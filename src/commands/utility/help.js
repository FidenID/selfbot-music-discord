const { reply } = require('../../utils/helpers');
const { getAllCommands } = require('../../handlers/commandHandler');
const config = require('../../../config');

module.exports = {
  name: 'help',
  aliases: [],
  category: 'utility',
  description: 'Tampilkan semua command ke DM',
  usage: '?help',

  async execute(msg, args) {
    const p = config.prefix;
    const commands = getAllCommands();

    // Kelompokkan per kategori
    const categories = {};
    for (const cmd of commands) {
      const cat = cmd.category || 'other';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd);
    }

    const categoryEmoji = {
      music: '🎵 Musik',
      radio: '📻 Radio',
      voice: '🎙️ Voice Channel',
      utility: '🛠️ Utility',
      other: '📦 Lainnya',
    };

    const lines = [
      `╔══════════════════════════╗`,
      `║   🤖  DISCORD SELFBOT    ║`,
      `╚══════════════════════════╝`,
      `Prefix: \`${p}\``,
      ``,
    ];

    for (const [cat, cmds] of Object.entries(categories)) {
      lines.push(`**${categoryEmoji[cat] || cat.toUpperCase()}**`);
      for (const cmd of cmds) {
        const aliases = cmd.aliases?.length ? ` / \`${p}${cmd.aliases.join(`\` / \`${p}`)}\`` : '';
        lines.push(`> \`${p}${cmd.name}\`${aliases} — ${cmd.description}`);
      }
      lines.push('');
    }

    lines.push(`💡 Semua output dikirim ke DM kamu.`);
    lines.push(`📌 Gunakan \`${p}status\` untuk cek kondisi bot.`);

    try {
      const dmChannel = await msg.author.createDM();
      await dmChannel.send(lines.join('\n'));
      await msg.react('✉️').catch(() => {});
    } catch (err) {
      await msg.channel.send(lines.join('\n'));
    }
  },
};
