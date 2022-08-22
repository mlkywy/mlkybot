const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("View all available commands.");

const execute = async (interaction) => {
  const helpEmbed = new EmbedBuilder()
    .setColor(0xfeaab3)
    .setTitle("mlkybot commands")
    .setDescription("This bot is still in development.")
    .addFields(
      { name: "/help", value: "View all available commands." },
      {
        name: "/activity {type}",
        value:
          "Set up activities with your friends! (You must be in voice channel!)",
      },
      { name: "/8ball {question}", value: "Ask and you shall recieve." },
      { name: "/joke", value: "Replies with a joke." },
      { name: "/color", value: "Generates a random color." }
    )
    .setTimestamp()
    .setFooter({
      text: "Made with ❤️ by Alina!",
    });

  interaction.reply({
    embeds: [helpEmbed],
  });
};

module.exports = {
  data,
  execute,
};