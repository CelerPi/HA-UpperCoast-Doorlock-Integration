FROM python:3.12-alpine

ARG BUILD_VERSION
ARG BUILD_ARCH

LABEL \
  io.hass.version="${BUILD_VERSION}" \
  io.hass.type="app" \
  io.hass.arch="${BUILD_ARCH}"

COPY run.sh /
COPY app /app

RUN chmod a+x /run.sh

ENV PYTHONPATH=/app \
  PYTHONUNBUFFERED=1

CMD [ "/run.sh" ]
