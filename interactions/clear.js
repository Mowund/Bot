import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  PermissionFlagsBits,
} from 'discord.js';
import { botOwners, colors } from '../defaults.js';

export const data = [
  {
    default_member_permissions: '8192',
    dm_permission: false,
    name: 'Delete After This',
    name_localizations: { 'pt-BR': 'Excluir Após Essa' },
    type: ApplicationCommandType.Message,
  },
  {
    default_member_permissions: '8192',
    description: 'Deletes chat messages from up to 2 weeks ago',
    description_localizations: { 'pt-BR': 'Exclui as mensagens do chat de até 2 semanas atrás' },
    dm_permission: false,
    name: 'clear',
    name_localizations: { 'pt-BR': 'limpar' },
    options: [
      {
        description: 'How many messages to delete',
        description_localizations: { 'pt-BR': 'A quantidade de mensagens para excluir' },
        max_value: 100,
        min_value: 1,
        name: 'count',
        name_localizations: { 'pt-BR': 'quantidade' },
        required: true,
        type: ApplicationCommandOptionType.Integer,
      },
      {
        description: 'Whether to deleted pinned messages (Default: False)',
        description_localizations: { 'pt-BR': 'Determina se deve excluir mensagens fixadas (Padrão: Falso)' },
        name: 'delete-pinned',
        name_localizations: { 'pt-BR': 'excluir-fixados' },
        type: ApplicationCommandOptionType.Boolean,
      },
      {
        description: 'Send reply as an ephemeral message (Default: True)',
        description_localizations: { 'pt-BR': 'Envia a resposta como uma mensagem efêmera (Padrão: Verdadeiro)' },
        name: 'ephemeral',
        name_localizations: { 'pt-BR': 'efêmero' },
        type: ApplicationCommandOptionType.Boolean,
      },
    ],
  },
];
export async function execute({ embed, interaction, st }) {
  const { channel, customId, memberPermissions, message, options, user } = interaction,
    countO = options?.getInteger('count') ?? 100,
    delPinsO = options?.getBoolean('delete-pinned'),
    ephemeralO = options?.getBoolean('ephemeral') ?? message?.flags.has(MessageFlags.Ephemeral) ?? true,
    messageO = options?.getMessage('message') ?? message,
    mdBtn = new ButtonBuilder()
      .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
      .setEmoji('🧹')
      .setStyle(ButtonStyle.Danger)
      .setCustomId('generic_message_delete'),
    mdRow = !ephemeralO ? [new ActionRowBuilder().addComponents([mdBtn])] : [];

  // TODO: Create a confirmation menu
  // TODO: Delete user-specific messages
  // TODO: Let users delete their own messages without manage messages permission
  if (interaction.isCommand()) {
    const msg = await interaction.deferReply({ ephemeral: ephemeralO, fetchReply: true });

    if (!interaction.inGuild()) {
      return interaction.editReply({
        components: mdRow,
        embeds: [embed({ type: 'error' }).setDescription(st.__('ERROR.DM'))],
      });
    }

    if (!memberPermissions?.has(PermissionFlagsBits.ManageMessages) && !botOwners.includes(user.id)) {
      return interaction.editReply({
        components: mdRow,
        embeds: [
          embed({ type: 'error' }).setDescription(st.__mf('PERM.REQUIRES', { perm: st.__('PERM.MANAGE_MESSAGES') })),
        ],
      });
    }

    const msgs = await channel.messages.fetch({ after: messageO?.id, before: msg.id, limit: countO }),
      fMsgs = msgs.filter(m => !m.pinned),
      pinCnt = msgs.size - fMsgs.size,
      rows = [new ActionRowBuilder()];

    if (!fMsgs.size)
      return interaction.editReply({ embeds: [embed({ type: 'error' }).setDescription(`No messages to delete`)] });

    rows[0].addComponents([
      new ButtonBuilder()
        .setLabel(st.__('GENERIC.YES'))
        .setEmoji('✅')
        .setStyle(ButtonStyle.Success)
        .setCustomId('clear_delete'),
    ]);

    if (!ephemeralO) rows[0].addComponents([mdBtn]);

    console.log({ msgCnt: fMsgs.size, pinCnt });
    return interaction.editReply({
      components: rows,
      embeds: [
        embed({
          addParams: { afterMsg: messageO?.id ?? msgs.last().id - 1, beforeMsg: msg.id, delPins: delPinsO },
          title: '🗑️ Deleting Messages',
        })
          .setColor(colors.red)
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
    switch (customId) {
      case 'clear_delete': {
        const embedParams = new URLSearchParams(messageO.embeds[0].footer.iconURL),
          delPinsP = embedParams.get('delPins'),
          msgs = await channel.messages.fetch({
            after: embedParams.get('afterMsg'),
            before: embedParams.get('beforeMsg'),
          }),
          delMsgs = await channel.bulkDelete(delPinsP ? msgs : msgs.filter(m => !m.pinned), true),
          pinCnt = delMsgs.filter(m => m.pinned).size;

        return interaction.update({
          components: mdRow,
          embeds: [
            embed({
              type: 'success',
            })
              .setColor(colors.red)
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
