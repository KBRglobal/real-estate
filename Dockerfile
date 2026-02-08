# Stage 1: Builder
FROM node:20-alpine AS builder

RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  pkgconf \
  pixman-dev \
  vips-dev \
  cairo-dev \
  pango-dev \
  libjpeg-turbo-dev \
  giflib-dev

WORKDIR /app

ENV PYTHON=/usr/bin/python3

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

RUN apk add --no-cache \
  vips \
  cairo \
  pango \
  pixman \
  libjpeg-turbo \
  giflib \
  && addgroup -S appgroup \
  && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

USER appuser

EXPOSE 5000

CMD ["node", "dist/index.cjs"]
