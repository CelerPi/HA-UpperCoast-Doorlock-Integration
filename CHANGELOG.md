# 更新日志

## v0.3.7

- **启动移动端完整体验第一阶段**
  - 手机来电通知蓝图支持摄像头预览、接听/查看、解锁、挂断和通话结束自动清除通知
  - 通知参数兼容 iOS time-sensitive/Critical Alert 与 Android high priority/ttl 0
  - 移动端打开门禁卡片时默认显示大弹窗，桌面端继续使用右下角画中画
  - 优化移动端音频播放和麦克风采集，使用兼容 AudioContext、回声消除、降噪和自动增益

## v0.3.6

- **修复呼入未接听时自动播放音频**
  - 前端仍接收实时音频数据并更新音频序号，但未接听前不播放声音
  - 点击接听后才启动扬声器播放和麦克风上行，进入双向通话
  - 接听时从当前音频序号开始，避免补播接听前缓存的音频

## v0.3.5

- **修复 WebSocket 握手持续失败**
  - 新增 `/api/uppercoast_doorlock/ws_path`，通过 HA `authSig` 生成短期签名 WebSocket 路径
  - 前端先用 Bearer token 获取签名路径，再建立 WebSocket
  - WebSocket 视图交回 HA 标准鉴权中间件处理，避免 query token 自校验失败

## v0.3.4

- **增强 WebSocket 重连和麦克风兼容性**
  - WebSocket 失败后不再永久禁用实时通道，会自动退避重连
  - 连接失败时继续使用现有 HTTP 轮询兜底
  - 非 HTTPS 环境下麦克风不可用时优雅跳过，不再抛 `getUserMedia` 错误

## v0.3.3

- **修复默认仪表盘模式下资源版本号仍不更新**
  - 不再要求 Lovelace mode 必须等于 `storage`
  - 兼容 HA 默认 `auto-gen` 模式下的 storage resources
  - 只要资源集合支持写入，就自动同步内置卡片版本号

## v0.3.2

- **修复 Dashboard 资源版本号未自动同步**
  - 配置项加载时再次同步内置卡片资源 URL
  - 已存在的 `/doorlock-card.js` 资源会被更新到当前集成版本
  - 兼容旧版本号、旧 query string 和重复资源清理

## v0.3.1

- **改用 WebSocket 二进制媒体帧**
  - Addon 到前端的视频帧改为直接传输 JPEG bytes，移除 JSON/base64 开销
  - 音频帧改为直接传输 PCM bytes，保留旧 JSON/base64 兼容解析
  - Integration WebSocket 代理支持二进制消息透传

## v0.3.0

- **优化实时视频播放流畅度**
  - WebSocket 收到视频帧后直接更新视频 `<img>`，不再触发整张卡片重渲染
  - 视频帧更新合并到 `requestAnimationFrame`，避免高帧率下阻塞 UI
  - 呼叫弹窗、PiP 小窗和监控弹窗共用同一套轻量视频刷新逻辑

## v0.2.9

- **修复通话音频播放采样率错误**
  - 前端按 8kHz PCM 正确排队播放门口机音频
  - 避免浏览器 48kHz AudioContext 将音频错误加速成蜂鸣声
  - 增加小缓冲，降低 WebSocket 抖动导致的破音

## v0.2.8

- **修复呼叫弹窗大尺寸未生效**
  - 为真实呼叫/通话弹窗补上 `call-popup` 样式类
  - 让 640px 宽度和 4:3 视频区域真正应用到中间弹窗
  - 独立 Dashboard 卡片与集成内置卡片保持一致

## v0.2.7

- **放大中间呼叫弹窗**
  - 呼叫/通话弹窗改为更大的 4:3 视频区域
  - 视频使用 `contain` 显示，避免裁切原始门禁画面
  - 对讲拨号弹窗保持原尺寸不变

## v0.2.6

- **兼容新版 Home Assistant Camera API**
  - `UpperCoastDoorlockCamera.async_camera_image()` 新增 `width` / `height` 参数
  - 修复 HA 请求摄像头截图时报 `unexpected keyword argument 'width'`

## v0.2.5

- **自动注册 Dashboard 卡片资源**
  - 集成启动后自动创建或更新 Lovelace resource
  - 资源 URL 自动带上当前集成版本号，升级后自动刷新为新版 JS
  - 保留 YAML 模式下的手动配置说明

## v0.2.4

- **优化右下角通话小窗展开交互**
  - 点击 PiP 小窗视频画面时放大为中间弹窗
  - 按钮区不再触发展开，避免误操作
  - 视频区域增加放大提示光标

## v0.2.3

- **修复右下角通话小窗按钮状态**
  - 呼入未接听时显示「接听」
  - 接听进入通话后自动切换为「挂断」
  - 主卡片在呼叫/通话中显示「开锁 / 挂断」，避免找不到结束通话入口

## v0.2.2

- **修复静态预览页与真实卡片不一致**
  - 预览页改为直接加载真实 `doorlock-card.js`
  - 使用 mock Home Assistant 实体状态驱动同一个 `custom:doorlock-card`
  - 避免预览页和实际卡片各写一套 UI 导致视觉漂移

## v0.2.1

- **修复 HACS 列表图标不显示**
  - 在仓库根目录新增 `brand/icon.png` 和 `brand/logo.png`
  - 保留 `custom_components/uppercoast_doorlock/brand/`，同时兼容 Home Assistant 本地品牌图
  - 更新 `manifest.json` 版本至 `0.2.1`

