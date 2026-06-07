'use strict';

const fs = require('fs');
const path = require('path');
const Module = require('module');

function toRelativePosix(appDir, targetPath) {
  const rel = path.relative(appDir, targetPath);
  return rel.split(path.sep).join('/');
}

function lookupCandidatesFromRelative(relPath) {
  const out = [];
  const normalized = String(relPath || '').replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized) {
    return out;
  }

  out.push(normalized);
  if (normalized.startsWith('app.asar/')) {
    out.push(normalized.slice('app.asar/'.length));
  }
  if (normalized.startsWith('app.asar.unpacked/')) {
    out.push(normalized.slice('app.asar.unpacked/'.length));
  }

  return Array.from(new Set(out));
}

function hasMappedDecryptedFile(cryptoModule, relPath) {
  const candidates = lookupCandidatesFromRelative(relPath);
  for (const candidate of candidates) {
    if (cryptoModule.hasDecryptedFile(candidate)) {
      return true;
    }
  }
  return false;
}

function getMappedDecryptedBuffer(cryptoModule, relPath) {
  const candidates = lookupCandidatesFromRelative(relPath);
  for (const candidate of candidates) {
    if (cryptoModule.hasDecryptedFile(candidate)) {
      return Buffer.from(cryptoModule.getDecryptedFile(candidate));
    }
  }
  return null;
}

function getMappedDecryptedText(cryptoModule, relPath) {
  const candidates = lookupCandidatesFromRelative(relPath);
  for (const candidate of candidates) {
    if (cryptoModule.hasDecryptedFile(candidate)) {
      return cryptoModule.getDecryptedText(candidate);
    }
  }
  return null;
}

function resolveFilePath(inputPath) {
  if (typeof inputPath !== 'string') {
    return null;
  }

  if (path.isAbsolute(inputPath)) {
    return path.normalize(inputPath);
  }

  return path.normalize(path.resolve(process.cwd(), inputPath));
}

function normalizeEncoding(options) {
  if (typeof options === 'string') {
    return options;
  }
  if (options && typeof options === 'object' && typeof options.encoding === 'string') {
    return options.encoding;
  }
  return null;
}

function encodeByOption(buffer, encoding) {
  if (!encoding) {
    return buffer;
  }
  return buffer.toString(encoding);
}

function installFsAndModuleHooks(cryptoModule, appDir) {
  const originalReadFileSync = fs.readFileSync;
  const originalResolveFilename = Module._resolveFilename;
  const originalJsLoader = Module._extensions['.js'];
  const originalJsonLoader = Module._extensions['.json'];

  function resolveVirtualModuleFilename(request, parent) {
    if (typeof request !== 'string' || !request) {
      return null;
    }

    // 只处理相对/绝对路径模块，包名解析仍交给 Node 原生逻辑。
    const isRelative = request.startsWith('./') || request.startsWith('../');
    const isAbsolute = path.isAbsolute(request);
    if (!isRelative && !isAbsolute) {
      return null;
    }

    const baseDir = isAbsolute
      ? appDir
      : path.dirname((parent && parent.filename) ? parent.filename : path.join(appDir, 'main.js'));

    const requestedAbs = isAbsolute
      ? path.normalize(request)
      : path.normalize(path.resolve(baseDir, request));

    const candidates = [];
    if (path.extname(requestedAbs)) {
      candidates.push(requestedAbs);
    } else {
      candidates.push(requestedAbs);
      candidates.push(`${requestedAbs}.js`);
      candidates.push(`${requestedAbs}.json`);
      candidates.push(path.join(requestedAbs, 'index.js'));
      candidates.push(path.join(requestedAbs, 'index.json'));
    }

    for (const candidate of candidates) {
      const rel = toRelativePosix(appDir, candidate);
      if (rel.startsWith('..')) {
        continue;
      }
      if (hasMappedDecryptedFile(cryptoModule, rel)) {
        return candidate;
      }
    }

    return null;
  }

  fs.readFileSync = function patchedReadFileSync(filePath, options) {
    const abs = resolveFilePath(filePath);
    if (!abs) {
      return originalReadFileSync.apply(this, arguments);
    }

    const rel = toRelativePosix(appDir, abs);
    if (rel.startsWith('..')) {
      return originalReadFileSync.apply(this, arguments);
    }

    if (hasMappedDecryptedFile(cryptoModule, rel)) {
      const data = getMappedDecryptedBuffer(cryptoModule, rel);
      return encodeByOption(data, normalizeEncoding(options));
    }

    return originalReadFileSync.apply(this, arguments);
  };

  Module._resolveFilename = function patchedResolveFilename(request, parent, isMain, options) {
    const virtual = resolveVirtualModuleFilename(request, parent);
    if (virtual) {
      return virtual;
    }
    return originalResolveFilename.call(this, request, parent, isMain, options);
  };

  Module._extensions['.js'] = function patchedJsLoader(mod, filename) {
    const rel = toRelativePosix(appDir, filename);
    if (!rel.startsWith('..') && hasMappedDecryptedFile(cryptoModule, rel)) {
      const source = getMappedDecryptedText(cryptoModule, rel);
      mod._compile(source, filename);
      return;
    }
    originalJsLoader(mod, filename);
  };

  Module._extensions['.json'] = function patchedJsonLoader(mod, filename) {
    const rel = toRelativePosix(appDir, filename);
    if (!rel.startsWith('..') && hasMappedDecryptedFile(cryptoModule, rel)) {
      const source = getMappedDecryptedText(cryptoModule, rel);
      mod.exports = JSON.parse(source);
      return;
    }
    originalJsonLoader(mod, filename);
  };
}

