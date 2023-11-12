import { ChatInputCommandInteraction, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { Client } from "../struct/client.js";
import CommandBuilder from "../struct/command.js";
import { getRankAndName } from "../utils/util.js";

const command = new CommandBuilder()
.setName('announce')
.setDescription('Announcement system')
.setCallback(
  async (_: Client, interaction: ChatInputCommandInteraction) => {
    const modal = new ModalBuilder({
      customId: `announcement-${interaction.user.id}`,
      title: 'Announcement'
    });

    const titleInput = new TextInputBuilder({
      customId: 'announcementTitleInput',
      label: 'Announcement Title',
      style: TextInputStyle.Short,
      required: true
    });

    const rankInput = new TextInputBuilder({
      customId: 'announcementUserRankInput',
      label: 'Title, Rank and Username',
      placeholder: 'Ex: [Vice Chairman of the Joint Chiefs of Staff] General, jw0902',
      style: TextInputStyle.Short,
      required: true
    })

    const messageInput = new TextInputBuilder({
      customId: 'announcementMessageInput',
      label: 'Announcement Message',
      style: TextInputStyle.Paragraph,
      required: true
    });

    const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput);
    const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(messageInput);
    const thirdActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(rankInput);

    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

    await interaction.showModal(modal);

    const filter = (interaction: any) => interaction.customId === `announcement-${interaction.user.id}`

    interaction.awaitModalSubmit({ filter, time: 30_000 })
    .then((modalInteraction) => {
        const titleValue = modalInteraction.fields.getTextInputValue('announcementTitleInput');
        const messageValue = modalInteraction.fields.getTextInputValue('announcementMessageInput');
        const rankValue = modalInteraction.fields.getTextInputValue('announcementUserRankInput');
        const rankData = getRankAndName(rankValue);

        if (rankData) {
          modalInteraction.reply({ content: `**${titleValue}**\n\n${messageValue}\n\nSigned,\n${rankData.rank}, *${rankData.name}*\n**${rankData.title}**`});
        }
      });
  }
)

export default command
