module.exports = {
  data: {
    name: "play",
    description: "Play music"
  },

  async execute(interaction) {

    const query = interaction.options.getString("song");
    const vc = interaction.member.voice.channel;

    if (!vc)
      return interaction.reply("Join a voice channel first.");

    const player = manager.create({
      guild: interaction.guild.id,
      voiceChannel: vc.id,
      textChannel: interaction.channel.id
    });

    player.connect();

    const res = await manager.search(query, interaction.user);

    if (!res.tracks.length)
      return interaction.reply("No results found.");

    player.queue.add(res.tracks[0]);

    if (!player.playing)
      player.play();

    interaction.reply(`🎵 Playing **${res.tracks[0].title}**`);
  }
};
