const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");

const fetch = require("node-fetch");
const { activitiesList } = require("../config/config.json");

const dotenv = require("dotenv");
dotenv.config();
const { TOKEN } = process.env;

const data = new SlashCommandBuilder()
  .setName("activity")
  .setDescription(
    "Set up activities with your friends! (You must be in voice channel!)"
  )
  .addStringOption((option) =>
    option
      .setName("type")
      .setDescription("Choose the type of activity you want to create!")
      .setRequired(true)
      .addChoices(
        { name: "Youtube", value: "youtube" },
        { name: "Sketchy Artist", value: "sketchy_artist" },
        { name: "Doodle Crew", value: "doodle_crew" },
        { name: "Poker Night", value: "poker_night" },
        { name: "Word Snacks", value: "word_snacks" },
        { name: "Betrayal.io", value: "betrayal" },
        { name: "Fishington.io", value: "fishington" },
        { name: "Chess in The Park", value: "chess" }
      )
  );

const execute = async (interaction) => {
  const guild = await interaction.member.guild.fetch();
  const member = await guild.members.fetch(interaction.user.id);
  const voiceChannel = await member.voice.channel;
  console.log("GUILD " + guild, "MEMBER " + member, "VC " + voiceChannel);

  if (voiceChannel) {
    console.log(`${member.user.tag} is connected to ${voiceChannel.name}!`);
  } else {
    console.log(`${member.user.tag} is not connected.`);
    return await interaction.reply({
      content: ":x: | You must be in a **voice** channel!",
      ephemeral: true,
    });
  }

  if (!member.permissionsIn(voiceChannel)) {
    return await interaction.reply({
      content: ":x: | You are missing permissions.",
      ephemeral: true,
    });
  }

  const activityValue = interaction.options["_hoistedOptions"][0].value;
  const activity = activitiesList[activityValue];

  fetch(`https://discord.com/api/v10/channels/${voiceChannel.id}/invites`, {
    method: "POST",
    body: JSON.stringify({
      max_age: 86400,
      max_uses: 1,
      target_application_id: activity["id"],
      target_type: 2,
      temporary: false,
      validate: null,
    }),
    headers: {
      Authorization: `Bot ${TOKEN}`,
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then(async (invite) => {
      if (invite.error || !invite.code)
        return interaction.reply({
          content: `:x: | Failed to create an invite for the new **${activity.name}** party!`,
          ephemeral: true,
        });
      await sendInvite(interaction, activity, voiceChannel, invite);
    })
    .catch((error) => console.log(error));
};

const sendInvite = async (...args) => {
  const [interaction, activity, voiceChannel, invite] = args;
  const inviteEmbed = new EmbedBuilder()
    .setColor(0xfeaab3)
    .setTitle(`New ${activity.name} party created!`)
    .setThumbnail(interaction.user.avatarURL())
    .setDescription(
      `<@${interaction.user.id}> has started a new ${activity.name} party!

      You can join their party via the link below or by clicking on their name in <#${voiceChannel.id}> and clicking 'join activity'!`
    )
    .setTimestamp();
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setURL(`https://discord.gg/${invite.code}`)
      .setLabel("Join Activity")
      .setStyle(5)
  );
  await interaction.reply({
    embeds: [inviteEmbed],
    components: [row],
  });
};

module.exports = {
  data,
  execute,
  activitiesList,
};
