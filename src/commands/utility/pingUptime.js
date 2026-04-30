const { reply, formatDuration } = require('../../utils/helpers');

const pingCommand = {
  name: 'ping',
  aliases: [],
  category: 'utility',
  description: 'Cek latency bot',
  usage: '?ping',

  async execute(msg, args) {
    const sent = await msg.channel.send('🏓 Pinging...');
    const latency = sent.createdTimestamp - msg.createdTimestamp;
    await sent.delete().catch(() => {});
    await reply(msg, `🏓 **Pong!**\n> Latency: \`${latency}ms\`\n> WebSocket: \`${Math.round(msg.client.ws.ping)}ms\``);
  },
};

const uptimeCommand = {
  name: 'uptime',
  aliases: [],
  category: 'utility',
  description: 'Cek sudah berapa lama bot berjalan',
  usage: '?uptime',

  async execute(msg, args) {
    const seconds = Math.floor(process.uptime());
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    const parts = [];
    if (d > 0) parts.push(`${d}h`);
    if (h > 0) parts.push(`${h}j`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}d`);

    await reply(msg, `⏱️ **Uptime:** \`${parts.join(' ')}\``);
  },
};

module.exports = [pingCommand, uptimeCommand];
