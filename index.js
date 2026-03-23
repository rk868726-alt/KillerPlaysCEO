require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  EmbedBuilder,
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
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions
  ]
});

// ===== DATABASE =====
const DB_FILE = './database.json';
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ warns: {}, autoresponder: {} }, null, 2));
}

const loadDB = () => JSON.parse(fs.readFileSync(DB_FILE));
const saveDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// ===== READY =====
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ===== WELCOME =====
client.on('guildMemberAdd', member => {
  const channel = member.guild.channels.cache.find(c => c.name === 'welcome');
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor('Green')
    .setTitle('Welcome!')
    .setDescription(`Welcome ${member} to **${member.guild.name}**`)
    .setTimestamp();

  channel.send({ embeds: [embed] });
});

// ===== MESSAGE COMMANDS =====
client.on('messageCreate', async message => {
  if (!message.guild || message.author.bot) return;

  const prefix = '$';
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // ===== CLEAR =====
  if (command === 'clear') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
      return message.reply('❌ No permission');

    const amount = parseInt(args[0]);
    if (!amount || amount < 1 || amount > 100)
      return message.reply('Enter 1-100');

    await message.channel.bulkDelete(amount, true);
    message.channel.send(`🧹 Deleted ${amount}`).then(m => setTimeout(() => m.delete(), 3000));
  }

  // ===== SAY =====
  if (command === 'say') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
      return;

    const text = args.join(' ');
    if (!text) return;

    await message.delete();
    message.channel.send(text);
  }

  // ===== BAN =====
  if (command === 'ban') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply('No permission');

    const member = message.mentions.members.first();
    if (!member) return message.reply('Mention user');

    await member.ban();
    message.channel.send(`🔨 ${member.user.tag} banned`);
  }

  // ===== TIMEOUT =====
  if (command === 'timeout') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return;

    const member = message.mentions.members.first();
    const minutes = parseInt(args[0]);

    if (!member || isNaN(minutes)) return message.reply('Usage: $timeout @user 5');

    await member.timeout(minutes * 60000);
    message.channel.send(`⏳ Timed out for ${minutes} min`);
  }

  // ===== AUTO RESPONDER =====
  if (command === 'addreply') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    const trigger = args.shift()?.toLowerCase();
    const text = args.join(' ');

    const db = loadDB();
    db.autoresponder[trigger] = text;
    saveDB(db);

    message.reply('✅ Added');
  }

});

// ===== AUTO RESPONSE LISTENER =====
client.on('messageCreate', message => {
  if (message.author.bot || !message.guild) return;

  const db = loadDB();
  const reply = db.autoresponder[message.content.toLowerCase()];

  if (reply) {
    message.channel.send(reply);
  }
});

// ===== VERIFY BUTTON =====
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'verify') {
    const role = interaction.guild.roles.cache.find(r => r.name === 'Verified');
    if (!role) return interaction.reply({ content: 'Role missing', ephemeral: true });

    await interaction.member.roles.add(role);
    interaction.reply({ content: '✅ Verified!', ephemeral: true });
  }
});

// ===== MIRROR SYSTEM =====
const MIRROR_FILE = './mirror.json';
if (!fs.existsSync(MIRROR_FILE)) {
  fs.writeFileSync(MIRROR_FILE, JSON.stringify({}, null, 2));
}

const loadMirror = () => JSON.parse(fs.readFileSync(MIRROR_FILE));
const saveMirror = (data) => fs.writeFileSync(MIRROR_FILE, JSON.stringify(data, null, 2));

// Mirror listener
client.on('messageCreate', async (message) => {
  if (!message.guild || message.author.bot) return;

  const data = loadMirror();
  const pairs = data[message.guild.id] || [];

  for (const pair of pairs) {
    if (message.channel.id === pair.source) {
      const target = message.guild.channels.cache.get(pair.target);
      if (!target) continue;

      const embed = new EmbedBuilder()
        .setColor('Blue')
        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
        .setDescription(message.content || '*No content*')
        .setFooter({ text: 'Mirrored Message' })
        .setTimestamp();

      target.send({ embeds: [embed] });
    }
  }
});

// ===== TICKET SYSTEM =====
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'create_ticket') {
    await interaction.deferReply({ ephemeral: true });

    const existing = interaction.guild.channels.cache.find(c => c.name === `ticket-${interaction.user.id}`);
    if (existing) return interaction.editReply('❌ You already have a ticket.');

    const adminRole = interaction.guild.roles.cache.find(r => r.name === 'Admin');

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: 0,
      permissionOverwrites: [
        { id: interaction.guild.roles.everyone.id, deny: ['ViewChannel'] },
        { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages'] },
        ...(adminRole ? [{ id: adminRole.id, allow: ['ViewChannel', 'SendMessages'] }] : [])
      ]
    });

    const closeBtn = new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('Close Ticket')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(closeBtn);

    channel.send({
      content: `${interaction.user} ${adminRole ? adminRole : ''}\nDescribe your issue.`,
      components: [row]
    });

    interaction.editReply(`✅ Ticket created: ${channel}`);
  }

  if (interaction.customId === 'close_ticket') {
    if (!interaction.channel.name.startsWith('ticket-'))
      return interaction.reply({ content: 'Not a ticket.', ephemeral: true });

    await interaction.reply('🔒 Closing ticket...');
    setTimeout(() => interaction.channel.delete(), 3000);
  }
});

// ===== COMMAND EXTENSIONS =====
client.on('messageCreate', async message => {
  if (!message.guild || message.author.bot) return;

  const prefix = '$';
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // Mirror setup
  if (command === 'setmirror') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    const source = message.mentions.channels.first();
    const target = message.mentions.channels.last();

    if (!source || !target) return message.reply('Usage: $setmirror #source #target');

    const data = loadMirror();
    if (!data[message.guild.id]) data[message.guild.id] = [];

    data[message.guild.id].push({ source: source.id, target: target.id });
    saveMirror(data);

    message.reply(`✅ Mirroring ${source} → ${target}`);
  }

  if (command === 'removemirror') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    const source = message.mentions.channels.first();
    const target = message.mentions.channels.last();

    if (!source || !target) return message.reply('Usage: $removemirror #source #target');

    const data = loadMirror();
    if (!data[message.guild.id]) return message.reply('No mirror found');

    data[message.guild.id] = data[message.guild.id].filter(p => !(p.source === source.id && p.target === target.id));
    saveMirror(data);

    message.reply('❌ Mirror removed');
  }

  // Ticket panel setup
  if (command === 'setticket') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    const button = new ButtonBuilder()
      .setCustomId('create_ticket')
      .setLabel('🎫 Create Ticket')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    message.channel.send({
      embeds: [{ title: 'Support', description: 'Click to create a ticket', color: 0x00AEFF }],
      components: [row]
    });
  }
});

client.login(process.env.TOKEN);
