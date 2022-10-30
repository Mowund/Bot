import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  BaseInteraction,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  CommandInteractionOptionResolver,
  PermissionFlagsBits,
} from 'discord.js';
import { Command, CommandArgs } from '../../lib/structures/Command.js';
import { botOwners } from '../defaults.js';

export default class Clear extends Command {
  constructor() {
    super([
      {
        defaultMemberPermissions: '8192',
        dmPermission: false,
        name: 'CLEAR.DELETE_AFTER_THIS',
        type: ApplicationCommandType.Message,
      },
      {
        defaultMemberPermissions: '8192',
        description: 'CLEAR.DESCRIPTION',
        dmPermission: false,
        name: 'CLEAR.NAME',
        options: [
          {
            description: 'CLEAR.OPTIONS.COUNT.DESCRIPTION',
            max_value: 100,
            min_value: 1,
            name: 'CLEAR.OPTIONS.COUNT.NAME',
            required: true,
            type: ApplicationCommandOptionType.Integer,
          },
          {
            description: 'CLEAR.OPTIONS.DELETE_PINNED.DESCRIPTION',
            name: 'CLEAR.OPTIONS.DELETE_PINNED.NAME',
            type: ApplicationCommandOptionType.Boolean,
          },
        ],
      },
    ]);
  }

  async run(args: CommandArgs, interaction: BaseInteraction<'cached'>): Promise<any> {
    const { client, embed } = args,
      { i18n } = client,
      { channel, memberPermissions, user } = interaction;

    // TODO: Create a confirmation menu
    // TODO: Delete user-specific messages
    // TODO: Let users delete their own messages without manage messages permission
    if (interaction.isCommand()) {
      const { options } = interaction,
        countO = (options as CommandInteractionOptionResolver)?.getInteger('count') ?? 100,
        delPinsO = (options as CommandInteractionOptionResolver)?.getBoolean('delete-pinned'),
        ephemeralO = (options as CommandInteractionOptionResolver)?.getBoolean('ephemeral') ?? true,
        messageO = (options as CommandInteractionOptionResolver)?.getMessage('message'),
        msg = await interaction.deferReply({ ephemeral: ephemeralO, fetchReply: true });

      if (!memberPermissions?.has(PermissionFlagsBits.ManageMessages) && !botOwners.includes(user.id)) {
        return interaction.editReply({
          embeds: [
            embed({ type: 'error' }).setDescription(
              i18n.__mf('PERM.REQUIRES', { perm: i18n.__('PERM.MANAGE_MESSAGES') }),
            ),
          ],
        });
      }

      const msgs = await channel.messages.fetch({ after: messageO?.id, before: msg.id, limit: countO }),
        fMsgs = msgs.filter(m => !m.pinned),
        pinCnt = msgs.size - fMsgs.size,
        rows = [new ActionRowBuilder<ButtonBuilder>()];

      if (!fMsgs.size)
        return interaction.editReply({ embeds: [embed({ type: 'error' }).setDescription(`No messages to delete`)] });

      rows[0].addComponents(
        new ButtonBuilder()
          .setLabel(i18n.__('GENERIC.YES'))
          .setEmoji('✅')
          .setStyle(ButtonStyle.Success)
          .setCustomId('clear_delete'),
      );

      console.log({ msgCnt: fMsgs.size, pinCnt });
      return interaction.editReply({
        components: rows,
        embeds: [
          embed({
            addParams: {
              afterMsg: messageO?.id ?? `${+msgs.last().id - 1}`,
              beforeMsg: msg.id,
              delPins: `${delPinsO}`,
            },
            title: '🗑️ Deleting Messages',
          })
            .setColor(Colors.Red)
            .setDescription(
              `Are you sure you want to delete all \`${(delPinsO ? msgs : fMsgs).size}\` messages up to [this](${
                msgs.last().url
              })?${
                pinCnt
                  ? delPinsO
                    ? `\n\`${pinCnt}\` pinned messages will be deleted together`
                    : `\n\`${pinCnt}\` messages were ignored as they are pinned`
                  : ''
              }`,
            ),
        ],
      });
    }

    if (interaction.isButton()) {
      const { customId, message } = interaction;

      switch (customId) {
        case 'clear_delete': {
          const embedParams = new URLSearchParams(message.embeds[0].footer.iconURL),
            delPinsP = embedParams.get('delPins'),
            msgs = await channel.messages.fetch({
              after: embedParams.get('afterMsg'),
              before: embedParams.get('beforeMsg'),
            }),
            delMsgs = await channel.bulkDelete(delPinsP ? msgs : msgs.filter(m => !m.pinned), true),
            pinCnt = delMsgs.filter(m => m.pinned).size;

          return interaction.update({
            components: [],
            embeds: [
              embed({
                type: 'success',
              })
                .setColor(Colors.Red)
                .setDescription(
                  `${delMsgs.size} messages were deleted${
                    pinCnt
                      ? delPinsP
                        ? `\n\`${pinCnt}\` pinned messages were deleted together`
                        : `\n\`${pinCnt}\` messages were ignored as they are pinned`
                      : ''
                  }`,
                ),
            ],
          });
        }
      }
    }
  }
}
