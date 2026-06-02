# 独立自动化

这里的 YAML 不会由集成自动安装，也不会修改集成实体。

`homepod_siri_doorlock_package.yaml` 用于实现：

- 门口机呼叫且有人在家时，让 HomePod mini 播报“有人来了，是否开门？”
- 创建 `input_boolean.vds_siri_unlock_request`
- 将这个 helper 通过 HomeKit Bridge 暴露到 Apple 家庭后，可以用 Siri 触发开门

复制到 Home Assistant 的 `/config/packages/` 后，按文件顶部注释修改实体 ID 并重启 HA。
