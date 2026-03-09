const { EmbedBuilder } = require("discord.js");

const LOG_CHANNEL = "1480457706094465085";

async function sendLog(client, embed) {

    const channel = client.channels.cache.get(LOG_CHANNEL);
    if (!channel) return;

    channel.send({ embeds: [embed] });

}


module.exports = { sendLog };


