/* eslint-disable */
// Old bullshit
import { ApplicationCommandOptionType } from 'discord.js';
//TODO: import { getColorFromURL } from 'color-thief-node';
import tc from 'tinycolor2';
import { botOwners } from '../defaults.js';
import { diEmb } from '../utils.js';

export const data = [
  {
    description: 'Color role related commands',
    description_localizations: { 'pt-BR': 'Comandos relacionados aos cargos de cor' },
    name: 'color',
    name_localizations: { 'pt-BR': 'cor' },
    options: [
      {
        description: 'Changes the color of a color role',
        description_localizations: { 'pt-BR': 'Altera a cor de um cargo de cor' },
        name: 'change',
        name_localizations: { 'pt-BR': 'alterar' },
        options: [
          {
            description: 'Any supported color',
            description_localizations: { 'pt-BR': 'Qualquer cor suportada' },
            name: 'color',
            name_localizations: { 'pt-BR': 'cor' },
            type: ApplicationCommandOptionType.String,
          },
          {
            description: 'A member (Requires: Manage roles)',
            description_localizations: { 'pt-BR': 'Um membro (Requer: Gerenciar cargos)' },
            name: 'user',
            name_localizations: { 'pt-BR': 'usuário' },
            type: ApplicationCommandOptionType.User,
          },
          {
            description: 'Send reply as an ephemeral message (Default: True)',
            description_localizations: { 'pt-BR': 'Envia a resposta como uma mensagem efêmera (Padrão: Verdadeiro)' },
            name: 'ephemeral',
            name_localizations: { 'pt-BR': 'efêmero' },
            type: ApplicationCommandOptionType.Boolean,
          },
        ],
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        description: 'The current color of a color role',
        description_localizations: { 'pt-BR': 'A cor atual de um cargo de cor' },
        name: 'current',
        name_localizations: { 'pt-BR': 'atual' },
        options: [
          {
            description: 'A member (Requires: Manage roles)',
            description_localizations: { 'pt-BR': 'Um membro (Requer: Gerenciar cargos)' },
            name: 'user',
            name_localizations: { 'pt-BR': 'usuário' },
            type: ApplicationCommandOptionType.User,
          },
          {
            description: 'Send reply as an ephemeral message (Default: True)',
            description_localizations: { 'pt-BR': 'Envia a resposta como uma mensagem efêmera (Padrão: Verdadeiro)' },
            name: 'ephemeral',
            name_localizations: { 'pt-BR': 'efêmero' },
            type: ApplicationCommandOptionType.Boolean,
          },
        ],
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        description: 'Deletes a color role',
        description_localizations: { 'pt-BR': 'Exclui um cargo de cor' },
        name: 'remove',
        name_localizations: { 'pt-BR': 'remover' },
        options: [
          {
            description: 'A member (Requires: Manage roles)',
            description_localizations: { 'pt-BR': 'Um membro (Requer: Gerenciar cargos)' },
            name: 'user',
            name_localizations: { 'pt-BR': 'usuário' },
            type: ApplicationCommandOptionType.User,
          },
          {
            description: 'Send reply as an ephemeral message (Default: True)',
            description_localizations: { 'pt-BR': 'Envia a resposta como uma mensagem efêmera (Padrão: Verdadeiro)' },
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
export const guildOnly = ['420007989261500418'];
export async function execute({ chalk, interaction, st, embed }) {
  const { client, user, guild, options } = interaction,
    userO = options?.getUser('user') ?? user,
    tRoleN = userO ? `USER-${userO.id}` : '',
    tRole = guild.roles.cache.find(x => x.name === tRoleN),
    pos = guild.roles.botRoleFor(client.user.id).position;

  if (!interaction.inGuild()) {
    return interaction.reply({
      embeds: [embed({ type: 'error' }).setDescription(st.__('ERROR.DM'))],
      ephemeral: true,
    });
  }

  if (!botOwners.includes(user.id)) {
    return interaction.reply({
      embeds: [embed({ type: 'wip' })],
      ephemeral: true,
    });
  }

  console.log(pos);
  function dftCF(disabled) {
    if (!disabled) disabled = [];

    function getValue(id) {
      return typeof disabled.find(item => item.id === id) !== 'undefined'
        ? disabled.find(item => item.id === id).value
        : false;
    }
    return [
      {
        type: ApplicationCommandOptionType.Subcommand,
        components: [
          {
            type: ApplicationCommandOptionType.SubcommandGroup,
            style: 2,
            name: {
              name: '⛔',
            },
            custom_id: 'color_cancel',
            disabled: getValue('cancel'),
          },
          {
            type: ApplicationCommandOptionType.SubcommandGroup,
            style: 2,
            name: {
              name: '✅',
            },
            custom_id: 'color_confirm',
            disabled: getValue('confirm'),
          },
          {
            type: ApplicationCommandOptionType.SubcommandGroup,
            style: 2,
            name: {
              name: '📝',
            },
            custom_id: ['COLOR', 'EDIT'],
            disabled: getValue('edit'),
          },
          {
            type: ApplicationCommandOptionType.SubcommandGroup,
            style: 2,
            name: {
              name: '🔍',
            },
            custom_id: ['COLOR', 'PREVIEW'],
            disabled: getValue('preview'),
          },
        ],
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        components: [
          {
            type: ApplicationCommandOptionType.SubcommandGroup,
            style: 2,
            name: {
              name: '🔁',
            },
            custom_id: 'color_random',
            disabled: getValue('random'),
          },
          {
            type: ApplicationCommandOptionType.SubcommandGroup,
            style: 2,
            name: {
              name: '⚪',
            },
            custom_id: 'color_lighten',
            disabled: getValue('ligthen'),
          },
          {
            type: ApplicationCommandOptionType.SubcommandGroup,
            style: 2,
            name: {
              name: '⚫',
            },
            custom_id: 'color_darken',
            disabled: getValue('darken'),
          },
          {
            type: ApplicationCommandOptionType.SubcommandGroup,
            style: 2,
            name: {
              name: '🎨',
            },
            custom_id: ['COLOR', 'MIX'],
            disabled: getValue('mix'),
          },
        ],
      },
    ];
  }
  let dftC = dftCF();
  if (!tRole) dftC = dftCF([{ id: 'preview', value: true }]);

  if (interaction.isChatInputCommand()) {
    // Let alwCH = database.get(guild, 'color_allowed_channels');
    // if (!alwCH || !alwCH.includes(channelI.id))
    //  return utils.iCP(
    //    client,
    //    0,
    //    interaction,
    //    [0, st.__('ERROR.UNALLOWED.CHAT')],
    //    1,
    //    0,
    //    1
    //  );
    if (options?.getSubcommand('change')) {
      let color = options?.getString('color'),
        pColor = [];
      if (tRole) pColor = tc(tRole.hexColor).toHex();

      let eTitle = st.__('COLOR.SPECIFIED');
      if (!color) {
        const [r, g, b] = await getColorFromURL(userO.avatarURL({ format: 'png' }));
        color = tc(chalk.rgb(r, g, b)(`rgb(${r}, ${g}, ${b})`)).toHex();
        eTitle = st.__('COLOR.AVATAR_ESTIMATED');
      }
      if (tc(color).isValid()) color = tc(color).toHex();
      else return iCP(client, 0, interaction, 0, 1, 0, await diEmb(client, 2, interaction, userO));

      color = color.replace('000000', '000001');

      interaction.reply(await diEmb(client, 2, interaction, userO, [pColor], color, eTitle, 0), dftC);
    } else if (options?.getSubcommand('current')) {
      if (tRole) {
        const color = tc(tRole.hexColor).toHex();
        iCP(
          client,
          0,
          interaction,
          0,
          1,
          0,
          await diEmb(
            client,
            2,
            interaction,
            userO,
            [userO.id, tc(tRole.hexColor).toHex()],
            color,
            st.__('COLOR.CURRENT'),
            0,
          ),
        );
      }
    } else {
      iCP(
        client,
        0,
        interaction,
        0,
        1,
        0,
        await diEmb(client, 2, interaction, userO, [], 0, st.__('COLOR.NO_ROLE'), 0),
      );
    }
  }
  if (interaction.isButton()) {
    const component_id = interaction.data.custom_id;
    if (!component_id.startsWith('color_')) return;

    let message = interaction.message;
    const embIURL = new URL(message.embeds[0].image.url).pathname.split(/[/&]/),
      embAURL = new URL(message.embeds[0].footer.icon_url).pathname.split(/[/&]/);
    let color = embIURL[2],
      eTitle;
    const diEV = [embAURL[2], embIURL[4]];

    if (userO.id !== diEV[0]) return iCP(client, 0, interaction, 0, 1, 0, 1);

    if (component_id === 'color_cancel') {
      iCP(
        client,
        3,
        interaction,
        0,
        0,
        0,
        await diEmb(client, 2, interaction, userO, 1, color, st.__('COLOR.CANCELED'), 1, 0),
        [
          {
            type: ApplicationCommandOptionType.Subcommand,
            components: [
              {
                type: ApplicationCommandOptionType.SubcommandGroup,
                style: 4,
                label: st.__('GENERIC.COMPONENT.MESSAGE_DELETE'),
                name: {
                  name: '🧹',
                },
                custom_id: 'color_message_delete',
              },
            ],
          },
        ],
      );
    } else if (component_id === 'color_confirm') {
      if (tRole) {
        function reSC() {
          eTitle = st.__('COLOR.CHANGED_ROLE');
          tRole.setPosition(--pos);
          tRole.setColor(color);
          setInterval(() => {
            if (tc(tRole.hexColor).toHex() !== color) {
              reSC();
              console.log('Resetting Color');
            }
          }, 1500);
        }
        reSC();
      } else {
        function reCR() {
          eTitle = st.__('COLOR.CREATED_ASSIGNED_ROLE');
          guild.roles
            .create({
              data: {
                name: tRoleN,
                color: color,
                position: pos,
              },
            })
            .then(role => {
              function reAR() {
                userO.roles.add(role);
                setInterval(() => {
                  if (!userO.roles.cache.find(r => r.name === tRoleN)) {
                    reAR();
                    console.log('Readding Role');
                  }
                }, 1500);
              }
              reAR();
            });
          setInterval(() => {
            if (!guild.roles.cache.find(x => x.name === tRoleN)) {
              reCR();
              console.log('Recreating Role');
            }
          }, 1500);
        }
        reCR();
      }

      iCP(client, 3, interaction, 0, 0, 0, await diEmb(client, 2, interaction, userO, 1, color, eTitle, 1, 0), [
        {
          type: ApplicationCommandOptionType.Subcommand,
          components: [
            {
              type: ApplicationCommandOptionType.SubcommandGroup,
              style: 4,
              label: st.__('GENERIC.COMPONENT.MESSAGE_DELETE'),
              name: {
                name: '🧹',
              },
              custom_id: 'color_message_delete',
            },
          ],
        },
      ]);
    } else if (component_id === ['COLOR', 'EDIT']) {
      iCP(
        client,
        3,
        interaction,
        0,
        0,
        0,
        await diEmb(client, 2, interaction, userO, 1, color, st.__('COLOR.EDIT'), 1, 0, `${color}+->`),
        [
          {
            type: ApplicationCommandOptionType.Subcommand,
            components: [
              {
                type: ApplicationCommandOptionType.SubcommandGroup,
                style: 2,
                name: {
                  name: '↩️',
                },
                custom_id: 'color_back',
              },
            ],
          },
        ],
      );

      const filter = msg => msg.author.id === userO.id;

      function fm1() {
        async function checkV() {
          message = await iCP(client, 4, interaction);
          if (message.embeds[0].title === st.__('COLOR.EDIT')) return 1;

          if (message.embeds[0].title === st.__('COLOR.EDIT_INVALID')) return 2;

          if (message.embeds[0].title === st.__('COLOR.EDITED_REPEAT')) return 3;

          return 0;
        }

        const channel = client.channels.cache.find(c => c.id === message.channel_id);
        channel
          .awaitMessages(filter, {
            max: 1,
            time: 60000,
            errors: ['time'],
          })
          .then(async msg => {
            if ((await checkV()) === 0) return;

            msg = msg.first();
            if (tc(msg.content).isValid()) {
              color = tc(msg.content).toHex().replace('000000', '000001');

              iCP(
                client,
                3,
                interaction,
                0,
                0,
                0,
                await diEmb(client, 2, interaction, userO, 1, color, st.__('COLOR.EDITED_REPEAT'), 1, 0, `${color}+->`),
              );

              msg.delete();

              fm1();
            } else {
              iCP(
                client,
                3,
                interaction,
                0,
                0,
                0,
                await diEmb(client, 2, interaction, userO, 1, color, st.__('COLOR.EDIT_INVALID'), 1, 0, `${color}+->`),
              );

              msg.delete();

              fm1();
            }
          })
          .catch(async () => {
            if ((await checkV()) === 0) return;

            iCP(
              client,
              3,
              interaction,
              0,
              0,
              0,
              await diEmb(client, 2, interaction, userO, 1, color, st.__('COLOR.TIME_OUT'), 0, 0),
              [
                {
                  type: ApplicationCommandOptionType.Subcommand,
                  components: [
                    {
                      type: ApplicationCommandOptionType.SubcommandGroup,
                      style: 2,
                      name: {
                        name: '↩️',
                      },
                      custom_id: 'color_back',
                    },
                    {
                      type: ApplicationCommandOptionType.SubcommandGroup,
                      style: 2,
                      name: {
                        name: '🔄',
                      },
                      custom_id: ['COLOR', 'EDIT'],
                    },
                  ],
                },
              ],
            );
          });
      }
      fm1();
      iCP(
        client,
        3,
        interaction,
        0,
        0,
        0,
        await diEmb(client, 2, interaction, userO, 1, color, st.__('COLOR.EDIT'), 1, 0, `${color}+->`),
        [
          {
            type: ApplicationCommandOptionType.Subcommand,
            components: [
              {
                type: ApplicationCommandOptionType.SubcommandGroup,
                style: 2,
                name: {
                  name: '↩️',
                },
                custom_id: 'color_back',
              },
            ],
          },
        ],
      );
    } else if (component_id === ['COLOR', 'PREVIEW']) {
      function reSPC() {
        tRole.setColor(color);
        setInterval(() => {
          if (tc(tRole.hexColor).toHex() !== color) {
            reSPC();
            console.log('Resetting Preview Color');
          }
        }, 1500);
      }
      reSPC();

      iCP(
        client,
        3,
        interaction,
        0,
        0,
        0,
        await diEmb(client, 2, interaction, userO, 1, color, st.__('COLOR.PREVIEW'), 1),
        [
          {
            type: ApplicationCommandOptionType.Subcommand,
            components: [
              {
                type: ApplicationCommandOptionType.SubcommandGroup,
                style: 2,
                name: {
                  name: '↩️',
                },
                custom_id: 'color_back_preview',
              },
              {
                type: ApplicationCommandOptionType.SubcommandGroup,
                style: 2,
                name: {
                  name: '✅',
                },
                custom_id: 'color_confirm',
              },
            ],
          },
        ],
      );
    } else if (component_id === 'color_random') {
      color = tc.random().toHex().replace('000000', '000001');
      iCP(
        client,
        3,
        interaction,
        0,
        0,
        0,
        await diEmb(client, 2, interaction, userO, 1, color, st.__('COLOR.LIKE'), 1),
        dftC,
      );
    } else if (component_id === 'color_lighten') {
      color = tc(color).brighten(10).toHex().replace('000000', '000001');
      iCP(
        client,
        3,
        interaction,
        0,
        0,
        0,
        await diEmb(client, 2, interaction, userO, 1, color, st.__('COLOR.LIKE'), 1),
        dftC,
      );
    } else if (component_id === 'color_darken') {
      color = tc(color).darken(10).toHex().replace('000000', '000001');
      iCP(
        client,
        3,
        interaction,
        0,
        0,
        0,
        await diEmb(client, 2, interaction, userO, 1, color, st.__('COLOR.LIKE'), 1),
        dftC,
      );
    } else if (component_id === ['COLOR', 'MIX']) {
      iCP(
        client,
        3,
        interaction,
        0,
        0,
        0,
        await diEmb(client, 2, interaction, userO, 1, color, st.__('COLOR.MIX'), 1, 0, `${color}+＋`),
        [
          {
            type: ApplicationCommandOptionType.Subcommand,
            components: [
              {
                type: ApplicationCommandOptionType.SubcommandGroup,
                style: 2,
                name: {
                  name: '↩️',
                },
                custom_id: 'color_back',
              },
            ],
          },
        ],
      );

      const filter = msg => msg.author.id === userO.id;

      function fm1() {
        async function checkV() {
          message = await iCP(client, 4, interaction);
          if (message.embeds[0].title === st.__('COLOR.MIX')) return 1;

          if (message.embeds[0].title === st.__('COLOR.MIXED_REPEAT')) return 2;

          if (message.embeds[0].title === st.__('COLOR.MIX_INVALID')) return 3;

          return 0;
        }

        const channel = client.channels.cache.find(c => c.id === message.channel_id);
        channel
          .awaitMessages(filter, {
            max: 1,
            time: 60000,
            errors: ['time'],
          })
          .then(async msg => {
            if ((await checkV()) === 0) return;

            msg = msg.first();
            if (tc(msg.content).isValid()) {
              color = tc.mix(color, msg.content, 50).toHex().replace('000000', '000001');

              iCP(
                client,
                3,
                interaction,
                0,
                0,
                0,
                await diEmb(client, 2, interaction, userO, 1, color, st.__('COLOR.MIXED_REPEAT'), 1, 0, `${color}+＋`),
              );

              msg.delete();

              fm1();
            } else {
              iCP(
                client,
                3,
                interaction,
                0,
                0,
                0,
                await diEmb(client, 2, interaction, userO, 1, color, st.__('COLOR.MIX_INVALID'), 1, 0, `${color}+＋`),
              );

              msg.delete();

              fm1();
            }
          })
          .catch(async () => {
            if ((await checkV()) === 0) return;

            iCP(
              client,
              3,
              interaction,
              0,
              0,
              0,
              await diEmb(client, 2, interaction, userO, 1, color, st.__('COLOR.TIME_OUT'), 0, 0),
              [
                {
                  type: ApplicationCommandOptionType.Subcommand,
                  components: [
                    {
                      type: ApplicationCommandOptionType.SubcommandGroup,
                      style: 2,
                      name: {
                        name: '↩️',
                      },
                      custom_id: 'color_back',
                    },
                    {
                      type: ApplicationCommandOptionType.SubcommandGroup,
                      style: 2,
                      name: {
                        name: '🔄',
                      },
                      custom_id: ['COLOR', 'MIX'],
                    },
                  ],
                },
              ],
            );
          });
      }
      fm1();
    } else if (component_id.startsWith('color_back')) {
      if (component_id === 'color_back_preview') {
        function reSBPC() {
          tRole.setColor(diEV[1]);
          setInterval(() => {
            if (tc(tRole.hexColor).toHex() !== diEV[1]) {
              reSBPC();
              console.log('Resetting Back Previous Color');
            }
          }, 1500);
        }
        reSBPC();
      }
      iCP(
        client,
        3,
        interaction,
        0,
        0,
        0,
        await diEmb(client, 2, interaction, userO, 1, color, st.__('COLOR.LIKE'), 1),
        dftC,
      );
    } else if (component_id === 'color_message_delete') {
      iCP(client, 5, interaction);
    }
  }
}
