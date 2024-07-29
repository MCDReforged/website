# ref: https://github.com/vercel/next.js/blob/33c91d9fc3299a6e24c65f26ddb5bec0ec7ea3f7/examples/with-docker/Dockerfile
FROM node:18-alpine AS base

WORKDIR /app
RUN apk add --no-cache gcompat  # https://github.com/nodejs/docker-node/tree/844b019f6d0df6d09e91c99fe90808a99bac6743#nodealpine

FROM base AS builder

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM base AS prod

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
EXPOSE $PORT

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

CMD ["node", "server.js"]
