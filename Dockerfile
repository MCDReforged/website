# ref: https://github.com/vercel/next.js/blob/33c91d9fc3299a6e24c65f26ddb5bec0ec7ea3f7/examples/with-docker/Dockerfile
FROM node:18-alpine AS base

WORKDIR /app
RUN apk add --no-cache gcompat  # https://github.com/nodejs/docker-node/tree/844b019f6d0df6d09e91c99fe90808a99bac6743#nodealpine

FROM base AS builder

COPY package*.json ./
RUN npm install

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
