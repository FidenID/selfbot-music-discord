const { joinVoiceChannel } = require('@discordjs/voice');
const { getQueue, createQueue } = require('../../utils/queueManager');
const { setupPlayer, playSong } = require('../../utils/audioPlayer');
const { reply } = require('../../utils/helpers');
const { isPlaylist, resolveSong } = require('../../utils/youtube');
const { isTikTokUrl, getTikTokAudio } = require('../../utils/tiktok');
const { getPlaylistVideos } = require('../../utils/youtube');
const config = require('../../../config');

module.exports = {
  name: 'p',
  aliases: ['play'],
  category: 'music',
  description: 'Putar lagu dari YouTube atau TikTok',
  usage: '?p <judul/URL YouTube/URL TikTok> [limit playlist]',

  async execute(msg, args) {
    if (!args.length) {
      return reply(msg, `❌ Masukkan judul lagu atau URL.\n**Contoh:**\n> \`${config.prefix}p Coldplay Yellow\`\n> \`${config.prefix}p https://www.tiktok.com/@user/video/xxx\``);
    }

    const voiceChannel = msg.member?.voice?.channel;
    if (!voiceChannel) {
      return reply(msg, '❌ Kamu harus masuk ke Voice Channel dulu!');
    }

    const query = args[0];
    const limitArg = parseInt(args[1]) || 50;

    let queue = getQueue(msg.guild.id);

    if (!queue) {
      queue = createQueue(msg.guild.id, {
        voiceChannel,
        textChannel: msg.channel,
        volume: config.defaultVolume,
        lastCommandAuthor: msg.author,
      });

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: msg.guild.id,
        adapterCreator: msg.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false,
      });

      queue.connection = connection;
      setupPlayer(queue);
    } else {
      queue.lastCommandAuthor = msg.author;
    }

    // ── TikTok ────────────────────────────────────────────
    if (isTikTokUrl(query)) {
      await reply(msg, `⏳ Mengambil audio TikTok...`);
      try {
        const song = await getTikTokAudio(query);
        song.requestedBy = msg.author;
        queue.songs.push(song);

        if (!queue.playing) {
          playSong(queue);
        } else {
          await reply(msg, `✅ **TikTok ditambahkan ke queue:**\n\`${song.title}\``);
        }
      } catch (err) {
        return reply(msg, `❌ Gagal ambil TikTok: ${err.message}`);
      }
      return;
    }

    // ── YouTube Playlist ──────────────────────────────────
    if (isPlaylist(query)) {
      await reply(msg, `⏳ Memuat playlist YouTube, mohon tunggu...`);
      try {
        const videos = await getPlaylistVideos(query, limitArg);
        if (!videos.length) return reply(msg, '❌ Playlist kosong atau tidak bisa diakses.');

        videos.forEach(v => {
          v.requestedBy = msg.author;
          v.source = 'youtube';
          queue.songs.push(v);
        });

        await reply(msg, `✅ **${videos.length} lagu** ditambahkan dari playlist ke queue!`);
        if (!queue.playing) playSong(queue);
      } catch (err) {
        return reply(msg, `❌ Gagal memuat playlist: ${err.message}`);
      }
      return;
    }

    // ── YouTube Single ────────────────────────────────────
    try {
      const song = await resolveSong(query);
      song.requestedBy = msg.author;
      song.source = 'youtube';
      queue.songs.push(song);

      if (!queue.playing) {
        playSong(queue);
      } else {
        await reply(msg, `✅ **Ditambahkan ke queue:** \`${song.title}\``);
      }
    } catch (err) {
      return reply(msg, `❌ ${err.message}`);
    }
  },
};
