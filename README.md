# 🎵 Discord Selfbot — Music & Radio

Selfbot Discord dengan fitur musik lengkap: YouTube, playlist, radio, autoplay rekomendasi YouTube, dan semua output dikirim ke DM.

> ⚠️ **Disclaimer:** Penggunaan selfbot melanggar ToS Discord. Gunakan dengan risiko sendiri.

---

## ✨ Fitur

- 🎵 Putar lagu dari YouTube (judul/URL)
- 📋 Putar playlist YouTube dengan limit
- 📻 Radio stream (by nama atau URL langsung)
- 🎶 Autoplay dari **rekomendasi YouTube** (bukan random)
- 🔁 Loop lagu
- 📊 Progress bar real-time di `?np`
- 📝 Lirik lagu ke DM
- ✉️ Semua output dikirim ke DM (react ✉️ di channel)
- 🐳 Siap Docker

---

## 📁 Struktur Project

```
discord-selfbot/
├── src/
│   ├── commands/
│   │   ├── music/          # play, skip, stop, pause, resume, volume, loop, autoplay, np, lyrics, queue
│   │   ├── radio/          # radio
│   │   ├── voice/          # join, leave
│   │   └── utility/        # status, ping, uptime, joinlink, clear, help
│   ├── handlers/
│   │   ├── commandHandler.js
│   │   └── messageHandler.js
│   ├── utils/
│   │   ├── audioPlayer.js  # ytdl streaming & voice player
│   │   ├── helpers.js      # reply(), notifyDM(), formatDuration(), progressBar()
│   │   ├── queueManager.js # state queue per guild
│   │   └── youtube.js      # search, info, playlist, rekomendasi
│   └── index.js
├── config/
│   └── index.js
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
└── package.json
```

---

## 🚀 Cara Install

### 1. Clone & Setup

```bash
git clone https://github.com/username/discord-selfbot.git
cd discord-selfbot
cp .env.example .env
```

### 2. Isi `.env`

```env
DISCORD_TOKEN=token_akun_kamu
PREFIX=?
OWNER_ID=id_akun_kamu
DEFAULT_VOLUME=50
```

**Cara dapat token:**
1. Buka Discord di browser
2. F12 → Network → request apapun
3. Lihat header `Authorization` — itu tokennya

### 3. Install & Jalankan

```bash
npm install
npm start
```

---

## 🐳 Pakai Docker

```bash
# Build dan jalankan
docker compose up -d

# Lihat log
docker compose logs -f

# Stop
docker compose down
```

---

## 📚 Daftar Command

### 🎵 Musik

| Command | Deskripsi |
|---------|-----------|
| `?p <judul/URL>` | Putar lagu dari YouTube |
| `?p <playlist URL> [limit]` | Putar playlist YouTube |
| `?skip` / `?s` | Skip ke lagu berikutnya |
| `?stop` | Stop dan kosongkan queue |
| `?pause` | Pause lagu |
| `?resume` / `?r` | Lanjutkan lagu |
| `?volume <1-100>` / `?vol` | Atur atau lihat volume |
| `?loop` / `?l` | Toggle loop lagu |
| `?autoplay` / `?ap` | Toggle autoplay rekomendasi YouTube |
| `?nowplaying` / `?np` | Info lagu + progress bar |
| `?lyrics [judul]` / `?lyr` | Lirik lagu ke DM |
| `?queue [hal]` / `?q` | Lihat antrian lagu |
| `?clearqueue` / `?cq` | Kosongkan antrian |

### 📻 Radio

| Command | Deskripsi |
|---------|-----------|
| `?radio <nama/URL>` | Putar stasiun radio |
| `?radio` | Lihat daftar radio tersedia |

**Contoh:**
```
?radio jazz
?radio prambors
?radio https://stream.radio.co/xxx/listen
```

### 🎙️ Voice Channel

| Command | Deskripsi |
|---------|-----------|
| `?join [nama VC]` | Bot masuk ke VC |
| `?leave` / `?dc` | Bot keluar dari VC |

### 🛠️ Utility

| Command | Deskripsi |
|---------|-----------|
| `?status` | Status lengkap bot |
| `?ping` | Cek latency |
| `?uptime` | Cek uptime bot |
| `?joinlink <kode>` | Join server via invite |
| `?clear [jumlah]` | Hapus pesan bot (default 10) |
| `?help` | Tampilkan semua command ke DM |

---

## 🎶 Autoplay

Autoplay mengambil rekomendasi langsung dari YouTube berdasarkan lagu yang sedang diputar — bukan random. Aktifkan dengan `?autoplay`.

---

## ❓ Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Bot tidak merespons | Pastikan prefix benar di `.env` |
| Suara tidak keluar | Pastikan ffmpeg terinstall (`ffmpeg -version`) |
| Login gagal | Token salah atau akun terkena 2FA |
| Playlist gagal | Coba batasi limit, misal `?p <url> 20` |
| Lirik tidak ditemukan | Coba `?lyrics <judul lagu manual>` |

---

## 📜 Lisensi

MIT License — bebas digunakan, dimodifikasi, dan didistribusikan dengan mencantumkan kredit.
