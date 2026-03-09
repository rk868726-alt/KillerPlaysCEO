const { REST, Routes } = require('discord.js');
const fs = require('fs');

const commands = [];
const commandFiles = fs.readdirSync('./commands');

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

rest.put(
  Routes.applicationCommands('YOUR_CLIENT_ID'),
  { body: commands },
);