const { getQueue } = require('../../utils/queueManager');
const { reply } = require('../../utils/helpers');

module.exports = {
  name: 'volume',
  aliases: ['vol'],
  category: 'music',
  description: 'Atur atau lihat volume (1-100)',
  usage: '?volume [1-100]',

  async execute(msg, args) {
    const queue = getQueue(msg.guild.id);
    if (!queue) return reply(msg, '❌ Tidak ada musik yang diputar.');

    if (!args.length) {
      return reply(msg, `🔊 Volume sekarang: \`${queue.volume}%\``);
    }

    const vol = parseInt(args[0]);
    if (isNaN(vol) || vol < 1 || vol > 100) {
      return reply(msg, '❌ Volume harus antara 1 sampai 100.');
    }

    queue.volume = vol;
    // Terapkan ke resource yang sedang diputar
    if (queue.player?.state?.resource?.volume) {
      queue.player.state.resource.volume.setVolume(vol / 100);
    }

    const bar = '█'.repeat(Math.round(vol / 5)) + '░'.repeat(20 - Math.round(vol / 5));
    await reply(msg, `🔊 Volume diatur ke \`${vol}%\`\n\`[${bar}]\``);
  },
};
