from __future__ import annotations

import logging

from homeassistant.core import HomeAssistant
from homeassistant.components.button import ButtonEntity
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from typing import ClassVar

from .coordinator import UpperCoastDoorlockCoordinator
from .const import DOMAIN
from homeassistant.config_entries import ConfigEntry

_LOGGER = logging.getLogger(__name__)


class UpperCoastDoorlockButtonUnlock(CoordinatorEntity, ButtonEntity):
    """解锁按钮。"""

    _attr_has_entity_name = True
    _attr_translation_key = "unlock"
    _attr_icon = "mdi:door-open"
    _attr_unique_id: ClassVar[str] = "vds_button_unlock"
    _attr_suggested_object_id: ClassVar[str] = "vds_button_unlock"

    def __init__(self, coordinator: UpperCoastDoorlockCoordinator) -> None:
        super().__init__(coordinator)
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, "doorlock")},
            name="VDS",
            manufacturer="UpperCoast",
            model="麦驰可视对讲",
        )

    async def async_press(self) -> None:
        data = self.coordinator.data or {}
        runtime = data.get("runtime", {})
        target_ip = runtime.get("target_ip", "")
        if not target_ip:
            return
        try:
            client = self.coordinator._client
            await client.async_unlock(target_ip)
        except Exception as exc:
            _LOGGER.error("解锁失败: %s", exc)


class UpperCoastDoorlockButtonAnswer(CoordinatorEntity, ButtonEntity):
    """接听按钮。"""

    _attr_has_entity_name = True
    _attr_translation_key = "answer"
    _attr_icon = "mdi:phone"
    _attr_unique_id: ClassVar[str] = "vds_button_answer"
    _attr_suggested_object_id: ClassVar[str] = "vds_button_answer"

    def __init__(self, coordinator: UpperCoastDoorlockCoordinator) -> None:
        super().__init__(coordinator)
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, "doorlock")},
            name="VDS",
            manufacturer="UpperCoast",
            model="麦驰可视对讲",
        )

    async def async_press(self) -> None:
        data = self.coordinator.data or {}
        runtime = data.get("runtime", {})
        target_ip = runtime.get("target_ip", "")
        if not target_ip:
            return
        try:
            client = self.coordinator._client
            await client.async_answer(target_ip)
        except Exception as exc:
            _LOGGER.error("接听失败: %s", exc)


class UpperCoastDoorlockButtonHangup(CoordinatorEntity, ButtonEntity):
    """挂断按钮。"""

    _attr_has_entity_name = True
    _attr_translation_key = "hangup"
    _attr_icon = "mdi:phone-hangup"
    _attr_unique_id: ClassVar[str] = "vds_button_hangup"
    _attr_suggested_object_id: ClassVar[str] = "vds_button_hangup"

    def __init__(self, coordinator: UpperCoastDoorlockCoordinator) -> None:
        super().__init__(coordinator)
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, "doorlock")},
            name="VDS",
            manufacturer="UpperCoast",
            model="麦驰可视对讲",
        )

    async def async_press(self) -> None:
        data = self.coordinator.data or {}
        runtime = data.get("runtime", {})
        target_ip = runtime.get("target_ip", "")
        if not target_ip:
            return
        try:
            client = self.coordinator._client
            await client.async_hangup(target_ip)
        except Exception as exc:
            _LOGGER.error("挂断失败: %s", exc)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    entry_data = hass.data[DOMAIN][entry.entry_id]
    coordinator: UpperCoastDoorlockCoordinator = entry_data["coordinator"]
    async_add_entities([
        UpperCoastDoorlockButtonUnlock(coordinator),
        UpperCoastDoorlockButtonAnswer(coordinator),
        UpperCoastDoorlockButtonHangup(coordinator),
    ])