const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("View all available commands.");

const execute = async (interaction) => {
  const embed = new EmbedBuilder()
    .setColor(0xfeaab3)
    .setTitle("mlkybot commands")
    .setDescription("This bot is still in development.")
    .addFields(
      { name: "/help", value: "View all available commands." },
      { name: "/8ball {question}", value: "Ask and you shall recieve." },
      { name: "/joke", value: "Replies with a joke." },
      { name: "/color", value: "Generates a random color." },
      { name: "/lyrics {artist} {title}", value: "Get the lyrics of a song." },
      { name: "/weather {city} {units}", value: "Get the weather in a city." }
    )
    .setFooter({
      text: "Made with ❤️ by Alina!",
    });

  interaction.reply({
    embeds: [embed],
  });
};

module.exports = {
  data,
  execute,
};
