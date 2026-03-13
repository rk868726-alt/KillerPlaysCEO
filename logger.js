const { EmbedBuilder } = require("discord.js");

const LOG_CHANNEL = "1480457706094465085";
const LOG_CHANNEL2 = "1482018504394801234";


async function sendLog(client, embed) {

    const channel = client.channels.cache.get(LOG_CHANNEL);
    client.channels.cache.get(LOG_CHANNEL2);

    if (!channel) return;

    channel.send({ embeds: [embed] });

}


module.exports = { sendLog };





