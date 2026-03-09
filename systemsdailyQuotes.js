const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../data/dailyQuotes.json");

if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify({}));
}

function load() {
    return JSON.parse(fs.readFileSync(dataPath));
}

function save(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

const quotes = [
"Push yourself, because no one else will do it for you.",
"Dream big. Start small. Act now.",
"Your only limit is your mind.",
"Success doesn’t come from what you do occasionally.",
"Great things never come from comfort zones.",
"Discipline beats motivation.",
"Stay hungry. Stay foolish.",
"Every day is a second chance.",
"Small progress is still progress.",
"Focus on the goal, not the obstacle."
];

const usedQuotes = {};

function getQuote(guildId){
    if(!usedQuotes[guildId]) usedQuotes[guildId] = [];

    let available = quotes.filter(q => !usedQuotes[guildId].includes(q));

    if(available.length === 0){
        usedQuotes[guildId] = [];
        available = quotes;
    }

    const quote = available[Math.floor(Math.random() * available.length)];
    usedQuotes[guildId].push(quote);

    return quote;
}

function start(client){

cron.schedule("0 9 * * *", () => {

    const data = load();

    for(const guildId in data){

        const guild = client.guilds.cache.get(guildId);
        if(!guild) continue;

        const channel = guild.channels.cache.get(data[guildId].channel);
        if(!channel) continue;

        const quote = getQuote(guildId);

        channel.send({
            content: "@everyone",
            embeds: [{
                color: 0x2F3136,
                title: "🌞 Morning Motivation",
                description: `💬 **${quote}**`,
                footer: { text: "Daily Quotes System" },
                timestamp: new Date()
            }]
        });

    }

},{
    timezone:"Asia/Kolkata"
});

cron.schedule("0 21 * * *", () => {

    const data = load();

    for(const guildId in data){

        const guild = client.guilds.cache.get(guildId);
        if(!guild) continue;

        const channel = guild.channels.cache.get(data[guildId].channel);
        if(!channel) continue;

        const quote = getQuote(guildId);

        channel.send({
            embeds:[{
                color:0x2F3136,
                title:"🌙 Night Motivation",
                description:`💬 **${quote}**`,
                footer:{text:"Rest well and come back stronger."},
                timestamp:new Date()
            }]
        });

    }

},{
timezone:"Asia/Kolkata"
});

}

function setChannel(guildId,channelId){

const data = load();

data[guildId] = {
channel:channelId
};

save(data);

}

module.exports = { start, setChannel };