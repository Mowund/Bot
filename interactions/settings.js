import {
  ButtonComponent,
  ActionRow,
  ButtonStyle,
  Util,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} from 'discord.js';
import { botOwners, imgOpts, emojis } from '../defaults.js';
import { searchKey, smp } from '../utils.js';

export const data = [
  {
    description: 'Configures the bot',
    name: 'settings',
    options: [
      {
        description: "Change server's language",
        name: 'language',
        options: [
          {
            autocomplete: true,
            description: 'Sets a new language (Requires: Manage guild)',
            name: 'language',
            type: ApplicationCommandOptionType.String,
          },
          {
            description: 'Send reply as an ephemeral message (Default: True)',
            name: 'ephemeral',
            type: ApplicationCommandOptionType.Boolean,
          },
        ],
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },
];
export async function execute({ client, interaction, st, embed }) {
  const { guild, user, member, memberPermissions, language, options } = interaction,
    ephemeralO = options?.getBoolean('ephemeral') ?? true;

  if (interaction.isAutocomplete()) {
    return interaction.respond(
      st
        .getLocales()
        .supported.filter(v =>
          smp(`${st.__(`SETTINGS.LANGUAGE.NAME.${v}`)} | ${v}`).includes(smp(options.getFocused())),
        )
        .map(c => ({ name: `${st.__(`SETTINGS.LANGUAGE.NAME.${c}`)} | ${c}`, value: c })),
    );
  }
  if (interaction.isChatInputCommand()) {
    await interaction.deferReply({ ephemeral: ephemeralO });

    if (options?.getSubcommand() === 'language') {
      if (!interaction.inGuild()) {
        return interaction.editReply({
          embeds: [embed({ type: 'error' }).setDescription(st.__('ERROR.DM'))],
          ephemeral: true,
        });
      }

      const languageO = options?.getString('language'),
        rows = [new ActionRow()];

      if (languageO) {
        const fLanguage =
          st.getLocales().supported.find(l => l.toLowerCase() === languageO.toLowerCase()) ??
          searchKey(st.__('SETTINGS.LANGUAGE.NAME'), languageO.match(/(?:(?! \|).)*/)?.[0] || languageO);

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
              embed({ type: 'error' }).setDescription(st.__mf('SETTINGS.LANGUAGE.NOT_SUPPORTED', { input: languageO })),
            ],
          });
        }

        await client.dbSet(guild, { language: fLanguage });
        const m = p => ({ locale: fLanguage, phrase: p });

        rows[0].addComponents(
          new ButtonComponent()
            .setLabel(st.__(m('SETTINGS.LANGUAGE.CROWDIN')))
            .setEmoji(Util.parseEmoji(emojis.crowdin))
            .setStyle(ButtonStyle.Link)
            .setURL('https://crowdin.com/project/mowund'),
        );
        if (!ephemeralO) {
          rows[0].addComponents(
            new ButtonComponent()
              .setLabel(st.__(m('GENERIC.COMPONENT.MESSAGE_DELETE')))
              .setEmoji({ name: '🧹' })
              .setStyle(ButtonStyle.Danger)
              .setCustomId('generic_message_delete'),
          );
        }

        return interaction.editReply({
          components: rows,
          embeds: [
            embed({ title: st.__(m('SETTINGS.LANGUAGE.CHANGED')), type: 'success' })
              .addField({
                name: st.__(m('GENERIC.FROM')),
                value: `\`${st.__(m(`SETTINGS.LANGUAGE.NAME.${language}`))}\` - \`${language}\``,
              })
              .addField({
                name: st.__(m('GENERIC.TO')),
                value: `\`${st.__(m(`SETTINGS.LANGUAGE.NAME.${fLanguage}`))}\` - \`${fLanguage}\``,
              })
              .setFooter({
                iconURL: `${(member ?? user).displayAvatarURL(imgOpts)}&mowLang=${language}`,
                text: st.__(m('GENERIC.REQUESTED_BY'), member?.displayName ?? user.username),
              }),
          ],

          ephemeral: ephemeralO,
        });
      }

      rows[0].addComponents(
        new ButtonComponent()
          .setLabel(st.__('SETTINGS.LANGUAGE.CROWDIN'))
          .setEmoji(Util.parseEmoji(emojis.crowdin))
          .setStyle(ButtonStyle.Link)
          .setURL('https://crowdin.com/project/mowund'),
      );
      if (!ephemeralO) {
        rows[0].addComponents(
          new ButtonComponent()
            .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
            .setEmoji({ name: '🧹' })
            .setStyle(ButtonStyle.Danger)
            .setCustomId('generic_message_delete'),
        );
      }

      return interaction.editReply({
        components: rows,
        embeds: [
          embed({ title: st.__('SETTINGS.LANGUAGE.CURRENT') }).setDescription(
            st.__mf('SETTINGS.LANGUAGE.CURRENT_IS', {
              lang: `${st.__(`SETTINGS.LANGUAGE.NAME.${language}`)}\` - \`${language}`,
            }),
          ),
        ],

        ephemeral: ephemeralO,
      });
    }
  }
}
