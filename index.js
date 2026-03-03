
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});const LEVEL_CHANNEL_FILE = "./levelChannel.json";

if (!fs.existsSync(LEVEL_CHANNEL_FILE)) {
  fs.writeFileSync(LEVEL_CHANNEL_FILE, JSON.stringify({}));
}

function loadLevelChannel() {
  return JSON.parse(fs.readFileSync(LEVEL_CHANNEL_FILE));
}

function saveLevelChannel(data) {
  fs.writeFileSync(LEVEL_CHANNEL_FILE, JSON.stringify(data, null, 2));
}

const { getData } = require("spotify-url-info");
const ffmpeg = require('ffmpeg-static');
const { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource, 
  AudioPlayerStatus,
  getVoiceConnection 
} = require('@discordjs/voice');

const play = require("play-dl");

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});
const { 
  Client, 
  GatewayIntentBits, 
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Events
} = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: ["MESSAGE", "CHANNEL", "REACTION"]
});

// ===== ANTI LINK CHANNEL STORAGE =====
const ANTI_LINK_FILE = "./antilink.json";

if (!fs.existsSync(ANTI_LINK_FILE)) {
  fs.writeFileSync(ANTI_LINK_FILE, JSON.stringify([]));
}

function loadAntiLink() {
  return JSON.parse(fs.readFileSync(ANTI_LINK_FILE));
}

function saveAntiLink(data) {
  fs.writeFileSync(ANTI_LINK_FILE, JSON.stringify(data, null, 2));
}

// ===== LEVEL SYSTEM =====
const LEVEL_FILE = "./levels.json";

if (!fs.existsSync(LEVEL_FILE)) {
  fs.writeFileSync(LEVEL_FILE, JSON.stringify({}));
}

function loadLevels() {
  return JSON.parse(fs.readFileSync(LEVEL_FILE));
}

function saveLevels(data) {
  fs.writeFileSync(LEVEL_FILE, JSON.stringify(data, null, 2));
}

// ===== DATABASE =====
const DB_FILE = './database.json';
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({
    warns: {},
    autoresponder: {}
  }, null, 2));
}

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

// ================= WELCOME MESSAGE =================
client.on("guildMemberAdd", async (member) => {

  const welcomeChannel = member.guild.channels.cache.find(
    ch => ch.name === "—͟͞͞⌬』│ᴡᴇʟᴄᴏᴍᴇ" // 🔹 change channel name if needed
  );

  if (!welcomeChannel) return;

  const embed = new EmbedBuilder()
    .setColor("#00ff99")
    .setTitle("🎉 Welcome to the Server!")
    .setDescription(
      `Hey ${member}, welcome to **${member.guild.name}**!\n\n` +
      `✨ Please read the rules\n` +
      `🔥 Have fun and enjoy your stay!`
    )
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: `Member #${member.guild.memberCount}` })
    .setTimestamp();

  welcomeChannel.send({ embeds: [embed] });
});

// ================= GOODBYE MESSAGE =================
client.on("guildMemberRemove", async (member) => {

  const goodbyeChannel = member.guild.channels.cache.find(
    ch => ch.name === "—͟͞͞⌬』│ɢᴏᴏᴅʙʏᴇ" // 🔹 change channel name if needed
  );

  if (!goodbyeChannel) return;

  const embed = new EmbedBuilder()
    .setColor("#ff4d4d")
    .setTitle("😢 Member Left")
    .setDescription(
      `👋 **${member.user.tag}** has left the server.\n\n` +
      `We now have ${member.guild.memberCount} members.`
    )
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setTimestamp();

  goodbyeChannel.send({ embeds: [embed] });
});


// ================= MESSAGE EVENT =================
client.on('messageCreate', async (message) => {

  if (message.author.bot || !message.guild) return;

if (message.author.bot || !message.guild) return;

// ===== XP GAIN =====
const levels = loadLevels();
const levelChannelData = loadLevelChannel();

if (!levels[message.guild.id]) levels[message.guild.id] = {};
if (!levels[message.guild.id][message.author.id]) {
  levels[message.guild.id][message.author.id] = {
    xp: 0,
    level: 1
  };
}

const user = levels[message.guild.id][message.author.id];

// Random XP (5–15)
const xpGain = Math.floor(Math.random() * 11) + 5;
user.xp += xpGain;

// Level formula
const xpNeeded = user.level * 100;

if (user.xp >= xpNeeded) {
  user.level++;
  user.xp = 0;

  const levelChannelId = levelChannelData[message.guild.id];
  if (levelChannelId) {
    const channel = message.guild.channels.cache.get(levelChannelId);
    if (channel) {
      channel.send(`🎉 ${message.author} leveled up to **Level ${user.level}**!`);
    }
  }
}

saveLevels(levels);
  
  // ================= AI CHAT =================
  if (message.mentions.has(client.user)) {
    try {
      const userMessage = message.content
        .replace(`<@${client.user.id}>`, "")
        .trim();

      if (!userMessage) return;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a friendly Discord bot." },
          { role: "user", content: userMessage }
        ],
        max_tokens: 200
      });

      await message.reply(response.choices[0].message.content);

    } catch (error) {
      console.error(error);
      await message.reply("⚠️ AI is unavailable.");
    }

    return;
  }
  // ===== SMART ANTI LINK =====
