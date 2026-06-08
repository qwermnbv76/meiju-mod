// kbm-preload.js - MeijuMod KBM bridge
// Chains original preload.js then exposes KBM API via contextBridge

// Load original preload first
var origPreload = null;
var argv = typeof process !== "undefined" ? process.argv : [];
for (var i = 0; i < argv.length; i++) {
  if (argv[i].startsWith("--meiju-orig-preload=")) {
    origPreload = argv[i].replace("--meiju-orig-preload=", "");
    break;
  }
}
if (origPreload) {
  try { require(origPreload); } catch(e) { console.warn("[MeijuMod] orig preload failed:", e.message); }
}

const { contextBridge, ipcRenderer } = require("electron");

var pending = {};
var cid = 0;

// Listen for KBM responses from main process
ipcRenderer.on("mod:kbm-result", function(event, data) {
  var cb = pending[data.id];
  if (cb) {
    delete pending[data.id];
    if (data.error) { cb.reject(new Error(data.error)); }
    else { cb.resolve(data.result); }
  }
});

// Expose KBM API to renderer main world
contextBridge.exposeInMainWorld("meijuKbm", {
  invoke: function(cmd) {
    return new Promise(function(resolve, reject) {
      var id = ++cid;
      pending[id] = { resolve: resolve, reject: reject };
      ipcRenderer.send("mod:kbm-req", { id: id, cmd: cmd });
      setTimeout(function() {
        if (pending[id]) { pending[id].reject(new Error("timeout")); delete pending[id]; }
      }, 10000);
    });
  },
  send: function(cmd) {
    ipcRenderer.send("mod:kbm-req", { id: 0, cmd: cmd });
  }
});