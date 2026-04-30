const { getQueue } = require('../../utils/queueManager');
const { reply } = require('../../utils/helpers');

const loopCommand = {
  name: 'loop',
  aliases: ['l'],
  category: 'music',
  description: 'Toggle loop lagu saat ini',
  usage: '?loop',

  async execute(msg, args) {
    const queue = getQueue(msg.guild.id);
    if (!queue || !queue.playing) return reply(msg, '❌ Tidak ada musik yang diputar.');

    queue.loop = !queue.loop;
    await reply(msg, queue.loop ? '🔁 Loop **aktif** — lagu ini akan diulang.' : '🔁 Loop **nonaktif**.');
  },
};

const autoplayCommand = {
  name: 'autoplay',
  aliases: ['ap'],
  category: 'music',
  description: 'Toggle autoplay rekomendasi YouTube',
  usage: '?autoplay',

  async execute(msg, args) {
    const queue = getQueue(msg.guild.id);
    if (!queue) return reply(msg, '❌ Tidak ada queue aktif.');

    queue.autoplay = !queue.autoplay;
    await reply(
      msg,
      queue.autoplay
        ? '🎶 Autoplay **aktif** — lagu berikutnya dari rekomendasi YouTube.'
        : '🎶 Autoplay **nonaktif**.'
    );
  },
};

module.exports = [loopCommand, autoplayCommand];