const antiLinkChannels = loadAntiLink();

if (
  antiLinkChannels.includes(message.channel.id) &&
  /(https?:\/\/[^\s]+)/g.test(message.content)
) {
  if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
    await message.delete();
    return message.channel.send(`${message.author}, 🚫 Links are not allowed here.`);
  }
}
  // 🚫 Bad Words Filter
  const bannedWords = ["badword1", "badword2"];
  if (bannedWords.some(word => message.content.toLowerCase().includes(word))) {
    await message.delete();
    return message.channel.send(`${message.author}, bad language is not allowed.`);
  }

  // ===== AUTO RESPONDER =====
// ===== AUTO RESPONDER =====
const db = loadDB();

if (db.autoresponder) {
  const trigger = message.content.toLowerCase();

  if (db.autoresponder[trigger]) {
    const data = db.autoresponder[trigger];

    if (data.text) {
      message.channel.send(data.text);
    }

    if (data.gif) {
      message.channel.send(data.gif);
    }
  }
}
  // ===== COMMANDS =====
  const prefix = "!";
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();


  // ===== ANTI LINK COMMAND =====
// ===== ANTI LINK SETUP =====
if (command === "antilink") {

  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
    return message.reply("❌ Admin only command.");

  const action = args[0];
  const channel = message.mentions.channels.first();

  let data = loadAntiLink();

  if (action === "add") {
    if (!channel) return message.reply("Mention a channel.");
    if (data.includes(channel.id))
      return message.reply("Channel already protected.");

    data.push(channel.id);
    saveAntiLink(data);
    return message.channel.send(`✅ Anti-link enabled in ${channel}`);
  }

  if (action === "remove") {
    if (!channel) return message.reply("Mention a channel.");

    data = data.filter(id => id !== channel.id);
    saveAntiLink(data);
    return message.channel.send(`❌ Anti-link removed from ${channel}`);
  }

  if (action === "list") {
    if (!data.length) return message.reply("No channels configured.");

    const channels = data.map(id => `<#${id}>`).join(", ");
    return message.channel.send(`🚫 Anti-link enabled in: ${channels}`);
  }

  return message.reply("Usage: !antilink add/remove/list #channel");
}
 
if (command === "setlevelchannel") {

if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
    return message.reply("Admin only.");

  const channel = message.mentions.channels.first();
if (!channel) return message.reply("Mention a channel.");

  const data = loadLevelChannel();
  data[message.guild.id] = channel.id;
  saveLevelChannel(data);

  message.channel.send(`✅ Level-up messages set to ${channel}`);
}
  
if (command === "rank") {

  const levels = loadLevels();

  if (!levels[message.guild.id] ||
      !levels[message.guild.id][message.author.id])
    return message.reply("No XP yet.");

  const user = levels[message.guild.id][message.author.id];

  message.channel.send(
    `🏆 ${message.author.username}\nLevel: ${user.level}\nXP: ${user.xp}`
  );
}
  if (command === "leaderboard") {

  const levels = loadLevels();
  if (!levels[message.guild.id])
    return message.reply("No data yet.");

  const sorted = Object.entries(levels[message.guild.id])
    .sort((a, b) => b[1].level - a[1].level)
    .slice(0, 10);

  let leaderboard = sorted
    .map((user, index) =>
      `${index + 1}. <@${user[0]}> - Level ${user[1].level}`
    )
    .join("\n");

  message.channel.send(`🏆 **Leaderboard**\n\n${leaderboard}`);
}

