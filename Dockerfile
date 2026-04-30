FROM node:20-alpine

# Install ffmpeg + libopus dari Alpine (tidak perlu compile dari source)
RUN apk add --no-cache \
    ffmpeg \
    libopus \
    libopus-dev \
    python3 \
    make \
    g++

WORKDIR /app

# Copy package files dulu (layer cache)
COPY package*.json ./

# Install — opusscript adalah pure JS, tidak butuh native compile
RUN npm install --omit=dev --legacy-peer-deps

# Copy source code
COPY . .

# Non-root user
RUN addgroup -S botuser && adduser -S botuser -G botuser
USER botuser

CMD ["node", "src/index.js"]
