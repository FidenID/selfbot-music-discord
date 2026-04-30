const { getQueue } = require('../../utils/queueManager');
const { reply } = require('../../utils/helpers');
const { AudioPlayerStatus } = require('@discordjs/voice');

const pauseCommand = {
  name: 'pause',
  aliases: [],
  category: 'music',
  description: 'Pause lagu',
  usage: '?pause',

  async execute(msg, args) {
    const queue = getQueue(msg.guild.id);
    if (!queue || !queue.playing) return reply(msg, '❌ Tidak ada musik yang diputar.');
    if (queue.paused) return reply(msg, '⚠️ Musik sudah di-pause.');

    queue.player.pause();
    queue.paused = true;
    await reply(msg, '⏸️ Musik di-pause.');
  },
};

const resumeCommand = {
  name: 'resume',
  aliases: ['r'],
  category: 'music',
  description: 'Lanjutkan lagu yang di-pause',
  usage: '?resume',

  async execute(msg, args) {
    const queue = getQueue(msg.guild.id);
    if (!queue) return reply(msg, '❌ Tidak ada musik di queue.');
    if (!queue.paused) return reply(msg, '⚠️ Musik tidak sedang di-pause.');

    queue.player.unpause();
    queue.paused = false;
    await reply(msg, '▶️ Musik dilanjutkan.');
  },
};

module.exports = [pauseCommand, resumeCommand];
