import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { Client } from "../struct/client.js";
import CommandBuilder from "../struct/command.js";
import { getMemberData } from "../utils/roblox.js";
import { getColor } from "../utils/color.js";

const command = new CommandBuilder()
.setName('userinfo')
.setDescription('Command to view information about a user')
.addUserOption(opt => opt
.setName('user')
.setDescription('The user whose information is to be viewed')
.setRequired(false)
)
.setCallback(
  async (client: Client, interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply({ ephemeral: false });
    const { options } = interaction;
    const userOption = options.getUser('user', false) ?? interaction.user;
    const member = interaction.guild!.members.cache.get(userOption.id)!;

    const userData = await getMemberData(userOption.id);

    const joinedTimestamp = member.joinedAt;

    const unixTimestamp = Math.floor(joinedTimestamp!.getTime() / 1000);
    const joinedAt = `<t:${unixTimestamp}:D> (<t:${unixTimestamp}:R>)`;

    const accountAge = userData.account_age;

    const embed = new EmbedBuilder()
    .setTitle(userOption.username)
    .setDescription('Profile Information')
    .addFields(
      {
        name: 'Username',
        value: userData.user
      },
      {
        name: 'Roblox Id',
        value: userData.user_id
      },
      {
        name: 'Display Name',
        value: userData.display_name
      },
      {
        name: 'Account Creation',
        value: userData.account_creation
      },
      {
        name: 'Account Age',
        value: `${userData.account_age_full} (${accountAge} ${accountAge > 1 ? 'days': 'day'})`
      },
      {
        name: 'Rank',
        value: userData.rank_name
      },
      {
        name: 'Discord Id',
        value: userData.discord_id
      },
      {
        name: 'Join Date',
        value: joinedAt,
      },
    )
    .setColor(getColor('red'))
    .setThumbnail(userData.thumbnail_url)
    .setFooter({
      text: client.user!.displayName,
      iconURL: client.user!.displayAvatarURL({ extension: 'png', size: 2048 })
    })

    return interaction.editReply({ embeds: [embed] });
  }
)

export default command;
