#!/usr/bin/env bash
# =============================================================================
# Деплой dinamchiki-newest на прод-сервер (94.250.255.42).
#
# Что делает:
#   1. билдит prod-образ (npm ci && vite build внутри Docker)
#   2. копирует docker-compose.yml на сервер в ~/dinamchiki-newest
#   3. рестартит контейнер
#   4. ждёт, пока healthcheck станет ok
#
# Требования:
#   - SSH-ключ для horoshiy@94.250.255.42:25178 (без пароля)
#   - На сервере ~/dinamchiki-newest/docker-compose.yml и Dockerfile лежат
#     (скрипт сам синхронизирует файлы)
#
# Использование:
#   ./scripts/deploy.sh                     # деплой с текущей ревизии
#   ./scripts/deploy.sh --no-build          # только перезапуск контейнера
#   ./scripts/deploy.sh --logs              # после деплоя показать логи
# =============================================================================
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REMOTE_HOST="horoshiy@94.250.255.42"
REMOTE_PORT="25178"
REMOTE_DIR="~/dinamchiki-newest"
LOCAL_PORT="8277"

DO_BUILD=true
SHOW_LOGS=false

for arg in "$@"; do
  case "$arg" in
    --no-build) DO_BUILD=false ;;
    --logs)     SHOW_LOGS=true ;;
    -h|--help)
      sed -n '3,25p' "$0"
      exit 0
      ;;
    *) echo "unknown arg: $arg" >&2; exit 2 ;;
  esac
done

cd "$PROJECT_DIR"

# Без .env.production образ соберётся с пустым адресом API — сборка упадёт
# на env-guard уже на сервере. Проверяем заранее, пока ничего не сломано.
if $DO_BUILD && [ ! -f .env.production ]; then
  echo "Нет .env.production — скопируйте .env.production.example и заполните." >&2
  exit 1
fi

SSH="ssh -p $REMOTE_PORT -o StrictHostKeyChecking=no -o ConnectTimeout=10"

run_remote() { $SSH "$REMOTE_HOST" "$1"; }

echo "==> Проверяю, что на сервере есть директория $REMOTE_DIR"
run_remote "mkdir -p $REMOTE_DIR/dockercfg" >/dev/null

echo "==> Синхронизирую файлы на сервер"
rsync -az --delete \
  -e "ssh -p $REMOTE_PORT -o StrictHostKeyChecking=no" \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude '.env' \
  "$PROJECT_DIR/docker-compose.yml" \
  "$REMOTE_HOST:$REMOTE_DIR/docker-compose.yml"

rsync -az -e "ssh -p $REMOTE_PORT -o StrictHostKeyChecking=no" \
  "$PROJECT_DIR/docker/" \
  "$REMOTE_HOST:$REMOTE_DIR/dockercfg/"

if $DO_BUILD; then
  echo "==> Билдю prod-образ на сервере"
  # Исходники проекта синхронизируем отдельно (исключая node_modules)
  rsync -az --delete \
    -e "ssh -p $REMOTE_PORT -o StrictHostKeyChecking=no" \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude '.env' \
    "$PROJECT_DIR/" \
    "$REMOTE_HOST:$REMOTE_DIR/"
fi

echo "==> Поднимаю контейнер"
run_remote "cd $REMOTE_DIR && docker compose up -d --build --force-recreate"

echo "==> Жду healthcheck (до 30 секунд)"
for i in $(seq 1 15); do
  if run_remote "docker inspect --format='{{.State.Health.Status}}' dinamchiki-newest 2>/dev/null" 2>/dev/null \
       | grep -q healthy; then
    echo "    healthy"
    break
  fi
  sleep 2
done

echo "==> Локальная проверка http://127.0.0.1:$LOCAL_PORT/"
if curl -fsS --max-time 10 "http://127.0.0.1:$LOCAL_PORT/healthz" >/dev/null 2>&1; then
  echo "    OK: 127.0.0.1:$LOCAL_PORT/healthz отвечает"
else
  echo "    WARN: 127.0.0.1:$LOCAL_PORT/healthz не отвечает — контейнер слушает только на сервере"
fi

if $SHOW_LOGS; then
  echo "==> docker logs (последние 50 строк):"
  run_remote "docker logs --tail=50 dinamchiki-newest"
fi

echo "==> Готово."
echo
echo "ВНИМАНИЕ: на проде фронт отдаёт Caddy (сервер отвечает 'server: Caddy'),"
echo "а не этот nginx-контейнер. Этот скрипт поднимает запасную схему на :8277."
echo "Эталонный vhost для Caddy лежит в docker/Caddyfile.example —"
echo "в нём заголовки безопасности, X-Robots-Tag для стенда и честный 404."
