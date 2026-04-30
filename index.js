// index.js — Entry point utama bot
const { Client } = require('discord.js-selfbot-v13');
const { DisTube } = require('distube');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { YtDlpPlugin } = require('@distube/yt-dlp');

const config = require('./config.json');
const logger = require('./src/utils/logger');
const { notifyDM, formatDuration, truncate } = require('./src/utils/dmHelper');

const musicCmd  = require('./src/commands/music');
const radioCmd  = require('./src/commands/radio');
const utilityCmd = require('./src/commands/utility');

// ── Client ────────────────────────────────────────────────────
const client = new Client({
  checkUpdate: false,
});

// ── DisTube ───────────────────────────────────────────────────
const distube = new DisTube(client, {
  plugins: [
    new SoundCloudPlugin(),
    new YtDlpPlugin({ update: false }),
  ],
  emitNewSongOnly: false,
  joinNewVoiceChannel: true,
  nsfw: true,
});

// ── DisTube Events ────────────────────────────────────────────

distube.on('playSong', async (queue, song) => {
  const isRadio = queue.metadata?.isRadio;
  const label   = isRadio ? (queue.metadata.radioLabel || 'Live Radio') : song.name;
  const dur     = isRadio ? '🔴 LIVE' : formatDuration(song.duration);

  const text = isRadio
    ? `📻 **Radio Dimulai!**\n🎙️ ${label}`
    : [
        `▶️ **Sekarang Diputar**`,
        `🎵 ${truncate(song.name, 60)}`,
        `👤 ${song.uploader?.name || 'Unknown'} | ⏱️ ${dur}`,
        `📋 Sisa queue: ${queue.songs.length - 1} lagu`,
        `🔗 ${song.url}`,
      ].join('\n');

  await notifyDM(queue, text);
  logger.music(`Playing: ${label}`);
});

distube.on('addSong', async (queue, song) => {
  const pos = queue.songs.length - 1;
  const text = [
    `➕ **Ditambahkan ke Queue** (posisi #${pos})`,
    `🎵 ${truncate(song.name, 60)}`,
    `⏱️ ${formatDuration(song.duration)}`,
  ].join('\n');

  await notifyDM(queue, text);
});

distube.on('addList', async (queue, playlist) => {
  const text = [
    `➕ **Playlist Ditambahkan!**`,
    `📁 ${truncate(playlist.name, 50)}`,
    `🎵 ${playlist.songs.length} lagu`,
  ].join('\n');

  await notifyDM(queue, text);
});

distube.on('finish', async (queue) => {
  await notifyDM(queue, '✅ **Queue selesai!** Semua lagu sudah diputar.');
  logger.music('Queue selesai.');
});

distube.on('empty', async (queue) => {
  await notifyDM(queue, '👋 **Voice channel kosong** — bot keluar otomatis.');
});

distube.on('error', async (channel, err) => {
  logger.error(`DisTube error: ${err.message}`);
  if (channel) channel.send(`❌ **Error musik:** ${err.message}`).catch(() => {});
});

distube.on('disconnect', (queue) => {
  logger.warn('Bot terputus dari voice channel.');
});

// ── Client Events ─────────────────────────────────────────────

client.once('ready', () => {
  logger.success(`Bot online sebagai: ${client.user.tag}`);
  logger.info(`Prefix: ${config.prefix}`);
  logger.info(`DM Output: ${config.dm.enabled ? 'AKTIF' : 'MATI'}`);
  logger.info('Bot siap digunakan!');
});

client.on('messageCreate', async (msg) => {
  // Hanya proses pesan dari diri sendiri (selfbot)
  if (msg.author.id !== client.user.id) return;

  const prefix = config.prefix || '?';
  if (!msg.content.startsWith(prefix)) return;

  const args = msg.content.slice(prefix.length).trim().split(/\s+/);
  const cmd  = args.shift().toLowerCase();

  // Update metadata queue agar DM notifikasi selalu fresh
  const queue = distube.getQueue(msg.guild);
  if (queue) {
    queue.metadata = { ...queue.metadata, lastAuthor: msg.author };
  }

  try {
    // Routing command
    const musicCmds   = ['p', 'play', 's', 'skip', 'stop', 'pause', 'r', 'resume',
                         'vol', 'volume', 'l', 'loop', 'ap', 'autoplay',
                         'np', 'nowplaying', 'q', 'queue', 'cq', 'clearqueue',
                         'join', 'leave', 'dc', 'lyr', 'lyrics'];
    const utilityCmds = ['ping', 'uptime', 'status', 'joinlink', 'clear', 'help'];

    if (musicCmds.includes(cmd)) {
      await musicCmd.execute(client, distube, msg, cmd, args);
    } else if (cmd === 'radio') {
      await radioCmd.execute(client, distube, msg, cmd, args);
    } else if (utilityCmds.includes(cmd)) {
      await utilityCmd.execute(client, distube, msg, cmd, args);
    }

  } catch (err) {
    logger.error(`Command error [${cmd}]: ${err.message}`);
  }
});

client.on('error', (err) => logger.error(`Client error: ${err.message}`));
client.on('warn', (info) => logger.warn(`Client warn: ${info}`));

// ── Login ─────────────────────────────────────────────────────
client.login(config.token).catch((err) => {
  logger.error(`Gagal login: ${err.message}`);
  process.exit(1);
});

// ── Graceful Shutdown ─────────────────────────────────────────
process.on('SIGINT', () => {
  logger.warn('Bot dimatikan (SIGINT)...');
  client.destroy();
  process.exit(0);
});

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled rejection: ${err?.message || err}`);
});
