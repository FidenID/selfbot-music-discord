// Queue Manager - menyimpan state musik per guild
const queues = new Map();

function getQueue(guildId) {
  return queues.get(guildId) || null;
}

function createQueue(guildId, data) {
  const queue = {
    guildId,
    voiceChannel: data.voiceChannel,
    textChannel: data.textChannel,
    connection: null,
    player: null,
    songs: [],
    volume: data.volume || 50,
    loop: false,
    autoplay: false,
    playing: false,
    paused: false,
    lastCommandAuthor: data.lastCommandAuthor || null,
    startTime: null,
    isRadio: false,
    radioInfo: null,
  };
  queues.set(guildId, queue);
  return queue;
}

function deleteQueue(guildId) {
  queues.delete(guildId);
}

function hasQueue(guildId) {
  return queues.has(guildId);
}

module.exports = { getQueue, createQueue, deleteQueue, hasQueue };
