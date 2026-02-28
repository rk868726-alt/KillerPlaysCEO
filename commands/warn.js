const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to warn')
        .setRequired(true)),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return interaction.reply({ content: "No permission.", ephemeral: true });

    const user = interaction.options.getUser('user');
    const data = JSON.parse(fs.readFileSync('./database.json'));

    if (!data[user.id]) data[user.id] = 0;
    data[user.id]++;

    fs.writeFileSync('./database.json', JSON.stringify(data, null, 2));

    interaction.reply(`${user.tag} has been warned. Total warns: ${data[user.id]}`);
  }
};