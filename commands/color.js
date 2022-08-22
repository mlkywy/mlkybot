const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const data = new SlashCommandBuilder()
  .setName("color")
  .setDescription("Generates a random color.");

const execute = async (interaction) => {
  const color = Math.floor(Math.random() * 16777215).toString(16);
  const answer = `Hex code: #${color}`;
  const url = `https://www.color-hex.com/color/${color}`;

  const embed = new EmbedBuilder()
    .setColor("0x" + color)
    .setTitle("Click to view your color!")
    .setURL(url)
    .setDescription(answer);

  interaction.reply({
    embeds: [embed],
  });
};

module.exports = {
  data,
  execute,
};
