const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getSong } = require("genius-lyrics-api");
const { GENIUS_API_KEY } = process.env;

const data = new SlashCommandBuilder()
  .setName("lyrics")
  .setDescription("Get the lyrics of a song.")
  .addStringOption((option) =>
    option
      .setName("artist")
      .setDescription("Enter the song artist.")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("title")
      .setDescription("Enter the song title.")
      .setRequired(true)
  );

const execute = async (interaction) => {
  const artist = interaction.options._hoistedOptions[0].value;
  const title = interaction.options._hoistedOptions[1].value;

  const options = {
    apiKey: GENIUS_API_KEY,
    title: title,
    artist: artist,
    optimizeQuery: true,
  };

  getSong(options).then((song) => {
    const embed = new EmbedBuilder()
      .setColor(0xfeaab3)
      .setTitle(song.title)
      .setDescription(song.lyrics)
      .setThumbnail(song.albumArt);

    interaction.reply({
      embeds: [embed],
    });
  });
};

module.exports = {
  data,
  execute,
};
