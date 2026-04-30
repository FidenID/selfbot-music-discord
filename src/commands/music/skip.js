const { getQueue } = require('../../utils/queueManager');
const { playSong } = require('../../utils/audioPlayer');
const { reply } = require('../../utils/helpers');

module.exports = {
  name: 'skip',
  aliases: ['s'],
  category: 'music',
  description: 'Skip ke lagu berikutnya',
  usage: '?skip',

  async execute(msg, args) {
    const queue = getQueue(msg.guild.id);
    if (!queue || !queue.playing) return reply(msg, '❌ Tidak ada lagu yang sedang diputar.');

    if (queue.isRadio) return reply(msg, '❌ Tidak bisa skip saat memutar radio.');

    const current = queue.songs[0];
    queue.loop = false; // matikan loop saat skip
    queue.songs.shift();

    await reply(msg, `⏭️ Skipped: \`${current?.title || 'lagu sekarang'}\``);
    playSong(queue);
  },
};
