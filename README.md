# 🎵 Discord Selfbot — Musik & Radio

Bot selfbot Discord buatan sendiri dengan fitur musik lengkap.  
Semua output dikirim ke **DM** kamu secara otomatis.

---

## ✨ Fitur

- ▶️ Putar lagu dari **YouTube**, **SoundCloud**
- 📁 Putar **playlist YouTube** dengan limit opsional
- 📻 **Radio streaming** (by nama atau URL langsung)
- 📋 **Queue system** dengan pagination
- 🔂 **Loop** per lagu / seluruh queue
- 🎲 **Autoplay** rekomendasi YouTube
- 🎵 **Progress bar** realtime di Now Playing
- 📝 **Lirik lagu** otomatis dikirim ke DM
- 📨 Semua output **dikirim ke DM**, bukan channel
- 🔊 Kontrol volume, pause, resume, skip
- 🛠️ Status bot, ping, uptime, clear pesan

---

## 📁 Struktur File

```
discord-selfbot/
├── index.js              ← Entry point utama
├── config.json           ← Konfigurasi bot
├── package.json
├── .gitignore
├── logs/                 ← Log otomatis dibuat
└── src/
    ├── commands/
    │   ├── music.js      ← Semua command musik
    │   ├── radio.js      ← Command radio
    │   └── utility.js    ← Command utility
    └── utils/
        ├── dmHelper.js   ← Helper DM & format
        └── logger.js     ← Sistem logging
```

---

## ⚙️ Konfigurasi (`config.json`)

| Key | Keterangan |
|-----|------------|
| `token` | Token akun Discord kamu |
| `prefix` | Prefix command (default: `?`) |
| `ownerId` | User ID kamu |
| `music.defaultVolume` | Volume awal (1-100) |
| `music.maxQueueSize` | Maks lagu di queue |
| `music.maxPlaylistSize` | Maks lagu dari playlist |
| `dm.enabled` | Aktifkan output ke DM |
| `dm.reactionEmoji` | Emoji reaksi di channel |
| `radio.stations` | Daftar stasiun radio |
| `lyrics.geniusApiKey` | API key Genius (opsional) |

---

## 🚀 Cara Install

```bash
# 1. Clone / download project
# 2. Install dependencies
npm install

# 3. Edit config
nano config.json
# Isi token dan ownerId kamu

# 4. Jalankan bot
npm start
```

### Jalankan dengan PM2 (background)
```bash
npm install -g pm2
pm2 start index.js --name selfbot
pm2 save
pm2 logs selfbot
```

### Jalankan dengan Docker
```bash
docker build -t selfbot .
docker run -d --name selfbot selfbot
```

---

## 📋 Daftar Command

### 🎶 Musik
| Command | Keterangan |
|---------|------------|
| `?p <judul/URL>` | Putar lagu dari YouTube atau SoundCloud |
| `?p <playlist URL> [limit]` | Putar playlist (limit = jumlah lagu) |
| `?skip` / `?s` | Skip ke lagu berikutnya |
| `?stop` | Stop dan kosongkan queue |
| `?pause` | Pause lagu |
| `?resume` / `?r` | Lanjutkan lagu yang di-pause |
| `?volume <1-100>` / `?vol` | Atur atau lihat volume |
| `?loop` / `?l` | Toggle loop (off → lagu → queue) |
| `?autoplay` / `?ap` | Toggle autoplay rekomendasi YouTube |
| `?nowplaying` / `?np` | Info lagu + progress bar |
| `?lyrics [judul]` / `?lyr` | Tampilkan lirik lagu ke DM |
| `?queue [halaman]` / `?q` | Lihat antrian lagu |
| `?clearqueue` / `?cq` | Kosongkan antrian |

### 📻 Radio
| Command | Keterangan |
|---------|------------|
| `?radio` | Lihat daftar stasiun radio |
| `?radio <nama>` | Putar radio by nama (contoh: `?radio jazz`) |
| `?radio <URL>` | Putar radio by URL langsung |

### 🎙️ Voice Channel
| Command | Keterangan |
|---------|------------|
| `?join` | Bot masuk ke VC kamu |
| `?leave` / `?dc` | Bot keluar dari VC |

### 🛠️ Utility
| Command | Keterangan |
|---------|------------|
| `?status` | Status lengkap bot (musik, queue, RAM, ping) |
| `?ping` | Cek latency bot |
| `?uptime` | Cek sudah berapa lama bot berjalan |
| `?joinlink <kode>` | Bot join server Discord via invite link |
| `?clear [jumlah]` | Hapus pesan-pesan bot di channel (default: 10) |
| `?help` | Tampilkan semua command ke DM |

---

## 🔧 Cara Dapat Token Discord

1. Buka Discord di browser (bukan app)
2. Tekan `F12` → tab **Console**
3. Ketik perintah ini:
```javascript
(webpackChunkdiscord_app.push([[''],{},e=>{m=[];for(let c in e.c)m.push(e.c[c])}]),m).find(m=>m?.exports?.default?.getToken!==void 0).exports.default.getToken()
```
4. Copy token yang muncul (jangan share ke siapapun!)

---

## ⚠️ Disclaimer

Selfbot melanggar **Terms of Service** Discord.  
Gunakan dengan risiko sendiri. Tidak bertanggung jawab atas pemblokiran akun.

---

## 📝 Lisensi

Kode ini milik kamu sendiri — **UNLICENSED**.  
Bebas dimodifikasi sesuai kebutuhan.
