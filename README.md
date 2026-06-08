<p align="center">
  <img src="https://img.shields.io/badge/version-2.9.8-996669?style=flat-square" alt="version">
  <img src="https://img.shields.io/badge/game-MeijuStory_demo-ff69b4?style=flat-square" alt="game">
  <img src="https://img.shields.io/badge/platform-Steam-1b2838?style=flat-square&logo=steam" alt="steam">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="license">
</p>

<h1 align="center">&#x1f380; MeijuMod</h1>
<p align="center"><strong>妹居物语</strong> &middot; 第三方自由模组 &middot; 键盘鼠标控制 + 桌宠 AI 增强</p>

---

## &#x2728; 功能

| &#x1f3ae; 功能 | &#x1f4dd; 说明 |
|:---|:---|
| &#x1f513; **免登录模式** | 跳过登录直接进入游戏 |
| &#x1f43e; **桌宠破解** | 免登录桌宠 &middot; Live2D 强制开启 &middot; 独立聊天窗口 &middot; 独立 API |
| &#x1f4da; **本地 AI 搜题** | 教师服搜题使用模组独立 API，不依赖游戏服务器 |
| &#x1f5bc;&#xfe0f; **本地 AI 场景识别** | 实景约会场景识别使用模组独立 API |
| &#x2328;&#xfe0f; **Alt 键主动识屏** | 按 `左 Alt` 立即触发桌宠窗口识别（2 秒防抖）+ 顶部提示框 |
| &#x23f1;&#xfe0f; **窗口识别频率** | 5s &middot; 10s &middot; 30s &middot; 60s &middot; 仅 Alt &middot; 关闭，面板可调 |
| &#x1f399;&#xfe0f; **RTC 全模态语音** | 火山引擎豆包 RTC + 实时语音 API |
| &#x1f5b1;&#xfe0f; **键鼠控制** | 模拟鼠标移动/点击/滚轮、键盘输入、文本发送 |

---

## &#x1f680; 快速开始

### 部署

将文件复制到游戏 `resources\` 目录：

```
%STEAM%\steamapps\common\MeijuStory_Demo\resources\
├── install-hooks.js       ← 主进程钩子
└── meiju-mod\
    ├── mod.js             ← 模组主体
    ├── kbm-preload.js     ← 键鼠 IPC 桥接
    ├── kbm-helper.exe     ← 键鼠底层驱动
    ├── mod-config.json    ← 配置模板
    └── mod.css            ← 样式
