# 更新日志

## v0.1.2

- Coordinator 增加连接失败时的详细错误日志（Addon 地址 + 异常原因）
- 当 Addon 返回空设备列表时增加警告日志
- `binary_sensor` 属性新增 `api_url`、`device_count`、`connection_status`
  - 便于在 HA 开发者工具中直接查看 Integration 与 Addon 的连接状态

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
