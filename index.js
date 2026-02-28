const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ===== SIMPLE DATABASE =====
const DB_FILE = './database.json';
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({}));

function loadDB() {
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ===== READY =====
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ===== COMMANDS =====
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const prefix = "!";
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // 🔊 SAY
  if (command === "say") {
    const text = args.join(" ");
    if (!text) return message.reply("Provide a message to say.");
    message.delete();
    return message.channel.send(text);
  }

  // 📢 MENTION
  if (command === "mention") {
    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention someone.");
    return message.channel.send(`${member}`);
  }

  // 🔨 BAN
  if (command === "ban") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply("No permission.");

    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention user to ban.");

    await member.ban();
    return message.channel.send(`🔨 ${member.user.tag} banned.`);
  }

  // ⚠ WARN
  if (command === "warn") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return message.reply("No permission.");

    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention user to warn.");

    const db = loadDB();
    if (!db[member.id]) db[member.id] = 0;
    db[member.id]++;

    saveDB(db);

    return message.channel.send(
      `⚠ ${member.user.tag} warned. Total warns: ${db[member.id]}`
    );
  }

  // ⏳ TIMEOUT (minutes)
  if (command === "timeout") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return message.reply("No permission.");

    const member = message.mentions.members.first();
    const minutes = parseInt(args[0]);

    if (!member || isNaN(minutes))
      return message.reply("Usage: !timeout @user 5");

    await member.timeout(minutes * 60 * 1000);
    return message.channel.send(
      `⏳ ${member.user.tag} timed out for ${minutes} minutes.`
    );
  }

  // 🔇 MUTE (Role Based)
  if (command === "mute") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles))
      return message.reply("No permission.");

    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention user to mute.");

    let muteRole = message.guild.roles.cache.find(r => r.name === "Muted");

    if (!muteRole) {
      muteRole = await message.guild.roles.create({
        name: "Muted",
        permissions: []
      });

      message.guild.channels.cache.forEach(async (channel) => {
        await channel.permissionOverwrites.create(muteRole, {
          SendMessages: false,
          Speak: false
        });
      });
    }

    await member.roles.add(muteRole);
    return message.channel.send(`🔇 ${member.user.tag} has been muted.`);
  }
});

client.login(process.env.TOKEN);

