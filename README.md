# MeijuMod v2.9.5

妹居物语 (MeijuStory) Steam 游戏第三方自由模组。

## 文件清单

| 文件 | 说明 |
|------|------|
| `mod.js` | 模组主体 v2.9.5，IIFE 注入渲染进程 |
| `install-hooks.js` | Electron 主进程钩子，挂载 web-contents-created 事件 |
| `mod-config.json` | 默认配置模板 |
| `mod.css` | 样式文件（当前 CSS 内联在 mod.js 中） |
| `tools/desktop-control.ps1` | Windows 桌面控制辅助脚本 |
| `tools/hotkey-right-alt.ps1` | 右 Alt 热键脚本 |

## 部署方式

复制 `meiju-mod\` 文件夹和 `install-hooks.js` 到游戏 `resources\` 目录：

```
C:\Program Files (x86)\Steam\steamapps\common\MeijuStory_Demo\resources\
```

## 功能列表

| 功能 | 说明 |
|------|------|
| 免登录模式 | 跳过登录直接进入游戏 |
| 桌宠破解 | 免登录桌宠 + Live2D 强制开启 + 独立聊天按钮 + 独立 API |
| 本地 AI 搜题 | 教师服搜题使用模组独立 API（不依赖游戏服务器） |
| 本地 AI 场景识别 | 实景约会场景识别使用模组独立 API |
| Alt 键主动识屏 | 按左 Alt 键立即触发桌宠窗口识别（2 秒防抖） |
| 窗口识别频率 | 5s / 10s / 30s / 60s / 仅 Alt 键 / 关闭，面板可调 |
| RTC 全模态语音 | 桌宠 RTC 语音输入按钮 + 火山引擎豆包 RTC + 实时语音 API |

## 桌宠按钮布局

```
[AI全模态]  [聊天]  [RTC语音]  [大小]  [关闭]
   ①          ②       ③         ④      ⑤
① 原版全模态 AI 语音
② 独立聊天窗口 (v2.9.1)
③ RTC 语音输入 (v2.9.2)
④ 三档大小切换
⑤ 关闭桌宠
```

## 三套独立 API 配置

| 配置 | localStorage Key | 用途 |
|------|-----------------|------|
| 搜题/场景 API | `meiju_mod_api_config` | 教师服搜题 + 实景约会场景识别 |
| 桌宠聊天 API | `meiju_mod_pet_api_config` | 桌面宠物主动搭话 + 聊天窗口对话 |
| RTC 语音配置 | `meiju_mod_rtc_config` | 火山引擎豆包 RTC + 实时语音 API |

## 教师服搜题

装备教师服 (outfit15，已自动解锁) 后聊天框出现相机图标，拍照使用模组 API 搜题。原版游戏聊天 API 不受影响。

## 更新日志

### v2.9.5
- 识别频率新增"仅 Alt 键识屏"选项
- 按键触发识屏独立开关
- Alt 键在任意自动频率下均可即时触发

### v2.9.4
- 左 Alt 键主动识屏（2 秒防抖）
- 窗口识别频率面板调节（5/10/30/60 秒）

### v2.9.3
- 修复 fetchModels URL 构建不一致
- 修复 injectPetApiToManager 类型守卫
- 修复 panelTimer getComputedStyle
- RTC hook 注入正确属性 + 面板增加 apiKey/model 字段

### v2.9.2
- RTC 全模态语音（豆包 RTC + 实时语音 API）
- 桌宠聊天按钮 + RTC 语音按钮
- 清理无限制约会代码

## 开发注意

- mod.js 运行在游戏渲染进程的浏览器环境，无 npm/node_modules
- 只能用原生 DOM API + fetch + localStorage
- 所有 API 调用走 OpenAI 兼容格式 `/v1/chat/completions`
- 配置持久化用 localStorage，不与游戏原版 IndexedDB 冲突
