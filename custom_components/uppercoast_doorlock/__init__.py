from __future__ import annotations

import logging
from typing import Any

import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from homeassistant.components.http import HomeAssistantView
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_HOST, CONF_PORT, CONF_TOKEN
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType
from aiohttp import web

from .api import UpperCoastDoorlockClient
from .const import DOMAIN
from .coordinator import UpperCoastDoorlockCoordinator
from .services import setup_services

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = vol.Schema(
    {
        DOMAIN: vol.Schema(
            {
                vol.Required(CONF_HOST): cv.string,
                vol.Required(CONF_PORT): cv.port,
                vol.Required(CONF_TOKEN): cv.string,
            },
            extra=vol.REMOVE_EXTRA,
        )
    },
    extra=vol.REMOVE_EXTRA,
)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    hass.data.setdefault(DOMAIN, {})
    return True


def _get_entry_data(hass: HomeAssistant) -> dict[str, Any] | None:
    entries = hass.config_entries.async_entries(DOMAIN)
    if not entries:
        return None
    return hass.data[DOMAIN].get(entries[0].entry_id)


class UpperCoastDoorlockAudioView(HomeAssistantView):
    """提供音频数据获取和发送的 HTTP 端点。"""

    url = "/api/uppercoast_doorlock/audio"
    name = "api:uppercoast_doorlock:audio"
    requires_auth = True

    async def get(self, request: web.Request) -> web.Response:
        hass = request.app["hass"]
        entry_data = _get_entry_data(hass)
        if not entry_data:
            return web.json_response({"ok": False, "error": "not_configured"})

        since = int(request.query.get("since", 0))
        client: UpperCoastDoorlockClient = entry_data["client"]
        try:
            result = await client.async_get_audio(since)
            return web.json_response(result)
        except Exception as exc:
            return web.json_response({"ok": False, "error": str(exc)})

    async def post(self, request: web.Request) -> web.Response:
        hass = request.app["hass"]
        entry_data = _get_entry_data(hass)
        if not entry_data:
            return web.json_response({"ok": False, "error": "not_configured"})

        try:
            data = await request.json()
        except Exception:
            return web.json_response({"ok": False, "error": "invalid_json"})

        client: UpperCoastDoorlockClient = entry_data["client"]
        try:
            result = await client.async_send_audio(
                data.get("target_ip", ""), data.get("pcm", "")
            )
            return web.json_response(result)
        except Exception as exc:
            return web.json_response({"ok": False, "error": str(exc)})


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    host = entry.data[CONF_HOST]
    port = entry.data[CONF_PORT]
    token = entry.data[CONF_TOKEN]

    client = UpperCoastDoorlockClient(host, port, token)
    coordinator = UpperCoastDoorlockCoordinator(hass, client)

    await coordinator.async_config_entry_first_refresh()

    hass.data[DOMAIN][entry.entry_id] = {
        "client": client,
        "coordinator": coordinator,
    }

    setup_services(hass)
    hass.http.register_view(UpperCoastDoorlockAudioView())
    await hass.config_entries.async_forward_entry_setups(entry, ("binary_sensor", "camera", "button"))

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    unload_ok = await hass.config_entries.async_unload_platforms(entry, ("binary_sensor", "camera", "button"))
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)
    return unload_ok
