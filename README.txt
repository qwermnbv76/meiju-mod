MeijuMod v2.9.2

=== 文件清单 ===
D:\yuki\meiju-mod\
  install-hooks.js      (注入钩子，挂载到Electron web-contents-created)
  mod.js                (模组主体 v2.9.2, 35923 bytes)
  mod.css               (样式文件，当前CSS内联在mod.js中)
  mod-config.json       (默认配置模板)
  README.txt            (本文件)

=== 部署方式 ===
复制 meiju-mod\ 文件夹和 install-hooks.js 到游戏 resources\ 目录：
  C:\Program Files (x86)\Steam\steamapps\common\MeijuStory_Demo\resources\

=== 功能列表 v2.9.2 ===
1. 免登录模式        - 跳过登录直接进入游戏
2. 桌宠破解          - 免登录桌宠 + 独立聊天按钮 + 独立API
3. 本地AI搜题        - 教师服搜题使用模组独立API
4. 本地AI场景识别    - 实景约会场景识别使用模组独立API
5. RTC全模态语音     - 桌宠RTC语音输入按钮 + 火山引擎豆包RTC

=== 桌宠按钮布局 ===
[AI全模态] [聊天] [RTC语音] [大小] [关闭]
   ①         ②       ③       ④      ⑤
① 原版全模态AI语音
② 独立聊天窗口 (v2.9.1新增)
③ RTC语音输入   (v2.9.2新增)
④ 三档大小切换
⑤ 关闭桌宠

=== 三套独立API配置 ===
- 搜题/场景 API  (meiju_mod_api_config)
- 桌宠聊天 API   (meiju_mod_pet_api_config)
- RTC语音配置    (meiju_mod_rtc_config)

=== 教师服搜题 ===
装备教师服(outfit15，已自动解锁)后聊天框出现相机图标，
拍照使用模组API搜题。原版游戏聊天API不受影响。

=== RTC全模态语音 ===
在模组面板填写火山引擎 appId + appKey，
点击测试连接验证，开启后桌宠出现RTC语音按钮。