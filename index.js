const { 
  Client, 
  GatewayIntentBits, 
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
} = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ===== DATABASE =====
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

// ===== AUTO MODERATION =====
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  // 🚫 Anti-Link
  if (message.content.includes("http://") || message.content.includes("https://")) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      await message.delete();
      return message.channel.send(`${message.author}, links are not allowed.`);
    }
  }

  // 🚫 Bad Words Filter
  const bannedWords = ["badword1", "badword2"];
  if (bannedWords.some(word => message.content.toLowerCase().includes(word))) {
    await message.delete();
    return message.channel.send(`${message.author}, bad language is not allowed.`);
  }

  // ===== COMMANDS =====
  const prefix = "!";
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // ✅ SETUP VERIFICATION PANEL
if (command === "setupverify") {
  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
    return message.reply("No permission.");

  const button = new ButtonBuilder()
    .setCustomId('verify_button')
    .setLabel('✅ Verify')
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder().addComponents(button);

  await message.channel.send({
    content: "Click the button below to verify yourself.",
    components: [row]
  });

  message.delete();
}

    // 🧹 Clear messages
 // 🧹 CLEAR
if (command === "clear") {
  if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
    return message.reply("❌ You don't have permission to manage messages.");

  const amount = parseInt(args[0]);

  if (!amount || isNaN(amount))
    return message.reply("⚠️ Please provide a number. Example: !clear 10");

  if (amount < 1 || amount > 100)
    return message.reply("⚠️ You can delete between 1 and 100 messages.");

  try {
    await message.channel.bulkDelete(amount, true);

    const confirm = await message.channel.send(`🧹 Deleted ${amount} messages.`);
    setTimeout(() => confirm.delete(), 3000);

  } catch (error) {
    console.error(error);
    message.reply("⚠️ I cannot delete messages older than 14 days.");
  }
}
  // 🔊 SAY
if (command === "say") {
  if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
    return message.reply("No permission.");

  const text = args.join(" ");
  if (!text) return message.reply("Provide a message to say.");

  await message.delete();
  return message.channel.send(text);
  }

  // 📢 MENTION
if (command === "mention") {
  const member = message.mentions.members.first();
  if (!member) return message.reply("Mention a user.");

  return message.channel.send(`${member}`);
}

  // ⚠ WARN
  if (command === "warn") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return message.reply("No permission.");

    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention user.");

    const db = loadDB();
    if (!db[member.id]) db[member.id] = 0;

    db[member.id]++;
    saveDB(db);

    message.channel.send(`⚠ ${member.user.tag} warned. Total warns: ${db[member.id]}`);

    // 🔇 AUTO MUTE AFTER 3 WARNS
    if (db[member.id] >= 3) {
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
      message.channel.send(`🔇 ${member.user.tag} auto-muted after 3 warns.`);
    }
  }

  // 🔇 MUTE
  if (command === "mute") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles))
      return message.reply("No permission.");

    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention user.");

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
    message.channel.send(`🔇 ${member.user.tag} muted.`);
  }

  // 🔊 UNMUTE
  if (command === "unmute") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles))
      return message.reply("No permission.");

    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention user.");

    const muteRole = message.guild.roles.cache.find(r => r.name === "Muted");
    if (!muteRole) return message.reply("No mute role found.");

    await member.roles.remove(muteRole);
    message.channel.send(`🔊 ${member.user.tag} unmuted.`);
  }

  // 🔨 BAN
  if (command === "ban") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply("No permission.");

    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention user.");

    await member.ban();
    message.channel.send(`🔨 ${member.user.tag} banned.`);
  }

  // ⏳ TIMEOUT
  if (command === "timeout") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return message.reply("No permission.");

    const member = message.mentions.members.first();
    const minutes = parseInt(args[0]);

    if (!member || isNaN(minutes))
      return message.reply("Usage: !timeout @user 5");

    await member.timeout(minutes * 60 * 1000);
    message.channel.send(`⏳ ${member.user.tag} timed out for ${minutes} minutes.`);
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'verify_button') {

    const verifiedRole = interaction.guild.roles.cache.find(r => r.name === "Verified");
    const unverifiedRole = interaction.guild.roles.cache.find(r => r.name === "Unverified");

    if (!verifiedRole)
      return interaction.reply({ content: "Verified role not found.", ephemeral: true });

    await interaction.member.roles.add(verifiedRole);

    if (unverifiedRole) {
      await interaction.member.roles.remove(unverifiedRole);
    }

    await interaction.reply({
      content: "🎉 You are now verified!",
      ephemeral: true
    });
  }
});

client.login(process.env.TOKEN);









