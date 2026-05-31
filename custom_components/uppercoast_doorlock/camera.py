from __future__ import annotations

from homeassistant.core import HomeAssistant
from homeassistant.components.camera import Camera
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from typing import ClassVar

from .coordinator import UpperCoastDoorlockCoordinator
from .const import DOMAIN
from homeassistant.config_entries import ConfigEntry


class UpperCoastDoorlockCamera(CoordinatorEntity, Camera):
    """实时视频帧摄像头实体。"""

    _attr_has_entity_name = True
    _attr_translation_key = "video"
    _attr_unique_id: ClassVar[str] = "vds_video"
    _attr_suggested_object_id: ClassVar[str] = "vds_video"

    def __init__(self, coordinator: UpperCoastDoorlockCoordinator) -> None:
        CoordinatorEntity.__init__(self, coordinator)
        Camera.__init__(self)
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, "doorlock")},
            name="VDS",
            manufacturer="UpperCoast",
            model="麦驰可视对讲",
        )

    @property
    def is_on(self) -> bool:
        data = self.coordinator.data or {}
        runtime = data.get("runtime", {})
        return bool(runtime.get("has_frame", False))

    async def async_camera_image(self) -> bytes | None:
        try:
            client = self.coordinator.client
            return await client.async_get_frame()
        except Exception:
            return None

    async def stream_source(self) -> str | None:
        return None


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    entry_data = hass.data[DOMAIN][entry.entry_id]
    coordinator: UpperCoastDoorlockCoordinator = entry_data["coordinator"]
    async_add_entities([UpperCoastDoorlockCamera(coordinator)])