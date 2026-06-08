// MeijuMod v2.9.6 - global Alt shortcut via install-hooks IPC
(function () {
    "use strict";
    var V = "2.9.6";
    var C = { pri: "#996669", bg: "rgba(255,255,255,0.96)", txt: "rgba(68,68,68,0.9)", mute: "rgba(68,68,68,0.6)", bd: "rgba(68,68,68,0.12)" };

    var style = document.createElement("style");
    style.textContent = ".mod-toggle{position:relative;display:inline-block;width:44px;height:24px;flex-shrink:0;cursor:pointer}" +
        ".mod-toggle input{opacity:0;width:0;height:0}" +
        ".mod-toggle .toggle-slider{position:absolute;inset:0;background:rgba(234,234,234,0.9);border:1px solid rgba(68,68,68,0.3);border-radius:24px;transition:all 0.3s}" +
        ".mod-toggle .toggle-slider::before{content:\"\";position:absolute;width:18px;height:18px;left:2px;top:2px;background:#fff;border-radius:50%;transition:all 0.3s;box-shadow:0 1px 3px rgba(0,0,0,0.15)}" +
        ".mod-toggle input:checked+.toggle-slider{background:#996669;border-color:#996669}" +
        ".mod-toggle input:checked+.toggle-slider::before{transform:translateX(20px)}" +
        ".mod-api-input{width:100%;padding:8px 12px;font-size:13px;color:" + C.txt + ";background:#fff;border:1px solid " + C.bd + ";border-radius:6px;outline:none;box-sizing:border-box;font-family:inherit;transition:border-color 0.2s}" +
        ".mod-api-input:focus{border-color:" + C.pri + ";box-shadow:0 0 0 2px rgba(153,102,105,0.15)}" +
        ".mod-api-input::placeholder{color:" + C.mute + "}" +
        ".mod-api-label{font-size:13px;color:" + C.txt + ";font-weight:500;margin-bottom:4px;display:block}" +
        ".mod-api-btn{padding:7px 18px;font-size:13px;color:#fff;background:" + C.pri + ";border:none;border-radius:6px;cursor:pointer;font-family:inherit;transition:opacity 0.2s}" +
        ".mod-api-btn:hover{opacity:0.85}" +
        ".mod-api-btn:disabled{opacity:0.5;cursor:not-allowed}" +
        ".mod-api-btn.secondary{background:transparent;color:" + C.pri + ";border:1px solid " + C.pri + "}" +
        ".mod-api-status{padding:8px 12px;font-size:12px;border-radius:6px;margin-top:8px;display:none}" +
        ".mod-api-status.info{background:rgba(153,102,105,0.08);color:" + C.pri + ";display:block}" +
        ".mod-api-status.success{background:rgba(76,175,80,0.1);color:#4CAF50;display:block}" +
        ".mod-api-status.error{background:rgba(244,67,54,0.1);color:#F44336;display:block}" +
        ".mod-model-dropdown{position:absolute;top:100%;left:0;right:0;max-height:160px;overflow-y:auto;background:#fff;border:1px solid " + C.bd + ";border-radius:6px;z-index:9999;display:none;box-shadow:0 4px 12px rgba(0,0,0,0.1)}" +
        ".mod-model-item{padding:8px 12px;font-size:12px;color:" + C.txt + ";cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
        ".mod-model-item:hover{background:rgba(153,102,105,0.08)}" +
        ".mod-divider{height:1px;background:" + C.bd + ";margin:16px 0}" +
        ".mod-freq-select{width:100%;padding:8px 12px;font-size:13px;color:" + C.txt + ";background:#fff;border:1px solid " + C.bd + ";border-radius:6px;outline:none;box-sizing:border-box;font-family:inherit;cursor:pointer;appearance:none;-webkit-appearance:none;background-image:url(\"data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27%3E%3Cpath d=%27M2 4l4 4 4-4%27 stroke=%27%23996%27 fill=%27none%27/%3E%3C/svg%3E\");background-repeat:no-repeat;background-position:right 10px center;padding-right:30px}" +
        ".mod-freq-select:focus{border-color:" + C.pri + ";box-shadow:0 0 0 2px rgba(153,102,105,0.15)}";
    document.head.appendChild(style);

    function loadCfg() {
        try { var r = localStorage.getItem("meiju_mod_config"); return r ? JSON.parse(r) : defCfg(); } catch(e) {}
        return defCfg();
    }
    function defCfg() { return { ver: V, on: true, login: true, pet: true, ocr: true, scene: true, rtc: true, petFreq: 10, altTrigger: true }; }
    function saveCfg(c) { try { localStorage.setItem("meiju_mod_config", JSON.stringify(c)); } catch(e) {} }
    var M = loadCfg();
    if (!M.on) return;
    console.log("[MeijuMod] v" + V + " start");

    // Alt key detection handled by install-hooks.js globalShortcut -> IPC

    var K_OCR = "meiju_mod_api_config";
    var K_PET = "meiju_mod_pet_api_config";
    var K_RTC = "meiju_mod_rtc_config";
    function loadApiCfg(key) { try { var r = localStorage.getItem(key); if (r) { var c = JSON.parse(r); return c; } } catch(e) {} return {}; }
    function saveApiCfg(key, c) { try { localStorage.setItem(key, JSON.stringify(c)); } catch(e) {} }
    function getModApi() { var c = loadApiCfg(K_OCR); return { baseurl: c.baseurl || "", modelname: c.modelname || "", apiKey: c.apiKey || "" }; }
    function getPetApi() { var c = loadApiCfg(K_PET); return { baseurl: c.baseurl || "", modelname: c.modelname || "", apiKey: c.apiKey || "" }; }
    function getRtcCfg() { var c = loadApiCfg(K_RTC); return { appId: (c && c.appId) || "", appKey: (c && c.appKey) || "", apiKey: (c && c.apiKey) || "", model: (c && c.model) || "" }; }

    function poll(chk, fn, max, iv) { max = max || 60; iv = iv || 200; var n = 0; function t() { n++; if (chk()) fn(); else if (n < max) setTimeout(t, iv); } t(); }
    function fakeToken() { if (!localStorage.getItem("auth_token")) { localStorage.setItem("auth_token", "meiju_mod_guest"); localStorage.setItem("user_info", JSON.stringify({ id: "guest", username: "\u672c\u5730\u73a9\u5bb6" })); } }
    function toB64(blob) { return new Promise(function(ok, no) { var r = new FileReader(); r.onload = function() { ok(r.result.split(",")[1]); }; r.onerror = no; r.readAsDataURL(blob); }); }

    async function vision(img64, prompt) {
        var a = getModApi(); if (!a || !a.apiKey || !a.baseurl) return null;
        var u = a.baseurl; if (!u.endsWith("/")) u += "/"; if (!u.includes("/v1/") && !u.endsWith("v1")) u += "v1/"; u += "chat/completions";
        try {
            var r = await fetch(u, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + a.apiKey }, body: JSON.stringify({ model: a.modelname, messages: [{ role: "user", content: [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: "data:image/jpeg;base64," + img64 } }] }], max_tokens: 1024 }) });
            if (!r.ok) return null; var d = await r.json();
            return (d.choices && d.choices[0] && d.choices[0].message) ? (d.choices[0].message.content || null) : null;
        } catch(e) { return null; }
    }

    async function petChat(systemPrompt, userMessage, history) {
        var a = getPetApi(); if (!a || !a.apiKey || !a.baseurl) return null;
        var u = a.baseurl; if (!u.endsWith("/")) u += "/"; if (!u.includes("/v1/") && !u.endsWith("v1")) u += "v1/"; u += "chat/completions";
        var msgs = []; if (systemPrompt) msgs.push({ role: "system", content: systemPrompt });
        if (history && history.length) for (var h = 0; h < history.length; h++) msgs.push(history[h]);
        msgs.push({ role: "user", content: userMessage });
        try {
            var r = await fetch(u, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + a.apiKey }, body: JSON.stringify({ model: a.modelname, messages: msgs, max_tokens: 512, temperature: 0.8 }) });
            if (!r.ok) return null; var d = await r.json();
            return (d.choices && d.choices[0] && d.choices[0].message) ? (d.choices[0].message.content || null) : null;
        } catch(e) { return null; }
    }

    // ============ AUTH BYPASS ============
    if (M.login) {
        fakeToken();
        poll(function() { return !!window.authManager; }, function() {
            var a = window.authManager, g = { id: "guest", username: "\u672c\u5730\u73a9\u5bb6", phone: null, email: null };
            if (a.isLoggedIn) a.isLoggedIn = function() { return true; };
            if (a.getCurrentUser) a.getCurrentUser = function() { return g; };
            if (a.validateToken) a.validateToken = async function() { return true; };
            if (a.initAuth) a.initAuth = async function() { this.currentUser = g; this.isAuthenticated = true; localStorage.setItem("user_info", JSON.stringify(g)); if (a.notifyListeners) a.notifyListeners("login", g); };
            if (a.getProfile) a.getProfile = async function() { return { success: true, user: g }; };
        });
        poll(function() { return !!window.backendClient; }, function() { if (window.backendClient.getToken) window.backendClient.getToken = function() { return localStorage.getItem("auth_token") || "meiju_mod_guest"; }; });
        poll(function() { return !!(window.DateSystem && window.DateSystem.prototype.getAuthToken); }, function() { window.DateSystem.prototype.getAuthToken = function() { return localStorage.getItem("auth_token") || "meiju_mod_guest"; }; }, 80, 500);
    }

    // ============ OUTFIT15 UNLOCK ============
    poll(function() { return !!window.outfitCatalog; }, function() { try { var e = window.outfitCatalog.get("outfit15"); if (e && e.shop) e.shop.defaultOwned = true; } catch(e) {} }, 80, 300);

    // ============ OCR SEARCH ============
    if (M.ocr) {
        poll(function() { return !!(window.UISystem && window.UISystem.prototype.performOCR); }, function() {
            var o = window.UISystem.prototype.performOCR;
            window.UISystem.prototype.performOCR = async function(d) {
                try { var b = d; if (b.indexOf(",") !== -1) b = b.split(",")[1]; var t = await vision(b, "\u8bc6\u522b\u56fe\u7247\u4e2d\u6240\u6709\u6587\u5b57\uff0c\u76f4\u63a5\u8f93\u51fa\u3002"); if (t) return { success: true, text: t.trim(), error: null }; return o.call(this, d); } catch(e) { try { return o.call(this, d); } catch(e2) {} return { success: false, error: e.message }; }
            };
        }, 80, 500);
    }

    // ============ SCENE RECOGNITION ============
    if (M.scene) {
        poll(function() { return !!(window.DateSystem && window.DateSystem.prototype.uploadAndAnalyzeImage); }, function() {
            var o = window.DateSystem.prototype.uploadAndAnalyzeImage;
            window.DateSystem.prototype.uploadAndAnalyzeImage = async function(b) {
                try { var i = await toB64(b); var d = await vision(i, "\u63cf\u8ff0\u56fe\u7247\u573a\u666f\uff0c50\u5b57\u5185\u4e2d\u6587\u3002"); if (d) return { sceneDescription: d.trim(), usage: null }; return o.call(this, b); } catch(e) { try { return o.call(this, b); } catch(e2) {} return { sceneDescription: "\u81ea\u5b9a\u4e49", usage: null }; }
            };
        }, 80, 500);
    }

    // ============ DESKTOP PET ============
    if (M.pet) {
        function injectPetApiToManager(mgr) { if (!mgr) return; if (typeof mgr.baseURL === "undefined" && typeof mgr.apiKey === "undefined") return; var a = getPetApi(); if (a && a.apiKey && a.baseurl) { mgr.apiKey = a.apiKey; mgr.baseURL = a.baseurl; mgr.modelName = a.modelname; mgr.isServerMode = false; } }

        poll(function() { return !!window.desktopPetSystem; }, function() {
            var dps = window.desktopPetSystem, orig = dps.initAIChatManager;
            if (orig) { dps.initAIChatManager = async function() { await orig.call(this); injectPetApiToManager(this.aiChatManager); }; }
            dps.sendAIRequest = async function(appName) {
                var a = getPetApi(); if (!a || !a.apiKey || !a.baseurl) return;
                try { var r = await petChat(null, "\u4f60\u662fYuki\uff0c\u73a9\u5bb6\u6b63\u5728\u4f7f\u7528 " + appName + "\uff0c\u8bf7\u7528\u4e00\u53e5\u8bdd\u8ddf\u73a9\u5bb6\u642d\u8bdd\uff0c\u81ea\u7136\u53ef\u7231\u3002", null); if (r) await this.showAIResponse(r, 8000); } catch(e) {}
            };
            var origWD = dps.startWindowDetection;
            dps.startWindowDetection = function() {
                var freq = (loadCfg().petFreq) || 10;
                if (freq <= 0) return;
                this.stopWindowDetection();
                var self = this;
                this.windowDetectionInterval = setInterval(function() { self.detectActiveWindow(); }, freq * 1000);
                console.log("[MeijuMod] window detection interval: " + freq + "s");
            };
        }, 80, 500);

        poll(function() { return !!(window.PetChatBridge && window.PetChatBridge.prototype); }, function() {
            var P = window.PetChatBridge.prototype, orig = P.initAIChatManager;
            if (orig) { P.initAIChatManager = async function() { await orig.call(this); injectPetApiToManager(this.aiChatManager); }; }
            P.handlePetChatMessage = async function(msg) {
                var a = getPetApi(); if (!a || !a.apiKey || !a.baseurl) { try { if (!this.aiChatManager) await this.initAIChatManager(); if (this.aiChatManager) { var r = await this.aiChatManager.sendMessage(msg, {}); return "Yuki: " + r; } } catch(e) {} return this.getFallbackResponse(); }
                try { var r = await petChat(null, msg, null); if (r) return r; } catch(e) {} return this.getFallbackResponse();
            };
            P.getRandomGreeting = async function() { var a = getPetApi(); if (!a || !a.apiKey || !a.baseurl) return this.getFallbackGreeting(); try { var r = await petChat(null, "\u4f60\u662fYuki\uff0c\u8bf7\u5bf9\u73a9\u5bb6\u8bf4\u4e00\u53e5\u53ef\u7231\u7684\u5f00\u573a\u767d\uff0c\u4e00\u53e5\u8bdd\u3002", null); if (r) return r; } catch(e) {} return this.getFallbackGreeting(); };
        }, 80, 500);
    }

    
    // ============ DESKTOP PET CHAT BUTTON ============
    if (M.pet) {
        (function() {
            var chatStyle = document.getElementById("meiju-chat-btn-style");
            if (!chatStyle) {
                chatStyle = document.createElement("style");
                chatStyle.id = "meiju-chat-btn-style";
                chatStyle.textContent = "#chat-button{display:flex!important;position:absolute;bottom:10px;left:70px;background:rgba(153,102,105,0.85);color:#fff;border:2px solid rgba(153,102,105,0.6);border-radius:50%;width:40px;height:40px;font-size:18px;cursor:pointer;align-items:center;justify-content:center;transition:all 0.3s ease;-webkit-app-region:no-drag;z-index:10}" +
                    "#chat-button:hover{background:rgba(153,102,105,1);transform:scale(1.1);box-shadow:0 0 12px rgba(153,102,105,0.4)}" +
                    "#chat-button.chat-active{border-color:#4CAF50;box-shadow:0 0 8px rgba(76,175,80,0.6);animation:aiPulse 2s ease-in-out infinite}";
                document.head.appendChild(chatStyle);
            }
            var tries = 0;
            var btnTimer = setInterval(function() {
                tries++;
                var btn = document.getElementById("chat-button");
                if (btn && window.electronAPI && window.electronAPI.createChatWindow) {
                    clearInterval(btnTimer);
                    btn.title = "\u804a\u5929";
                    var isOpen = false;
                    btn.onclick = async function() {
                        try {
                            if (isOpen) { if (window.electronAPI.closeChatWindow) await window.electronAPI.closeChatWindow(); isOpen = false; btn.classList.remove("chat-active"); return; }
                            var bounds = { x: 0, y: 0, width: 300, height: 400 };
                            if (window.electronAPI.getWindowBounds) { try { bounds = await window.electronAPI.getWindowBounds(); } catch(e) {} }
                            await window.electronAPI.createChatWindow(bounds);
                            isOpen = true;
                            btn.classList.add("chat-active");
                        } catch(e) { console.warn("[MeijuMod] chat open fail:", e.message); }
                    };
                    if (window.electronAPI.onChatWindowClosed) {
                        window.electronAPI.onChatWindowClosed(function() { isOpen = false; btn.classList.remove("chat-active"); });
                    }
                    console.log("[MeijuMod] chat button ready");
                }
                if (tries > 200) { clearInterval(btnTimer); }
            }, 500);
        })();
    // ============ DESKTOP PET RTC VOICE BUTTON ============
    if (M.rtc) {
        (function() {
            var rtcStyle = document.getElementById("meiju-rtc-btn-style");
            if (!rtcStyle) {
                rtcStyle = document.createElement("style");
                rtcStyle.id = "meiju-rtc-btn-style";
                rtcStyle.textContent = "#mod-rtc-btn{position:absolute;bottom:10px;left:120px;background:rgba(153,102,105,0.85);color:#fff;border:2px solid rgba(153,102,105,0.6);border-radius:50%;width:40px;height:40px;font-size:16px;cursor:pointer;align-items:center;justify-content:center;transition:all 0.3s ease;-webkit-app-region:no-drag;z-index:10}" +
                    "#mod-rtc-btn:hover{background:rgba(153,102,105,1);transform:scale(1.1);box-shadow:0 0 12px rgba(153,102,105,0.4)}" +
                    "#mod-rtc-btn.rtc-active{border-color:#FF9800;box-shadow:0 0 8px rgba(255,152,0,0.6);animation:aiPulse 2s ease-in-out infinite}" +
                    "#mod-rtc-btn.rtc-recording{border-color:#F44336;box-shadow:0 0 12px rgba(244,67,54,0.7);animation:aiPulse 1.2s ease-in-out infinite}";
                document.head.appendChild(rtcStyle);
            }
            var tries = 0;
            var rtcTimer = setInterval(function() {
                tries++;
                var existing = document.getElementById("mod-rtc-btn");
                if (!existing) {
                    var btn = document.createElement("button");
                    btn.id = "mod-rtc-btn";
                    btn.className = "control-button";
                    btn.title = "RTC\u8bed\u97f3\u8f93\u5165";
                    btn.textContent = "\u{1F399}";
                    var container = document.getElementById("pet-container");
                    if (container) { container.appendChild(btn); }
                }
                var btn = document.getElementById("mod-rtc-btn");
                var dp = window.desktopPetInstance;
                if (btn && dp && dp.voiceManager) {
                    clearInterval(rtcTimer);
                    var vm = dp.voiceManager;
                    var rtcActive = false;
                    var rtcRecording = false;

                    btn.onclick = async function() {
                        try {
                            if (!rtcActive) {
                                rtcActive = true;
                                btn.classList.add("rtc-active");
                                if (vm.startSession) {
                                    try { await vm.startSession(); } catch(e) { console.warn("[MeijuMod] RTC start fail:", e.message); }
                                }
                                if (vm.startRecording) {
                                    try { await vm.startRecording(); rtcRecording = true; btn.classList.add("rtc-recording"); } catch(e) {}
                                }
                                btn.title = "RTC\u8bed\u97f3\u8f93\u5165 (\u5df2\u5f00\u542f)";
                            } else {
                                if (rtcRecording && vm.stopRecording) {
                                    try { vm.stopRecording(); } catch(e) {}
                                    rtcRecording = false;
                                }
                                if (vm.stopSession) {
                                    try { vm.stopSession(); } catch(e) {}
                                }
                                rtcActive = false;
                                btn.classList.remove("rtc-active", "rtc-recording");
                                btn.title = "RTC\u8bed\u97f3\u8f93\u5165";
                            }
                        } catch(e) { console.warn("[MeijuMod] RTC toggle fail:", e.message); rtcActive = false; btn.classList.remove("rtc-active", "rtc-recording"); }
                    };

                    if (vm.isConnected !== undefined) {
                        setInterval(function() {
                            if (vm.isConnected && !rtcActive) { rtcActive = true; btn.classList.add("rtc-active"); }
                            else if (!vm.isConnected && rtcActive) { rtcActive = false; btn.classList.remove("rtc-active", "rtc-recording"); }
                        }, 2000);
                    }
                    console.log("[MeijuMod] RTC voice button ready");
                }
                if (tries > 200) { clearInterval(rtcTimer); }
            }, 500);
        })();
    }

    }
