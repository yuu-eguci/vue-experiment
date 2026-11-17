#!/bin/sh
# Docker イメージそのものを確かめるテストです。ホストには Docker と curl だけが必要です。
#   sh tests/docker.test.sh
# プロジェクトを一時ディレクトリへ複製し、ダミーのローカル用 env ファイルを置いてからイメージをビルドします。
# そのうえで、env ファイルがイメージに含まれないこと、既定のコマンドで起動した開発サーバーが
# 各ページと静的ファイルを返すことを確認します。作成したイメージ、コンテナー、一時ディレクトリは終了時に削除します。
set -eu

root=$(cd "$(dirname "$0")/.." && pwd)
image="vue-experiment-docker-test:$$"
context=$(mktemp -d "${TMPDIR:-/tmp}/vue-experiment-docker-test.XXXXXX")
container=
failed=0

cleanup() {
  if [ -n "$container" ]; then docker rm -f "$container" >/dev/null 2>&1 || true; fi
  docker image rm -f "$image" >/dev/null 2>&1 || true
  rm -rf "$context"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

check() {
  name=$1
  shift
  if "$@"; then
    echo "ok - $name"
  else
    echo "not ok - $name"
    failed=$((failed + 1))
  fi
}

# 手元に本物のローカル用 env ファイルがあっても複製しません。代わりにダミーの値だけを書いたファイルを置きます。
# src/pages は MPA 構成の root で、Vite はそこにある env ファイルも読み込むため、同じように置きます。
tar -C "$root" --exclude=./.git --exclude=./node_modules --exclude=./dist \
  --exclude='.env.local' --exclude='.env.*.local' -cf - . | tar -C "$context" -xf -
for file in .env.local .env.development.local src/pages/.env.local; do
  echo 'VITE_DOCKER_TEST_DUMMY=dummy' > "$context/$file"
done

docker build -q -t "$image" "$context" >/dev/null

no_local_env_files() {
  found=$(docker run --rm "$image" find /app -path /app/node_modules -prune -o \( -name '.env.local' -o -name '.env.*.local' \) -print)
  [ -z "$found" ] || { echo "$found"; return 1; }
}
check 'ローカル用の env ファイルはイメージに含まれません' no_local_env_files

container=$(docker run -d -p 127.0.0.1::8080 "$image")
port=$(docker port "$container" 8080/tcp | head -n 1 | sed 's/.*://')
base="http://127.0.0.1:$port"
i=0
until curl -fsS -o /dev/null "$base/" 2>/dev/null; do
  i=$((i + 1))
  if [ "$i" -ge 60 ]; then
    docker logs "$container"
    echo 'not ok - 開発サーバーが 60 秒以内に応答しませんでした'
    exit 1
  fi
  sleep 1
done

# path の本文に、pattern (grep の基本正規表現) が含まれるかどうかを返します。
body_contains() {
  curl -fsS "$base$1" | grep -q -- "$2"
}

# path の Content-Type が type から始まるかどうかを返します。
content_type_is() {
  case $(curl -fsS -o /dev/null -w '%{content_type}' "$base$1") in
    "$2"*) return 0 ;;
    *) return 1 ;;
  esac
}

check '/ は既定のアプリのエントリーを読み込む index.html を返します' body_contains / 'src="/src/main.ts"'
for page in page1 page2 page3; do
  check "/$page は履歴モードのルーター用に index.html を返します" body_contains "/$page" 'src="/src/main.ts"'
done
check '/src/main.ts は Vue のアプリを作るスクリプトを返します' body_contains /src/main.ts 'createApp'
check '/spa.html はスクリプトを含まない静的なページを返します' sh -c "curl -fsS '$base/spa.html' | grep -q 'Spa' && ! curl -fsS '$base/spa.html' | grep -q '<script'"
check '/favicon.ico を返します' content_type_is /favicon.ico image/
check '/src/assets/logo.png を返します' content_type_is /src/assets/logo.png image/png

if [ "$failed" -ne 0 ]; then
  echo "$failed 件の確認が失敗しました。"
  exit 1
fi
