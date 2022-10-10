const fs = require("fs");
const statusRotator = require("./components/statusRotator");

// Require the necessary Discord.js classes
const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  REST,
  Routes,
} = require("discord.js");

// Create a new client instance
const Bot = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.GuildMember,
    Partials.GuildScheduledEvent,
    Partials.Reaction,
    Partials.ThreadMember,
    Partials.User,
  ],
});

// Load commands from the commands folder
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

// Load the token from .env file
const dotenv = require("dotenv");
dotenv.config();
const { TOKEN, TEST_GUILD_ID } = process.env;

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

  // REST v10
  const rest = new REST({
    version: "10",
  }).setToken(TOKEN);

  (async () => {
    try {
      console.log("Started refreshing application (/) commands.");

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

Bot.on("voiceStateUpdate", (oldVoiceState, newVoiceState) => {
  // Listening to the voiceStateUpdate event
  if (newVoiceState.channel) {
    // The member connected to a channel.
    console.log(
      `${newVoiceState.member.user.tag} connected to ${newVoiceState.channel.name}.`
    );
  } else if (oldVoiceState.channel) {
    // The member disconnected from a channel.
    console.log(
      `${oldVoiceState.member.user.tag} disconnected from ${oldVoiceState.channel.name}.`
    );
  }
});

// Login to discord with bot's token
Bot.login(TOKEN);
