
require('dotenv').config();
const { getData } = require("spotify-url-info");
const ffmpeg = require('ffmpeg-static');
const { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource, 
  AudioPlayerStatus,
  getVoiceConnection 
} = require('@discordjs/voice');
const { Manager } = require("erela.js");
const play = require("play-dl");



// ===== DAILY QUOTES =====
const quotes = [
"Believe in yourself and you will be unstoppable.",
"Every day is a new beginning.",
"Push yourself because no one else will do it for you.",
"Difficult roads often lead to beautiful destinations.",
"Dream it. Wish it. Do it.",
"Stay positive, work hard, make it happen.",
"Success is built on consistency.",
"Do something today that your future self will thank you for.",
"Your only limit is your mind.",
"Small progress is still progress.",
"Don’t stop until you’re proud.",
"Be stronger than your excuses.",
"Work hard in silence, let success make the noise.",
"Make yourself a priority.",
"You are capable of amazing things.",
"The best time to start was yesterday. The next best time is now.",
"Turn your dreams into plans.",
"Focus on the goal, not the obstacles.",
"Great things never come from comfort zones.",
"Believe you can and you’re halfway there.",
"Stay patient and trust your journey.",
"Don’t wait for opportunity. Create it.",
"Your attitude determines your direction.",
"Failure is not the opposite of success; it’s part of success.",
"Be fearless in the pursuit of what sets your soul on fire.",
"The harder you work, the luckier you get.",
"Start where you are. Use what you have. Do what you can.",
"Progress, not perfection.",
"Your potential is endless.",
"Make today count.",
"Doubt kills more dreams than failure ever will.",
"Success doesn’t come from what you do occasionally, but what you do consistently.",
"Don’t limit your challenges; challenge your limits.",
"You didn’t come this far to only come this far.",
"Rise above the storm and you will find the sunshine.",
"The comeback is always stronger than the setback.",
"Discipline is choosing between what you want now and what you want most.",
"Stay hungry. Stay focused.",
"Keep moving forward.",
"Your growth begins at the end of your comfort zone.",
"Believe in the power of yet.",
"Success is a journey, not a destination.",
"Be the energy you want to attract.",
"Fall seven times, stand up eight.",
"Hard work beats talent when talent doesn’t work hard.",
"Don’t be afraid to start over.",
"Act as if it were impossible to fail.",
"Strength grows in moments when you think you can’t go on but you keep going anyway.",
"Hustle until your haters ask if you’re hiring.",
"Turn pain into power.",
"A little progress each day adds up to big results.",
"Focus on becoming better, not on proving others wrong.",
"Do what is right, not what is easy.",
"Your future is created by what you do today.",
"Dream big and dare to fail.",
"Confidence comes from preparation.",
"Make your passion your paycheck.",
"Stay consistent and never give up.",
"Winners focus on winning. Losers focus on winners.",
"Everything you need is already inside you.",
"Keep your eyes on the stars and your feet on the ground.",
"Greatness begins with a decision to try.",
"Let your courage be stronger than your fear.",
"Don’t wish for it. Work for it.",
"If you can imagine it, you can achieve it.",
"Dare to be different.",
"Your life does not get better by chance, it gets better by change.",
"Success is earned, not given.",
"You are one decision away from a different life.",
"Energy flows where attention goes.",
"Nothing changes if nothing changes.",
"Choose progress over excuses.",
"Trust the process.",
"You are stronger than your struggles.",
"Chase your dreams relentlessly.",
"Let your actions speak louder than your words.",
"Create the life you can’t wait to wake up to.",
"Every accomplishment starts with the decision to try.",
"Be brave enough to begin.",
"Your mindset shapes your reality.",
"Don’t quit. Suffer now and live the rest of your life as a champion.",
"Success starts with self-belief.",
"Fear is temporary. Regret lasts forever.",
"Your dreams don’t work unless you do.",
"Be proud of how far you’ve come.",
"The only way to fail is to give up.",
"Keep pushing. Keep growing.",
"You are your only competition.",
"Happiness is found in the journey.",
"Make it happen.",
"Success is built one day at a time.",
"Stay focused and never settle.",
"The best view comes after the hardest climb.",
"Push past your limits.",
"Your hard work will pay off.",
"Be unstoppable.",
"Take the risk or lose the chance.",
"Victory begins in the mind.",
"Keep believing, keep achieving.",
"Shine even when no one is watching.",
];



