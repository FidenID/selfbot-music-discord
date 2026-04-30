require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_TOKEN,
  prefix: process.env.PREFIX || '?',
  ownerId: process.env.OWNER_ID,
  geniusKey: process.env.GENIUS_API_KEY || '',
  defaultVolume: parseInt(process.env.DEFAULT_VOLUME) || 50,
  lang: process.env.LANG || 'id',

  // Warna embed / teks
  colors: {
    primary: '🎵',
    radio: '📻',
    error: '❌',
    success: '✅',
    info: 'ℹ️',
  },

  // Radio stations bawaan
  radioStations: [
    { name: 'Jazz FM', aliases: ['jazz'], url: 'https://streaming.radio.co/s45e949474/listen' },
    { name: 'Prambors', aliases: ['prambors'], url: 'https://live.prambors.com/prambors' },
    { name: 'RRI Pro2', aliases: ['rri', 'pro2'], url: 'https://streaming2.rri.co.id/rri_pro2_jakarta' },
    { name: 'Hard Rock FM', aliases: ['hardrock', 'rock'], url: 'https://hardrock.leanstream.co/JKTHKFM-MP3' },
    { name: 'Gen FM', aliases: ['gen'], url: 'https://stream-gen.indosiar.com/gen' },
    { name: 'Trax FM', aliases: ['trax'], url: 'https://stream.traxfm.co.id/traxfm' },
    { name: 'Sonora FM', aliases: ['sonora'], url: 'https://sonorafm.leanstream.co/JKTSFM-MP3' },
  ],
};
