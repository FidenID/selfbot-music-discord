// src/commands/radio.js
const { reply } = require('../utils/dmHelper');
const logger = require('../utils/logger');
const config = require('../../config.json');

module.exports = {
  name: 'radio',

  async execute(client, distube, msg, cmd, args) {
    if (cmd !== 'radio') return;

    const voiceChannel = msg.member?.voice?.channel;
    if (!voiceChannel) {
      return reply(msg, '❌ **Kamu harus join voice channel dulu!**');
    }

    if (!args.length) {
      // Tampilkan daftar stasiun
      const stations = config.radio.stations;
      const list = stations.map((s, i) => `${i + 1}. **${s.label}** — \`?radio ${s.name}\``).join('\n');
      return reply(msg, `📻 **Daftar Stasiun Radio**\n\n${list}\n\nAtau gunakan URL langsung:\n\`?radio https://stream.url.com/stream\``);
    }

    const query = args.join(' ');

    // Cek apakah URL langsung
    const isUrl = query.startsWith('http://') || query.startsWith('https://');

    let streamUrl = null;
    let stationLabel = null;

    if (isUrl) {
      streamUrl = query;
      stationLabel = query;
    } else {
      // Cari di daftar stasiun
      const found = config.radio.stations.find(s =>
        s.name.toLowerCase() === query.toLowerCase() ||
        s.label.toLowerCase().includes(query.toLowerCase())
      );

      if (!found) {
        const names = config.radio.stations.map(s => `\`${s.name}\``).join(', ');
        return reply(msg, `❌ Stasiun **${query}** tidak ditemukan!\n\nStasiun tersedia: ${names}\n\nAtau gunakan URL langsung.`);
      }

      streamUrl = found.url;
      stationLabel = found.label;
    }

    try {
      await reply(msg, `📻 Memuat radio: **${stationLabel}**...`);

      await distube.play(voiceChannel, streamUrl, {
        member: msg.member,
        textChannel: msg.channel,
        metadata: {
          lastAuthor: msg.author,
          isRadio: true,
          radioLabel: stationLabel,
        },
      });

      logger.music(`Radio dimulai: ${stationLabel} oleh ${msg.author.tag}`);
    } catch (err) {
      logger.error(`Radio error: ${err.message}`);
      return reply(msg, `❌ **Gagal memutar radio!**\n\`${err.message}\`\n\nPastikan URL stream valid dan online.`);
    }
  },
};
