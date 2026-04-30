// DM Helper - kirim semua output ke DM, fallback ke channel
async function reply(msg, content) {
  try {
    const dmChannel = await msg.author.createDM();
    await dmChannel.send(content);
    // Tambah reaksi ✉️ di channel sebagai tanda sudah dikirim ke DM
    try {
      await msg.react('✉️');
    } catch (_) {}
  } catch (err) {
    // Fallback ke channel kalau DM gagal (misalnya diblokir)
    try {
      await msg.channel.send(content);
    } catch (_) {}
  }
}

// Kirim notifikasi ke DM dari dalam playSong/playRadio
async function notifyDM(queue, content) {
  if (!queue?.lastCommandAuthor) return;
  try {
    const dmChannel = await queue.lastCommandAuthor.createDM();
    await dmChannel.send(content);
  } catch (_) {}
}

// Format durasi detik → mm:ss atau hh:mm:ss
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '◉ LIVE';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Progress bar
function progressBar(current, total, length = 20) {
  if (!total) return '```[◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉] LIVE```';
  const percent = current / total;
  const filled = Math.round(length * percent);
  const bar = '█'.repeat(filled) + '░'.repeat(length - filled);
  return `\`[${bar}]\``;
}

// Truncate string panjang
function truncate(str, max = 50) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 3) + '...' : str;
}

module.exports = { reply, notifyDM, formatDuration, progressBar, truncate };
