<p align="center">
  <img src="https://img.shields.io/badge/version-2.9.5-996669?style=flat-square" alt="version">
  <img src="https://img.shields.io/badge/game-MeijuStorydemo-ff69b4?style=flat-square" alt="game">
  <img src="https://img.shields.io/badge/platform-Steam-1b2838?style=flat-square&logo=steam" alt="steam">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="license">
</p>

<h1 align="center">🎀 MeijuMod</h1>
<p align="center"><b>妹居物语</b> · 第三方模组</p>

---

## ✨ 功能

| 🎮 功能 | 📝 说明 |
|:---|:---|
| 🔓 **免登录模式** | 跳过登录直接进入游戏 |
| 🐾 **桌宠破解** | 免登录桌宠 · Live2D 强制开启 · 独立聊天窗口 · 独立 API |
| 📚 **本地 AI 搜题** | 教师服搜题使用模组独立 API，不依赖游戏服务器 |
| 🖼️ **本地 AI 场景识别** | 实景约会场景识别使用模组独立 API |
| ⌨️ **Alt 键主动识屏** | 按 `左 Alt` 立即触发桌宠窗口识别（2 秒防抖） |
| ⏱️ **窗口识别频率** | 5s · 10s · 30s · 60s · 仅 Alt · 关闭，面板可调 |
| 🎙️ **RTC 全模态语音** | 火山引擎豆包 RTC + 实时语音 API |

---

## 🚀 快速开始

### 部署

将文件复制到游戏 `resources\` 目录：

```
C:\Program Files (x86)\Steam\steamapps\common\MeijuStory_Demo\resources\
├── install-hooks.js    ← 主进程钩子
└── meiju-mod\
    ├── mod.js           ← 模组主体
    ├── mod-config.json  ← 配置模板
    └── mod.css          ← 样式
```

### 卸载

删除 `resources\install-hooks.js` 和 `resources\meiju-mod\` 即可。

---

## ⚙️ 配置

在游戏内打开设置 → **模组** 标签页，可配置三套独立 API：

| 配置项 | localStorage Key | 用途 |
|:---|:---|:---|
| 📚 搜题/场景 | `meiju_mod_api_config` | 教师服搜题 + 实景约会场景识别 |
| 🐾 桌宠聊天 | `meiju_mod_pet_api_config` | 桌宠主动搭话 + 聊天窗口对话 |
| 🎙️ RTC 语音 | `meiju_mod_rtc_config` | 豆包 RTC + 实时语音 API |

所有 API 兼容 OpenAI 格式 `/v1/chat/completions`。

<details>
<summary>📋 配置示例</summary>

```json
{
  "baseurl": "https://api.openai.com/v1",
  "modelname": "gpt-4o",
  "apiKey": "sk-xxxxxxxx"
}
```
</details>

---

## 🖥️ 桌宠按钮

```
┌──────────┬────────┬──────────┬──────┬──────┐
│ AI全模态 │  聊天  │ RTC 语音 │ 大小 │ 关闭 │
│    ①     │   ②    │    ③     │  ④   │  ⑤   │
└──────────┴────────┴──────────┴──────┴──────┘
```

| # | 功能 | 版本 |
|:--:|:---|:---|
| ① | 原版全模态 AI 语音 | — |
| ② | 独立聊天窗口 | v2.9.1 |
| ③ | RTC 语音输入 | v2.9.2 |
| ④ | 三档大小切换 | — |
| ⑤ | 关闭桌宠 | — |

---

## 📁 文件清单

```
meiju-mod/
├── mod.js                    # 模组主体 (v2.9.5)
├── install-hooks.js          # Electron 主进程注入钩子
├── mod-config.json           # 默认配置模板
├── mod.css                   # 样式
├── README.md                 # 本文件
├── 使用说明.txt               # 中文详细说明
├── 豆包RTC开通指南.docx        # RTC 配置教程
└── tools/
    ├── desktop-control.ps1   # Windows 桌面控制脚本
    └── hotkey-right-alt.ps1  # 右 Alt 热键脚本
```

---

## 📝 更新日志

### v2.9.5
- ➕ 识别频率新增「仅 Alt 键识屏」选项
- 🔘 按键触发识屏独立开关
- ⌨️ Alt 键在任意自动频率下均可即时触发

### v2.9.4
- ⌨️ 左 Alt 键主动识屏（2 秒防抖）
- ⏱️ 窗口识别频率面板调节（5 / 10 / 30 / 60 秒）

### v2.9.3
- 🐛 修复 fetchModels URL 构建不一致
- 🐛 修复 panelTimer getComputedStyle
- 🎙️ RTC hook 注入正确属性 + 面板增加 apiKey/model 字段

### v2.9.2
- 🎙️ RTC 全模态语音（豆包 RTC + 实时语音 API）
- 💬 桌宠聊天按钮 + RTC 语音按钮

---

## 🛠️ 开发

```javascript
// mod.js 运行环境
// ✅ 可用：DOM API · fetch · localStorage
// ❌ 不可用：npm · node_modules · require
```

- 所有 API 调用走 OpenAI 兼容格式
- 配置持久化用 `localStorage`，不与游戏 IndexedDB 冲突
- CSS 内联在 `mod.js` 顶部，颜色变量统一在 `C` 对象中

---

<p align="center">
  <sub>Made with ❤️ for MeijuStory</sub>
</p>
