# 更新日志

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
