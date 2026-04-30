// src/utils/dmHelper.js
const config = require('../../config.json');
const logger = require('./logger');

/**
 * Kirim pesan ke DM user, fallback ke channel jika gagal
 * @param {Message} msg - pesan original
 * @param {string|Object} content - konten pesan
 * @returns {Promise<Message>}
 */
async function reply(msg, content) {
  try {
    const dm = await msg.author.createDM();
    const sent = await dm.send(content);

    // Tambahkan reaksi di channel sebagai tanda sudah dikirim ke DM
    if (config.dm?.reactionEmoji) {
      await msg.react(config.dm.reactionEmoji).catch(() => {});
    }

    return sent;
  } catch (err) {
    logger.warn(`Gagal DM ke ${msg.author.tag}: ${err.message}`);

    if (config.dm?.fallbackToChannel) {
      return msg.channel.send(content).catch(() => {});
    }
  }
}

/**
 * Kirim notifikasi ke DM dari dalam event musik (tanpa msg)
 * @param {Object} queue - DisTube queue object
 * @param {string|Object} content - konten pesan
 */
async function notifyDM(queue, content) {
  try {
    const author = queue.metadata?.lastAuthor;
    if (!author) return;

    const dm = await author.createDM();
    await dm.send(content);
  } catch (err) {
    logger.warn(`Gagal notif DM: ${err.message}`);

    // Fallback ke text channel
    if (queue.textChannel) {
      queue.textChannel.send(content).catch(() => {});
    }
  }
}

/**
 * Format durasi detik ke MM:SS atau HH:MM:SS
 * @param {number} seconds
 * @returns {string}
 */
function formatDuration(seconds) {
  if (!seconds || seconds === Infinity) return '🔴 LIVE';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Buat progress bar musik
 * @param {number} current - posisi saat ini (detik)
 * @param {number} total - total durasi (detik)
 * @param {number} length - panjang bar
 * @returns {string}
 */
function progressBar(current, total, length = 20) {
  if (!total || total === Infinity) return '▓'.repeat(length);
  const filled = Math.round((current / total) * length);
  const empty = length - filled;
  return '▓'.repeat(filled) + '░'.repeat(empty);
}

/**
 * Potong teks jika melebihi batas
 * @param {string} text
 * @param {number} max
 * @returns {string}
 */
function truncate(text, max = 50) {
  if (!text) return 'Unknown';
  return text.length > max ? text.substring(0, max - 3) + '...' : text;
}

module.exports = { reply, notifyDM, formatDuration, progressBar, truncate };
