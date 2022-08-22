const { SlashCommandBuilder } = require("discord.js");
const getRandomLine = require("../components/getRandomLine.js");

const data = new SlashCommandBuilder()
  .setName("joke")
  .setDescription("Replies with a joke.");

const execute = async (interaction) => {
  const joke = getRandomLine("./text/jokes.txt");
  interaction.reply({ content: joke });
};

module.exports = {
  data,
  execute,
};
