from __future__ import annotations

import aiohttp
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession


class UpperCoastDoorlockClient:
    """调用 addon HTTP API 的客户端。"""

    def __init__(self, hass: HomeAssistant, host: str, port: int, token: str) -> None:
        self._session = async_get_clientsession(hass)
        self._base_url = f"http://{host}:{port}"
        self._token = token

    @property
    def base_url(self) -> str:
        return self._base_url

    @property
    def websocket_url(self) -> str:
        return f"{self._base_url.replace('http://', 'ws://', 1)}/api/ws"

    async def _request(
        self,
        method: str,
        path: str,
        **kwargs: Any,
    ) -> aiohttp.ClientResponse:
        resp = await self._session.request(
            method,
            f"{self._base_url}{path}",
            headers={"Authorization": f"Bearer {self._token}"},
            timeout=aiohttp.ClientTimeout(total=5),
            **kwargs,
        )
        resp.raise_for_status()
        return resp

    async def async_get_status(self) -> dict[str, Any]:
        resp = await self._request("GET", "/api/status")
        return await resp.json()

    async def async_unlock(self, target_ip: str) -> dict[str, Any]:
        resp = await self._request("POST", "/api/unlock", json={"target_ip": target_ip})
        return await resp.json()

    async def async_answer(self, target_ip: str) -> dict[str, Any]:
        resp = await self._request("POST", "/api/answer", json={"target_ip": target_ip})
        return await resp.json()

    async def async_hangup(self, target_ip: str) -> dict[str, Any]:
        resp = await self._request("POST", "/api/hangup", json={"target_ip": target_ip})
        return await resp.json()

    async def async_get_frame(self) -> bytes | None:
        resp = await self._session.get(
            f"{self._base_url}/api/frame",
            headers={"Authorization": f"Bearer {self._token}"},
            timeout=aiohttp.ClientTimeout(total=5),
        )
        if resp.status == 404:
            resp.release()
            return None
        resp.raise_for_status()
        return await resp.read()

    async def async_monitor_start(self, target_ip: str) -> dict[str, Any]:
        resp = await self._request("POST", "/api/monitor/start", json={"target_ip": target_ip})
        return await resp.json()

    async def async_monitor_stop(self, target_ip: str) -> dict[str, Any]:
        resp = await self._request("POST", "/api/monitor/stop", json={"target_ip": target_ip})
        return await resp.json()

    async def async_get_audio(self, since: int = 0) -> dict[str, Any]:
        resp = await self._request("GET", "/api/audio", params={"since": since})
        return await resp.json()

    async def async_send_audio(self, target_ip: str, pcm: str) -> dict[str, Any]:
        resp = await self._request("POST", "/api/audio", json={"target_ip": target_ip, "pcm": pcm})
        return await resp.json()

    async def async_ws_connect(self) -> aiohttp.ClientWebSocketResponse:
        return await self._session.ws_connect(
            self.websocket_url,
            headers={"Authorization": f"Bearer {self._token}"},
            heartbeat=20,
            timeout=5,
        )
