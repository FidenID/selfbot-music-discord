// src/commands/utility.js
const { reply, formatDuration } = require('../utils/dmHelper');
const logger = require('../utils/logger');
const config = require('../../config.json');

const startTime = Date.now();

module.exports = {
  name: 'utility',

  async execute(client, distube, msg, cmd, args) {

    // ── PING ──────────────────────────────────────────────────
    if (cmd === 'ping') {
      const before = Date.now();
      const sent = await reply(msg, '🏓 Pong!');
      const latency = Date.now() - before;
      const wsLatency = client.ws.ping;
      if (sent) {
        await sent.edit(`🏓 **Pong!**\n📡 Round-trip: \`${latency}ms\`\n🌐 WebSocket: \`${wsLatency}ms\``);
      }
    }

    // ── UPTIME ────────────────────────────────────────────────
    else if (cmd === 'uptime') {
      const uptimeSec = Math.floor((Date.now() - startTime) / 1000);
      const d = Math.floor(uptimeSec / 86400);
      const h = Math.floor((uptimeSec % 86400) / 3600);
      const m = Math.floor((uptimeSec % 3600) / 60);
      const s = uptimeSec % 60;

      let uptimeStr = '';
      if (d > 0) uptimeStr += `${d} hari `;
      if (h > 0) uptimeStr += `${h} jam `;
      if (m > 0) uptimeStr += `${m} menit `;
      uptimeStr += `${s} detik`;

      return reply(msg, `⏱️ **Uptime Bot:** ${uptimeStr}`);
    }

    // ── STATUS ────────────────────────────────────────────────
    else if (cmd === 'status') {
      const queue = distube.getQueue(msg.guild);
      const voice = distube.voices.get(msg.guild);

      const uptimeSec = Math.floor((Date.now() - startTime) / 1000);
      const used = process.memoryUsage().heapUsed;
      const memMB = (used / 1024 / 1024).toFixed(1);

      let musicStatus = '⏹️ Tidak ada musik';
      let queueInfo = '📋 Queue kosong';

      if (queue) {
        const song = queue.songs[0];
        const state = queue.paused ? '⏸️ Paused' : '▶️ Playing';
        musicStatus = `${state}: **${song.name}**`;
        queueInfo = `📋 Queue: ${queue.songs.length} lagu | 🔊 Vol: ${queue.volume}%`;

        if (queue.metadata?.isRadio) {
          musicStatus = `📻 Radio: **${queue.metadata.radioLabel || 'Live'}**`;
        }
      }

      const voiceInfo = voice ? `✅ Di VC: ${voice.channel?.name || 'Unknown'}` : '❌ Tidak di VC';

      const lines = [
        `🤖 **Status Bot**`,
        ``,
        `🟢 Online sebagai: **${client.user?.tag}**`,
        `⏱️ Uptime: ${formatUptime(uptimeSec)}`,
        `💾 RAM: ${memMB} MB`,
        `🌐 Ping: ${client.ws.ping}ms`,
        ``,
        `🎵 **Musik**`,
        musicStatus,
        queueInfo,
        voiceInfo,
        ``,
        `⚙️ Prefix: \`${config.prefix}\` | 📨 DM Output: ${config.dm.enabled ? 'ON' : 'OFF'}`,
      ].join('\n');

      return reply(msg, lines);
    }

    // ── JOINLINK ──────────────────────────────────────────────
    else if (cmd === 'joinlink') {
      if (!args.length) {
        return reply(msg, '❌ Masukkan kode/link invite!\nContoh: `?joinlink abc123` atau `?joinlink discord.gg/abc123`');
      }

      const input = args[0];
      // Extract kode dari berbagai format
      const code = input
        .replace(/https?:\/\/(www\.)?(discord\.gg|discord\.com\/invite)\//i, '')
        .trim();

      try {
        await reply(msg, `🔗 Mencoba join server dengan kode: \`${code}\`...`);
        const invite = await client.fetchInvite(code);
        await invite.accept();
        return reply(msg, `✅ **Berhasil join server:** ${invite.guild?.name || 'Unknown'}`);
      } catch (err) {
        logger.error(`Joinlink error: ${err.message}`);
        return reply(msg, `❌ **Gagal join!**\n\`${err.message}\`\n\nPastikan kode invite valid dan belum expired.`);
      }
    }

    // ── CLEAR ─────────────────────────────────────────────────
    else if (cmd === 'clear') {
      const amount = parseInt(args[0]) || 10;
      const max = Math.min(Math.max(amount, 1), 100);

      try {
        const messages = await msg.channel.messages.fetch({ limit: max + 1 });
        const botMessages = messages.filter(m => m.author.id === client.user.id);

        let deleted = 0;
        for (const [, m] of botMessages) {
          await m.delete().catch(() => {});
          deleted++;
          await sleep(300); // rate limit aman
        }

        const notif = await msg.channel.send(`🗑️ **${deleted} pesan bot dihapus!**`);
        setTimeout(() => notif.delete().catch(() => {}), 3000);
      } catch (err) {
        return reply(msg, `❌ Gagal hapus pesan: ${err.message}`);
      }
    }

    // ── HELP ──────────────────────────────────────────────────
    else if (cmd === 'help') {
      const p = config.prefix;
      const helpText = [
        `📖 **Daftar Command Bot** — Prefix: \`${p}\``,
        `*(Semua response dikirim ke DM kamu)*`,
        ``,
        `**🎶 Musik**`,
        `\`${p}p <judul/URL>\` — Putar lagu dari YouTube/SoundCloud`,
        `\`${p}p <playlist URL> [limit]\` — Putar playlist (limit = maks lagu)`,
        `\`${p}skip\` / \`${p}s\` — Skip lagu`,
        `\`${p}stop\` — Stop & kosongkan queue`,
        `\`${p}pause\` — Pause lagu`,
        `\`${p}resume\` / \`${p}r\` — Lanjutkan lagu`,
        `\`${p}volume <1-100>\` / \`${p}vol\` — Atur/lihat volume`,
        `\`${p}loop\` / \`${p}l\` — Toggle loop (off/lagu/queue)`,
        `\`${p}autoplay\` / \`${p}ap\` — Toggle autoplay rekomendasi`,
        `\`${p}nowplaying\` / \`${p}np\` — Info lagu + progress bar`,
        `\`${p}queue [halaman]\` / \`${p}q\` — Lihat antrian`,
        `\`${p}clearqueue\` / \`${p}cq\` — Kosongkan antrian`,
        `\`${p}lyrics [judul]\` / \`${p}lyr\` — Tampilkan lirik ke DM`,
        ``,
        `**📻 Radio**`,
        `\`${p}radio <nama/URL>\` — Putar stasiun radio`,
        `\`${p}radio\` — Lihat daftar stasiun tersedia`,
        ``,
        `**🎙️ Voice**`,
        `\`${p}join\` — Bot masuk ke VC kamu`,
        `\`${p}leave\` / \`${p}dc\` — Bot keluar dari VC`,
        ``,
        `**🛠️ Utility**`,
        `\`${p}status\` — Status lengkap bot`,
        `\`${p}ping\` — Cek latency bot`,
        `\`${p}uptime\` — Cek uptime bot`,
        `\`${p}joinlink <kode>\` — Join server via invite`,
        `\`${p}clear [jumlah]\` — Hapus pesan bot (default: 10)`,
        `\`${p}help\` — Tampilkan bantuan ini`,
      ].join('\n');

      return reply(msg, helpText);
    }
  },
};

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [];
  if (d) parts.push(`${d}h`);
  if (h) parts.push(`${h}j`);
  if (m) parts.push(`${m}m`);
  parts.push(`${s}d`);
  return parts.join(' ');
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
