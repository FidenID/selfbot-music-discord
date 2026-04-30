const fs = require('fs');
const path = require('path');

const commands = new Map();

function loadCommands() {
  const commandsDir = path.join(__dirname, '../commands');
  const folders = fs.readdirSync(commandsDir);
  let total = 0;

  for (const folder of folders) {
    const folderPath = path.join(commandsDir, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));

    for (const file of files) {
      const exported = require(path.join(folderPath, file));

      // Support: module.exports = cmd ATAU module.exports = [cmd1, cmd2]
      const cmdList = Array.isArray(exported) ? exported : [exported];

      for (const command of cmdList) {
        if (!command?.name) continue;
        commands.set(command.name, command);
        total++;
        if (Array.isArray(command.aliases)) {
          for (const alias of command.aliases) {
            commands.set(alias, command);
          }
        }
      }
    }
  }

  console.log(`[Handler] ✅ Loaded ${total} commands`);
}

function getCommand(name) {
  return commands.get(name) || null;
}

function getAllCommands() {
  // Return unique commands (bukan alias duplicate)
  const seen = new Set();
  const result = [];
  for (const cmd of commands.values()) {
    if (!seen.has(cmd.name)) {
      seen.add(cmd.name);
      result.push(cmd);
    }
  }
  return result;
}

module.exports = { loadCommands, getCommand, getAllCommands };
