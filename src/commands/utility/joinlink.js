const { reply } = require('../../utils/helpers');

module.exports = {
  name: 'joinlink',
  aliases: [],
  category: 'utility',
  description: 'Bot join server Discord via invite link',
  usage: '?joinlink <kode/URL invite>',

  async execute(msg, args) {
    if (!args.length) {
      return reply(msg, `❌ Masukkan kode atau URL invite.\n**Contoh:** \`?joinlink discord.gg/abc123\``);
    }

    // Ekstrak kode dari URL kalau full URL diberikan
    let code = args[0].trim();
    const match = code.match(/discord(?:\.gg|app\.com\/invite)\/([a-zA-Z0-9\-]+)/);
    if (match) code = match[1];

    try {
      await msg.client.acceptInvite(code);
      await reply(msg, `✅ Berhasil join server via invite: \`${code}\``);
    } catch (err) {
      await reply(msg, `❌ Gagal join server: \`${err.message}\``);
    }
  },
};
