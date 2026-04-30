require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const { loadCommands } = require('./handlers/commandHandler');
const { handleMessage } = require('./handlers/messageHandler');
const config = require('../config');

const client = new Client({
  checkUpdate: false,
  readyStatus: false,
  patchVoice: true, // diperlukan untuk @discordjs/voice dengan selfbot
});

// ─── Ready ───────────────────────────────────────────────
client.once('ready', () => {
  console.log(`\n╔══════════════════════════════════╗`);
  console.log(`║   ✅  Bot Ready!                 ║`);
  console.log(`║   👤  ${client.user.tag.padEnd(26)}║`);
  console.log(`║   🎵  Prefix: ${config.prefix.padEnd(21)}║`);
  console.log(`╚══════════════════════════════════╝\n`);
});

// ─── Message ─────────────────────────────────────────────
client.on('messageCreate', handleMessage);

// ─── Error handling ───────────────────────────────────────
client.on('error', err => console.error('[Client Error]', err.message));
process.on('unhandledRejection', err => console.error('[Unhandled Rejection]', err?.message || err));
process.on('uncaughtException', err => console.error('[Uncaught Exception]', err.message));

// ─── Load commands & login ────────────────────────────────
loadCommands();

if (!config.token || config.token === 'your_discord_token_here') {
  console.error('❌ DISCORD_TOKEN belum diisi di file .env!');
  process.exit(1);
}

client.login(config.token);