const { 
  Client, 
  GatewayIntentBits, 
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Events,
  channelType
} = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates

  ],
  partials: ["MESSAGE", "CHANNEL", "REACTION"]
});

const manager = new Manager({
  nodes: [
    {
      host: "lavalink.lexnet.cc",
      port: 80,
      password: "lexnet",
      secure: false
    }
  ],
  send(id, payload) {
    const guild = client.guilds.cache.get(id);
    if (guild) guild.shard.send(payload);
  }
});

manager.on("nodeConnect", node => console.log(`Lavalink Node "${node.options.identifier}" connected.`));
manager.on("nodeError", (node, error) => console.log(`Node "${node.options.identifier}" error: ${error.message}`));
manager.on("trackStart", (player, track) => {
    const channel = client.channels.cache.get(player.textChannel);
    if (channel) channel.send(`🎶 Now playing: **${track.title}**`);
});

manager.on("queueEnd", player => {
    const channel = client.channels.cache.get(player.textChannel);
    if (channel) channel.send("Queue finished. Leaving voice channel.");
    player.destroy();
});

const axios = require("axios");
const YT_FILE = "./youtube.json";

if (!fs.existsSync(YT_FILE)) {
  fs.writeFileSync(YT_FILE, JSON.stringify({}));
}

function loadYT() {
  return JSON.parse(fs.readFileSync(YT_FILE));
}

function saveYT(data) {
  fs.writeFileSync(YT_FILE, JSON.stringify(data, null, 2));
}

// ===== ECONOMY SYSTEM =====
const ECONOMY_FILE = "./economy.json";

if (!fs.existsSync(ECONOMY_FILE)) {
  fs.writeFileSync(ECONOMY_FILE, JSON.stringify({}));
}

function loadEconomy() {
  return JSON.parse(fs.readFileSync(ECONOMY_FILE));
}

function saveEconomy(data) {
  fs.writeFileSync(ECONOMY_FILE, JSON.stringify(data, null, 2));
}

function getUserData(guildId, userId) {
  const data = loadEconomy();

  if (!data[guildId]) data[guildId] = {};
  if (!data[guildId][userId]) {
    data[guildId][userId] = { points: 0 };
  }

  saveEconomy(data);
  return data;
}

// ===== MIRROR SYSTEM =====
const MIRROR_FILE = "./mirror.json";

if (!fs.existsSync(MIRROR_FILE)) {
  fs.writeFileSync(MIRROR_FILE, JSON.stringify({}));
}

function loadMirror() {
  return JSON.parse(fs.readFileSync(MIRROR_FILE));
}

function saveMirror(data) {
  fs.writeFileSync(MIRROR_FILE, JSON.stringify(data, null, 2));
}

const LEVEL_CHANNEL_FILE = "./levelChannel.json";

if (!fs.existsSync(LEVEL_CHANNEL_FILE)) {
  fs.writeFileSync(LEVEL_CHANNEL_FILE, JSON.stringify({}));
}

function loadLevelChannel() {
  return JSON.parse(fs.readFileSync(LEVEL_CHANNEL_FILE));
}

function saveLevelChannel(data) {
  fs.writeFileSync(LEVEL_CHANNEL_FILE, JSON.stringify(data, null, 2));
}

// ===== SNIPE SYSTEM =====
const snipes = new Map();

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
// ===== DAILY CHANNEL STORAGE =====
const DAILY_FILE = "./dailyChannel.json";

