const { EmbedBuilder } = require("discord.js");

const LOG_CHANNEL = "1450767341834076253";

async function sendLog(client, embed) {

    const channel = client.channels.cache.get(LOG_CHANNEL);
    if (!channel) return;

    channel.send({ embeds: [embed] });

}

module.exports = { sendLog };