const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { OPENWEATHER_API_KEY } = process.env;
const weather = require("openweather-apis");
const apiKey = OPENWEATHER_API_KEY;

const data = new SlashCommandBuilder()
  .setName("weather")
  .setDescription("Get the weather of an area.")
  .addStringOption((option) =>
    option
      .setName("city")
      .setDescription("Enter the city name.")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("units")
      .setDescription("Select the unit type.")
      .setRequired(true)
      .addChoices(
        { name: "Celsius", value: "metric" },
        { name: "Fahrenheit", value: "imperial" }
      )
  );

const execute = async (interaction) => {
  const city = interaction.options._hoistedOptions[0].value;
  const units = interaction.options._hoistedOptions[1].value;
  let degrees;

  weather.setAPPID(apiKey);
  weather.setUnits(units);
  weather.setCity(city);

  if (units == "imperial") {
    degrees = "F";
  } else if (units == "metric") {
    degrees = "C";
  }

  weather.getAllWeather((err, data) => {
    if (err) {
      const embed = new EmbedBuilder()
        .setColor(0xfeaab3)
        .setTitle("Error!")
        .setDescription(
          "Check to ensure that you've spelled the city name correctly."
        );

      interaction.reply({
        embeds: [embed],
      });
    } else {
      const message = `**Temperature:** ${data.main.temp}°${degrees}
      **Low:** ${data.main.temp_min}°${degrees}
      **High:** ${data.main.temp_max}°${degrees}
      **Feels like:** ${data.main.feels_like}°${degrees}

      **Pressure:** ${data.main.pressure}hPa
      **Humidity:** ${data.main.humidity}%
    
      **Longitude:** ${data.coord.lon}
      **Latitude:** ${data.coord.lat}`;

      const embed = new EmbedBuilder()
        .setColor(0xfeaab3)
        .setTitle(`Weather in ${data.name}`)
        .setDescription(message);

      interaction.reply({
        embeds: [embed],
      });
    }
  });
};

module.exports = {
  data,
  execute,
};
