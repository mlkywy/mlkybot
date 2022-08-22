const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("View all available commands.");

// Inside a command, event listener, etc.
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
    { name: "/joke", value: "Replies with a joke." }
  )
  .setTimestamp()
  .setFooter({
    text: "Made with ❤️ by Alina!",
  });

const execute = async (interaction) => {
  interaction.reply({
    embeds: [helpEmbed],
  });
};

module.exports = {
  data,
  execute,
};
