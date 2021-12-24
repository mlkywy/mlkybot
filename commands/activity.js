const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const { TOKEN } = process.env;
const fetch = require("node-fetch");
const { activitiesList } = require("../config/config.json");

const data = new SlashCommandBuilder()
  .setName("activity")
  .setDescription(
    "Set up activities with your friends! (Must be in Voice Channel)"
  )
  .addStringOption((option) =>
    option
      .setName("type")
      .setDescription("Choose the type of activity you want to create! (BETA)")
      .setRequired(true)
      .addChoice("Youtube", "youtube")
      .addChoice("Sketchy Artist", "sketchy_artist")
      .addChoice("Doodle Crew", "doodle_crew")
      .addChoice("Poker Night", "poker_night")
      .addChoice("Word Snacks", "word_snacks")
      .addChoice("Betrayal.io", "betrayal")
      .addChoice("Fishington.io", "fishington")
      .addChoice("Chess in The Park", "chess")
  );

const execute = async (interaction) => {
  const guild = await interaction.member.guild.fetch();
  const member = await guild.members.fetch(interaction.user.id);
  const voiceChannel = member.voice.channel;
  //   console.log(interaction);
  if (!voiceChannel || voiceChannel.type !== "GUILD_VOICE")
    return await interaction.reply({
      content: ":x: | You must be in a **voice** channel!",
      ephemeral: true,
    });
  if (!voiceChannel.permissionsFor(guild.me).has("CREATE_INSTANT_INVITE"))
    return await interaction.reply({
      content:
        ":x: | I need the **'CREATE_INSTANT_INVITE'** permission to do that.",
      ephemeral: true,
    });

  const activityValue = interaction.options["_hoistedOptions"][0].value;
  const activity = activitiesList[activityValue];

  fetch(`https://discord.com/api/v9/channels/${voiceChannel.id}/invites`, {
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
  const inviteEmbed = new MessageEmbed()
    .setColor("#d34964")
    .setTitle(`New ${activity.name} party created!`)
    .setThumbnail(interaction.user.avatarURL())
    .setDescription(
      `<@${interaction.user.id}> has started a new ${activity.name} party!

      You can join their party via the link below or by clicking on their name in <#${voiceChannel.id}> and clicking 'join activity'!`
    )
    .setTimestamp();
  const row = new MessageActionRow().addComponents(
    new MessageButton()
      .setURL(`https://discord.gg/${invite.code}`)
      .setLabel("Join Activity")
      .setStyle("LINK")
  );
  await interaction.reply({
    content: `Join via the link: https://discord.gg/${invite.code}`,
    ephemeral: true,
  });

  const msg = await interaction.followUp({
    embeds: [inviteEmbed],
    components: [row],
    fetchReply: true,
  });
  setTimeout(() => msg.delete(), 600000);
};

module.exports = {
  data,
  execute,
  activitiesList,
};
