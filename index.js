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

// 🎵 MUSIC PLAYER (PUT IT HERE)
let player = createAudioPlayer();

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

  const play = require("play-dl");
const { getData } = require("spotify-url-info");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require("@discordjs/voice");

client.on("messageCreate", async (message) => {

  if (!message.content.startsWith("!play")) return;
  if (!message.member.voice.channel)
    return message.reply("❌ Join a voice channel first!");

  const query = message.content.split(" ").slice(1).join(" ");
  if (!query) return message.reply("❌ Provide a Spotify playlist link.");

  try {

    const connection = joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    connection.subscribe(player);

    // 🎵 If Spotify Playlist
    if (query.includes("spotify.com/playlist")) {

      const data = await getData(query);

      if (!data.tracks || !data.tracks.items.length)
        return message.reply("❌ Could not fetch playlist.");

      const tracks = data.tracks.items.map(item =>
        `${item.track.name} ${item.track.artists[0].name}`
      );

      let index = 0;

      const playNext = async () => {
        if (index >= tracks.length) {
          message.channel.send("✅ Playlist finished.");
          return;
        }

        const search = await play.search(tracks[index], { limit: 1 });
        if (!search.length) {
          index++;
          return playNext();
        }

        const stream = await play.stream(search[0].url);
        const resource = createAudioResource(stream.stream, {
          inputType: stream.type,
        });

        player.play(resource);
        message.channel.send(`🎶 Now Playing: **${search[0].title}**`);

        index++;
      };

      player.on(AudioPlayerStatus.Idle, playNext);

      playNext();

    } else {
      return message.reply("❌ Only Spotify playlist links supported.");
    }

  } catch (err) {
    console.error("SPOTIFY ERROR:", err);
    message.reply("❌ Error playing playlist.");
  }
});

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

  let query = args.join(" ");
if (!query) return message.reply("Provide a song name or link.");

try {

  // 🎵 If Spotify link
  if (query.includes("spotify.com")) {

    const data = await getData(query);

    if (data.type === "track") {
      query = `${data.name} ${data.artists[0].name}`;
    } else {
      return message.reply("Only Spotify track links supported.");
    }
  }

  const search = await play.search(query, { limit: 1 });
  if (!search.length) return message.reply("No results found.");

  const stream = await play.stream(search[0].url, {
    discordPlayerCompatibility: true
  });

  const resource = createAudioResource(stream.stream, {
    inputType: stream.type,
    inlineVolume: true
  });
    player.play(resource);
    connection.subscribe(player);

    message.channel.send(`🎶 Now Playing: **${yt[0].title}**`);

  } catch (err) {
    console.log(err);
    message.reply("❌ Error playing song.");
  }

  if (command === "pause") {
  player.pause();
  message.channel.send("⏸ Paused.");
}

  if (command === "resume") {
  player.unpause();
  message.channel.send("▶ Resumed.");
}

  if (command === "skip") {
  player.stop();
  message.channel.send("⏭ Skipped.");
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








































