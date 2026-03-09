const { SlashCommandBuilder } = require("discord.js");
const dailyQuotes = require("../systems/dailyQuotes");

module.exports = {
data: new SlashCommandBuilder()
.setName("setdailyquotes")
.setDescription("Set channel for daily quotes")
.addChannelOption(option =>
option.setName("channel")
.setDescription("Channel for daily quotes")
.setRequired(true)
),

async execute(interaction){

const channel = interaction.options.getChannel("channel");

dailyQuotes.setChannel(
interaction.guild.id,
channel.id
);

await interaction.reply({
content:`✅ Daily quotes will be sent in ${channel}`,
ephemeral:true
});

}
};