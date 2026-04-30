const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const { getQueue, createQueue, deleteQueue } = require('../../utils/queueManager');
const { setupPlayer } = require('../../utils/audioPlayer');
const { reply } = require('../../utils/helpers');

const joinCommand = {
  name: 'join',
  aliases: [],
  category: 'voice',
  description: 'Bot masuk ke VC kamu atau VC yang disebutkan',
  usage: '?join [nama VC]',

  async execute(msg, args) {
    let voiceChannel;

    if (args.length) {
      // Cari VC berdasarkan nama
      const name = args.join(' ').toLowerCase();
      voiceChannel = msg.guild.channels.cache.find(
        c => c.isVoice() && c.name.toLowerCase().includes(name)
      );
      if (!voiceChannel) return reply(msg, `❌ Voice Channel \`${args.join(' ')}\` tidak ditemukan.`);
    } else {
      voiceChannel = msg.member?.voice?.channel;
      if (!voiceChannel) return reply(msg, '❌ Kamu harus masuk ke Voice Channel dulu, atau sebutkan nama VC.');
    }

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: msg.guild.id,
      adapterCreator: msg.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false,
    });

    let queue = getQueue(msg.guild.id);
    if (!queue) {
      queue = createQueue(msg.guild.id, {
        voiceChannel,
        textChannel: msg.channel,
        lastCommandAuthor: msg.author,
      });
      queue.connection = connection;
      setupPlayer(queue);
    } else {
      queue.connection = connection;
      queue.voiceChannel = voiceChannel;
    }

    await reply(msg, `✅ Bot masuk ke **${voiceChannel.name}**.`);
  },
};

const leaveCommand = {
  name: 'leave',
  aliases: ['dc'],
  category: 'voice',
  description: 'Bot keluar dari VC',
  usage: '?leave',

  async execute(msg, args) {
    const queue = getQueue(msg.guild.id);
    const connection = getVoiceConnection(msg.guild.id);

    if (!connection) return reply(msg, '❌ Bot tidak sedang di Voice Channel.');

    if (queue) {
      if (queue.player) queue.player.stop(true);
      deleteQueue(msg.guild.id);
    }

    connection.destroy();
    await reply(msg, '👋 Bot keluar dari Voice Channel.');
  },
};

module.exports = [joinCommand, leaveCommand];
