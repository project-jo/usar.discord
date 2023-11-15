import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { Client } from "../struct/client.js";
import CommandBuilder from "../struct/command.js";
import { promoteUser } from "../utils/roblox.js";
import { getColor } from "../utils/color.js";

const command = new CommandBuilder()
.setName('promote')
.setDescription('Command to promote a user rank')
.addUserOption(opt => opt
.setName('user')
.setDescription('The user to be promoted')
.setRequired(true)
)
.setCallback(
  async (client: Client, interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply({ ephemeral: false });
    const { options } = interaction;
    const userOption = options.getUser('user', true);
    if (userOption.bot) {
      const errEmbed = client.errorEmbed(interaction.user, 'Warning - Restriction', 'Bots are not eligible for rank promotion!');
      return interaction.editReply({ embeds: [errEmbed] });
    }
    const userId = userOption.id;
    let res = await promoteUser(userId);
    if (res.status === true && 'new' in res) {
      const newData = res.new!;
      const oldData = res.old!;

      const embed = new EmbedBuilder()
      .setTitle('Promotion')
      .setDescription(`<@${userId}> **has been promoted by** <@${interaction.user.id}>`)
      .addFields(
        {
          name: 'Previous',
          value: oldData.name
        },
        {
          name: 'Current',
          value: newData.name
        }
      )
      .setColor(getColor('peach'))
      .setFooter({
        text: client.user!.username,
        iconURL: client.user!.displayAvatarURL({ extension: 'png', size: 2048 })
      })
      .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }
  }
)

export default command;
