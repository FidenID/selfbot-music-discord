const {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  StreamType,
} = require('@discordjs/voice');
const playdl = require('play-dl');
const { notifyDM, formatDuration, truncate } = require('./helpers');
const { getRecommendations } = require('./youtube');

// Buat resource dari YouTube via play-dl
async function createYTResource(url, volume = 50) {
  const stream = await playdl.stream(url, { quality: 2 });
  const resource = createAudioResource(stream.stream, {
    inputType: stream.type,
    inlineVolume: true,
  });
  resource.volume?.setVolume(volume / 100);
  return resource;
}

// Buat resource dari URL langsung (TikTok, radio)
function createDirectResource(url, volume = 50) {
  const resource = createAudioResource(url, {
    inputType: StreamType.Arbitrary,
    inlineVolume: true,
  });
  resource.volume?.setVolume(volume / 100);
  return resource;
}

// Play lagu berikutnya di queue
async function playSong(queue) {
  if (!queue.songs.length) {
    // Cek autoplay hanya untuk YouTube
    if (queue.autoplay && queue.lastPlayed && queue.lastPlayedSource === 'youtube') {
      try {
        const rec = await getRecommendations(queue.lastPlayed);
        if (rec) {
          rec.requestedBy = queue.lastCommandAuthor;
          queue.songs.push(rec);
          await notifyDM(queue, `🎶 **Autoplay:** \`${truncate(rec.title, 60)}\`\n> Dari rekomendasi YouTube`);
        }
      } catch (_) {}
    }

    if (!queue.songs.length) {
      await notifyDM(queue, `✅ Queue habis. Bot tetap di voice channel.\nGunakan \`??p <lagu>\` untuk putar lagi.`);
      queue.playing = false;
      return;
    }
  }

  const song = queue.songs[0];
  queue.playing = true;
  queue.paused = false;
  queue.startTime = Date.now();
  queue.isRadio = false;
  queue.lastPlayed = song.url;
  queue.lastPlayedSource = song.source || 'youtube';

  try {
    let resource;

    if (song.source === 'tiktok') {
      resource = createDirectResource(song.audioUrl, queue.volume);
    } else {
      resource = await createYTResource(song.url, queue.volume);
    }

    queue.player.play(resource);

    const emoji = song.source === 'tiktok' ? '🎵 TikTok' : '🎵 YouTube';
    await notifyDM(
      queue,
      `${emoji} **Sekarang Memutar**\n\`${truncate(song.title, 60)}\`\n> Durasi: \`${formatDuration(song.duration)}\` | By: \`${song.channel}\``
    );
  } catch (err) {
    console.error('[Player] Error:', err.message);
    await notifyDM(queue, `❌ Gagal memutar \`${truncate(song.title, 40)}\`: ${err.message}`);
    queue.songs.shift();
    if (queue.songs.length) playSong(queue);
    else queue.playing = false;
  }
}

// Play radio stream
async function playRadio(queue, radioInfo) {
  queue.playing = true;
  queue.paused = false;
  queue.isRadio = true;
  queue.radioInfo = radioInfo;
  queue.startTime = Date.now();

  try {
    const resource = createDirectResource(radioInfo.url, queue.volume);
    queue.player.play(resource);
    await notifyDM(queue, `📻 **Radio:** \`${radioInfo.name}\`\n> URL: \`${radioInfo.url}\``);
  } catch (err) {
    await notifyDM(queue, `❌ Gagal memutar radio: ${err.message}`);
    queue.playing = false;
    queue.isRadio = false;
  }
}

// Setup player event
function setupPlayer(queue) {
  const player = createAudioPlayer();

  player.on(AudioPlayerStatus.Idle, async () => {
    if (queue.isRadio) return;

    if (queue.loop && queue.songs.length > 0) {
      return playSong(queue);
    }

    queue.songs.shift();
    playSong(queue);
  });

  player.on('error', async (err) => {
    console.error('[Player Error]', err.message);
    await notifyDM(queue, `❌ Player error: ${err.message}`);
    queue.songs.shift();
    if (queue.songs.length) playSong(queue);
    else queue.playing = false;
  });

  queue.player = player;
  queue.connection.subscribe(player);
}

module.exports = { setupPlayer, playSong, playRadio };
