import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  BaseInteraction,
} from 'discord.js';
import { Command, CommandArgs } from '../../lib/structures/Command.js';
import { botOwners, imgOpts, emojis } from '../defaults.js';
import { simplify } from '../utils.js';

export default class Settings extends Command {
  constructor() {
    super([
      {
        defaultMemberPermissions: '32',
        description: 'SETTINGS.DESCRIPTION',
        dmPermission: false,
        name: 'SETTINGS.NAME',
        options: [
          {
            description: 'SETTINGS.OPTIONS.LANGUAGE.DESCRIPTION',
            name: 'SETTINGS.OPTIONS.LANGUAGE.NAME',
            options: [
              {
                autocomplete: true,
                description: 'SETTINGS.OPTIONS.LANGUAGE.OPTIONS.LANGUAGE.DESCRIPTION',
                name: 'SETTINGS.OPTIONS.LANGUAGE.OPTIONS.LANGUAGE.NAME',
                type: ApplicationCommandOptionType.String,
              },
            ],
            type: ApplicationCommandOptionType.Subcommand,
          },
        ],
      },
    ]);
  }

  async run(args: CommandArgs, interaction: BaseInteraction<'cached'>): Promise<any> {
    const { client, embed } = args,
      { i18n } = client,
      { guild, member, memberPermissions, user } = interaction;

    if (interaction.isAutocomplete()) {
      const focused = interaction.options.getFocused();
      return interaction.respond(
        i18n
          .getLocales()
          .filter(v =>
            simplify(`${i18n.__({ locale: v, phrase: 'SETTINGS.LANGUAGE.NAME' })} | ${v}`).includes(simplify(focused)),
          )
          .slice(0, 25)
          .map(c => ({ name: `${i18n.__({ locale: c, phrase: 'SETTINGS.LANGUAGE.NAME' })} | ${c}`, value: c })),
      );
    }

    if (interaction.isChatInputCommand()) {
      const { options } = interaction,
        ephemeralO = options?.getBoolean('ephemeral') ?? true;

      await interaction.deferReply({ ephemeral: ephemeralO });

      switch (options?.getSubcommand()) {
        case 'language': {
          const languageO = options?.getString('language'),
            rows = [new ActionRowBuilder<ButtonBuilder>()];

          if (languageO) {
            const fLanguage = i18n.getLocales().find(l => l.toLowerCase() === languageO.toLowerCase());

            if (!memberPermissions?.has(PermissionFlagsBits.ManageGuild) && !botOwners.includes(user.id)) {
              return interaction.editReply({
                embeds: [
                  embed({ type: 'error' }).setDescription(
                    i18n.__mf('PERM.REQUIRES', { perm: i18n.__('PERM.MANAGE_GUILD') }),
                  ),
                ],
              });
            }
            if (!fLanguage) {
              return interaction.editReply({
                embeds: [
                  embed({ type: 'error' }).setDescription(
                    i18n.__mf('SETTINGS.LANGUAGE.NOT_SUPPORTED', { input: languageO }),
                  ),
                ],
              });
            }

            await client.database.guilds.set(guild, { language: fLanguage });
            const m = p => ({ locale: fLanguage, phrase: p });

            rows[0].addComponents(
              new ButtonBuilder()
                .setLabel(i18n.__(m('SETTINGS.LANGUAGE.CROWDIN')))
                .setEmoji(emojis.crowdin)
                .setStyle(ButtonStyle.Link)
                .setURL('https://crowdin.com/project/mowund'),
            );
            client.guilds.cache.get(guild.id);
            console.log(await client.database.guilds.cache.get(guild.id));

            return interaction.editReply({
              components: rows,
              embeds: [
                embed({ title: i18n.__(m('SETTINGS.LANGUAGE.CHANGED')), type: 'success' })
                  .addFields(
                    {
                      name: i18n.__(m('GENERIC.FROM')),
                      value: `\`${i18n.__({
                        locale: i18n.locale,
                        phrase: 'SETTINGS.LANGUAGE.NAME',
                      })}\` - \`${i18n.locale}\``,
                    },
                    {
                      name: i18n.__(m('GENERIC.TO')),
                      value: `\`${i18n.__(m(`SETTINGS.LANGUAGE.NAME`))}\` - \`${fLanguage}\``,
                    },
                  )
                  .setFooter({
                    iconURL: (member ?? user).displayAvatarURL(imgOpts),
                    text: i18n.__mf(m('GENERIC.REQUESTED_BY'), { userName: member?.displayName ?? user.username }),
                  }),
              ],
            });
          }

          rows[0].addComponents(
            new ButtonBuilder()
              .setLabel(i18n.__('SETTINGS.LANGUAGE.CROWDIN'))
              .setEmoji(emojis.crowdin)
              .setStyle(ButtonStyle.Link)
              .setURL('https://crowdin.com/project/mowund'),
          );

          return interaction.editReply({
            components: rows,
            embeds: [
              embed({ title: i18n.__('SETTINGS.LANGUAGE.CURRENT') }).setDescription(
                i18n.__mf('SETTINGS.LANGUAGE.CURRENT_IS', {
                  lang: `${i18n.__({ locale: i18n.locale, phrase: 'SETTINGS.LANGUAGE.NAME' })}\` - \`${i18n.locale}`,
                }),
              ),
            ],
          });
        }
      }
    }
  }
}
