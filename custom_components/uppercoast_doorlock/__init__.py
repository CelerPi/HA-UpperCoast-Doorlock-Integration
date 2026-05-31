from __future__ import annotations

import asyncio
import contextlib
import logging
from pathlib import Path
from typing import Any

import aiohttp
import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from homeassistant.components.http import HomeAssistantView, StaticPathConfig
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

CARD_URL_PATH = f"/{DOMAIN}"
CARD_STATIC_PATH = Path(__file__).parent / "frontend"

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
    setup_services(hass)
    hass.http.register_view(UpperCoastDoorlockAudioView())
    hass.http.register_view(UpperCoastDoorlockWebsocketView())
    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                CARD_URL_PATH,
                str(CARD_STATIC_PATH),
                cache_headers=True,
            )
        ]
    )
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

        try:
            since = int(request.query.get("since", 0))
        except (TypeError, ValueError):
            return web.json_response({"ok": False, "error": "invalid_since"})

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


class UpperCoastDoorlockWebsocketView(HomeAssistantView):
    """代理 addon WebSocket，避免前端直接暴露 addon token。"""

    url = "/api/uppercoast_doorlock/ws"
    name = "api:uppercoast_doorlock:ws"
    requires_auth = False

    async def get(self, request: web.Request) -> web.WebSocketResponse:
        hass = request.app["hass"]
        if not await self._authorized(hass, request):
            frontend_ws = web.WebSocketResponse(heartbeat=20)
            await frontend_ws.prepare(request)
            await frontend_ws.send_json({"type": "error", "error": "unauthorized"})
            await frontend_ws.close()
            return frontend_ws

        entry_data = _get_entry_data(hass)
        frontend_ws = web.WebSocketResponse(heartbeat=20)
        await frontend_ws.prepare(request)

        if not entry_data:
            await frontend_ws.send_json({"type": "error", "error": "not_configured"})
            await frontend_ws.close()
            return frontend_ws

        client: UpperCoastDoorlockClient = entry_data["client"]
        try:
            addon_ws = await client.async_ws_connect()
        except Exception as exc:
            await frontend_ws.send_json({"type": "error", "error": str(exc)})
            await frontend_ws.close()
            return frontend_ws

        async def addon_to_frontend() -> None:
            async for msg in addon_ws:
                if msg.type == aiohttp.WSMsgType.TEXT:
                    await frontend_ws.send_str(msg.data)
                elif msg.type in (aiohttp.WSMsgType.CLOSED, aiohttp.WSMsgType.ERROR):
                    break

        async def frontend_to_addon() -> None:
            async for msg in frontend_ws:
                if msg.type == aiohttp.WSMsgType.TEXT:
                    await addon_ws.send_str(msg.data)
                elif msg.type in (aiohttp.WSMsgType.CLOSED, aiohttp.WSMsgType.ERROR):
                    break

        tasks = [
            asyncio.create_task(addon_to_frontend()),
            asyncio.create_task(frontend_to_addon()),
        ]
        done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
        for task in pending:
            task.cancel()
        for task in done:
            with contextlib.suppress(Exception, asyncio.CancelledError):
                task.result()
        await addon_ws.close()
        await frontend_ws.close()
        return frontend_ws

    async def _authorized(self, hass: HomeAssistant, request: web.Request) -> bool:
        token = request.query.get("token", "")
        if not token:
            return False
        return await hass.auth.async_validate_access_token(token) is not None


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    host = entry.data[CONF_HOST]
    port = entry.data[CONF_PORT]
    token = entry.data[CONF_TOKEN]

    client = UpperCoastDoorlockClient(hass, host, port, token)
    coordinator = UpperCoastDoorlockCoordinator(hass, client)

    await coordinator.async_config_entry_first_refresh()

    hass.data[DOMAIN][entry.entry_id] = {
        "client": client,
        "coordinator": coordinator,
    }

    await hass.config_entries.async_forward_entry_setups(entry, ("binary_sensor", "camera", "button"))

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    unload_ok = await hass.config_entries.async_unload_platforms(entry, ("binary_sensor", "camera", "button"))
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)
    return unload_ok
