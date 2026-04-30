const { getQueue } = require('../../utils/queueManager');
const { reply } = require('../../utils/helpers');
const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
  name: 'stop',
  aliases: [],
  category: 'music',
  description: 'Stop musik dan kosongkan queue',
  usage: '?stop',

  async execute(msg, args) {
    const queue = getQueue(msg.guild.id);
    if (!queue) return reply(msg, '❌ Tidak ada musik yang sedang diputar.');

    queue.songs = [];
    queue.loop = false;
    queue.autoplay = false;
    queue.playing = false;
    queue.isRadio = false;

    if (queue.player) {
      queue.player.stop(true);
    }

    await reply(msg, '⏹️ Musik dihentikan dan queue dikosongkan.');
  },
};
