const { Client, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// Bot Ready Event
client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// Ping Command
client.on('messageCreate', message => {
    if (message.author.bot) return;

    if (message.content === '!ping') {
        message.reply('🏓 Pong!');
    }
});

// Welcome Message
client.on('guildMemberAdd', member => {
    const channel = member.guild.systemChannel;
    if (channel) {
        channel.send(`🎉 Welcome to the server, ${member.user}!`);
    }
});

// 🔐 Replace with your bot token

const { 
  Client, 
  GatewayIntentBits, 
  PermissionsBitField 
} = require('discord.js');

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const args = message.content.split(" ");
  const command = args.shift().toLowerCase();

  // 🔨 KICK COMMAND
  if (command === "!kick") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return message.reply("❌ You don't have permission to kick members.");

    const member = message.mentions.members.first();
    if (!member) return message.reply("⚠️ Mention a user to kick.");

    await member.kick();
    message.channel.send(`👢 ${member.user.tag} has been kicked.`);
  }

  // 🔨 BAN COMMAND
  if (command === "!ban") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply("❌ You don't have permission to ban members.");

    const member = message.mentions.members.first();
    if (!member) return message.reply("⚠️ Mention a user to ban.");

    await member.ban();
    message.channel.send(`🔨 ${member.user.tag} has been banned.`);
  }

  // ⏳ TIMEOUT COMMAND (in minutes)
  if (command === "!timeout") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return message.reply("❌ You don't have permission to timeout members.");

    const member = message.mentions.members.first();
    const minutes = parseInt(args[0]);

    if (!member || isNaN(minutes))
      return message.reply("⚠️ Usage: !timeout @user 5");

    await member.timeout(minutes * 60 * 1000);
    message.channel.send(`⏳ ${member.user.tag} has been timed out for ${minutes} minutes.`);
  }

  // 🧹 CLEAR MESSAGES
  if (command === "!clear") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
      return message.reply("❌ You don't have permission to manage messages.");

    const amount = parseInt(args[0]);
    if (!amount || amount < 1 || amount > 100)
      return message.reply("⚠️ Enter a number between 1-100.");

    await message.channel.bulkDelete(amount, true);
    message.channel.send(`🧹 Deleted ${amount} messages.`).then(msg => {
      setTimeout(() => msg.delete(), 3000);
    });
  }
});

client.login(process.env.TOKEN);

console.log("Token length:", process.env.TOKEN?.length);
client.login(process.env.TOKEN);