function getContentTypeByPath(relPath) {
  const lower = relPath.toLowerCase();
  if (lower.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (lower.endsWith('.mjs')) return 'application/javascript; charset=utf-8';
  if (lower.endsWith('.json')) return 'application/json; charset=utf-8';
  if (lower.endsWith('.html') || lower.endsWith('.htm')) return 'text/html; charset=utf-8';
  if (lower.endsWith('.css')) return 'text/css; charset=utf-8';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  if (lower.endsWith('.txt')) return 'text/plain; charset=utf-8';
  if (lower.endsWith('.mp3')) return 'audio/mpeg';
  if (lower.endsWith('.wav')) return 'audio/wav';
  if (lower.endsWith('.ogg')) return 'audio/ogg';
  if (lower.endsWith('.m4a') || lower.endsWith('.aac')) return 'audio/aac';
  if (lower.endsWith('.flac')) return 'audio/flac';
  if (lower.endsWith('.mp4')) return 'video/mp4';
  if (lower.endsWith('.webm')) return 'video/webm';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.ico')) return 'image/x-icon';
  if (lower.endsWith('.woff')) return 'font/woff';
  if (lower.endsWith('.woff2')) return 'font/woff2';
  if (lower.endsWith('.ttf')) return 'font/ttf';
  if (lower.endsWith('.otf')) return 'font/otf';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.wasm')) return 'application/wasm';
  if (lower.endsWith('.xml')) return 'application/xml';
  return 'application/octet-stream';
}

function installProtocolHook(cryptoModule, appDir) {
  const { app, session } = require('electron');

  const installedSessions = new WeakSet();

  // Serve a disk/asar file with full Range request support so that
  // <audio> and <video> elements can seek and stream properly.
  function serveFileResponse(filePath, rel, request) {
    let content;
    try {
      content = fs.readFileSync(filePath);
    } catch (_) {
      return new Response('Not Found', { status: 404 });
    }

    const contentType = getContentTypeByPath(rel);
    const totalSize = content.length;
    const rangeHeader = request.headers.get('range');

    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = match[2] ? parseInt(match[2], 10) : totalSize - 1;
        const clampedEnd = Math.min(end, totalSize - 1);
        const chunk = content.slice(start, clampedEnd + 1);
        return new Response(chunk, {
          status: 206,
          headers: {
            'content-type': contentType,
            'content-range': `bytes ${start}-${clampedEnd}/${totalSize}`,
            'accept-ranges': 'bytes',
            'content-length': String(chunk.length),
          },
        });
      }
    }

    return new Response(content, {
      status: 200,
      headers: {
        'content-type': contentType,
        'content-length': String(totalSize),
        'accept-ranges': 'bytes',
      },
    });
  }

  async function registerOnSession(targetSession) {
    if (!targetSession || installedSessions.has(targetSession)) {
      return;
    }

    const protocolApi = targetSession.protocol;
    if (await protocolApi.isProtocolHandled('file')) {
      await protocolApi.unhandle('file');
    }

    await protocolApi.handle('file', async (request) => {
      const url = new URL(request.url);
      let pathname = decodeURIComponent(url.pathname);
      if (process.platform === 'win32' && /^\/[A-Za-z]:/.test(pathname)) {
        pathname = pathname.slice(1);
      }

      const filePath = path.normalize(pathname);
      const rel = toRelativePosix(appDir, filePath);

      if (!rel.startsWith('..') && hasMappedDecryptedFile(cryptoModule, rel)) {
        const body = getMappedDecryptedBuffer(cryptoModule, rel);
        return new Response(body, {
          headers: {
            'content-type': getContentTypeByPath(rel),
            'content-length': String(body.length),
            'cache-control': 'no-store',
          },
        });
      }

      // For non-encrypted files, read from disk/asar with Range support.
      return serveFileResponse(filePath, rel, request);
    });

    installedSessions.add(targetSession);
  }

  async function registerFileInterceptor() {
    await registerOnSession(session.defaultSession);
    await registerOnSession(session.fromPartition('persist:launcher'));
    await registerOnSession(session.fromPartition('persist:main'));
  }

  const onError = (error) => {
    console.error('[Encryption] file protocol hook registration failed:', error && error.message ? error.message : error);
  };

  if (app.isReady()) {
    registerFileInterceptor().catch(onError);
    return;
  }

  app.whenReady().then(() => registerFileInterceptor().catch(onError));
}

