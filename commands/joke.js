const { SlashCommandBuilder } = require("@discordjs/builders");
const getRandomLine = require("../components/getRandomLine.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("joke")
    .setDescription("Replies with a joke."),
  async execute(interaction) {
    let joke = getRandomLine("./text/jokes.txt");
    interaction.reply({ content: joke });
  },
};
