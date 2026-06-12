# 云海湾门禁-集成

![version](https://img.shields.io/badge/version-v0.4.9-blue)
![hacs](https://img.shields.io/badge/hacs-default-orange)
![ha-version](https://img.shields.io/badge/HA-2026.5.0%2B-41BDF5)

云海湾虚拟门禁系统的 Home Assistant 自定义集成（Custom Integration），为 Addon 提供实体封装，并内置 Dashboard 卡片资源。

## 功能

- 与 `uppercoast_doorlock` Addon 通信，同步呼叫状态和设备信息
- 提供以下 Home Assistant 实体：
  - `binary_sensor.vds_call_status` — 呼叫状态（空闲 / 呼叫中）
  - `camera.vds_video` — 实时视频画面
  - `button.vds_button_unlock` — 远程解锁
  - `button.vds_button_answer` — 接听呼叫
  - `button.vds_button_hangup` — 挂断通话
- 通过 DataUpdateCoordinator 每秒轮询 Addon 状态
- 在 HA 事件总线上派发呼叫事件（`uppercoast_doorlock_call_started` / `call_ended` / `frame_received`）
- 提供 Service：`unlock`、`answer`、`hangup`、`monitor_start`、`monitor_stop`、`send_audio`
- 内置 Dashboard 卡片：`custom:doorlock-card`
- 提供 WebSocket 代理：`/api/uppercoast_doorlock/ws`，用于实时视频帧和音频数据
- 提供手机来电通知蓝图：`blueprints/automation/mobile_call_notification.yaml`

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

## 目录结构

本仓库按 Home Assistant 自定义集成和 HACS 集成仓库结构组织：

```text
custom_components/uppercoast_doorlock/
├── __init__.py
├── manifest.json
├── config_flow.py
├── coordinator.py
├── api.py
├── binary_sensor.py
├── camera.py
├── button.py
├── services.py
├── services.yaml
├── brand/
│   ├── icon.png
│   ├── icon@2x.png
│   ├── dark_icon.png
│   ├── dark_icon@2x.png
│   ├── logo.png
│   ├── logo@2x.png
│   ├── dark_logo.png
│   └── dark_logo@2x.png
├── frontend/
│   ├── doorlock-card.js
│   └── assets/icon.png
└── translations/
    ├── en.json
    └── zh.json
blueprints/automation/
└── mobile_call_notification.yaml
brand/
├── icon.png
├── icon@2x.png
├── dark_icon.png
├── dark_icon@2x.png
├── logo.png
├── logo@2x.png
├── dark_logo.png
└── dark_logo@2x.png
```

## 配置

重启后，进入 **设置 → 设备与服务 → 添加集成**，搜索「虚拟门禁系统」或「uppercoast」：

| 参数 | 说明 | 示例 |
|------|------|------|
| `Host` | Addon 的 IP 地址 | `192.168.16.64` |
| `Port` | Addon 的 API 端口 | `8099` |
| `Token` | Addon 的 API 令牌 | `1234` |

> 配置前请确保 Addon 已启动（日志显示「监听中」）。

## Dashboard 卡片

本集成已内置 Dashboard 卡片文件。安装并重启 Home Assistant 后，在 **设置 → 仪表盘 → 资源** 中添加：

| 参数 | 值 |
|------|----|
| URL | `/uppercoast_doorlock/doorlock-card.js?v=0.4.8` |
| 资源类型 | `JavaScript Module` |

添加资源并刷新浏览器后，可以在仪表盘编辑界面直接搜索「云海湾门禁」添加；也可以使用 YAML：

```yaml
type: custom:doorlock-card
```

如你的实体 ID 不是默认值，可以指定：

```yaml
type: custom:doorlock-card
entity: binary_sensor.vds_call_status
camera_entity: camera.vds_video
```

> 集成会在 Home Assistant 默认的 storage 仪表盘模式下自动创建或更新这条资源；上面的 URL 主要用于排查或 YAML 模式手动配置。如果之前安装过独立的 Dashboard 卡片仓库，建议删除旧资源 `/local/HA-UpperCoast-DoorLock-Card.js`，避免旧资源先注册同名 `custom:doorlock-card`。

## 手机 App 通知

本集成提供蓝图 `uppercoast_doorlock/mobile_call_notification.yaml`。更新集成并重启 Home Assistant 后，它会自动安装到 HA 的蓝图目录。每台手机创建一条自动化，选择对应的 `notify.*` 通知实体（例如 `notify.iphone_air`），并把“门禁仪表盘地址”设为放置 `custom:doorlock-card` 的视图路径。

- `手机通知实体` 选择 `notify.iphone_air` 等实体，用作基础通知兜底
- 如开发者工具“动作”里存在 `notify.mobile_app_*`，可填到“手机 App 高级通知服务”，通知会带接听/查看、解锁、挂断按钮和跳转
- `iOS 通知声音文件名` 可填 `default` 或 HA App 已导入的声音完整文件名；Android 请用“Android 通知频道”并在系统通知频道里设置长铃声
- iOS 通知按钮通常需要长按/下拉展开；Android 高优先级通知更容易以顶部横幅显示

## 依赖

- Home Assistant 2026.5.0 或更高版本
- **[uppercoast_doorlock Addon](https://github.com/CelerPi/HA-Virtual-Doorlock-System-App)** 已安装并运行

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
| [HA-Virtual-Doorlock-System-App](https://github.com/CelerPi/HA-Virtual-Doorlock-System-App) | Addon 源码 |

## License

[MIT](LICENSE)
