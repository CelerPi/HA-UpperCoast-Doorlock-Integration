from __future__ import annotations

from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .coordinator import UpperCoastDoorlockCoordinator
from .const import DOMAIN
from homeassistant.config_entries import ConfigEntry
from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.helpers.device_registry import DeviceInfo
from typing import ClassVar


class UpperCoastDoorlockBinarySensor(BinarySensorEntity):
    """表示当前是否有活跃呼叫。attributes 中附带当前门口机详情及设备列表。"""

    _attr_name = "门禁呼叫状态"
    _attr_icon = "mdi:doorbell-video"
    _attr_unique_id: ClassVar[str] = "vds_call_status"

    def __init__(self, coordinator: UpperCoastDoorlockCoordinator) -> None:
        self.coordinator = coordinator
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, "doorlock")},
            name="虚拟门禁系统",
            manufacturer="UpperCoast",
            model="麦驰可视对讲",
        )

    @property
    def is_on(self) -> bool:
        data = self.coordinator.data or {}
        runtime = data.get("runtime", {})
        return bool(runtime.get("in_call", False))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data or {}
        runtime = data.get("runtime", {})
        config = data.get("config", {})
        devices = config.get("devices", [])
        connection_error = data.get("connection_error", "")

        client = getattr(self.coordinator, "_client", None)
        api_url = getattr(client, "_base_url", "") if client else ""

        attrs: dict[str, Any] = {
            "building_id": config.get("building_id", ""),
            "building_name": config.get("building_name", ""),
            "devices": devices,
            "device_count": len(devices),
            "api_url": api_url,
            "connection_status": "disconnected" if connection_error else "connected",
        }

        if connection_error:
            attrs["connection_error"] = connection_error

        if runtime.get("in_call"):
            attrs.update({
                "device_name": runtime.get("device_name", ""),
                "display_name": runtime.get("display_name", ""),
                "target_ip": runtime.get("target_ip", ""),
                "floor_label": runtime.get("floor_label", ""),
                "position_detail": runtime.get("position_detail", ""),
            })

        return attrs


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    entry_data = hass.data[DOMAIN][entry.entry_id]
    coordinator: UpperCoastDoorlockCoordinator = entry_data["coordinator"]
    async_add_entities([UpperCoastDoorlockBinarySensor(coordinator)])
