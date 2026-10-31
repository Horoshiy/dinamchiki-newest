#!/usr/bin/env bash
# Выкладка сборки сайта на проде. Запускается из CI (и вручную) от horoshiy:
#   release.sh <sha>   — ждёт архив /var/www/dinamchiki.ru/releases/<sha>.tgz
# Распаковывает в releases/<sha>, атомарно переводит current на него,
# хранит 5 последних релизов. Откат: release.sh rollback <sha>.
set -euo pipefail
BASE=/var/www/dinamchiki.ru
REL="$BASE/releases"
KEEP=5

switch_to() {
  local dir="$REL/$1"
  [[ -f "$dir/index.html" ]] || { echo "в $dir нет index.html — не переключаю" >&2; exit 1; }
  ln -sfn "$dir" "$BASE/current.tmp"
  mv -Tf "$BASE/current.tmp" "$BASE/current"
  echo "current → $(readlink "$BASE/current")"
}

if [[ "${1:-}" == rollback ]]; then
  switch_to "${2:?укажи sha релиза}"
  exit 0
fi

SHA="${1:?укажи sha}"
[[ "$SHA" =~ ^[0-9a-f]{7,40}$ ]] || { echo "плохой sha: $SHA" >&2; exit 1; }
mkdir -p "$REL"
TGZ="$REL/$SHA.tgz"
[[ -f "$TGZ" ]] || { echo "нет архива $TGZ" >&2; exit 1; }

STAGE="$REL/.$SHA.staging"
rm -rf "$STAGE" && mkdir -p "$STAGE"
tar -xzf "$TGZ" -C "$STAGE"
printf '%s\n' "$SHA" > "$STAGE/version.txt"
rm -rf "${REL:?}/$SHA" && mv "$STAGE" "$REL/$SHA" && rm -f "$TGZ"
switch_to "$SHA"

# Чистка: оставляем KEEP последних релизов и тот, на который смотрит current.
cur="$(basename "$(readlink "$BASE/current")")"
ls -1t "$REL" | grep -E '^[0-9a-f]{7,40}$' | tail -n +$((KEEP + 1)) | while read -r old; do
  [[ "$old" == "$cur" ]] || rm -rf "${REL:?}/$old"
done