if (!fs.existsSync(DAILY_FILE)) {
  fs.writeFileSync(DAILY_FILE, JSON.stringify({}));
}

function loadDaily() {
  return JSON.parse(fs.readFileSync(DAILY_FILE));
}

function saveDaily(data) {
  fs.writeFileSync(DAILY_FILE, JSON.stringify(data, null, 2));
}

// ===== READY =====
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  manager.init(client.user.id);
});
client.on("raw", (d) => manager.updateVoiceState(d));


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


//TICKET SUPPORT

client.on("interactionCreate", async (interaction) => {

  if (!interaction.isButton()) return;

  if (interaction.customId === "create_ticket") {

    await interaction.deferReply({ ephemeral: true });

    const existing = interaction.guild.channels.cache.find(
      c => c.name === `ticket-${interaction.user.id}`
    );

    if (existing)
      return interaction.editReply("❌ You already have an open ticket.");

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: 0,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone.id,
          deny: ["ViewChannel"]
        },
        {
          id: interaction.user.id,
          allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"]
        }
      ]
    });

    const supportRole = interaction.guild.roles.cache.find(r => r.name === "YONKO☠️");

    if (supportRole) {
      await channel.permissionOverwrites.edit(supportRole, {
        ViewChannel: true,
        SendMessages: true
      });

      channel.send(`${supportRole} 🔔 New ticket created!`);
    }

    channel.send(`Hello ${interaction.user}, please describe your issue.`);
    //channel.send(``);

    interaction.editReply(`✅ Ticket created: ${channel}`);
  }
});
// ================= MESSAGE EVENT =================
client.on('messageCreate', async(message) => {

  if (message.author.bot || !message.guild) return;

  const prefix = "$";

if (!message.content.startsWith(prefix)) return;

const args = message.content.slice(prefix.length).trim().split(/ +/);
const command = args.shift().toLowerCase();


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

  //play

 if (command === "play") {
        if (!args[0]) return message.reply("Please provide a song name or URL.");
        let voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply("Join a voice channel first.");

        let search = args.join(" ");
        let newPlayer = player || manager.create({
            guild: message.guild.id,
            voiceChannel: voiceChannel.id,
            textChannel: message.channel.id,
            selfDeafen: true,
        });

        let res = await manager.search(search, message.author);
        if (res.tracks.length === 0) return message.reply("No results found.");

        newPlayer.queue.add(res.tracks[0]);
        if (!newPlayer.playing && !newPlayer.paused) newPlayer.play();
        message.reply(`🎵 Added **${res.tracks[0].title}** to the queue.`);
    }

    if (command === "stop") {
        if (!player) return message.reply("Nothing is playing.");
        player.destroy();
        message.reply("Stopped playback and left the voice channel.");
    }


 

  // ===== MIRROR MESSAGE =====
const mirrorData = loadMirror();

if (
  mirrorData[message.guild.id] &&
  mirrorData[message.guild.id].length
) {
  const pairs = mirrorData[message.guild.id];

  for (let pair of pairs) {
    if (message.channel.id === pair.source) {

      const targetChannel = message.guild.channels.cache.get(pair.target);
      if (!targetChannel) return;

      const { EmbedBuilder } = require("discord.js");

      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setAuthor({
          name: message.author.tag,
          iconURL: message.author.displayAvatarURL()
        })
        .setDescription(message.content || "*No text content*")
        .setFooter({ text: `From ADMIN` })
        .setTimestamp();

      targetChannel.send({ embeds: [embed] });
    }
  }
}
  
 
 
  // ===== COMMANDS =====
 
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

  // ===== SET TICKET PANEL =====
if (command === "setticket") {

  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
    return message.reply("Admin only.");

  const button = new ButtonBuilder()
    .setCustomId("create_ticket")
    .setLabel("🎫 Create Ticket")
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(button);

  message.channel.send({
    embeds: [{
      color: 0x00AEFF,
      title: "Support System",
      description: "Click the button below to create a support ticket."
    }],
    components: [row]
  });
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
//set daily
  if (command === "setdaily") {

  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
    return message.reply("Admin only.");

  const channel = message.mentions.channels.first();
  if (!channel) return message.reply("Mention a channel.");

  const data = loadDaily();
  data[message.guild.id] = channel.id;
  saveDaily(data);

  message.channel.send(`✅ Daily quotes will be sent in ${channel}`);
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


  if (command === "setyt") {

  if (message.author.id !== "YOUR_USER_ID")
    return message.reply("❌ Only bot owner can set YouTube channel.");

  const ytChannelId = args[0];
  if (!ytChannelId)
    return message.reply("Provide YouTube channel ID.");

  const data = loadYT();

  data.channelId = ytChannelId;
  data.discordChannel = message.channel.id;
  data.lastVideo = null;

  saveYT(data);

  message.reply("✅ YouTube channel set successfully.");
}
  

  //leave vc
if (command === "leave") {

  const player = manager.players.get(message.guild.id);
  if (!player) return message.reply("Not in a voice channel.");

  player.destroy();
  message.channel.send("👋 Left voice channel.");
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

  if (command === "close") {

  if (!message.channel.name.startsWith("ticket-"))
    return message.reply("This is not a ticket channel.");

  await message.channel.send("🔒 Closing ticket...");
  setTimeout(() => {
    message.channel.delete();
  }, 3000);
}

  if (command === "guess") {

  const number = Math.floor(Math.random() * 5) + 1;
  const guess = parseInt(args[0]);

  if (!guess || guess < 1 || guess > 5)
    return message.reply("Guess a number between 1-5.");

  const data = getUserData(message.guild.id, message.author.id);

  if (guess === number) {
    data[message.guild.id][message.author.id].points += 10;
    saveEconomy(data);
    return message.reply("🎉 Correct! You earned 10 points.");
  } else {
    return message.reply(`❌ Wrong! The number was ${number}.`);
  }
}

  if (command === "balance") {

  const data = getUserData(message.guild.id, message.author.id);
  const points = data[message.guild.id][message.author.id].points;

  message.reply(`💰 You have ${points} points.`);
}

  if (command === "shop") {

  message.channel.send(`
🛒 **Role Shop**

🥉 ᴍᴀᴅᴀʀᴀ - 50 points
🥈 ᴀɪᴢᴇɴ - 100 points
🥇 ᴊᴏʏʙᴏʏ - 200 points

Use !redeem <role name>
`);
}

  if (command === "redeem") {

  const roleName = args.join(" ");
  if (!roleName) return message.reply("Provide role name.");

  const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
  if (!role) return message.reply("Role not found.");

  const prices = {
    "ᴍᴀᴅᴀʀᴀ": 50,
    "ᴀɪᴢᴇɴ": 100,
    "ᴊᴏʏʙᴏʏ": 200
  };

  const price = prices[roleName.toLowerCase()];
  if (!price) return message.reply("Role not purchasable.");

  const data = getUserData(message.guild.id, message.author.id);
  const user = data[message.guild.id][message.author.id];

  if (user.points < price)
    return message.reply("❌ Not enough points.");

  user.points -= price;
  saveEconomy(data);

  await message.member.roles.add(role);

  message.reply(`✅ You redeemed ${role.name} role!`);
}

  // 📢 MENTION
if (command === "mention") {
  const member = message.mentions.members.first();
  if (!member) return message.reply("Mention a user.");

  return message.channel.send(`${member}`);
}

// ===== LOCK CHANNEL =====
if (command === "lock") {

  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
    return message.reply("❌ Admin only.");

  await message.channel.permissionOverwrites.edit(
    message.guild.roles.everyone,
    { SendMessages: false }
  );

  message.channel.send("🔒 Channel locked. Only admins can send messages.");
}

  // ===== UNLOCK CHANNEL =====
if (command === "unlock") {

  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
    return message.reply("❌ Admin only.");

  await message.channel.permissionOverwrites.edit(
    message.guild.roles.everyone,
    { SendMessages: null }
  );

  message.channel.send("🔓 Channel unlocked.");
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


  if (command === "setmirror") {

  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
    return message.reply("Admin only.");

  const source = message.mentions.channels.first();
  const target = message.mentions.channels.last();

  if (!source || !target)
    return message.reply("Usage: !setmirror #source #target");

  const data = loadMirror();

  if (!data[message.guild.id]) data[message.guild.id] = [];

  data[message.guild.id].push({
    source: source.id,
    target: target.id
  });

  saveMirror(data);

  message.channel.send(`✅ Mirroring ${source} → ${target}`);
}

  if (command === "removemirror") {

  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
    return message.reply("Admin only.");

  const source = message.mentions.channels.first();
  const target = message.mentions.channels.last();

  if (!source || !target)
    return message.reply("Usage: !removemirror #source #target");

  const data = loadMirror();

  if (!data[message.guild.id])
    return message.reply("No mirror data found.");

  data[message.guild.id] = data[message.guild.id].filter(pair =>
    !(pair.source === source.id && pair.target === target.id)
  );

  saveMirror(data);

  message.channel.send(`❌ Mirror removed: ${source} → ${target}`);
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

  if (command === "snipe") {

  const snipe = snipes.get(message.channel.id);

  if (!snipe)
    return message.reply("❌ Nothing to snipe!");

  const { EmbedBuilder } = require("discord.js");

  const embed = new EmbedBuilder()
    .setColor("Red")
    .setAuthor({
      name: snipe.author.tag,
      iconURL: snipe.author.displayAvatarURL()
    })
    .setDescription(snipe.content || "*No text content*")
    .setFooter({
      text: `Deleted at ${new Date(snipe.createdAt).toLocaleString()}`
    });

  message.channel.send({ embeds: [embed] });
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

const cron = require("node-cron");

client.once("ready", () => {

  console.log(`✅ Logged in as ${client.user.tag}`);

  // Runs every day at 9:00 AM
  cron.schedule("0 9 * * *", () => {

    const data = loadDaily();

    for (let guildId in data) {

      const guild = client.guilds.cache.get(guildId);
      if (!guild) continue;

      const channel = guild.channels.cache.get(data[guildId]);
      if (!channel) continue;

      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

      channel.send({
        content: "@everyone",
        embeds: [{
          color: 0x00AEFF,
          description: randomQuote,
          footer: { text: "Daily Motivation 🚀" },
          timestamp: new Date()
        }]
      });
    }

  }, {
    timezone: "Asia/Kolkata" // Change if needed
  });

});

client.on("messageDelete", (message) => {
  if (!message.guild || message.author?.bot) return;

  snipes.set(message.channel.id, {
    content: message.content,
    author: message.author,
    createdAt: message.createdAt
  });
});

client.login(process.env.TOKEN);
cron.schedule("*/5 * * * *", async () => {

  const data = loadYT();
  if (!data.channelId) return;

  try {
    const res = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          key: process.env.YOUTUBE_API_KEY,
          channelId: data.channelId,
          part: "snippet",
          order: "date",
          maxResults: 1
        }
      }
    );

    const video = res.data.items[0];
    if (!video) return;

    const videoId = video.id.videoId;
    if (!videoId) return;

    if (data.lastVideo === videoId) return;

    data.lastVideo = videoId;
    saveYT(data);

    const channel = await client.channels.fetch(data.discordChannel);

    const url = `https://www.youtube.com/watch?v=${videoId}`;

    if (video.snippet.liveBroadcastContent === "live") {
      channel.send(`🔴 LIVE NOW!\n${video.snippet.title}\n${url}`);
    } else {
      channel.send(`📢 New Video Uploaded!\n${video.snippet.title}\n${url}`);
    }

  } catch (err) {
    console.log("YT ERROR:", err.message);
  }

});































































































































