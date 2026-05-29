from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any

from homeassistant.core import callback
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .api import UpperCoastDoorlockClient

_LOGGER = logging.getLogger(__name__)


class UpperCoastDoorlockCoordinator(DataUpdateCoordinator):
    """协调 addon 状态与 HA 实体更新。"""

    def __init__(self, hass, client: UpperCoastDoorlockClient) -> None:
        super().__init__(
            hass,
            _LOGGER,
            name="uppercoast_doorlock",
            update_interval=timedelta(seconds=1.0),
        )
        self._client = client
        self._previous: dict[str, Any] = {}
        self._consecutive_errors = 0

    async def _async_update_data(self) -> dict[str, Any]:
        try:
            status = await self._client.async_get_status()
            self._consecutive_errors = 0
        except Exception as exc:
            self._consecutive_errors += 1
            # 前 3 次及每 60 次记录一次，避免日志刷屏
            if self._consecutive_errors <= 3 or self._consecutive_errors % 60 == 0:
                _LOGGER.error(
                    "无法连接到门禁 Addon (%s): %s",
                    self._client._base_url,
                    exc,
                )
            return {
                "runtime": {},
                "config": {},
                "connection_error": str(exc),
            }

        runtime = status.get("runtime", {})
        config = status.get("config", {})
        devices = config.get("devices", [])

        if not devices:
            _LOGGER.warning(
                "Addon (%s) 返回的门口机列表为空，请检查 Addon 的 building_id 配置",
                self._client._base_url,
            )

        self._detect_and_publish_events(runtime)
        return {
            "runtime": runtime,
            "config": config,
        }

    @callback
    def _detect_and_publish_events(self, new: dict[str, Any]) -> None:
        prev = self._previous

        if new.get("in_call") and not prev.get("in_call"):
            self.hass.bus.async_fire("uppercoast_doorlock_call_started", {
                "device_name": new.get("device_name", ""),
                "display_name": new.get("display_name", ""),
                "target_ip": new.get("target_ip", ""),
                "floor_label": new.get("floor_label", ""),
                "position_detail": new.get("position_detail", ""),
            })

        if not new.get("in_call") and prev.get("in_call"):
            self.hass.bus.async_fire("uppercoast_doorlock_call_ended", {
                "device_name": prev.get("device_name", ""),
                "display_name": prev.get("display_name", ""),
                "target_ip": prev.get("target_ip", ""),
            })

        if new.get("frame_id") and new.get("frame_id") != prev.get("frame_id"):
            self.hass.bus.async_fire("uppercoast_doorlock_frame_received", {
                "frame_id": new.get("frame_id"),
            })

        self._previous = new.copy()