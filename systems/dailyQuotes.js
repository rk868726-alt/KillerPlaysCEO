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
"Believe in yourself and keep moving forward",
"Every small step today builds a better tomorrow",
"Dream big and work hard for it",
"Success begins with self belief",
"Your limits exist only in your mind",
"Turn your pain into power",
"Great things take time and patience",
"Stay strong even when it gets tough",
"Every day is a fresh start",
"Hard work beats talent when talent doesn’t work hard",
"Push yourself beyond your comfort zone",
"Failure is the first step toward success",
"Stay focused on your goals",
"Your future depends on what you do today",
"Never stop learning and improving",
"Confidence creates opportunities",
"Small progress is still progress",
"Make today count",
"Your effort will pay off one day",
"Stay humble and keep grinding",
"Discipline leads to freedom",
"Believe you can and you’re halfway there",
"Consistency is the key to success",
"Be stronger than your excuses",
"Growth begins at the end of your comfort zone",
"Keep going no matter what",
"Success is built on daily habits",
"Your mindset shapes your reality",
"Don’t quit before the miracle happens",
"Turn obstacles into opportunities",
"Every challenge makes you stronger",
"Focus on progress not perfection",
"Your determination defines your success",
"Stay positive and work hard",
"The best is yet to come",
"Be fearless in the pursuit of greatness",
"Your dreams are worth chasing",
"Hard times build strong people",
"Patience and persistence win",
"Success starts with discipline",
"Your attitude determines your direction",
"Rise above the negativity",
"Greatness comes from dedication",
"Let your actions speak louder",
"Be proud of how far you’ve come",
"Work until your idols become rivals",
"Every effort counts",
"Stay hungry for success",
"Be the reason someone believes in good",
"Never lose your curiosity",
"Strength grows in the moments you think you can’t go on",
"Be brave enough to start",
"Your story is still being written",
"Keep your vision clear",
"Progress happens one step at a time",
"Stay committed to your journey",
"Dream it believe it achieve it",
"Turn ideas into reality",
"Success requires sacrifice",
"Let your passion guide you",
"Opportunities are created not given",
"Be patient with your growth",
"Your potential is limitless",
"Keep your head high and move forward",
"Stay determined and unstoppable",
"Learn from yesterday live for today",
"Make your life a masterpiece",
"Your courage defines you",
"Stay true to your purpose",
"Be the energy you want to attract",
"Focus on what matters most",
"Strength comes from persistence",
"Every moment is a chance to improve",
"Your dreams deserve effort",
"Stay motivated and keep building",
"Success loves preparation",
"Believe in endless possibilities",
"Keep your fire alive",
"Let determination lead the way",
"Your journey is unique",
"Rise stronger after every fall",
"Turn effort into excellence",
"Stay inspired and keep creating",
"Never underestimate your power",
"Build the life you imagine",
"Your future self will thank you",
"Keep your dreams alive",
"Great things start with courage",
"Focus on the bigger picture",
"Success grows from perseverance",
"Your ambition fuels your progress",
"Stay calm and keep working",
"Victory belongs to the persistent",
"Every goal starts with belief",
"Make progress every day",
"Your willpower is your strength",
"Stay dedicated to your goals",
"Create the future you want",
"Keep striving for greatness",
"Believe in the power of effort",
"Success is a journey not a destination",
"Stay hopeful and keep pushing",
"Your passion can change the world"
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

cron.schedule("*/1 * * *", () => {

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