```

### 卸载

删除 `resources\install-hooks.js` 和 `resources\meiju-mod\` 即可。

---

## &#x2699;&#xfe0f; 配置

在游戏内打开设置 &rarr; **模组** 标签页，可配置三套独立 API + 键鼠控制：

| 配置项 | localStorage Key | 用途 |
|:---|:---|:---|
| &#x1f4da; 搜题/场景 | `meiju_mod_api_config` | 教师服搜题 + 实景约会场景识别 |
| &#x1f43e; 桌宠聊天 | `meiju_mod_pet_api_config` | 桌宠主动搭话 + 聊天窗口对话 |
| &#x1f399;&#xfe0f; RTC 语音 | `meiju_mod_rtc_config` | 豆包 RTC + 实时语音 API |
| &#x1f5b1;&#xfe0f; 键鼠控制 | 面板内嵌 | 鼠标移动/点击/滚轮/文本输入 |

所有 API 兼容 OpenAI 格式 `/v1/chat/completions`。

<details>
<summary>&#x1f4cb; 配置示例</summary>

```json
{
  "baseurl": "https://api.openai.com/v1",
  "modelname": "gpt-4o",
  "apiKey": "sk-xxxxxxxx"
}
```
</details>

---

## &#x1f5a5;&#xfe0f; 桌宠按钮

```
┌──────────┬────────┬──────────┬──────┬──────┐
│ AI全模态 │  聊天  │ RTC 语音 │ 大小 │ 关闭 │
│    &#x2460;     │   &#x2461;   │    &#x2462;    │  &#x2463;  │  &#x2464;  │
└──────────┴────────┴──────────┴──────┴──────┘
```

| # | 功能 | 版本 |
|:--:|:---|:---|
| &#x2460; | 原版全模态 AI 语音 | &mdash; |
| &#x2461; | 独立聊天窗口 | v2.9.1 |
| &#x2462; | RTC 语音输入 | v2.9.2 |
| &#x2463; | 三档大小切换 | &mdash; |
| &#x2464; | 关闭桌宠 | &mdash; |

---

## &#x1f5b1;&#xfe0f; 键鼠控制面板

模组设置面板底部提供键鼠模拟操作：

| 按钮 | 功能 |
|:---|:---|
| 左键 | 鼠标左键点击 |
| 右键 | 鼠标右键点击 |
| 中键 | 鼠标中键点击 |
| 滚轮上 | 向上滚动 |
| 滚轮下 | 向下滚动 |
| 移动到中心 | 鼠标移动到屏幕中心 (960, 540) |
| 文本输入框 + 发送 | 模拟键盘输入文本 |

底层由 `kbm-helper.exe` (C/Win32 API) 驱动，通过 preload 桥接与主进程通信。

---

## &#x1f4c1; 文件清单

```
meiju-mod/
├── mod.js               # 模组主体 (v2.9.8)
├── install-hooks.js     # Electron 主进程注入钩子
├── kbm-preload.js       # 键鼠 IPC 桥接 (contextBridge)
├── kbm-helper.exe       # 键鼠底层驱动 (Win32)
├── kbm-helper.c         # 键鼠驱动源码
├── mod-config.json      # 默认配置模板
├── mod.css              # 样式
├── README.md            # 本文件
├── 使用说明.txt          # 中文详细说明
└── 豆包RTC开通指南.docx   # RTC 配置教程
```

---

## &#x1f4dd; 更新日志

### v2.9.8
- &#x1f527; 重大修复：通过 preload + contextBridge 建立 IPC 桥接，适配 contextIsolation
- &#x1f5b1;&#xfe0f; 新增键鼠控制面板（鼠标移动/点击/滚轮/键盘输入）
- &#x1f6a8; 新增 Alt 识屏顶部提示框（#996669 配色）
- &#x2699;&#xfe0f; BrowserWindow 构造函数 Hook 自动注入 kbm-preload.js

### v2.9.7
- &#x1f5b1;&#xfe0f; 添加 kbm-helper.exe 底层键鼠驱动

### v2.9.6
- &#x2795; 识别频率新增「仅 Alt 键识屏」选项
- &#x1f518; 按键触发识屏独立开关
- &#x2328;&#xfe0f; Alt 键在任意自动频率下均可即时触发

### v2.9.5
- &#x2328;&#xfe0f; 左 Alt 键主动识屏（2 秒防抖）
- &#x23f1;&#xfe0f; 窗口识别频率面板调节（5 / 10 / 30 / 60 秒）

### v2.9.4 ~ v2.9.0
- &#x1f41b; 修复 fetchModels URL 构建不一致
- &#x1f399;&#xfe0f; RTC 全模态语音（豆包 RTC + 实时语音 API）
- &#x1f4ac; 桌宠聊天按钮 + RTC 语音按钮

---

## &#x1f6e0;&#xfe0f; 架构

```
┌──────────────────────────────────────┐
│  install-hooks.js (主进程)            │
│  ├── BrowserWindow Hook ──? kbm-preload│
│  ├── web-contents-created ──? mod.js  │
│  ├── startKbmService() ──? kbm-helper│
│  └── setupKbmIpc() ?──? preload IPC  │
├──────────────────────────────────────┤
│  kbm-preload.js (preload 上下文)      │
│  ├── 加载原始 preload.js             │
│  └── contextBridge ──? window.meijuKbm│
├──────────────────────────────────────┤
│  mod.js (渲染进程)                    │
│  ├── CSS 注入 + 配置层               │
│  ├── 三套独立 API                    │
│  ├── 键鼠控制面板                    │
│  └── 桌宠按钮 + 设置面板注入          │
└──────────────────────────────────────┘
```

---

## &#x1f6e0;&#xfe0f; 开发

```javascript
// mod.js 运行环境
// &#x2705; 可用：DOM API &middot; fetch &middot; localStorage &middot; window.meijuKbm (preload)
// &#x274c; 不可用：npm &middot; node_modules &middot; require("electron")
```

- 所有 API 调用走 OpenAI 兼容格式
- 配置持久化用 `localStorage`，不与游戏 IndexedDB 冲突
- CSS 内联在 `mod.js` 顶部，颜色变量统一在 `C` 对象中
- 键鼠通信经 `kbm-preload.js` (contextBridge) &rarr; `ipcMain` &rarr; `kbm-helper.exe`

---

## &#x1f511; 安全

本模组不含任何敏感信息。API Key 存储在本地 `localStorage`，不上传任何服务器。

---

<p align="center">
  <sub>Made with &#x2764;&#xfe0f; for MeijuStory</sub>
</p>