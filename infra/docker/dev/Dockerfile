FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app:/app/src

WORKDIR /app

COPY infra/docker/dev/requirements.txt .
COPY infra/docker/prod/requirements.txt ./prod-requirements.txt

RUN sed -i 's#../prod/requirements.txt#prod-requirements.txt#' requirements.txt \
    && pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["watchfiles", "python", "-m", "backend.bot.main"]
