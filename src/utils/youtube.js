const playdl = require('play-dl');
const ytpl = require('ytpl');

// Cek apakah string adalah URL YouTube
function isYouTubeUrl(str) {
  return /(?:youtube\.com\/(?:watch\?v=|playlist\?list=)|youtu\.be\/)/.test(str);
}

// Cek apakah URL adalah playlist
function isPlaylist(str) {
  return /[?&]list=/.test(str) || /youtube\.com\/playlist/.test(str);
}

// Cari lagu di YouTube via play-dl
async function searchYouTube(query, limit = 5) {
  const results = await playdl.search(query, { source: { youtube: 'video' }, limit });
  return results;
}

// Ambil info video dari URL YouTube
async function getVideoInfo(url) {
  const info = await playdl.video_info(url);
  const details = info.video_details;
  return {
    title: details.title || 'Unknown',
    url: details.url,
    thumbnail: details.thumbnails?.[0]?.url || '',
    duration: details.durationInSec || 0,
    channel: details.channel?.name || 'Unknown',
    source: 'youtube',
  };
}

// Ambil stream dari URL YouTube (langsung bisa dipakai player)
async function getYTStream(url) {
  const stream = await playdl.stream(url, { quality: 2 });
  return stream;
}

// Ambil rekomendasi YouTube untuk autoplay
async function getRecommendations(videoUrl) {
  try {
    const info = await playdl.video_info(videoUrl);
    const related = info.related_videos;
    if (!related?.length) return null;

    const next = related.find(v => v.id && !v.live && v.durationInSec > 0);
    if (!next) return null;

    return {
      title: next.title || 'Unknown',
      url: `https://www.youtube.com/watch?v=${next.id}`,
      thumbnail: next.thumbnails?.[0]?.url || '',
      duration: next.durationInSec || 0,
      channel: next.channel?.name || 'Unknown',
      source: 'youtube',
    };
  } catch (_) {
    return null;
  }
}

// Ambil semua video dari playlist YouTube
async function getPlaylistVideos(url, limit = 50) {
  try {
    const playlist = await ytpl(url, { limit });
    return playlist.items.map(item => ({
      title: item.title,
      url: item.shortUrl,
      thumbnail: item.bestThumbnail?.url || '',
      duration: item.durationSec || 0,
      channel: item.author?.name || 'Unknown',
      source: 'youtube',
    }));
  } catch (err) {
    throw new Error(`Gagal ambil playlist: ${err.message}`);
  }
}

// Resolve query: URL atau search keyword
async function resolveSong(query) {
  if (isYouTubeUrl(query)) {
    return await getVideoInfo(query);
  }

  const results = await searchYouTube(query, 1);
  if (!results.length) throw new Error('Lagu tidak ditemukan di YouTube.');

  const v = results[0];
  return {
    title: v.title || 'Unknown',
    url: v.url,
    thumbnail: v.thumbnails?.[0]?.url || '',
    duration: v.durationInSec || 0,
    channel: v.channel?.name || 'Unknown',
    source: 'youtube',
  };
}

module.exports = {
  isYouTubeUrl,
  isPlaylist,
  searchYouTube,
  getVideoInfo,
  getYTStream,
  getRecommendations,
  getPlaylistVideos,
  resolveSong,
};
