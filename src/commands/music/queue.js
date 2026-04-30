const { getQueue } = require('../../utils/queueManager');
const { reply, formatDuration, truncate } = require('../../utils/helpers');

const ITEMS_PER_PAGE = 10;

const queueCommand = {
  name: 'queue',
  aliases: ['q'],
  category: 'music',
  description: 'Lihat antrian lagu',
  usage: '?queue [halaman]',

  async execute(msg, args) {
    const queue = getQueue(msg.guild.id);
    if (!queue || !queue.songs.length) return reply(msg, '❌ Queue kosong.');

    const page = Math.max(1, parseInt(args[0]) || 1);
    const totalPages = Math.ceil(queue.songs.length / ITEMS_PER_PAGE);
    const validPage = Math.min(page, totalPages);

    const start = (validPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const songs = queue.songs.slice(start, end);

    const lines = [`📋 **Queue** — Halaman ${validPage}/${totalPages} (${queue.songs.length} lagu)`];

    songs.forEach((song, i) => {
      const idx = start + i;
      const prefix = idx === 0 ? '▶️' : `${idx}.`;
      lines.push(`${prefix} \`${truncate(song.title, 45)}\` \`[${formatDuration(song.duration)}]\``);
    });

    if (queue.songs.length > end) {
      lines.push(`\n... dan ${queue.songs.length - end} lagu lainnya`);
    }

    lines.push(`\n🔊 Volume: \`${queue.volume}%\` | 🔁 Loop: \`${queue.loop ? 'ON' : 'OFF'}\` | 🎶 Autoplay: \`${queue.autoplay ? 'ON' : 'OFF'}\``);

    await reply(msg, lines.join('\n'));
  },
};

const clearQueueCommand = {
  name: 'clearqueue',
  aliases: ['cq'],
  category: 'music',
  description: 'Kosongkan antrian (lagu sekarang tetap diputar)',
  usage: '?clearqueue',

  async execute(msg, args) {
    const queue = getQueue(msg.guild.id);
    if (!queue || queue.songs.length <= 1) return reply(msg, '❌ Queue sudah kosong atau hanya ada 1 lagu.');

    const cleared = queue.songs.length - 1;
    queue.songs = queue.songs.slice(0, 1); // Keep lagu yang sedang diputar

    await reply(msg, `🗑️ **${cleared} lagu** dihapus dari queue.`);
  },
};

module.exports = [queueCommand, clearQueueCommand];
