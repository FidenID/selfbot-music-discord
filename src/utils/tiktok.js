const axios = require('axios');

// Cek apakah URL adalah TikTok
function isTikTokUrl(str) {
  return /tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com/.test(str);
}

// Resolve TikTok URL pendek jadi URL penuh
async function resolveShortUrl(url) {
  try {
    const res = await axios.get(url, {
      maxRedirects: 5,
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    return res.request.res.responseUrl || url;
  } catch (err) {
    // Kalau redirect, axios error tapi URL sudah terupdate
    if (err.request?.res?.responseUrl) return err.request.res.responseUrl;
    return url;
  }
}

// Ambil audio TikTok tanpa watermark via API publik
async function getTikTokAudio(url) {
  // Resolve URL pendek dulu
  const fullUrl = await resolveShortUrl(url);

  // Coba API tikwm (gratis, tidak perlu key)
  try {
    const res = await axios.post(
      'https://www.tikwm.com/api/',
      new URLSearchParams({ url: fullUrl, count: 1, cursor: 0, web: 1, hd: 1 }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000,
      }
    );

    const data = res.data?.data;
    if (!data) throw new Error('Data tidak ditemukan');

    // TikTok musik/audio
    const audioUrl = data.music_info?.play || data.play || data.hdplay;
    if (!audioUrl) throw new Error('Audio URL tidak ditemukan');

    return {
      title: data.title || data.music_info?.title || 'TikTok Audio',
      url: fullUrl,
      audioUrl,
      thumbnail: data.cover || data.music_info?.cover || '',
      duration: data.duration || data.music_info?.duration || 0,
      channel: data.author?.nickname || data.music_info?.author || 'TikTok',
      source: 'tiktok',
    };
  } catch (err) {
    throw new Error(`Gagal ambil audio TikTok: ${err.message}`);
  }
}

module.exports = { isTikTokUrl, getTikTokAudio };
