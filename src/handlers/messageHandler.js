const { getCommand } = require('./commandHandler');
const { reply } = require('../utils/helpers');
const config = require('../../config');

async function handleMessage(msg) {
  // Abaikan pesan bukan dari akun sendiri (selfbot)
  if (msg.author.id !== msg.client.user.id) return;

  // Cek prefix
  if (!msg.content.startsWith(config.prefix)) return;

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
