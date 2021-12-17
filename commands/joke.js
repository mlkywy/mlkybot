const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("joke")
    .setDescription("Replies with a random joke."),
  async execute(interaction) {
    interaction.reply({ content: "joke here" });
  },
};
