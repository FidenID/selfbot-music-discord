FROM node:20-alpine

RUN apk add --no-cache ffmpeg python3 make g++

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev --legacy-peer-deps

COPY . .

RUN addgroup -S botuser && adduser -S botuser -G botuser
USER botuser

CMD ["node", "src/index.js"]
