const { SlashCommandBuilder } = require("@discordjs/builders");
const getRandomLine = require("../components/getRandomLine.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Ask and you shall recieve.")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("Type the question you wish to ask the 8-ball.")
        .setRequired(true)
    ),
  async execute(interaction) {
    let question = interaction.options._hoistedOptions[0].value;
    let answer = getRandomLine("./text/8ball.txt");
    interaction.reply({
      content: "Question: " + question + "\n" + "Answer: " + answer,
    });
  },
};
