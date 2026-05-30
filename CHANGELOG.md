# 更新日志

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
