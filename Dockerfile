FROM node:20-alpine

# Install ffmpeg dan dependencies native
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    make \
    g++ \
    libc6-compat

# Set working directory
WORKDIR /app

# Copy package files dulu (layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy seluruh source code
COPY . .

# Jangan jalankan sebagai root
RUN addgroup -S botuser && adduser -S botuser -G botuser
USER botuser

# Start bot
CMD ["node", "src/index.js"]
