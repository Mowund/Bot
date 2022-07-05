import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ApplicationCommandOptionType,
  InteractionType,
  PermissionFlagsBits,
} from 'discord.js';
import { botOwners, imgOpts, emojis } from '../defaults.js';
import { smp } from '../utils.js';

export const data = [
  {
    default_member_permissions: '32',
    description: 'Configures the bot',
    description_localizations: {
      'pt-BR': 'Configura o bot',
    },
    dm_permission: false,
    name: 'settings',
    name_localizations: { 'pt-BR': 'configurações' },
    options: [
      {
        description: "Change server's language",
        description_localizations: {
          'pt-BR': 'Altera o idioma do servidor',
        },
        name: 'language',
        name_localizations: { 'pt-BR': 'idioma' },
        options: [
          {
            autocomplete: true,
            description: 'Sets a new language (Requires: Manage guild)',
            description_localizations: {
              'pt-BR': 'Define um novo idioma (Requer: Gerenciar servidor)',
            },
            name: 'language',
            name_localizations: { 'pt-BR': 'idioma' },
            type: ApplicationCommandOptionType.String,
          },
          {
            description: 'Send reply as an ephemeral message (Default: True)',
            description_localizations: {
              'pt-BR': 'Envia a resposta como uma mensagem efêmera (Padrão: Verdadeiro)',
            },
            name: 'ephemeral',
            name_localizations: { 'pt-BR': 'efêmero' },
            type: ApplicationCommandOptionType.Boolean,
          },
        ],
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },
];
export async function execute({ embed, interaction, st }) {
  const { client, guild, language, member, memberPermissions, options, user } = interaction,
    ephemeralO = options?.getBoolean('ephemeral') ?? true;

  if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
    const focused = options.getFocused();
    return interaction.respond(
      st
        .getLocales()
        .filter(v => smp(`${st.__({ locale: v, phrase: 'SETTINGS.LANGUAGE.NAME' })} | ${v}`).includes(smp(focused)))
        .slice(0, 25)
        .map(c => ({ name: `${st.__({ locale: c, phrase: 'SETTINGS.LANGUAGE.NAME' })} | ${c}`, value: c })),
    );
  }
  if (interaction.isChatInputCommand()) {
    await interaction.deferReply({ ephemeral: ephemeralO });

    switch (options?.getSubcommand()) {
      case 'language': {
        if (!interaction.inGuild()) {
          return interaction.editReply({
            embeds: [embed({ type: 'error' }).setDescription(st.__('ERROR.DM'))],
            ephemeral: true,
          });
        }

        const languageO = options?.getString('language'),
          rows = [new ActionRowBuilder()];

        if (languageO) {
          const fLanguage = st.getLocales().find(l => l.toLowerCase() === languageO.toLowerCase());

          if (!memberPermissions?.has(PermissionFlagsBits.ManageGuild) && !botOwners.includes(user.id)) {
            return interaction.editReply({
              embeds: [
                embed({ type: 'error' }).setDescription(st.__mf('PERM.REQUIRES', { perm: st.__('PERM.MANAGE_GUILD') })),
              ],
            });
          }
          if (!fLanguage) {
            return interaction.editReply({
              embeds: [
                embed({ type: 'error' }).setDescription(
                  st.__mf('SETTINGS.LANGUAGE.NOT_SUPPORTED', { input: languageO }),
                ),
              ],
            });
          }

          await client.dbSet(guild, { language: fLanguage });
          const m = p => ({ locale: fLanguage, phrase: p });

          rows[0].addComponents([
            new ButtonBuilder()
              .setLabel(st.__(m('SETTINGS.LANGUAGE.CROWDIN')))
              .setEmoji(emojis.crowdin)
              .setStyle(ButtonStyle.Link)
              .setURL('https://crowdin.com/project/mowund'),
          ]);
          if (!ephemeralO) {
            rows[0].addComponents([
              new ButtonBuilder()
                .setLabel(st.__(m('GENERIC.COMPONENT.MESSAGE_DELETE')))
                .setEmoji('🧹')
                .setStyle(ButtonStyle.Danger)
                .setCustomId('generic_message_delete'),
            ]);
          }

          console.log(await client.dbGet(guild));

          return interaction.editReply({
            components: rows,
            embeds: [
              embed({ title: st.__(m('SETTINGS.LANGUAGE.CHANGED')), type: 'success' })
                .addFields([
                  {
                    name: st.__(m('GENERIC.FROM')),
                    value: `\`${st.__({ locale: language, phrase: 'SETTINGS.LANGUAGE.NAME' })}\` - \`${language}\``,
                  },
                  {
                    name: st.__(m('GENERIC.TO')),
                    value: `\`${st.__(m(`SETTINGS.LANGUAGE.NAME`))}\` - \`${fLanguage}\``,
                  },
                ])
                .setFooter({
                  iconURL: (member ?? user).displayAvatarURL(imgOpts),
                  text: st.__mf(m('GENERIC.REQUESTED_BY'), { userName: member?.displayName ?? user.username }),
                }),
            ],

            ephemeral: ephemeralO,
          });
        }

        rows[0].addComponents([
          new ButtonBuilder()
            .setLabel(st.__('SETTINGS.LANGUAGE.CROWDIN'))
            .setEmoji(emojis.crowdin)
            .setStyle(ButtonStyle.Link)
            .setURL('https://crowdin.com/project/mowund'),
        ]);
        if (!ephemeralO) {
          rows[0].addComponents([
            new ButtonBuilder()
              .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
              .setEmoji('🧹')
              .setStyle(ButtonStyle.Danger)
              .setCustomId('generic_message_delete'),
          ]);
        }

        console.log(await client.dbGet(guild));

        return interaction.editReply({
          components: rows,
          embeds: [
            embed({ title: st.__('SETTINGS.LANGUAGE.CURRENT') }).setDescription(
              st.__mf('SETTINGS.LANGUAGE.CURRENT_IS', {
                lang: `${st.__({ locale: language, phrase: 'SETTINGS.LANGUAGE.NAME' })}\` - \`${language}`,
              }),
            ),
          ],

          ephemeral: ephemeralO,
        });
      }
    }
  }
}
