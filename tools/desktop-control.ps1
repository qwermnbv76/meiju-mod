param(
    [Parameter(Mandatory=$true)]
    [string]$PayloadBase64
)

$ErrorActionPreference = "Stop"

Add-Type @"
using System;
using System.Runtime.InteropServices;

public static class YukiDesktopControl {
    [DllImport("user32.dll")]
    public static extern bool SetCursorPos(int X, int Y);

    [DllImport("user32.dll")]
    public static extern void mouse_event(uint dwFlags, uint dx, uint dy, int dwData, UIntPtr dwExtraInfo);

    [DllImport("user32.dll")]
    public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);

    [StructLayout(LayoutKind.Sequential)]
    public struct INPUT {
        public uint type;
        public INPUTUNION u;
    }

    [StructLayout(LayoutKind.Explicit)]
    public struct INPUTUNION {
        [FieldOffset(0)]
        public KEYBDINPUT ki;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct KEYBDINPUT {
        public ushort wVk;
        public ushort wScan;
        public uint dwFlags;
        public uint time;
        public IntPtr dwExtraInfo;
    }

    [DllImport("user32.dll", SetLastError=true)]
    public static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

    public static void SendUnicodeText(string text) {
        if (text == null) return;
        foreach (char ch in text) {
            INPUT down = new INPUT();
            down.type = 1;
            down.u.ki.wVk = 0;
            down.u.ki.wScan = ch;
            down.u.ki.dwFlags = 0x0004;
            INPUT up = down;
            up.u.ki.dwFlags = 0x0004 | 0x0002;
            INPUT[] inputs = new INPUT[] { down, up };
            SendInput((uint)inputs.Length, inputs, Marshal.SizeOf(typeof(INPUT)));
        }
    }
}
"@

function Write-Result($obj) {
    $obj | ConvertTo-Json -Compress -Depth 8
}

function Move-Cursor($x, $y) {
    [YukiDesktopControl]::SetCursorPos([int]$x, [int]$y) | Out-Null
}

function Invoke-Click($button, $count) {
    $down = 0x0002
    $up = 0x0004
    if ($button -eq "right") {
        $down = 0x0008
        $up = 0x0010
    } elseif ($button -eq "middle") {
        $down = 0x0020
        $up = 0x0040
    }
    for ($i = 0; $i -lt [Math]::Max(1, [int]$count); $i++) {
        [YukiDesktopControl]::mouse_event($down, 0, 0, 0, [UIntPtr]::Zero)
        Start-Sleep -Milliseconds 35
        [YukiDesktopControl]::mouse_event($up, 0, 0, 0, [UIntPtr]::Zero)
        Start-Sleep -Milliseconds 70
    }
}

function Get-VirtualKey($key) {
    $k = [string]$key
    $lower = $k.ToLowerInvariant()
    $map = @{
        "ctrl"=0x11; "control"=0x11; "shift"=0x10; "alt"=0x12; "win"=0x5B; "meta"=0x5B;
        "enter"=0x0D; "return"=0x0D; "esc"=0x1B; "escape"=0x1B; "tab"=0x09; "space"=0x20;
        "backspace"=0x08; "delete"=0x2E; "del"=0x2E; "home"=0x24; "end"=0x23; "pageup"=0x21; "pagedown"=0x22;
        "left"=0x25; "up"=0x26; "right"=0x27; "down"=0x28;
        "f1"=0x70; "f2"=0x71; "f3"=0x72; "f4"=0x73; "f5"=0x74; "f6"=0x75;
        "f7"=0x76; "f8"=0x77; "f9"=0x78; "f10"=0x79; "f11"=0x7A; "f12"=0x7B
    }
    if ($map.ContainsKey($lower)) {
        return [byte]$map[$lower]
    }
    if ($lower.Length -eq 1) {
        $code = [byte][char]$lower.ToUpperInvariant()[0]
        return $code
    }
    throw "Unsupported hotkey key: $key"
}

try {
    $json = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($PayloadBase64))
    $payload = $json | ConvertFrom-Json
    $tool = [string]$payload.tool
    $args = $payload.args

    switch ($tool) {
        "mouse_move" {
            Move-Cursor $args.x $args.y
            Write-Result @{ success = $true; tool = $tool; x = [int]$args.x; y = [int]$args.y }
        }
        "mouse_click" {
            Move-Cursor $args.x $args.y
            Invoke-Click ([string]$args.button) ([int]$args.count)
            Write-Result @{ success = $true; tool = $tool; x = [int]$args.x; y = [int]$args.y; button = [string]$args.button; count = [int]$args.count }
        }
        "mouse_scroll" {
            [YukiDesktopControl]::mouse_event(0x0800, 0, 0, [int]$args.deltaY, [UIntPtr]::Zero)
            Write-Result @{ success = $true; tool = $tool; deltaY = [int]$args.deltaY }
        }
        "mouse_drag" {
            $steps = 18
            $duration = [Math]::Max(100, [int]$args.durationMs)
            Move-Cursor $args.fromX $args.fromY
            Start-Sleep -Milliseconds 60
            [YukiDesktopControl]::mouse_event(0x0002, 0, 0, 0, [UIntPtr]::Zero)
            for ($i = 1; $i -le $steps; $i++) {
                $x = [Math]::Round([double]$args.fromX + (([double]$args.toX - [double]$args.fromX) * $i / $steps))
                $y = [Math]::Round([double]$args.fromY + (([double]$args.toY - [double]$args.fromY) * $i / $steps))
                Move-Cursor $x $y
                Start-Sleep -Milliseconds ([Math]::Max(5, [Math]::Floor($duration / $steps)))
            }
            [YukiDesktopControl]::mouse_event(0x0004, 0, 0, 0, [UIntPtr]::Zero)
            Write-Result @{ success = $true; tool = $tool }
        }
        "type_text" {
            [YukiDesktopControl]::SendUnicodeText([string]$args.text)
            Write-Result @{ success = $true; tool = $tool; chars = ([string]$args.text).Length }
        }
        "press_hotkey" {
            $keys = @($args.keys)
            $vks = @()
            foreach ($key in $keys) {
                $vks += (Get-VirtualKey $key)
            }
            foreach ($vk in $vks) {
                [YukiDesktopControl]::keybd_event([byte]$vk, 0, 0, [UIntPtr]::Zero)
                Start-Sleep -Milliseconds 20
            }
            [Array]::Reverse($vks)
            foreach ($vk in $vks) {
                [YukiDesktopControl]::keybd_event([byte]$vk, 0, 0x0002, [UIntPtr]::Zero)
                Start-Sleep -Milliseconds 20
            }
            Write-Result @{ success = $true; tool = $tool; keys = @($args.keys) }
        }
        default {
            throw "Unsupported tool: $tool"
        }
    }
} catch {
    Write-Error $_.Exception.Message
    exit 1
}
