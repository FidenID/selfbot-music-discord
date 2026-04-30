const ytsr = require('ytsr');
const ytpl = require('ytpl');
const ytdl = require('ytdl-core');

// Cek apakah string adalah URL YouTube
function isYouTubeUrl(str) {
  return /(?:youtube\.com\/(?:watch\?v=|playlist\?list=)|youtu\.be\/)/.test(str);
}

// Cek apakah URL adalah playlist
function isPlaylist(str) {
  return /[?&]list=/.test(str) || /youtube\.com\/playlist/.test(str);
}

// Cek apakah URL adalah TikTok
function isTikTokUrl(str) {
  return /tiktok\.com/.test(str);
}

// Cari lagu di YouTube
async function searchYouTube(query, limit = 1) {
  const filters = await ytsr.getFilters(query);
  const filter = filters.get('Type')?.get('Video');
  const results = await ytsr(filter?.url || query, { limit });
  return results.items.filter(i => i.type === 'video');
}

// Ambil info video dari URL/ID YouTube
async function getVideoInfo(url) {
  try {
    const info = await ytdl.getInfo(url);
    const details = info.videoDetails;
    return {
      title: details.title,
      url: details.video_url,
      thumbnail: details.thumbnails?.[details.thumbnails.length - 1]?.url || '',
      duration: parseInt(details.lengthSeconds),
      channel: details.author?.name || 'Unknown',
      views: details.viewCount,
    };
  } catch (err) {
    throw new Error(`Gagal ambil info video: ${err.message}`);
  }
}

// Ambil semua video dari playlist
async function getPlaylistVideos(url, limit = 50) {
  try {
    const playlist = await ytpl(url, { limit });
    return playlist.items.map(item => ({
      title: item.title,
      url: item.shortUrl,
      thumbnail: item.bestThumbnail?.url || '',
      duration: item.durationSec || 0,
      channel: item.author?.name || 'Unknown',
    }));
  } catch (err) {
    throw new Error(`Gagal ambil playlist: ${err.message}`);
  }
}

// Ambil rekomendasi YouTube (autoplay) dari lagu terakhir
async function getRecommendations(videoUrl) {
  try {
    const info = await ytdl.getInfo(videoUrl);
    const related = info.related_videos;
    if (!related || related.length === 0) return null;

    // Ambil video pertama dari related yang bukan live
    const next = related.find(v => v.id && !v.isLive && v.length_seconds > 0);
    if (!next) return null;

    return {
      title: next.title,
      url: `https://www.youtube.com/watch?v=${next.id}`,
      thumbnail: next.thumbnails?.[0]?.url || '',
      duration: next.length_seconds || 0,
      channel: next.author?.name || 'Unknown',
    };
  } catch (_) {
    return null;
  }
}

// Resolve query: URL atau search
async function resolveSong(query) {
  if (isYouTubeUrl(query)) {
    return await getVideoInfo(query);
  }
  const results = await searchYouTube(query, 1);
  if (!results.length) throw new Error('Lagu tidak ditemukan di YouTube.');
  const v = results[0];
  return {
    title: v.title,
    url: v.url,
    thumbnail: v.bestThumbnail?.url || '',
    duration: v.duration ? parseDuration(v.duration) : 0,
    channel: v.author?.name || 'Unknown',
  };
}

// Parse durasi string "mm:ss" atau "hh:mm:ss" ke detik
function parseDuration(str) {
  if (!str) return 0;
  const parts = str.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

module.exports = {
  isYouTubeUrl,
  isPlaylist,
  isTikTokUrl,
  searchYouTube,
  getVideoInfo,
  getPlaylistVideos,
  getRecommendations,
  resolveSong,
};
