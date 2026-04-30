const { getQueue } = require('../../utils/queueManager');
const { reply, formatDuration, progressBar, truncate } = require('../../utils/helpers');

module.exports = {
  name: 'nowplaying',
  aliases: ['np'],
  category: 'music',
  description: 'Info lagu yang sedang diputar',
  usage: '?nowplaying',

  async execute(msg, args) {
    const queue = getQueue(msg.guild.id);
    if (!queue || !queue.playing) return reply(msg, '❌ Tidak ada musik yang diputar.');

    if (queue.isRadio) {
      return reply(msg, [
        `📻 **Radio: ${queue.radioInfo?.name || 'Unknown'}**`,
        `> URL: \`${queue.radioInfo?.url || '-'}\``,
        `> Status: \`LIVE ◉\``,
        `> Volume: \`${queue.volume}%\``,
      ].join('\n'));
    }

    const song = queue.songs[0];
    if (!song) return reply(msg, '❌ Tidak ada lagu di queue.');

    const elapsed = Math.floor((Date.now() - queue.startTime) / 1000);
    const total = song.duration || 0;

    const lines = [
      `🎵 **Now Playing**`,
      `\`\`\`${truncate(song.title, 55)}\`\`\``,
      progressBar(elapsed, total),
      `\`${formatDuration(elapsed)}\` / \`${formatDuration(total)}\``,
      ``,
      `> 📺 Channel: \`${song.channel}\``,
      `> 🔊 Volume: \`${queue.volume}%\``,
      `> 🔁 Loop: \`${queue.loop ? 'ON' : 'OFF'}\``,
      `> 🎶 Autoplay: \`${queue.autoplay ? 'ON' : 'OFF'}\``,
      `> 📋 Queue: \`${queue.songs.length} lagu\``,
    ];

    await reply(msg, lines.join('\n'));
  },
};
