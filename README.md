# 云海湾门禁-集成

![version](https://img.shields.io/badge/version-v0.1.8-blue)
![hacs](https://img.shields.io/badge/hacs-default-orange)
![ha-version](https://img.shields.io/badge/HA-2026.5.0%2B-41BDF5)

云海湾虚拟门禁系统的 Home Assistant 自定义集成（Custom Integration），为 Addon 提供实体封装和前端交互能力。

## 功能

- 与 `uppercoast_doorlock` Addon 通信，同步呼叫状态和设备信息
- 提供以下 Home Assistant 实体：
  - `binary_sensor.vds_call_status` — 呼叫状态（待机 / 呼叫中）
  - `camera.vds_video` — 实时视频画面
  - `button.vds_button_unlock` — 远程解锁
  - `button.vds_button_answer` — 接听呼叫
  - `button.vds_button_hangup` — 挂断通话
- 通过 DataUpdateCoordinator 每秒轮询 Addon 状态
- 在 HA 事件总线上派发呼叫事件（`uppercoast_doorlock_call_started` / `call_ended` / `frame_received`）
- 提供 Service：`unlock`、`answer`、`hangup`、`monitor_start`、`monitor_stop`、`send_audio`

## 安装

### 方式一：HACS（推荐）

1. 打开 Home Assistant，进入 **HACS → 集成**
2. 点击右下角 **⋮ → 自定义仓库**
3. 填入仓库地址：`https://github.com/CelerPi/HA-UpperCoast-Doorlock-Integration`
4. 类别选择：**集成**
5. 在 HACS 集成列表中找到 **云海湾门禁-集成**，点击 **下载**
6. 重启 Home Assistant

### 方式二：手动安装

1. 下载本仓库中的 `custom_components/uppercoast_doorlock/` 目录
2. 将其复制到 Home Assistant 的 `config/custom_components/` 目录下
3. 重启 Home Assistant

## 配置

重启后，进入 **设置 → 设备与服务 → 添加集成**，搜索「虚拟门禁系统」或「uppercoast」：

| 参数 | 说明 | 示例 |
|------|------|------|
| `Host` | Addon 的 IP 地址 | `192.168.16.64` |
| `Port` | Addon 的 API 端口 | `8099` |
| `Token` | Addon 的 API 令牌 | `1234` |

> 配置前请确保 Addon 已启动（日志显示「监听中」）。

## 依赖

- Home Assistant 2026.5.0 或更高版本
- **[uppercoast_doorlock Addon](https://github.com/CelerPi/HA_Virtual_Doorlock_System_App)** 已安装并运行
- **[云海湾门禁卡片](https://github.com/CelerPi/HA-UpperCoast-Doorlock-Card)**（可选，用于 Dashboard 弹窗和监控界面）

## 故障排查

### 实体始终显示为 `off` 或 `unavailable`

1. 确认 Addon 已启动（查看 Addon 日志是否有「监听中」）
2. 确认 Integration 配置中的 Host/Port/Token 与 Addon 一致
3. 在 HA 的 **开发者工具 → 状态** 中搜索 `vds_call_status`，观察 connection_status 属性
4. 查看 HA 系统日志中是否有 `uppercoast_doorlock` 相关错误

### 配置时提示「无法连接到后端服务」

1. 确认 Addon 已经启动完成（首次启动可能需要 10~30 秒）
2. 如果 Addon 和 HA Core 不在同一网络命名空间，尝试将 Host 改为 Addon 所在主机的实际 IP（而非 `127.0.0.1`）

## 相关仓库

| 仓库 | 说明 |
|------|------|
| [HA-UpperCoast-Doorlock-Integration](https://github.com/CelerPi/HA-UpperCoast-Doorlock-Integration) | 本仓库，集成源码 |
| [HA_Virtual_Doorlock_System_App](https://github.com/CelerPi/HA_Virtual_Doorlock_System_App) | Addon 源码 |
| [HA-UpperCoast-Doorlock-Card](https://github.com/CelerPi/HA-UpperCoast-Doorlock-Card) | Dashboard 卡片源码 |

## License

[MIT](LICENSE)
