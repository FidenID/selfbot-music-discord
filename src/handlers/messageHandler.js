const { getCommand } = require('./commandHandler');
const { reply } = require('../utils/helpers');
const config = require('../../config');

async function handleMessage(msg) {
  // Abaikan bot lain
  if (msg.author.bot) return;

  // Cek prefix
  if (!msg.content.startsWith(config.prefix)) return;

  // Kalau OWNER_ID diset, hanya owner yang bisa pakai
  if (config.ownerId && msg.author.id !== config.ownerId) return;

  const args = msg.content.slice(config.prefix.length).trim().split(/\s+/);
  const commandName = args.shift().toLowerCase();

  const command = getCommand(commandName);
  if (!command) return;

  try {
    await command.execute(msg, args);
  } catch (err) {
    console.error(`[Error] Command ${commandName}:`, err);
    await reply(msg, `❌ **Error:** ${err.message}`);
  }
}

module.exports = { handleMessage };