// ============ RTC VOICE ============
    if (M.rtc) {
        poll(function() { return !!(window.DoubaoRTCClient && window.DoubaoRTCClient.prototype._initRTCEngine); }, function() {
            var origInit = window.DoubaoRTCClient.prototype._initRTCEngine;
            window.DoubaoRTCClient.prototype._initRTCEngine = function() {
                var c = getRtcCfg(); if (c.appId) { this.appId = c.appId; }
                return origInit.call(this);
            };
            console.log("[MeijuMod] RTC: DoubaoRTCClient patched");
        }, 80, 500);

        poll(function() { return !!(window.RealtimeVoiceManager && window.RealtimeVoiceManager.prototype.init); }, function() {
            var origInit = window.RealtimeVoiceManager.prototype.init;
            window.RealtimeVoiceManager.prototype.init = async function() {
                var c = getRtcCfg();
                if (c.apiKey) { this.config.apiKey = c.apiKey; }
                if (c.model) { this.config.model = c.model; }
                return origInit.call(this);
            };
            console.log("[MeijuMod] RTC: RealtimeVoiceManager patched");
        }, 80, 500);
    }

    // ============ UI PANEL ============
    function apiStatus(pfx, msg, type) { var el = document.getElementById(pfx + "-status"); if (!el) return; el.textContent = msg; el.className = "mod-api-status " + (type || "info"); el.style.display = "block"; }
    function apiStatusClear(pfx) { var el = document.getElementById(pfx + "-status"); if (el) { el.style.display = "none"; el.textContent = ""; } }
    function readInputs(pfx) { return { baseurl: (document.getElementById(pfx + "-baseurl") || {}).value || "", modelname: (document.getElementById(pfx + "-modelname") || {}).value || "", apiKey: (document.getElementById(pfx + "-key") || {}).value || "" }; }

    async function testApi(pfx) { apiStatusClear(pfx); var v = readInputs(pfx); if (!v.baseurl || !v.apiKey) { apiStatus(pfx, "\u8bf7\u586b\u5199 Base URL \u548c API Key", "error"); return; } apiStatus(pfx, "\u6b63\u5728\u6d4b\u8bd5...", "info"); var u = v.baseurl; if (!u.endsWith("/")) u += "/"; if (!u.includes("/v1/") && !u.endsWith("v1")) u += "v1/"; u += "chat/completions"; try { var r = await fetch(u, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + v.apiKey }, body: JSON.stringify({ model: v.modelname || "gpt-4o", messages: [{ role: "user", content: "hi" }], max_tokens: 5 }) }); if (r.ok) { apiStatus(pfx, "\u2713 \u8fde\u63a5\u6210\u529f!", "success"); } else { var txt = ""; try { var j = await r.json(); txt = (j.error && j.error.message) ? j.error.message : ""; } catch(e) {} apiStatus(pfx, "\u5931\u8d25: HTTP " + r.status + (txt ? " - " + txt : ""), "error"); } } catch(e) { apiStatus(pfx, "\u5931\u8d25: " + e.message, "error"); } }

    async function fetchModels(pfx) { apiStatusClear(pfx); var v = readInputs(pfx); if (!v.baseurl) { apiStatus(pfx, "\u8bf7\u5148\u586b\u5199 Base URL", "error"); return; } if (!v.apiKey) { apiStatus(pfx, "\u8bf7\u5148\u586b\u5199 API Key", "error"); return; } apiStatus(pfx, "\u6b63\u5728\u83b7\u53d6\u6a21\u578b...", "info"); var u = v.baseurl; if (!u.endsWith("/")) u += "/"; if (!u.includes("/v1/") && !u.endsWith("v1")) u += "v1/"; u += "models"; try { var r = await fetch(u, { method: "GET", headers: { "Authorization": "Bearer " + v.apiKey, "Content-Type": "application/json" } }); if (!r.ok) throw new Error("HTTP " + r.status); var d = await r.json(); if (d && d.data && Array.isArray(d.data)) { var ids = d.data.map(function(m) { return m.id; }); var dd = document.getElementById(pfx + "-model-dropdown"), dl = document.getElementById(pfx + "-model-list"); if (dd && dl) { dl.innerHTML = ""; ids.forEach(function(id) { var item = document.createElement("div"); item.className = "mod-model-item"; item.textContent = id; item.onclick = function() { var inp = document.getElementById(pfx + "-modelname"); if (inp) inp.value = id; dd.style.display = "none"; }; dl.appendChild(item); }); dd.style.display = "block"; } apiStatus(pfx, "\u83b7\u53d6\u5230 " + ids.length + " \u4e2a\u6a21\u578b", "success"); } else { apiStatus(pfx, "\u6a21\u578b\u5217\u8868\u683c\u5f0f\u5f02\u5e38", "error"); } } catch(e) { apiStatus(pfx, "\u83b7\u53d6\u5931\u8d25: " + e.message, "error"); } }

    function saveApi(pfx, key) { var v = readInputs(pfx); saveApiCfg(key, { baseurl: v.baseurl.trim(), modelname: v.modelname.trim(), apiKey: v.apiKey.trim() }); apiStatus(pfx, "\u2713 \u4fdd\u5b58\u6210\u529f", "success"); setTimeout(function() { apiStatusClear(pfx); }, 2000); }

    function buildApiSection(d, pfx, title, desc, apiData) {
        var div = document.createElement("div"); div.className = "mod-divider"; d.appendChild(div);
        var h = document.createElement("div"); h.style.cssText = "margin-bottom:12px;"; h.innerHTML = "<h4 style=\"margin:0;font-size:14px;color:" + C.pri + ";font-weight:600;\">" + title + "</h4><p style=\"margin:4px 0 0 0;font-size:12px;color:" + C.mute + ";\">" + desc + "</p>"; d.appendChild(h);
        var addField = function(label, id, type, ph, val) {
            var w = document.createElement("div"); w.style.cssText = "margin-bottom:10px;"; w.innerHTML = "<label class=\"mod-api-label\" for=\"" + id + "\">" + label + "</label>";
            var inp = document.createElement("input"); inp.type = type; inp.id = id; inp.className = "mod-api-input"; inp.placeholder = ph; inp.value = val; w.appendChild(inp); d.appendChild(w);
        };
        addField("Base URL", pfx + "-baseurl", "text", "https://api.openai.com/v1", apiData.baseurl || "");
        var fg2 = document.createElement("div"); fg2.style.cssText = "margin-bottom:10px;position:relative;"; fg2.innerHTML = "<label class=\"mod-api-label\" for=\"" + pfx + "-modelname\">Model</label>";
        var i2 = document.createElement("input"); i2.type = "text"; i2.id = pfx + "-modelname"; i2.className = "mod-api-input"; i2.placeholder = "gpt-4o"; i2.value = apiData.modelname || "";
        var dd = document.createElement("div"); dd.id = pfx + "-model-dropdown"; dd.className = "mod-model-dropdown"; var dl = document.createElement("div"); dl.id = pfx + "-model-list"; dd.appendChild(dl); fg2.appendChild(i2); fg2.appendChild(dd); d.appendChild(fg2);
        addField("API Key", pfx + "-key", "password", "sk-...", apiData.apiKey || "");
        var br = document.createElement("div"); br.style.cssText = "display:flex;gap:8px;margin-bottom:6px;";
        var b1 = document.createElement("button"); b1.className = "mod-api-btn secondary"; b1.textContent = "\u62c9\u53d6\u6a21\u578b"; b1.onclick = function() { fetchModels(pfx); };
        var b2 = document.createElement("button"); b2.className = "mod-api-btn secondary"; b2.textContent = "\u6d4b\u8bd5\u8fde\u63a5"; b2.onclick = function() { testApi(pfx); };
        var b3 = document.createElement("button"); b3.className = "mod-api-btn"; b3.textContent = "\u4fdd\u5b58"; b3.onclick = function() { saveApi(pfx, pfx === "mod-api" ? K_OCR : K_PET); };
        br.appendChild(b1); br.appendChild(b2); br.appendChild(b3); d.appendChild(br);
        var st = document.createElement("div"); st.id = pfx + "-status"; st.className = "mod-api-status"; d.appendChild(st);
    }

    function buildRtcSection(d) {
        var rtc = getRtcCfg();
        var div = document.createElement("div"); div.className = "mod-divider"; d.appendChild(div);
        var h = document.createElement("div"); h.style.cssText = "margin-bottom:12px;"; h.innerHTML = "<h4 style=\"margin:0;font-size:14px;color:" + C.pri + ";font-weight:600;\">RTC\u8bed\u97f3 \u914d\u7f6e</h4><p style=\"margin:4px 0 0 0;font-size:12px;color:" + C.mute + ";\">\u684c\u5ba0RTC\u8bed\u97f3\u8f93\u5165\u6309\u94ae + \u706b\u5c71\u5f15\u64ce\u8c46\u5305RTC</p>"; d.appendChild(h);
        var fg1 = document.createElement("div"); fg1.style.cssText = "margin-bottom:10px;";
        fg1.innerHTML = "<label class=\"mod-api-label\" for=\"mod-rtc-appid\">App ID</label>";
        var i1 = document.createElement("input"); i1.type = "text"; i1.id = "mod-rtc-appid"; i1.className = "mod-api-input"; i1.placeholder = "\u706b\u5c71\u5f15\u64ce\u5e94\u7528ID (\u8c46\u5305RTC)"; i1.value = rtc.appId || ""; fg1.appendChild(i1); d.appendChild(fg1);
        var fg2 = document.createElement("div"); fg2.style.cssText = "margin-bottom:10px;";
        fg2.innerHTML = "<label class=\"mod-api-label\" for=\"mod-rtc-appkey\">App Key</label>";
        var i2 = document.createElement("input"); i2.type = "password"; i2.id = "mod-rtc-appkey"; i2.className = "mod-api-input"; i2.placeholder = "\u706b\u5c71\u5f15\u64ce\u5bc6\u94a5 (\u8c46\u5305RTC)"; i2.value = rtc.appKey || ""; fg2.appendChild(i2); d.appendChild(fg2);
        var fg3 = document.createElement("div"); fg3.style.cssText = "margin-bottom:10px;";
        fg3.innerHTML = "<label class=\"mod-api-label\" for=\"mod-rtc-apikey\">API Key</label>";
        var i3 = document.createElement("input"); i3.type = "password"; i3.id = "mod-rtc-apikey"; i3.className = "mod-api-input"; i3.placeholder = "sk-... (\u5b9e\u65f6\u8bed\u97f3API)"; i3.value = rtc.apiKey || ""; fg3.appendChild(i3); d.appendChild(fg3);
        var fg4 = document.createElement("div"); fg4.style.cssText = "margin-bottom:10px;";
        fg4.innerHTML = "<label class=\"mod-api-label\" for=\"mod-rtc-model\">Model</label>";
        var i4 = document.createElement("input"); i4.type = "text"; i4.id = "mod-rtc-model"; i4.className = "mod-api-input"; i4.placeholder = "qwen3-omni-flash-realtime-2025-12-01"; i4.value = rtc.model || ""; fg4.appendChild(i4); d.appendChild(fg4);
        var br = document.createElement("div"); br.style.cssText = "display:flex;gap:8px;margin-bottom:6px;";
        var b1 = document.createElement("button"); b1.className = "mod-api-btn secondary"; b1.textContent = "\u6d4b\u8bd5RTC"; b1.onclick = function() { testRtc(); };
        var b2 = document.createElement("button"); b2.className = "mod-api-btn"; b2.textContent = "\u4fdd\u5b58"; b2.onclick = function() { saveRtc(); };
        br.appendChild(b1); br.appendChild(b2); d.appendChild(br);
        var st = document.createElement("div"); st.id = "mod-rtc-status"; st.className = "mod-api-status"; d.appendChild(st);
    }

    function readRtcInputs() {
        return {
            appId: (document.getElementById("mod-rtc-appid") || {}).value || "",
            appKey: (document.getElementById("mod-rtc-appkey") || {}).value || ""
        };
    }

    async function testRtc() {
        var v = readRtcInputs(); var pfx = "mod-rtc";
        apiStatusClear(pfx);
        if (!v.appId || !v.appKey) { apiStatus(pfx, "\u8bf7\u586b\u5199 App ID \u548c App Key", "error"); return; }
        apiStatus(pfx, "\u6b63\u5728\u6d4b\u8bd5RTC\u8fde\u63a5...", "info");
        try {
            if (!window.DoubaoRTCClient) { apiStatus(pfx, "\u5931\u8d25: DoubaoRTCClient \u672a\u52a0\u8f7d", "error"); return; }
            var client = new window.DoubaoRTCClient({ appId: v.appId });
            client.appId = v.appId;
            await client.init();
            apiStatus(pfx, "\u2713 RTC\u8fde\u63a5\u6210\u529f!", "success");
        } catch(e) {
            apiStatus(pfx, "\u5931\u8d25: " + (e.message || "RTC\u521d\u59cb\u5316\u5931\u8d25"), "error");
        }
    }

    function saveRtc() {
        var v = readRtcInputs();
        saveApiCfg(K_RTC, { appId: v.appId.trim(), appKey: v.appKey.trim(), apiKey: v.apiKey.trim(), model: v.model.trim() });
        apiStatus("mod-rtc", "\u2713 \u4fdd\u5b58\u6210\u529f", "success");
        setTimeout(function() { apiStatusClear("mod-rtc"); }, 2000);
    }

    function buildPanel() {
        var toggles = [
            ["m-login", "\u514d\u767b\u5f55\u6a21\u5f0f", "\u8df3\u8fc7\u767b\u5f55\u76f4\u63a5\u8fdb\u5165\u6e38\u620f", "login"],
            ["m-pet", "\u684c\u5ba0\u7834\u89e3", "\u514d\u767b\u5f55\u684c\u5ba0 + \u72ec\u7acbAPI\u804a\u5929", "pet"],
            ["m-ocr", "\u672c\u5730AI\u641c\u9898", "\u6a21\u7ec4\u72ec\u7acbAPI\u641c\u9898", "ocr"],
            ["m-scene", "\u672c\u5730AI\u573a\u666f\u8bc6\u522b", "\u6a21\u7ec4\u72ec\u7acbAPI\u8bc6\u522b\u573a\u666f", "scene"],
            ["m-rtc", "RTC\u5168\u6a21\u6001\u8bed\u97f3", "\u684c\u5ba0RTC\u8bed\u97f3\u8f93\u5165\u6309\u94ae + \u706b\u5c71\u5f15\u64ce\u8c46\u5305RTC", "rtc"]
        ];
        var api = loadApiCfg(K_OCR) || {}, petApi = loadApiCfg(K_PET) || {};
        var d = document.createElement("div"); d.id = "mod-panel"; d.style.cssText = "display:none;padding:0;margin:0;";
        var hdr = document.createElement("div"); hdr.style.cssText = "padding:0 0 14px 0;border-bottom:1px solid " + C.bd + ";margin-bottom:18px;";
        hdr.innerHTML = "<h3 style=\"margin:0;font-size:16px;color:" + C.pri + ";font-weight:600;\">\u6a21\u7ec4\u8bbe\u7f6e <span style=\"font-size:12px;color:" + C.mute + ";font-weight:400;\">v" + V + "</span></h3>"; d.appendChild(hdr);
        for (var i = 0; i < toggles.length; i++) {
            var t = toggles[i], chk = M[t[3]] ? " checked" : "", row = document.createElement("div");
            row.style.cssText = "display:flex;align-items:center;justify-content:space-between;padding:12px 16px;margin-bottom:6px;background:" + C.bg + ";border:1px solid " + C.bd + ";border-radius:8px;";
            row.innerHTML = "<div style=\"display:flex;flex-direction:column;gap:3px;\"><span style=\"font-size:14px;color:" + C.txt + ";font-weight:500;\">" + t[1] + "</span><span style=\"font-size:12px;color:" + C.mute + ";\">" + t[2] + "</span></div><label class=\"mod-toggle\"><input type=\"checkbox\" id=\"" + t[0] + "\"" + chk + "><span class=\"toggle-slider\"></span></label>";
            d.appendChild(row);
        }
        var altRow = document.createElement("div");
        altRow.style.cssText = "display:flex;align-items:center;justify-content:space-between;padding:12px 16px;margin-bottom:6px;background:" + C.bg + ";border:1px solid " + C.bd + ";border-radius:8px;";
        altRow.innerHTML = '<div style="display:flex;flex-direction:column;gap:3px;"><span style="font-size:14px;color:' + C.txt + ';font-weight:500;">按键触发识屏</span><span style="font-size:12px;color:' + C.mute + ';">按下左Alt键立即识别活动窗口</span></div><label class="mod-toggle"><input type="checkbox" id="m-alt"' + (M.altTrigger ? " checked" : "") + '><span class="toggle-slider"></span></label>';
        d.appendChild(altRow);
        var freqRow = document.createElement("div");
        freqRow.style.cssText = "display:flex;align-items:center;justify-content:space-between;padding:12px 16px;margin-bottom:6px;background:" + C.bg + ";border:1px solid " + C.bd + ";border-radius:8px;";
        freqRow.innerHTML = '<div style="display:flex;flex-direction:column;gap:3px;"><span style="font-size:14px;color:' + C.txt + ';font-weight:500;">窗口识别频率</span><span style="font-size:12px;color:' + C.mute + ';">桌宠检测活动窗口的间隔时间</span></div><select id="mod-pet-freq" class="mod-freq-select" style="width:120px;flex-shrink:0;">' +
            '<option value="5"' + (M.petFreq === 5 ? " selected" : "") + '>5 秒</option>' +
            '<option value="10"' + (M.petFreq === 10 ? " selected" : "") + '>10 秒</option>' +
            '<option value="30"' + (M.petFreq === 30 ? " selected" : "") + '>30 秒</option>' +
            '<option value="60"' + (M.petFreq === 60 ? " selected" : "") + '>60 秒</option>' +
            '<option value="-1"' + (M.petFreq === -1 ? " selected" : "") + '>仅Alt键识屏</option>' +
            '<option value="0"' + (M.petFreq === 0 ? " selected" : "") + '>关闭</option>' +
            '</select>';
        d.appendChild(freqRow);
        setTimeout(function() {
            var sel = d.querySelector("#mod-pet-freq");
            if (sel) sel.onchange = function() { M.petFreq = parseInt(this.value); saveCfg(M); };
        }, 100);
        buildApiSection(d, "mod-api", "\u641c\u9898/\u573a\u666f API\u914d\u7f6e", "\u6559\u5e08\u670d\u641c\u9898 + \u5b9e\u666f\u7ea6\u4f1a\u573a\u666f\u8bc6\u522b", api);
        buildApiSection(d, "mod-pet-api", "\u684c\u5ba0\u804a\u5929 API\u914d\u7f6e", "\u684c\u9762\u5ba0\u7269\u4e3b\u52a8\u642d\u8bdd + \u804a\u5929\u7a97\u53e3\u5bf9\u8bdd", petApi);
        buildRtcSection(d);
        var ftr = document.createElement("div"); ftr.style.cssText = "margin-top:14px;padding-top:12px;border-top:1px solid " + C.bd + ";";
        ftr.innerHTML = "<p style=\"font-size:12px;color:" + C.mute + ";margin:4px 0;line-height:1.5;\">\u5404API\u72ec\u7acb\u914d\u7f6e | \u6559\u5e08\u670d\u5df2\u89e3\u9501 | \u914d\u7f6e\u4fdd\u5b58\u5728\u672c\u5730</p>"; d.appendChild(ftr);
        setTimeout(function() {
            var keys = ["login", "pet", "altTrigger", "ocr", "scene", "rtc"], ids = ["m-login", "m-pet", "m-alt", "m-ocr", "m-scene", "m-rtc"];
            for (var j = 0; j < ids.length; j++) { (function(k, id) { var cb = d.querySelector("#" + id); if (cb) cb.onchange = function() { M[k] = this.checked; saveCfg(M); }; })(keys[j], ids[j]); }
            document.addEventListener("click", function(e) { ["mod-api-model-dropdown", "mod-pet-api-model-dropdown"].forEach(function(did) { var dd2 = document.getElementById(did), pfx = did.replace("-model-dropdown", ""); if (dd2 && !e.target.closest("#" + pfx + "-modelname") && !e.target.closest("#" + did)) { dd2.style.display = "none"; } }); });
        }, 100);
        return d;
    }

    function injectTab() { var bar = document.querySelector("#cloud-preset-sidebar"); if (!bar) return false; if (document.getElementById("mod-settings-tab")) return true; var b = document.createElement("button"); b.id = "mod-settings-tab"; b.className = "preset-btn mj-sidebar-item"; b.textContent = "\u6a21\u7ec4"; b.onclick = showPanel; bar.appendChild(b); return true; }
    function injectPanel() { var ct = document.querySelector("#ai-settings-modal .mj-panel-content"); if (!ct) return false; if (document.getElementById("mod-panel")) return true; var p = buildPanel(); if (!p) return false; var acts = ct.querySelector(".mj-panel-actions"); if (acts) ct.insertBefore(p, acts); else ct.appendChild(p); return true; }

    function showPanel() {
        if (!document.getElementById("mod-panel")) injectPanel();
        var cs = document.getElementById("cloud-custom-section"); if (cs) cs.style.display = "none";
        var ss = document.getElementById("cloud-server-section"); if (ss) ss.style.display = "none";
        var mp = document.getElementById("mod-panel"); if (mp) mp.style.display = "block";
        var items = document.querySelectorAll("#ai-settings-modal .mj-sidebar-item"); for (var i = 0; i < items.length; i++) { items[i].classList.remove("active"); items[i].style.background = ""; items[i].style.color = ""; items[i].style.fontWeight = ""; }
        var tab = document.getElementById("mod-settings-tab"); if (tab) { tab.classList.add("active"); tab.style.background = "rgba(153,102,105,0.1)"; tab.style.color = "#996669"; tab.style.fontWeight = "600"; }
    }

    var tabTimer = setInterval(function() { if (injectTab()) clearInterval(tabTimer); }, 300); setTimeout(function() { clearInterval(tabTimer); }, 35000);
    var panelTimer = setInterval(function() { var modal = document.getElementById("ai-settings-modal"); if (modal && window.getComputedStyle(modal).display !== "none" && !document.getElementById("mod-panel")) injectPanel(); }, 500); setTimeout(function() { clearInterval(panelTimer); }, 60000);
    poll(function() { return !!(window.AISettingsManager && window.AISettingsManager.prototype.showModal); }, function() { var orig = window.AISettingsManager.prototype.showModal; window.AISettingsManager.prototype.showModal = function() { orig.call(this); setTimeout(function() { injectPanel(); }, 100); setTimeout(function() { injectPanel(); }, 300); setTimeout(function() { injectPanel(); }, 600); }; }, 80, 1000);

    fakeToken();
    console.log("[MeijuMod] v" + V + " done");
})();