## v0.2.0

- **内置 Dashboard 卡片**
  - 将卡片资源整合进 Integration，安装集成后通过 `/uppercoast_doorlock/doorlock-card.js` 加载
  - 新增 `frontend/` 目录和卡片静态预览页，便于脱离 HA 调整 UI
- **新增 WebSocket 实时通道代理**
  - 新增 `/api/uppercoast_doorlock/ws`，由 HA 鉴权后代理 Addon WebSocket
  - 卡片优先通过 WebSocket 接收实时视频帧和音频数据，失败时回退 HTTP 轮询
- **移动端来电通知蓝图**
  - 新增 `blueprints/automation/mobile_call_notification.yaml`
  - 支持 iOS / Android Home Assistant App 来电推送、打开画面、解锁和挂断动作
- **配置与生命周期优化**
  - API client 改用 HA 共享 aiohttp session
  - 服务和 HTTP view 改为集成初始化时注册，避免重载重复注册
  - Options Flow 支持修改 Host / Port / Token 后自动重载
- **品牌与目录结构整理**
  - 按 HA 2026.3+ 本地品牌图结构整理 `brand/`
  - 更新 `manifest.json` 版本至 `0.2.0`，补充 `iot_class`

## v0.1.9

- **`binary_sensor` 区分呼叫与监控状态**
  - `is_on` 仅在 Addon 返回 `session_type == "call"` 时返回 `True`
  - 解决主动监控时误触发呼入弹窗的问题

## v0.1.8

- **修复 Coordinator 事件总线属性错误**
  - `coordinator.py` 中 `self._hass` 修正为 `self.hass`，恢复呼叫/挂断/帧事件派发
- **所有实体正确继承 `CoordinatorEntity`**
  - `binary_sensor.py`、`camera.py`、`button.py` 统一继承 `CoordinatorEntity`
  - 解决实体状态不随 Coordinator 刷新而更新的问题（`binary_sensor` 始终为 `off` 的根因）
- **修复 `camera.py` 读取 `has_frame` 层级错误**
  - 从 `data.get("has_frame")` 修正为 `data["runtime"]["has_frame"]`
- **修复 `button.py` 读取 `target_ip` 层级错误**
  - 从 `data.get("target_ip")` 修正为 `data["runtime"]["target_ip"]`，恢复解锁/接听/挂断功能
- **修复 `async_unload_entry` API 调用**
  - `hass.config_entries.async_unload_entries` 修正为 `async_unload_platforms`

## v0.1.5

- **彻底修复实体 ID 再次变回拼音的问题**
  - 为所有实体显式添加 `_attr_suggested_object_id`
  - 强制 Home Assistant 使用指定的英文 entity_id，不再依赖设备名称推导
  - 新 entity_id 与之前保持一致：
    - `binary_sensor.vds_call_status`
    - `camera.vds_video`
    - `button.vds_button_unlock`
    - `button.vds_button_answer`
    - `button.vds_button_hangup`
- `camera` 实体的 `unique_id` 从 `vds_camera` 修正为 `vds_video`，与卡片引用完全一致
- 修复 `binary_sensor.py` 运行时类型注解缺少 `Any` 导入的隐患

## v0.1.4

- **所有实体 ID 改为英文，彻底解决拼音问题**
  - 为 `binary_sensor`、`camera`、`button` 添加 `translation_key` 和 `has_entity_name = True`
  - DeviceInfo name 改为英文缩写 "VDS"
  - 新增中英翻译文件中的 `entity` 字段
  - 新的实体 ID：
    - `binary_sensor.vds_call_status`
    - `camera.vds_video`
    - `button.vds_unlock`
    - `button.vds_answer`
    - `button.vds_hangup`

## v0.1.3

- `binary_sensor` 实体 ID 缩短为 `binary_sensor.vds_call_status`
  - 解决原有名称过长、在 HA 中显示为拼音的问题

## v0.1.2

- **关键修复：Addon 离线时实体也能被创建**
  - Coordinator 连接失败时不再抛出 `UpdateFailed` 阻塞实体创建
  - 返回空数据并记录 `connection_error`，实体以离线状态存在
  - 日志增加退避机制（前 3 次及每 60 次记录一次），避免刷屏
- `binary_sensor` 属性增强
  - 新增 `api_url`、`device_count`、`connection_status`、`connection_error`
  - 便于在 HA 开发者工具中直接查看 Integration 与 Addon 的连接状态
- `camera`、`button` 增加异常捕获，Addon 离线时操作不会崩溃

## v0.1.1

- 新增 HTTP 音频接口 `GET/POST /api/uppercoast_doorlock/audio`
  - 支持从 Addon 拉取音频数据并转发给卡片
  - 支持接收卡片上传的麦克风音频并转发给 Addon
- 新增 `uppercoast_doorlock.send_audio` Service，供卡片或自动化发送音频数据
- 新增 `binary_sensor.uppercoast_doorlock_call_active`
  - 暴露呼叫状态、楼栋名称、门口机列表等属性
  - 供卡片动态读取设备信息
- 新增 `DataUpdateCoordinator`，定时同步 Addon 的运行时状态和配置
- 新增 Service：`unlock`、`answer`、`hangup`、`monitor_start`、`monitor_stop`
- 新增 `camera` 实体，提供门口机实时视频画面

## v0.1.0

- 初始版本
- 基础 Integration 框架（`custom_components/uppercoast_doorlock`）
- Config Flow 可视化配置
- 基础 HTTP API 客户端与 Addon 通信
