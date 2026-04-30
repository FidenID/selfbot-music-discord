const {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  StreamType,
} = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const { getQueue, deleteQueue } = require('../utils/queueManager');
const { notifyDM, formatDuration, truncate } = require('../utils/helpers');
const { getRecommendations } = require('../utils/youtube');

// Buat audio resource dari URL YouTube
function createYTResource(url, volume = 50) {
  const stream = ytdl(url, {
    filter: 'audioonly',
    quality: 'highestaudio',
    highWaterMark: 1 << 25,
  });

  const resource = createAudioResource(stream, {
    inputType: StreamType.Arbitrary,
    inlineVolume: true,
  });

  resource.volume?.setVolume(volume / 100);
  return resource;
}

// Buat audio resource dari URL radio (HTTP stream)
function createRadioResource(url, volume = 50) {
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
    // Queue kosong, cek autoplay
    if (queue.autoplay && queue.lastPlayed) {
      const rec = await getRecommendations(queue.lastPlayed);
      if (rec) {
        rec.requestedBy = queue.lastCommandAuthor;
        queue.songs.push(rec);
        await notifyDM(queue, `🎵 **Autoplay:** \`${truncate(rec.title, 60)}\`\n> Dari rekomendasi YouTube`);
      }
    }

    if (!queue.songs.length) {
      await notifyDM(queue, `✅ Queue habis. Bot tetap di voice channel.\nGunakan \`?p <lagu>\` untuk putar lagi.`);
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

  try {
    const resource = createYTResource(song.url, queue.volume);
    queue.player.play(resource);

    await notifyDM(
      queue,
      `🎵 **Sekarang Memutar**\n\`${truncate(song.title, 60)}\`\n> Durasi: \`${formatDuration(song.duration)}\` | Channel: \`${song.channel}\``
    );
  } catch (err) {
    await notifyDM(queue, `❌ Gagal memutar \`${song.title}\`: ${err.message}`);
    queue.songs.shift();
    playSong(queue);
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
    const resource = createRadioResource(radioInfo.url, queue.volume);
    queue.player.play(resource);

    await notifyDM(
      queue,
      `📻 **Radio Dimulai**\n\`${radioInfo.name}\`\n> Stream: \`${radioInfo.url}\``
    );
  } catch (err) {
    await notifyDM(queue, `❌ Gagal memutar radio: ${err.message}`);
    queue.playing = false;
    queue.isRadio = false;
  }
}

// Setup audio player dengan event handlers
function setupPlayer(queue) {
  const player = createAudioPlayer();

  player.on(AudioPlayerStatus.Idle, async () => {
    if (queue.isRadio) return; // radio tidak auto-next

    if (queue.loop && queue.songs.length > 0) {
      // Loop: putar ulang lagu yang sama
      playSong(queue);
      return;
    }

    // Geser ke lagu berikutnya
    queue.songs.shift();
    playSong(queue);
  });

  player.on('error', async (err) => {
    await notifyDM(queue, `❌ Player error: ${err.message}`);
    queue.songs.shift();
    playSong(queue);
  });

  queue.player = player;
  queue.connection.subscribe(player);
}

module.exports = { setupPlayer, playSong, playRadio, createYTResource, createRadioResource };
