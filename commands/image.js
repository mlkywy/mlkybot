const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const ImageHandler = require("../imagehandler");

const data = new SlashCommandBuilder()
  .setName("image")
  .setDescription("Find a random image.")
  .addStringOption((option) =>
    option
      .setName("tag")
      .setDescription("Type the tag you wish search by.")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("site")
      .setDescription("Choose the site you'd like to use.")
      .setRequired(true)
      .addChoices({ name: "Safebooru", value: "Safebooru" })
      .addChoices({ name: "Danbooru", value: "Danbooru" })
  );

const execute = async (interaction) => {
  const tag = interaction.options._hoistedOptions[0].value;
  const site = interaction.options._hoistedOptions[1].value;

  const handler = new ImageHandler({
    site: site,
    wildcard: true,
    save: false,
  });

  const imgUrl = await handler.fetch(tag);

  const embed = new EmbedBuilder()
    .setColor(0xfeaab3)
    .setTitle("Image")
    .setImage(imgUrl);

  interaction.reply({
    embeds: [embed],
  });
};

module.exports = {
  data,
  execute,
};