function runMainFromMemory(cryptoModule, appDir, mainRelativePath) {
  const mainRel = (mainRelativePath || 'main.js').split('\\').join('/');
  const source = getMappedDecryptedText(cryptoModule, mainRel);

  const virtualAsarRoot = path.join(appDir, 'app.asar');
  const mainAbs = path.join(virtualAsarRoot, ...mainRel.split('/'));
  const mainModule = new Module(mainAbs, null);
  mainModule.filename = mainAbs;
  mainModule.paths = Module._nodeModulePaths(path.dirname(mainAbs));
  process.mainModule = mainModule;
  require.main = mainModule;
  mainModule._compile(source, mainAbs);
}




// ============================================================
//  [MeijuMod] 外部注入 - hook BrowserWindow 向渲染进程注入模组
// ============================================================
function installModInjection(payloadRoot) {
  const { BrowserWindow } = require("electron");
  const fs = require("fs");
  const path = require("path");

  const modDir = path.join(payloadRoot, "meiju-mod");
  const modJsPath = path.join(modDir, "mod.js");
  const modCssPath = path.join(modDir, "mod.css");

  if (!fs.existsSync(modJsPath)) {
    console.log("[MeijuMod] mod.js 未找到，跳过注入。路径:", modJsPath);
    return;
  }

  const modJs = fs.readFileSync(modJsPath, "utf8");
  let modCss = "";
  try { modCss = fs.readFileSync(modCssPath, "utf8"); } catch (_) {}

  console.log("[MeijuMod] 模组已加载，将在每个窗口中注入");

  // Hook webContents creation: inject mod after page loads
  const origEmit = BrowserWindow.prototype._init ? null : null;

  // Hook via constructor
  const OrigBrowserWindow = BrowserWindow;
  const hookedWindows = new WeakSet();

  // Use the app-level event (more reliable)
  try {
    const { app } = require("electron");
    app.on("web-contents-created", (event, wc) => {
      wc.on("did-finish-load", () => {
        try {
          // Inject CSS
          if (modCss) {
            wc.insertCSS(modCss).catch(e =>
              console.warn("[MeijuMod] CSS 注入失败:", e.message)
            );
          }
          // Inject JS
          wc.executeJavaScript(modJs).then(() => {
            console.log("[MeijuMod] ✅ 模组 JS 已注入窗口");
          }).catch(e =>
            console.warn("[MeijuMod] JS 注入失败:", e.message)
          );
        } catch (e) {
          console.warn("[MeijuMod] 注入异常:", e.message);
        }
      });
    });
    console.log("[MeijuMod] web-contents-created 钩子已注册");
  } catch (e) {
    console.warn("[MeijuMod] 注册注入钩子失败:", e.message);
  }
}

function bootstrapAll(cryptoModule, appDir, mainRelativePath, payloadRoot) {
  if (!cryptoModule || typeof cryptoModule.bootstrap !== 'function') {
    throw new Error('invalid crypto module');
  }
  if (!appDir || typeof appDir !== 'string') {
    throw new Error('invalid appDir');
  }

  cryptoModule.bootstrap(payloadRoot || appDir);
  installFsAndModuleHooks(cryptoModule, appDir);
  installProtocolHook(cryptoModule, appDir);

  installModInjection(appDir);
  runMainFromMemory(cryptoModule, appDir, mainRelativePath || 'main.js');
}

module.exports = {
  bootstrapAll,
  installFsAndModuleHooks,
  installProtocolHook,
  runMainFromMemory,
};
