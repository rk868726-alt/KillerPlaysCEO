
const API_KEY = "AIzaSyCrQKEbtqANem8RocJM-4CNRtIeIv2hYDs";
const CHANNEL_ID = "https://www.youtube.com/@Killerplayztamil";
const DISCORD_CHANNEL_ID = "1312097094814666792";

let lastVideo = null;

async function checkUploads(client) {

  const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=1`;

  const res = await fetch(url);
  const data = await res.json();

  const video = data.items[0];

  if (!video) return;

  if (lastVideo && lastVideo === video.id.videoId) return;

  lastVideo = video.id.videoId;

  const channel = client.channels.cache.get(DISCORD_CHANNEL_ID);

  if (!channel) return;

  const videoURL = `https://youtube.com/watch?v=${video.id.videoId}`;

  channel.send(
    `🚨 **NEW VIDEO / SHORT / LIVE!**\n\n@everyone\n\n📺 ${video.snippet.title}\n${videoURL}`
  );
}


module.exports = { checkUploads };
