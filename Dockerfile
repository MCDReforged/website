# ref: https://github.com/vercel/next.js/blob/1d5338f767b7e80a7a64e1e846da3cfc3abe1d13/examples/with-docker/Dockerfile
FROM node:18-alpine AS base

WORKDIR /app
RUN apk add --no-cache gcompat  # https://github.com/nodejs/docker-node/blob/efc560b6676c2ff477b27b4045443f3fb12f1632/README.md#nodealpine

FROM base AS builder

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN <<EOT
set -eux

cp -r /app/.next/standalone /out
cp -r /app/.next/static /out/.next/static
cp -r /app/public /out/public
if [ -f /app/git-info.json ]; then
  cp /app/git-info.json /out/git-info.json
fi
ls -la /out

mv /out/.next /out_next
mv /out /out_common
ls -la /out_next
ls -la /out_common
EOT

FROM base AS prod

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
EXPOSE $PORT

COPY --from=builder /out_common ./
COPY --from=builder /out_next /data/.next

RUN <<EOT
# Mount "/app/.next" to a persistent volume, to persist ISR cache between containers
set -eux

cat << 'EOF' > entrypoint.sh
#!/bin/sh
set -e
dst=/app/.next
src=/data/.next
dst_id_file="$dst/BUILD_ID"
src_id_file="$src/BUILD_ID"

img_build_id="$(cat "$src_id_file")"
if [ -f "$dst_id_file" ]; then
  old_build_id="$(cat "$dst_id_file")"
else
  old_build_id="<none>"
fi

if [ "$img_build_id" != "$old_build_id" ]; then
  echo "[INIT] Build ID changed, recreating .next files"
  echo "[INIT] Existing build ID at $dst_id_file: $old_build_id"
  echo "[INIT] Image build ID: $img_build_id"

  if [ -d "$dst" ]; then
    rm -rf "$dst/*"
    cp -rp "$src/." "$dst"
  else
    echo "[INIT] runtime .next dir $dst does not exist, no volume mount? use symlink instead"
    ln -s "$src" "$dst"
  fi
else
  echo "[INIT] Build ID unchanged, reusing existing .next files"
  echo "[INIT] Build ID: $img_build_id"
fi

exec node server.js
EOF

chmod +x entrypoint.sh
EOT

CMD ["sh", "entrypoint.sh"]
