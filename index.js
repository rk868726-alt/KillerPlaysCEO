const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

// Load commands
const commandFiles = fs.readdirSync('./commands');
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// Ready Event
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Interaction Handler
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Error executing command.', ephemeral: true });
  }
});

// Auto Moderation
client.on('messageCreate', message => {
  if (message.author.bot) return;

  const bannedWords = ["badword1", "badword2"];
  if (bannedWords.some(word => message.content.toLowerCase().includes(word))) {
    message.delete();
    message.channel.send(`${message.author}, bad language is not allowed.`);
  }

  if (message.content.includes("http://") || message.content.includes("https://")) {
    message.delete();
    message.channel.send(`${message.author}, links are not allowed.`);
  }
});

client.login(process.env.TOKEN);
