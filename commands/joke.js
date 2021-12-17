const fs = require("fs");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("joke")
    .setDescription("Replies with a random joke."),
  async execute(interaction) {
    let randomJoke = getRandomLine("./text/jokes.txt");
    interaction.reply({ content: randomJoke });
  },
};

const getRandomLine = (filename) => {
  let data = fs.readFileSync(filename, "utf-8");
  let lines = data.split(/\r?\n/);
  return lines[Math.floor(Math.random() * lines.length)];
};
