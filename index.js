const fs = require("fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const statusRotator = require("./components/statusRotator");
// Require the necessary Discord.js classes
const { Client, Intents, Collection } = require("discord.js");

// Create a new client instance
const Bot = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_INVITES,
  ],
});

// Load commands from the commands folder
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

// Load the token from .env file
const dotenv = require("dotenv");
dotenv.config();
const TOKEN = process.env["TOKEN"];
const TEST_GUILD_ID = process.env["TEST_GUILD_ID"];

const commands = [];

// Create a collection for commands in bot
Bot.commands = new Collection();

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
  Bot.commands.set(command.data.name, command);
}

// When the client is ready, this only runs once
Bot.once("ready", () => {
  console.log("Bot is ready!");
  // Set username
  Bot.user.setUsername("mlkybot");
  // Custom statuses
  statusRotator(Bot);
  // Register commands
  const CLIENT_ID = Bot.user.id;
  const rest = new REST({
    version: "9",
  }).setToken(TOKEN);
  (async () => {
    try {
      if (!TEST_GUILD_ID) {
        await rest.put(Routes.applicationCommands(CLIENT_ID), {
          body: commands,
        });
        console.log("Successfully registered application commands globally!");
      } else {
        await rest.put(
          Routes.applicationGuildCommands(CLIENT_ID, TEST_GUILD_ID),
          {
            body: commands,
          }
        );
        console.log(
          "Successfully registered application commands for development guild!"
        );
      }
    } catch (error) {
      if (error) console.error(error);
    }
  })();
});

Bot.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  const command = Bot.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (error) {
    if (error) console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

// Login to discord with bot's token
Bot.login(TOKEN);
