const { getQueue } = require('../../utils/queueManager');
const { reply, formatDuration, progressBar, truncate } = require('../../utils/helpers');

module.exports = {
  name: 'status',
  aliases: [],
  category: 'utility',
  description: 'Status lengkap bot',
  usage: '?status',

  async execute(msg, args) {
    const queue = getQueue(msg.guild.id);

    const uptime = process.uptime();
    const uptimeStr = formatDuration(Math.floor(uptime));
    const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

    if (!queue || !queue.playing) {
      return reply(msg, [
        `🤖 **Status Bot**`,
        `> ⏱️ Uptime: \`${uptimeStr}\``,
        `> 💾 Memory: \`${mem} MB\``,
        `> 🎵 Status: \`Idle\``,
        `> 📋 Queue: \`Kosong\``,
      ].join('\n'));
    }

    if (queue.isRadio) {
      return reply(msg, [
        `🤖 **Status Bot**`,
        `> ⏱️ Uptime: \`${uptimeStr}\``,
        `> 💾 Memory: \`${mem} MB\``,
        `> 📻 Radio: \`${queue.radioInfo?.name || 'Unknown'}\``,
        `> 🔊 Volume: \`${queue.volume}%\``,
        `> 📺 VC: \`${queue.voiceChannel?.name || '-'}\``,
      ].join('\n'));
    }

    const song = queue.songs[0];
    const elapsed = Math.floor((Date.now() - queue.startTime) / 1000);
    const total = song?.duration || 0;

    return reply(msg, [
      `🤖 **Status Bot**`,
      `> ⏱️ Uptime: \`${uptimeStr}\``,
      `> 💾 Memory: \`${mem} MB\``,
      `> 🎵 Lagu: \`${truncate(song?.title || '-', 45)}\``,
      `> ⏳ Progress: \`${formatDuration(elapsed)}\` / \`${formatDuration(total)}\``,
      progressBar(elapsed, total),
      `> 🔊 Volume: \`${queue.volume}%\``,
      `> 🔁 Loop: \`${queue.loop ? 'ON' : 'OFF'}\``,
      `> 🎶 Autoplay: \`${queue.autoplay ? 'ON' : 'OFF'}\``,
      `> ⏸️ Paused: \`${queue.paused ? 'YES' : 'NO'}\``,
      `> 📋 Queue: \`${queue.songs.length} lagu\``,
      `> 📺 VC: \`${queue.voiceChannel?.name || '-'}\``,
    ].join('\n'));
  },
};