// ✅ SETUP VERIFY PANEL
if (command === "setupverify") {

  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
    return message.reply("❌ You need Administrator permission.");

  const embed = new EmbedBuilder()
    .setColor("#2ecc71") // Green
    .setTitle("✅ Server Verification")
    .setDescription(
      `Welcome to **${message.guild.name}**!\n\n` +
      `To access the server, you need to verify yourself.\n` +
      `Click the button below to get verified.`
    )
    .setThumbnail(message.guild.iconURL({ dynamic: true }))
    .setFooter({ text: `${message.guild.name} • Verification` })
    .setTimestamp();

  const button = new ButtonBuilder()
    .setCustomId("verify_button")
    .setLabel("Verify")
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder().addComponents(button);

  await message.channel.send({
    embeds: [embed],
    components: [row]
  });

  message.delete();
}

  if (command === "setuproles") {

  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
    return message.reply("No permission.");

  const msg = await message.channel.send(
    "🎮 **React to get roles!**\n\n" +
    "🔥 = ʙᴀɴᴋᴀɪ🔥\n" +
    "😈 = sʜᴀʀɪɴɢᴀɴ😈\n" +
    "⚡ = ʜᴀᴋɪ⚡"
  );

  await msg.react("🔥");
  await msg.react("😈");
  await msg.react("⚡");

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

  if (command === "addreply") {
  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
    return message.reply("No permission.");

  const trigger = args.shift()?.toLowerCase();
  if (!trigger) return message.reply("Usage: !addreply hello Your text [gif link optional]");

  let gif = null;

  // detect gif link
  const gifIndex = args.findIndex(arg => arg.startsWith("http"));

  if (gifIndex !== -1) {
    gif = args[gifIndex];
    args.splice(gifIndex, 1);
  }

  const text = args.join(" ");

  const db = loadDB();

  db.autoresponder[trigger] = {
    text: text || null,
    gif: gif || null
  };

  saveDB(db);

  message.reply(`✅ Auto response added for: ${trigger}`);
}

  if (command === "removereply") {
  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
    return message.reply("No permission.");

  const trigger = args[0]?.toLowerCase();
  if (!trigger) return message.reply("Usage: !removereply hello");

  const db = loadDB();

  if (!db.autoresponder[trigger])
    return message.reply("Trigger not found.");

  delete db.autoresponder[trigger];
  saveDB(db);

  message.reply(`❌ Auto response removed for: ${trigger}`);
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

  // 📊 SERVER INFO
if (command === "serverinfo") {

  const { guild } = message;

  const embed = new EmbedBuilder()
    .setColor("#3498db")
    .setTitle(`📊 ${guild.name} Server Info`)
    .setThumbnail(guild.iconURL({ dynamic: true }))
    .addFields(
      { name: "👑 Owner", value: `<@${guild.ownerId}>`, inline: true },
      { name: "👥 Members", value: `${guild.memberCount}`, inline: true },
      { name: "📅 Created On", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false },
      { name: "📂 Channels", value: `${guild.channels.cache.size}`, inline: true },
      { name: "🎭 Roles", value: `${guild.roles.cache.size}`, inline: true }
    )
    .setFooter({ text: `Server ID: ${guild.id}` })
    .setTimestamp();

  message.channel.send({ embeds: [embed] });
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

  if (interaction.customId === "verify_button") {

    const verifiedRole = interaction.guild.roles.cache.find(r => r.name === "𝔸𝕊𝕊𝔸𝕊𝕀ℕ𝕊");
    const unverifiedRole = interaction.guild.roles.cache.find(r => r.name === "Unverified");
    const logChannel = interaction.guild.channels.cache.find(
      ch => ch.name === "乄│ᴠᴇʀɪғɪᴇᴅ"
    );

    if (!verifiedRole)
      return interaction.reply({ content: "❌ Verified role not found.", ephemeral: true });

    await interaction.member.roles.add(verifiedRole);

    if (unverifiedRole) {
      await interaction.member.roles.remove(unverifiedRole);
    }

    // Reply to user privately
    await interaction.reply({
      content: "🎉 You are now verified!",
      ephemeral: true
    });

    // Send log message in another channel
    if (logChannel) {
      logChannel.send(
        `✅ ${interaction.user.tag} has been verified successfully.`
      );
    }
  }
});

client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;

  const member = await reaction.message.guild.members.fetch(user.id);

  const gamerRole = reaction.message.guild.roles.cache.find(r => r.name === "ʙᴀɴᴋᴀɪ🔥");
  const musicRole = reaction.message.guild.roles.cache.find(r => r.name === "sʜᴀʀɪɴɢᴀɴ😈");
  const devRole = reaction.message.guild.roles.cache.find(r => r.name === "ʜᴀᴋɪ⚡");

  if (reaction.emoji.name === "🔥" && gamerRole) {
    await member.roles.add(gamerRole);
  }

  if (reaction.emoji.name === "😈" && musicRole) {
    await member.roles.add(musicRole);
  }

  if (reaction.emoji.name === "⚡" && devRole) {
    await member.roles.add(devRole);
  }
});

client.on("messageReactionRemove", async (reaction, user) => {
  if (user.bot) return;

  const member = await reaction.message.guild.members.fetch(user.id);

  const gamerRole = reaction.message.guild.roles.cache.find(r => r.name === "ʙᴀɴᴋᴀɪ🔥");
  const musicRole = reaction.message.guild.roles.cache.find(r => r.name === "sʜᴀʀɪɴɢᴀɴ😈");
  const devRole = reaction.message.guild.roles.cache.find(r => r.name === "ʜᴀᴋɪ⚡");

  if (reaction.emoji.name === "🔥" && gamerRole) {
    await member.roles.remove(gamerRole);
  }

  if (reaction.emoji.name === "😈" && musicRole) {
    await member.roles.remove(musicRole);
  }

  if (reaction.emoji.name === "⚡" && devRole) {
    await member.roles.remove(devRole);
  }
});

client.login(process.env.TOKEN);




















































