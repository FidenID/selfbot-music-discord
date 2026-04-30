// src/utils/logger.js
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const config = require('../../config.json');

// Pastikan folder logs ada
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const levels = {
  info:    { color: chalk.cyan,    label: 'INFO ' },
  success: { color: chalk.green,   label: 'OK   ' },
  warn:    { color: chalk.yellow,  label: 'WARN ' },
  error:   { color: chalk.red,     label: 'ERR  ' },
  debug:   { color: chalk.magenta, label: 'DEBUG' },
  music:   { color: chalk.blue,    label: 'MUSIC' },
};

function timestamp() {
  return new Date().toLocaleString('id-ID', { hour12: false });
}

function writeFile(line) {
  if (!config.logging?.enabled) return;
  const filePath = path.join(__dirname, '../../', config.logging.file || 'logs/bot.log');
  fs.appendFile(filePath, line + '\n', () => {});
}

function log(level, ...args) {
  const { color, label } = levels[level] || levels.info;
  const msg = args.join(' ');
  const line = `[${timestamp()}] [${label}] ${msg}`;
  console.log(color(line));
  writeFile(line);
}

module.exports = {
  info:    (...a) => log('info', ...a),
  success: (...a) => log('success', ...a),
  warn:    (...a) => log('warn', ...a),
  error:   (...a) => log('error', ...a),
  debug:   (...a) => log('debug', ...a),
  music:   (...a) => log('music', ...a),
};
