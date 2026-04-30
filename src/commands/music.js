// src/commands/music.js
const { reply, notifyDM, formatDuration, progressBar, truncate } = require('../utils/dmHelper');
const logger = require('../utils/logger');
const config = require('../../config.json');

module.exports = {
  name: 'music',

  /**
   * Handle semua command musik
   * @param {Client} client
   * @param {DisTube} distube
   * @param {Message} msg
   * @param {string} cmd
   * @param {string[]} args
   */
  async execute(client, distube, msg, cmd, args) {
    const voiceChannel = msg.member?.voice?.channel;

    // ── PLAY ──────────────────────────────────────────────────
    if (cmd === 'p' || cmd === 'play') {
      if (!args.length) {
        return reply(msg, '❌ **Masukkan judul atau URL lagu!**\nContoh: `?p Shape of You` atau `?p https://youtube.com/...`');
      }

      if (!voiceChannel) {
        return reply(msg, '❌ **Kamu harus join voice channel dulu!**');
      }

      const query = args.join(' ');
      const limitMatch = query.match(/\[(\d+)\]$/);
      const limit = limitMatch ? parseInt(limitMatch[1]) : config.music.maxPlaylistSize;
      const cleanQuery = limitMatch ? query.replace(/\s*\[\d+\]$/, '') : query;

      try {
        await reply(msg, `🔍 Mencari: **${truncate(cleanQuery, 60)}**...`);

        // Update metadata agar notifikasi bisa ke DM
        const options = {
          member: msg.member,
          textChannel: msg.channel,
          metadata: { lastAuthor: msg.author },
        };

        if (limit && (cleanQuery.includes('playlist') || cleanQuery.includes('list='))) {
          options.limit = limit;
        }

        await distube.play(voiceChannel, cleanQuery, options);
      } catch (err) {
        logger.error(`Play error: ${err.message}`);
        return reply(msg, `❌ **Gagal memutar lagu!**\n\`${err.message}\``);
      }
    }

    // ── SKIP ──────────────────────────────────────────────────
    else if (cmd === 's' || cmd === 'skip') {
      const queue = distube.getQueue(msg.guild);
      if (!queue) return reply(msg, '❌ Tidak ada lagu yang sedang diputar!');
      if (queue.songs.length <= 1) return reply(msg, '❌ Tidak ada lagu berikutnya di queue!');

      try {
        await distube.skip(msg.guild);
        return reply(msg, '⏭️ **Lagu di-skip!**');
      } catch (err) {
        return reply(msg, `❌ Gagal skip: ${err.message}`);
      }
    }

    // ── STOP ──────────────────────────────────────────────────
    else if (cmd === 'stop') {
      const queue = distube.getQueue(msg.guild);
      if (!queue) return reply(msg, '❌ Tidak ada lagu yang sedang diputar!');

      await distube.stop(msg.guild);
      return reply(msg, '⏹️ **Musik dihentikan dan queue dikosongkan!**');
    }

    // ── PAUSE ─────────────────────────────────────────────────
    else if (cmd === 'pause') {
      const queue = distube.getQueue(msg.guild);
      if (!queue) return reply(msg, '❌ Tidak ada lagu yang sedang diputar!');
      if (queue.paused) return reply(msg, '⚠️ Lagu sudah di-pause!');

      await distube.pause(msg.guild);
      return reply(msg, `⏸️ **Di-pause:** ${truncate(queue.songs[0].name)}`);
    }

    // ── RESUME ────────────────────────────────────────────────
    else if (cmd === 'r' || cmd === 'resume') {
      const queue = distube.getQueue(msg.guild);
      if (!queue) return reply(msg, '❌ Tidak ada lagu yang sedang diputar!');
      if (!queue.paused) return reply(msg, '⚠️ Lagu tidak dalam keadaan pause!');

      await distube.resume(msg.guild);
      return reply(msg, `▶️ **Dilanjutkan:** ${truncate(queue.songs[0].name)}`);
    }

    // ── VOLUME ────────────────────────────────────────────────
    else if (cmd === 'vol' || cmd === 'volume') {
      const queue = distube.getQueue(msg.guild);
      if (!queue) return reply(msg, '❌ Tidak ada lagu yang sedang diputar!');

      if (!args.length) {
        return reply(msg, `🔊 **Volume saat ini:** ${queue.volume}%`);
      }

      const vol = parseInt(args[0]);
      if (isNaN(vol) || vol < 1 || vol > 100) {
        return reply(msg, '❌ Volume harus antara **1 - 100**!');
      }

      await distube.setVolume(msg.guild, vol);
      const bar = progressBar(vol, 100, 15);
      return reply(msg, `🔊 **Volume diset ke ${vol}%**\n\`${bar}\``);
    }

    // ── LOOP ──────────────────────────────────────────────────
    else if (cmd === 'l' || cmd === 'loop') {
      const queue = distube.getQueue(msg.guild);
      if (!queue) return reply(msg, '❌ Tidak ada lagu yang sedang diputar!');

      const RepeatMode = distube.constructor.RepeatMode || { DISABLED: 0, SONG: 1, QUEUE: 2 };
      let mode;

      if (args[0] === 'queue' || args[0] === 'q') {
        mode = 2; // loop queue
      } else if (args[0] === 'off' || args[0] === '0') {
        mode = 0; // off
      } else {
        // Toggle: off → song → queue → off
        mode = (queue.repeatMode + 1) % 3;
      }

      await distube.setRepeatMode(msg.guild, mode);
      const modeLabel = ['❌ Loop mati', '🔂 Loop lagu ini', '🔁 Loop seluruh queue'][mode];
      return reply(msg, `**${modeLabel}**`);
    }

    // ── AUTOPLAY ──────────────────────────────────────────────
    else if (cmd === 'ap' || cmd === 'autoplay') {
      const queue = distube.getQueue(msg.guild);
      if (!queue) return reply(msg, '❌ Tidak ada lagu yang sedang diputar!');

      const status = await distube.toggleAutoplay(msg.guild);
      return reply(msg, status ? '🎲 **Autoplay AKTIF** — lagu rekomendasi akan diputar otomatis!' : '🎲 **Autoplay MATI**');
    }

    // ── NOW PLAYING ───────────────────────────────────────────
    else if (cmd === 'np' || cmd === 'nowplaying') {
      const queue = distube.getQueue(msg.guild);
      if (!queue || !queue.songs.length) return reply(msg, '❌ Tidak ada lagu yang sedang diputar!');

      const song = queue.songs[0];
      const current = Math.floor(queue.currentTime);
      const total = song.duration;
      const bar = progressBar(current, total, config.music.progressBarLength);
      const repeat = ['❌', '🔂', '🔁'][queue.repeatMode] || '❌';

      const text = [
        `🎵 **Now Playing**`,
        ``,
        `**${song.name}**`,
        `👤 ${song.uploader?.name || 'Unknown'} | ⏱️ ${formatDuration(current)} / ${formatDuration(total)}`,
        `\`${bar}\``,
        ``,
        `🔊 Volume: ${queue.volume}% | ${repeat} Loop | 🎲 Autoplay: ${queue.autoplay ? 'ON' : 'OFF'}`,
        `📋 Queue: ${queue.songs.length} lagu`,
        `🔗 ${song.url}`,
      ].join('\n');

      return reply(msg, text);
    }

    // ── QUEUE ─────────────────────────────────────────────────
    else if (cmd === 'q' || cmd === 'queue') {
      const queue = distube.getQueue(msg.guild);
      if (!queue || !queue.songs.length) return reply(msg, '📋 Queue kosong!');

      const page = parseInt(args[0]) || 1;
      const perPage = 10;
      const totalPages = Math.ceil(queue.songs.length / perPage);
      const validPage = Math.min(Math.max(page, 1), totalPages);
      const start = (validPage - 1) * perPage;
      const songs = queue.songs.slice(start, start + perPage);

      const lines = songs.map((s, i) => {
        const num = start + i;
        const prefix = num === 0 ? '▶️' : `${num}.`;
        return `${prefix} **${truncate(s.name, 45)}** — \`${formatDuration(s.duration)}\``;
      });

      const totalDur = queue.songs.reduce((acc, s) => acc + (s.duration || 0), 0);

      const text = [
        `📋 **Queue — Halaman ${validPage}/${totalPages}**`,
        ``,
        lines.join('\n'),
        ``,
        `Total: **${queue.songs.length} lagu** | ⏱️ ${formatDuration(totalDur)}`,
        totalPages > 1 ? `\nKetik \`?q ${validPage + 1}\` untuk halaman berikutnya` : '',
      ].join('\n');

      return reply(msg, text);
    }

    // ── CLEAR QUEUE ───────────────────────────────────────────
    else if (cmd === 'cq' || cmd === 'clearqueue') {
      const queue = distube.getQueue(msg.guild);
      if (!queue) return reply(msg, '❌ Tidak ada queue!');

      const count = queue.songs.length - 1; // -1 karena lagu yg sedang main tidak ikut dihapus
      queue.songs.splice(1);
      return reply(msg, `🗑️ **${count} lagu dihapus dari queue!** (Lagu saat ini tetap berjalan)`);
    }

    // ── JOIN ──────────────────────────────────────────────────
    else if (cmd === 'join') {
      if (!voiceChannel) {
        return reply(msg, '❌ **Kamu harus join voice channel dulu!**');
      }

      try {
        await distube.voices.join(voiceChannel);
        return reply(msg, `✅ **Bergabung ke:** ${voiceChannel.name}`);
      } catch (err) {
        return reply(msg, `❌ Gagal join: ${err.message}`);
      }
    }

    // ── LEAVE ─────────────────────────────────────────────────
    else if (cmd === 'leave' || cmd === 'dc') {
      const voice = distube.voices.get(msg.guild);
      if (!voice) return reply(msg, '❌ Bot tidak ada di voice channel!');

      const queue = distube.getQueue(msg.guild);
      if (queue) await distube.stop(msg.guild);
      distube.voices.leave(msg.guild);
      return reply(msg, '👋 **Keluar dari voice channel!**');
    }

    // ── LYRICS ────────────────────────────────────────────────
    else if (cmd === 'lyr' || cmd === 'lyrics') {
      const queue = distube.getQueue(msg.guild);
      let title = args.join(' ');

      if (!title && queue?.songs.length) {
        title = queue.songs[0].name;
      }

      if (!title) {
        return reply(msg, '❌ Masukkan judul lagu atau putar lagu dulu!\nContoh: `?lyrics Shape of You`');
      }

      await reply(msg, `🔍 Mencari lirik untuk: **${truncate(title, 50)}**...`);

      try {
        const lyrics = await fetchLyrics(title);
        if (!lyrics) return reply(msg, `❌ Lirik tidak ditemukan untuk: **${title}**`);

        // Kirim lirik dalam chunks (maks 1900 char per pesan)
        const dm = await msg.author.createDM();
        const header = `🎵 **Lirik: ${title}**\n${'─'.repeat(40)}\n`;
        const chunks = splitChunks(header + lyrics, 1900);

        for (const chunk of chunks) {
          await dm.send(chunk);
          await sleep(300); // delay antar pesan
        }
      } catch (err) {
        logger.error(`Lyrics error: ${err.message}`);
        return reply(msg, `❌ Gagal mengambil lirik: ${err.message}`);
      }
    }
  },
};

