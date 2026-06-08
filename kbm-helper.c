#include <windows.h>
#include <stdio.h>
#include <string.h>
#include <ctype.h>

static char* trim(char* s) {
    while (isspace((unsigned char)*s)) ++s;
    if (*s) { char* e = s + strlen(s) - 1; while (e > s && isspace((unsigned char)*e)) *e-- = 0; }
    return s;
}

static int get_int(const char* json, const char* key) {
    char pat[64]; snprintf(pat, sizeof(pat), "\"%s\"", key);
    const char* p = strstr(json, pat);
    if (!p) return 0; p = strchr(p, ':'); if (!p) return 0;
    while (*p && !isdigit((unsigned char)*p) && *p != '-') ++p;
    if (!*p) return 0;
    int i = 0, neg = 0;
    if (*p == '-') { neg = 1; ++p; }
    while (isdigit((unsigned char)*p)) { i = i * 10 + (*p - '0'); ++p; }
    return neg ? -i : i;
}

static void get_str(const char* json, const char* key, char* out, int outsz) {
    char pat[64]; snprintf(pat, sizeof(pat), "\"%s\"", key);
    const char* p = strstr(json, pat);
    if (!p) { out[0] = 0; return; }
    p = strchr(p, ':'); if (!p) { out[0] = 0; return; }
    while (*p && *p != '"') ++p;
    if (!*p) { out[0] = 0; return; }
    ++p; int i = 0;
    while (*p && *p != '"' && i < outsz - 1) {
        if (*p == '\\' && *(p+1)) { ++p; if (*p == 'n') out[i++] = '\n'; else out[i++] = *p; }
        else out[i++] = *p;
        ++p;
    }
    out[i] = 0;
}

int main(int argc, char* argv[]) {
    // --watch mode: poll keyboard state, output JSON events
    if (argc > 1 && strcmp(argv[1], "--watch") == 0) {
        int lastL = 0, lastR = 0;
        while (1) {
            int sl = GetAsyncKeyState(VK_LMENU) & 0x8000;
            int sr = GetAsyncKeyState(VK_RMENU) & 0x8000;
            if (sl != lastL) { printf("{\"e\":\"k\",\"v\":%d,\"d\":%d}\n", VK_LMENU, sl ? 1 : 0); fflush(stdout); lastL = sl; }
            if (sr != lastR) { printf("{\"e\":\"k\",\"v\":%d,\"d\":%d}\n", VK_RMENU, sr ? 1 : 0); fflush(stdout); lastR = sr; }
            Sleep(30);
        }
        return 0;
    }

    char line[8192];
    while (fgets(line, sizeof(line), stdin)) {
        char* cmd = trim(line);
        if (!*cmd || *cmd == '#') continue;
        int ok = 0;
        char action[64] = {0};
        get_str(cmd, "action", action, sizeof(action));
        
        if (strcmp(action, "mouse_move") == 0) {
            SetCursorPos(get_int(cmd, "x"), get_int(cmd, "y")); ok = 1;
        }
        else if (strcmp(action, "mouse_click") == 0) {
            char btn[16] = {0}; get_str(cmd, "button", btn, sizeof(btn));
            int down = get_int(cmd, "down");
            DWORD flags = 0;
            if (strcmp(btn, "right") == 0) flags = down ? MOUSEEVENTF_RIGHTDOWN : MOUSEEVENTF_RIGHTUP;
            else if (strcmp(btn, "middle") == 0) flags = down ? MOUSEEVENTF_MIDDLEDOWN : MOUSEEVENTF_MIDDLEUP;
            else flags = down ? MOUSEEVENTF_LEFTDOWN : MOUSEEVENTF_LEFTUP;
            mouse_event(flags, 0, 0, 0, 0); ok = 1;
        }
        else if (strcmp(action, "mouse_scroll") == 0) {
            mouse_event(MOUSEEVENTF_WHEEL, 0, 0, get_int(cmd, "delta"), 0); ok = 1;
        }
        else if (strcmp(action, "key") == 0) {
            int vk = get_int(cmd, "vk"), down = get_int(cmd, "down");
            keybd_event((BYTE)vk, 0, down ? 0 : KEYEVENTF_KEYUP, 0); ok = 1;
        }
        else if (strcmp(action, "type") == 0) {
            char text[512] = {0}; get_str(cmd, "text", text, sizeof(text));
            for (int i = 0; text[i]; ++i) {
                SHORT vk = VkKeyScanA(text[i]); if (vk == -1) continue;
                BYTE vkCode = vk & 0xFF, shift = (vk >> 8) & 0xFF;
                if (shift & 1) keybd_event(VK_SHIFT, 0, 0, 0);
                keybd_event(vkCode, 0, 0, 0);
                keybd_event(vkCode, 0, KEYEVENTF_KEYUP, 0);
                if (shift & 1) keybd_event(VK_SHIFT, 0, KEYEVENTF_KEYUP, 0);
                Sleep(10);
            }
            ok = 1;
        }
        else if (strcmp(action, "ping") == 0) { ok = 1; }
        
        fprintf(stdout, "{\"ok\":%d,\"action\":\"%s\"}\n", ok, action);
        fflush(stdout);
    }
    return 0;
}