const { getQueue } = require('../../utils/queueManager');
const { reply } = require('../../utils/helpers');
const config = require('../../../config');

// Lightweight lyrics fetch via lyrics.ovh (gratis, tanpa API key)
async function fetchLyrics(title, artist) {
  try {
    const axios = require('axios');
    const query = encodeURIComponent(artist ? `${artist} ${title}` : title);
    const res = await axios.get(`https://lyric.ovh/search/${query}`, { timeout: 8000 });

    if (res.data?.lyrics) return res.data.lyrics;

    // Fallback: lyrics.ovh format lain
    const res2 = await axios.get(`https://lyric.ovh/${encodeURIComponent(artist || 'unknown')}/${encodeURIComponent(title)}`, { timeout: 8000 });
    return res2.data?.lyrics || null;
  } catch (_) {
    return null;
  }
}

module.exports = {
  name: 'lyrics',
  aliases: ['lyr'],
  category: 'music',
  description: 'Tampilkan lirik lagu ke DM',
  usage: '?lyrics [judul lagu]',

  async execute(msg, args) {
    const queue = getQueue(msg.guild.id);
    let title = args.join(' ');

    if (!title) {
      if (!queue?.songs?.length) {
        return reply(msg, '❌ Tidak ada lagu yang diputar. Masukkan judul: `?lyrics <judul>`');
      }
      title = queue.songs[0].title;
    }

    await reply(msg, `🔍 Mencari lirik untuk: \`${title}\`...`);

    // Bersihkan judul dari noise seperti "(Official Video)", "[Lyrics]", dll
    const cleanTitle = title
      .replace(/\(.*?\)|\[.*?\]/g, '')
      .replace(/official|video|lyrics|audio|ft\.|feat\./gi, '')
      .trim();

    const lyrics = await fetchLyrics(cleanTitle, '');

    if (!lyrics) {
      return reply(msg, `❌ Lirik tidak ditemukan untuk: \`${title}\``);
    }

    // Kirim ke DM (bisa panjang, potong kalau perlu)
    const MAX = 1800;
    if (lyrics.length <= MAX) {
      await reply(msg, `🎵 **Lirik: ${title}**\n\n${lyrics}`);
    } else {
      // Kirim dalam beberapa bagian
      const parts = [];
      for (let i = 0; i < lyrics.length; i += MAX) {
        parts.push(lyrics.slice(i, i + MAX));
      }

      await reply(msg, `🎵 **Lirik: ${title}** (${parts.length} bagian)\n\n${parts[0]}`);
      for (let i = 1; i < parts.length; i++) {
        try {
          const dmChannel = await msg.author.createDM();
          await dmChannel.send(parts[i]);
        } catch (_) {}
      }
    }
  },
};
