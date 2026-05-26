# UpperCoast Doorlock System

这个 Add-on 运行云海湾门禁虚拟室内机后端。
当前版本从 Home Assistant Add-on 配置页读取参数，并常驻监听门禁协议。

由于门禁协议需要在 HA 主机网络上绑定 UDP `10000` 和 `10008`，本 Add-on 使用 host network。
