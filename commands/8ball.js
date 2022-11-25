const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const getRandomLine = require("../components/getRandomLine.js");

const data = new SlashCommandBuilder()
  .setName("8ball")
  .setDescription("Ask and you shall recieve.")
  .addStringOption((option) =>
    option
      .setName("question")
      .setDescription("Type the question you wish to ask the 8-ball.")
      .setRequired(true)
  );

const execute = async (interaction) => {
  const question = interaction.options._hoistedOptions[0].value;
  const answer = getRandomLine("./text/8ball.txt");
  const message = `**Question:** ${question}
  **Answer:** ${answer}`;

  const embed = new EmbedBuilder()
    .setColor(0xfeaab3)
    .setTitle("Magic 8-Ball!")
    .setDescription(message)
    .setThumbnail("https://i.imgur.com/Sfwlk4R.png");

  interaction.reply({
    embeds: [embed],
  });
};

module.exports = {
  data,
  execute,
};
