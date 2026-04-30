const { joinVoiceChannel } = require('@discordjs/voice');
const { getQueue, createQueue } = require('../../utils/queueManager');
const { setupPlayer, playRadio } = require('../../utils/audioPlayer');
const { reply } = require('../../utils/helpers');
const config = require('../../../config');

function findStation(query) {
  const q = query.toLowerCase().trim();

  // Cek kalau URL langsung
  if (q.startsWith('http://') || q.startsWith('https://')) {
    return { name: query, url: query };
  }

  // Cari di daftar stasion
  return config.radioStations.find(s =>
    s.name.toLowerCase().includes(q) ||
    s.aliases.some(a => a.includes(q) || q.includes(a))
  ) || null;
}

module.exports = {
  name: 'radio',
  aliases: [],
  category: 'radio',
  description: 'Putar stasiun radio',
  usage: '?radio <nama/URL>',

  async execute(msg, args) {
    if (!args.length) {
      const list = config.radioStations.map((s, i) => `${i + 1}. **${s.name}** — \`${s.aliases.join(', ')}\``).join('\n');
      return reply(msg, `📻 **Daftar Radio Tersedia:**\n${list}\n\n**Contoh:** \`${config.prefix}radio jazz\` atau \`${config.prefix}radio https://stream.radio.co/xxx/listen\``);
    }

    const voiceChannel = msg.member?.voice?.channel;
    if (!voiceChannel) return reply(msg, '❌ Kamu harus masuk ke Voice Channel dulu!');

    const query = args.join(' ');
    const station = findStation(query);

    if (!station) {
      return reply(msg, `❌ Stasiun radio tidak ditemukan: \`${query}\`\nGunakan \`${config.prefix}radio\` untuk melihat daftar.`);
    }

    let queue = getQueue(msg.guild.id);

    if (!queue) {
      queue = createQueue(msg.guild.id, {
        voiceChannel,
        textChannel: msg.channel,
        volume: config.defaultVolume,
        lastCommandAuthor: msg.author,
      });

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: msg.guild.id,
        adapterCreator: msg.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false,
      });

      queue.connection = connection;
      setupPlayer(queue);
    } else {
      queue.lastCommandAuthor = msg.author;
      // Stop lagu yang sedang diputar
      if (queue.player) queue.player.stop(true);
      queue.songs = [];
    }

    await playRadio(queue, station);
  },
};
