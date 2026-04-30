FROM node:20-alpine

# Install ffmpeg dan build tools untuk native modules
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    make \
    g++

WORKDIR /app

# Copy package files dulu (layer cache)
COPY package*.json ./

# Install dependencies — legacy-peer-deps menghindari konflik antar peer deps
RUN npm install --omit=dev --legacy-peer-deps

# Copy source code
COPY . .

# Jalankan sebagai non-root
RUN addgroup -S botuser && adduser -S botuser -G botuser
USER botuser

CMD ["node", "src/index.js"]
