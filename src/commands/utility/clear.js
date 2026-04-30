const { reply } = require('../../utils/helpers');

module.exports = {
  name: 'clear',
  aliases: [],
  category: 'utility',
  description: 'Hapus pesan-pesan bot di channel (default: 10)',
  usage: '?clear [jumlah]',

  async execute(msg, args) {
    const limit = Math.min(parseInt(args[0]) || 10, 100);

    try {
      // Fetch pesan dari channel
      const messages = await msg.channel.messages.fetch({ limit: 100 });

      // Filter hanya pesan dari akun sendiri
      const myMessages = messages
        .filter(m => m.author.id === msg.client.user.id)
        .first(limit);

      let deleted = 0;
      for (const m of myMessages) {
        try {
          await m.delete();
          deleted++;
          // Delay kecil biar tidak rate limited
          await new Promise(r => setTimeout(r, 300));
        } catch (_) {}
      }

      // Kirim konfirmasi ke DM
      const dmChannel = await msg.author.createDM();
      await dmChannel.send(`🗑️ Berhasil menghapus **${deleted}** pesan bot di channel.`);
    } catch (err) {
      await reply(msg, `❌ Gagal menghapus pesan: ${err.message}`);
    }
  },
};
