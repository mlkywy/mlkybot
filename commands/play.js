const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Player, QueryType } = require("discord-player");

// Require the necessary Discord.js classes
const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  REST,
  Routes,
} = require("discord.js");

// Create a new client instance
const Bot = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.GuildMember,
    Partials.GuildScheduledEvent,
    Partials.Reaction,
    Partials.ThreadMember,
    Partials.User,
  ],
});

const player = new Player(Bot);

const data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("Play music from YouTube!")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("song")
      .setDescription("Play a single song.")
      .addStringOption((option) =>
        option
          .setName("url")
          .setDescription("Paste your url here.")
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("playlist")
      .setDescription("Play a playlist of songs.")
      .addStringOption((option) =>
        option
          .setName("url")
          .setDescription("Paste your url here.")
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("search")
      .setDescription("Find a song based on keywords.")
      .addStringOption((option) =>
        option
          .setName("keywords")
          .setDescription("Type the words to search by here.")
          .setRequired(true)
      )
  );

const execute = async (interaction) => {
  const guild = await interaction.member.guild.fetch();
  const member = await guild.members.fetch(interaction.user.id);
  const voiceChannel = await member.voice.channel;
  console.log("GUILD " + guild, "MEMBER " + member, "VC " + voiceChannel);

  if (voiceChannel) {
    console.log(`${member.user.tag} is connected to ${voiceChannel.name}!`);
  } else {
    console.log(`${member.user.tag} is not connected.`);
    return await interaction.reply({
      content: ":x: | You must be in a **voice** channel!",
      ephemeral: true,
    });
  }

  const queue = player.createQueue(guild);
  if (!queue.connection) await queue.connect(voiceChannel);

  let embed = new EmbedBuilder();

  // If searching by song URL, or by playlist URL, or by search terms
  if (interaction.options.getSubcommand() === "song") {
    let url = interaction.options.getString("url");

    const result = await player.search(url, {
      requestedBy: member,
      searchEngine: QueryType.YOUTUBE_VIDEO,
    });

    if (result.tracks.length === 0) {
      return interaction.reply({ content: "No results!" });
    }

    const song = result.tracks[0];
    await queue.addTrack(song);

    embed
      .setDescription(
        `**[${song.title}] (${song.url})** has been added to the queue.`
      )
      .setThumbnail(song.thumbnail)
      .setFooter({ text: `Duration: ${song.duration}` });
  } else if (interaction.options.getSubcommand() === "playlist") {
    let url = interaction.options.getString("url");

    const result = await player.search(url, {
      requestedBy: member,
      searchEngine: QueryType.YOUTUBE_PLAYLIST,
    });

    if (result.tracks.length === 0) {
      return interaction.reply({ content: "No results!" });
    }

    const playlist = result.playlist;
    await queue.addTracks(result.tracks);

    embed
      .setDescription(
        `**${result.tracks.length} songs from [${playlist.title}] (${playlist.url})** has been added to the queue.`
      )
      .setThumbnail(playlist.thumbnail);
  } else if (interaction.options.getSubcommand() === "search") {
    let search = interaction.options.getString("search terms");

    const result = await player.search(search, {
      requestedBy: member,
      searchEngine: QueryType.AUTO,
    });

    if (result.tracks.length === 0) {
      return interaction.reply({ content: "No results!" });
    }

    const song = result.tracks[0];
    await queue.addTrack(song);

    embed
      .setDescription(
        `**[${song.title}] (${song.url})** has been added to the queue.`
      )
      .setThumbnail(song.thumbnail)
      .setFooter({ text: `Duration: ${song.duration}` });
  }

  if (!queue.playing) await queue.play();

  interaction.reply({
    embeds: [embed],
  });
};

module.exports = {
  data,
  execute,
};
