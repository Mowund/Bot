'use strict';

const { Permissions, MessageButton, MessageActionRow } = require('discord.js'),
  db = require('../database.js'),
  { botOwners, botLanguage, imgOpts, emojis } = require('../defaults'),
  { searchKey, smp } = require('../utils');

module.exports = {
  data: [
    {
      name: 'settings',
      description: 'Configures the bot.',
      options: [
        {
          name: 'language',
          description: "Change server's language.",
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'language',
              description: 'Sets a new language. (Requires: Manage guild)',
              type: 'STRING',
              autocomplete: true,
            },
            {
              name: 'ephemeral',
              description: 'Send reply as an ephemeral message. (Default: True)',
              type: 'BOOLEAN',
            },
          ],
        },
      ],
    },
  ],
  async execute(client, interaction, st, embed) {
    const { guild, user, member, memberPermissions, language, options } = interaction,
      ephemeralO = options?.getBoolean('ephemeral') ?? true;

    if (interaction.isAutocomplete()) {
      return interaction.respond(
        botLanguage.supported
          .filter(v => smp(`${st.__(`SETTINGS.LANGUAGE.NAME.${v}`)} | ${v}`).includes(smp(options.getFocused())))
          .map(c => ({ name: `${st.__(`SETTINGS.LANGUAGE.NAME.${c}`)} | ${c}`, value: c })),
      );
    }
    if (interaction.isCommand()) {
      await interaction.deferReply({ ephemeral: ephemeralO });

      if (options?.getSubcommand() === 'language') {
        if (!interaction.inGuild()) {
          return interaction.editReply({
            embeds: [embed({ type: 'error' }).setDescription(st.__('ERROR.DM'))],
            ephemeral: true,
          });
        }

        const languageO = options?.getString('language'),
          rows = [new MessageActionRow()];

        if (languageO) {
          const fLanguage =
            botLanguage.supported.find(l => l.toLowerCase() === languageO.toLowerCase()) ??
            searchKey(st.__('SETTINGS.LANGUAGE.NAME'), languageO.match(/(?:(?! \|).)*/)?.[0] || languageO);

          if (!memberPermissions?.has(Permissions.FLAGS.MANAGE_GUILD) && !botOwners.includes(user.id)) {
            return interaction.editReply({
              embeds: [embed({ type: 'error' }).setDescription(st.__('PERM.REQUIRES', st.__('PERM.MANAGE_GUILD')))],
            });
          }
          if (!fLanguage) {
            return interaction.editReply({
              embeds: [embed({ type: 'error' }).setDescription(st.__('SETTINGS.LANGUAGE.NOT_SUPPORTED', languageO))],
            });
          }

          await db.guildSet(guild, { language: fLanguage });
          const m = p => ({ phrase: p, locale: fLanguage });

          rows[0].addComponents(
            new MessageButton()
              .setLabel(st.__(m('SETTINGS.LANGUAGE.CROWDIN')))
              .setEmoji(emojis.crowdin)
              .setStyle('LINK')
              .setURL('https://crowdin.com/project/mowund'),
          );
          if (!ephemeralO) {
            rows[0].addComponents(
              new MessageButton()
                .setLabel(st.__(m('GENERIC.COMPONENT.MESSAGE_DELETE')))
                .setEmoji('🧹')
                .setStyle('DANGER')
                .setCustomId('generic_message_delete'),
            );
          }

          return interaction.editReply({
            embeds: [
              embed({ type: 'success', title: st.__(m('SETTINGS.LANGUAGE.CHANGED')) })
                .addField(
                  st.__(m('GENERIC.FROM')),
                  `\`${st.__(m(`SETTINGS.LANGUAGE.NAME.${language}`))}\` - \`${language}\``,
                )
                .addField(
                  st.__(m('GENERIC.TO')),
                  `\`${st.__(m(`SETTINGS.LANGUAGE.NAME.${fLanguage}`))}\` - \`${fLanguage}\``,
                )
                .setFooter({
                  text: st.__(m('GENERIC.REQUESTED_BY'), member?.displayName ?? user.username),
                  iconURL: `${(member ?? user).displayAvatarURL(imgOpts)}&mowLang=${language}`,
                }),
            ],
            components: rows,
            ephemeral: ephemeralO,
          });
        }

        rows[0].addComponents(
          new MessageButton()
            .setLabel(st.__('SETTINGS.LANGUAGE.CROWDIN'))
            .setEmoji(emojis.crowdin)
            .setStyle('LINK')
            .setURL('https://crowdin.com/project/mowund'),
        );
        if (!ephemeralO) {
          rows[0].addComponents(
            new MessageButton()
              .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
              .setEmoji('🧹')
              .setStyle('DANGER')
              .setCustomId('generic_message_delete'),
          );
        }

        return interaction.editReply({
          embeds: [
            embed({ title: st.__('SETTINGS.LANGUAGE.CURRENT') })
              .setColor('00ff00')
              .setDescription(
                st.__(
                  'SETTINGS.LANGUAGE.CURRENT_IS',
                  `${st.__(`SETTINGS.LANGUAGE.NAME.${language}`)}\` - \`${language}`,
                ),
              ),
          ],
          components: rows,
          ephemeral: ephemeralO,
        });
      }
    }
  },
};
