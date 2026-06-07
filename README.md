<p align="center">
  <img src="https://img.shields.io/badge/version-2.9.2-%23996669?style=flat-square" />
  <img src="https://img.shields.io/badge/game-妹居物语%20Demo-%23996669?style=flat-square" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" />
</p>

<h1 align="center">MeijuMod</h1>
<p align="center"><strong>妹居物语 · 自由模组</strong></p>
<p align="center">即放即用 / 独立API / 三套配置 / 零侵入</p>

---

## 快速开始

将 install-hooks.js 和 meiju-mod/ 复制到游戏 esources\ 目录，启动游戏即生效。

`
Steam → 右键「妹居物语」→ 管理 → 浏览本地文件 → resources\

resources\
├── app.asar
├── install-hooks.js          ← 放在这里
└── meiju-mod\
    ├── mod.js
    ├── mod.css
    └── mod-config.json
`

卸载：删除上述两个文件/文件夹即可恢复原版。

---

## 功能

| 功能 | 说明 |
|------|------|
| **免登录** | 跳过账号登录，直接进入游戏 |
| **桌宠破解** | 免登录桌面宠物 + 独立聊天按钮 + 独立API |
| **AI 搜题** | 教师服拍照搜题，调用自定义 AI 服务商 |
| **场景识别** | 实景约会场景分析，调用自定义 AI |
| **RTC 语音** | 火山引擎豆包全模态语音，桌宠独立控制按钮 |

---

## 配置

游戏内 **设置 → 云端大模型 → 模组** 标签页。

三套 **独立 API**，互不干扰，各走各的模型：

| API 配置 | 用途 |
|----------|------|
| **搜题 / 场景** | 教师服 OCR 搜题 + 实景约会场景识别 |
| **桌宠聊天** | 桌面宠物主动搭话 + 聊天窗口对话 |
| **RTC 语音** | 火山引擎豆包全模态语音 |

> 游戏原版聊天 API（云端大模型设置）不受模组影响。

支持任意 OpenAI 兼容服务商：

OpenAI DeepSeek Groq OpenRouter SiliconFlow 自定义

---

## 教师服搜题

1. 教师服（outfit15）已自动解锁
2. 装备后聊天框出现相机图标
3. 拍照 → 裁切 → AI 识别 → 结果插入聊天

---

## 桌宠按钮

鼠标靠近或拖动桌宠窗口时显示：

`
[🤖]  [💬]  [🎙]   [↔]  [✕]
 ①     ②     ③     ④    ⑤

① 全模态AI语音    ② 独立聊天（模组）    ③ RTC语音（模组）
④ 大小切换        ⑤ 关闭
`

---

## 文件结构

`
install-hooks.js           Electron 注入钩子
meiju-mod/
├── mod.js                 模组主体（所有补丁逻辑）
├── mod.css                样式
└── mod-config.json        默认配置模板
`

---

## 常见问题

**Q: 模组不生效？**
确认 install-hooks.js 和 meiju-mod/ 都在 esources\ 根目录下。

**Q: 搜题/聊天用哪个 API？**
搜题走模组的「搜题/场景 API」、桌宠搭话走「桌宠聊天 API」、原版聊天走云端大模型设置，三者独立。

**Q: 怎么更新配置？**
所有配置实时生效，保存在浏览器 localStorage 中，无需重启。

---

## 许可证

MIT License