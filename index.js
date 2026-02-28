const { Client, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Channel]
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
client.login(process.env.TOKEN);