// ── Helper Functions ──────────────────────────────────────────

async function fetchLyrics(title) {
  const apiKey = config.lyrics?.geniusApiKey;
  if (!apiKey || apiKey === 'YOUR_GENIUS_API_KEY_HERE') {
    // Fallback: coba scrape dari lyrics.ovh (gratis, tanpa API key)
    return fetchLyricsOvh(title);
  }

  try {
    const fetch = require('node-fetch');
    const searchUrl = `https://api.genius.com/search?q=${encodeURIComponent(title)}`;
    const res = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    const data = await res.json();
    const hit = data?.response?.hits?.[0]?.result;
    if (!hit) return null;

    // Genius tidak menyediakan lirik langsung via API,
    // fallback ke lyrics.ovh dengan judul yang lebih bersih
    const cleanTitle = hit.title + ' ' + hit.primary_artist.name;
    return fetchLyricsOvh(cleanTitle);
  } catch {
    return fetchLyricsOvh(title);
  }
}

async function fetchLyricsOvh(title) {
  try {
    const fetch = require('node-fetch');
    // Pisah judul dan artis jika ada tanda "-"
    const parts = title.split(' - ');
    let artist, song;

    if (parts.length >= 2) {
      artist = parts[0].trim();
      song = parts.slice(1).join(' - ').trim();
    } else {
      // Coba split kata pertama sebagai artis
      const words = title.split(' ');
      artist = words[0];
      song = words.slice(1).join(' ');
    }

    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(song)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.lyrics || null;
  } catch {
    return null;
  }
}

function splitChunks(text, maxLen) {
  const chunks = [];
  while (text.length > maxLen) {
    let cutAt = text.lastIndexOf('\n', maxLen);
    if (cutAt === -1) cutAt = maxLen;
    chunks.push(text.substring(0, cutAt));
    text = text.substring(cutAt + 1);
  }
  if (text) chunks.push(text);
  return chunks;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
