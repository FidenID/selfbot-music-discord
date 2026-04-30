const { joinVoiceChannel } = require('@discordjs/voice');
const { getQueue, createQueue, hasQueue } = require('../../utils/queueManager');
const { setupPlayer, playSong } = require('../../utils/audioPlayer');
const { reply } = require('../../utils/helpers');
const { isPlaylist, resolveSong, getPlaylistVideos } = require('../../utils/youtube');
const config = require('../../../config');

module.exports = {
  name: 'p',
  aliases: ['play'],
  category: 'music',
  description: 'Putar lagu dari YouTube atau playlist',
  usage: '?p <judul/URL> [limit playlist]',

  async execute(msg, args) {
    if (!args.length) {
      return reply(msg, `❌ Masukkan judul lagu atau URL.\n**Contoh:** \`${config.prefix}p Coldplay Yellow\``);
    }

    // Cek apakah user ada di voice channel
    const voiceChannel = msg.member?.voice?.channel;
    if (!voiceChannel) {
      return reply(msg, '❌ Kamu harus masuk ke Voice Channel dulu!');
    }

    const query = args[0];
    const limitArg = parseInt(args[1]) || 50;

    let queue = getQueue(msg.guild.id);

    // Buat queue dan join VC kalau belum ada
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

    // Handle playlist
    if (isPlaylist(query)) {
      await reply(msg, `⏳ Memuat playlist, mohon tunggu...`);
      try {
        const videos = await getPlaylistVideos(query, limitArg);
        if (!videos.length) return reply(msg, '❌ Playlist kosong atau tidak bisa diakses.');

        videos.forEach(v => { v.requestedBy = msg.author; queue.songs.push(v); });

        await reply(msg, `✅ **${videos.length} lagu** ditambahkan dari playlist ke queue!`);
        if (!queue.playing) playSong(queue);
        return;
      } catch (err) {
        return reply(msg, `❌ Gagal memuat playlist: ${err.message}`);
      }
    }

    // Handle single song
    try {
      const song = await resolveSong(query);
      song.requestedBy = msg.author;
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
