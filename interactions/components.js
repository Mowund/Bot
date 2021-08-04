const Discord = require('discord.js');
const tc = require('tinycolor2');
const utils = require('../utils/utils.js');
require('colors');
require('log-timestamp');

module.exports = {
  name: 'INTERACTION_CREATE',
  async execute(client, interaction) {
    function getTS(path, values) {
      return utils.getTSE(interaction.guild_id, path, values);
    }
    var guildI = client.guilds.cache.get(interaction.guild_id);
    if (guildI) {
      var uI = guildI.members.cache.get(interaction.member.user.id);
      var uIF = await client.users.fetch(interaction.member.user.id);
    }

    if (interaction.data.name) {
      var command = interaction.data.name.toLowerCase();
      var args = interaction.data.options;

      if (command == 'components') {
        if (!guildI)
          return utils.iCP(
            client,
            0,
            interaction,
            [0, await getTS(['GENERIC', 'NO_DM'])],
            1,
            0,
            1
          );

        if (args.find((arg) => arg.name == 'test')) {
          var embed = new Discord.MessageEmbed()
            .setColor('aaaaaa')
            .setTitle('Teste :b')
            .setFooter('ye', uIF.avatarURL())
            .setTimestamp(Date.now());

          utils.iCP(client, 0, interaction, 0, 1, 0, embed, [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  label: 'Leve',
                  style: 1,
                  custom_id: 'button1',
                  disabled: false,
                },
                {
                  type: 2,
                  label: 'Médio',
                  style: 3,
                  custom_id: 'button2',
                  disabled: false,
                },
                {
                  type: 2,
                  label: 'Crítico',
                  style: 4,
                  custom_id: 'button3',
                  disabled: false,
                },
              ],
            },
            {
              type: 1,
              components: [
                {
                  type: 2,
                  label: 'Magia 1',
                  style: 1,
                  custom_id: 'button4',
                  disabled: false,
                },
                {
                  type: 2,
                  label: 'Magia 2',
                  style: 3,
                  custom_id: 'button5',
                  disabled: false,
                },
                {
                  type: 2,
                  label: 'Magia 3',
                  style: 4,
                  custom_id: 'button6',
                  disabled: false,
                },
                {
                  type: 2,
                  label: 'Link',
                  style: 5,
                  url: 'https://mowund.com',
                  disabled: false,
                },
              ],
            },
            {
              type: 1,
              label: 'Magias',
              components: [
                {
                  type: 3,
                  placeholder: 'Escolher Magia',
                  min_values: 1,
                  max_values: 3,
                  custom_id: 'select1',
                  options: [
                    {
                      type: 1,
                      label: '1',
                      description: 'Faz bla',
                      value: 'option1',
                    },
                    {
                      type: 2,
                      label: '2',
                      emoji: {
                        name: 'fox',
                        id: '771499973119311872',
                      },
                      description: 'Faz blabla',
                      value: 'option2',
                    },
                    {
                      type: 3,
                      label: '3',
                      description: 'Faz blablabla',
                      value: 'option3',
                      disabled: true,
                    },
                  ],
                },
              ],
            },
          ]);
        }
      }
    }
    if (interaction.data.component_type) {
      var component = interaction.data;
      var component_id = component.custom_id;
      var component_val = component.values;

      if (component_id == 'select1') {
        if (component_val.find((val) => val['option1'])) {
          var embed = new Discord.MessageEmbed()
            .setColor('00ff00')
            .setTitle('Teste :D')
            .setFooter('ye', uIF.avatarURL())
            .setTimestamp(Date.now());
          utils.iCP(client, 3, interaction, 0, 1, 0, embed, [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  label: 'Botão 1 :DDD',
                  style: 1,
                  custom_id: 'button1',
                  disabled: false,
                },
                {
                  type: 2,
                  label: 'Botão 2',
                  style: 3,
                  custom_id: 'button2',
                  disabled: false,
                },
                {
                  type: 2,
                  label: 'Botão 3',
                  style: 4,
                  emoji: {
                    name: 'fox',
                    id: '771499973119311872',
                  },
                  custom_id: 'button3',
                  disabled: false,
                },
                {
                  type: 2,
                  label: 'Botão 4',
                  style: 5,
                  url: 'https://mowund.com',
                  disabled: false,
                },
                {
                  type: 2,
                  label: 'Link',
                  style: 5,
                  url: 'https://mowund.com',
                  disabled: false,
                },
              ],
            },
            {
              type: 1,
              components: [
                {
                  type: 3,
                  placeholder: 'select',
                  min_values: 1,
                  max_values: 3,
                  custom_id: 'select1',
                  options: [
                    {
                      type: 1,
                      label: 'Opção 1',
                      description: 'Faz bla',
                      value: 'option1',
                    },
                    {
                      type: 2,
                      label: 'Opção 2',
                      emoji: {
                        name: 'fox',
                        id: '771499973119311872',
                      },
                      description: 'Dá pra ver o select dnv',
                      value: 'option2',
                    },
                    {
                      type: 3,
                      label: 'Opção 3',
                      description: 'Se vc estiver no experimento',
                      value: 'option3',
                    },
                  ],
                  disabled: true,
                },
              ],
            },
          ]);
        }
      }

      if (component_id == 'button1') {
        var embed = new Discord.MessageEmbed()
          .setColor('ff0000')
          .setTitle('Teste :D')
          .setFooter('ye', uIF.avatarURL())
          .setTimestamp(Date.now());

        utils.iCP(client, 3, interaction, 0, 1, 0, embed, [
          {
            type: 1,
            components: [
              {
                type: 2,
                label: 'Botão 1 :DDD',
                style: 1,
                custom_id: 'button1',
                disabled: false,
              },
              {
                type: 2,
                label: 'Botão 2',
                style: 3,
                custom_id: 'button2',
                disabled: false,
              },
              {
                type: 2,
                label: 'Botão 3',
                style: 4,
                emoji: {
                  name: 'fox',
                  id: '771499973119311872',
                },
                custom_id: 'button3',
                disabled: false,
              },
              {
                type: 2,
                label: 'Botão 4',
                style: 5,
                url: 'https://mowund.com',
                disabled: false,
              },
              {
                type: 2,
                label: 'Link',
                style: 5,
                url: 'https://mowund.com',
                disabled: false,
              },
            ],
          },
          {
            type: 1,
            components: [
              {
                type: 3,
                placeholder: 'select',
                min_values: 1,
                max_values: 3,
                custom_id: 'select1',
                options: [
                  {
                    type: 1,
                    label: 'Opção 1',
                    description: 'Faz bla',
                    value: 'option1',
                  },
                  {
                    type: 2,
                    label: 'Opção 2',
                    emoji: {
                      name: 'fox',
                      id: '771499973119311872',
                    },
                    description: 'Dá pra ver o select dnv',
                    value: 'option2',
                  },
                  {
                    type: 3,
                    label: 'Opção 3',
                    description: 'Se vc estiver no experimento',
                    value: 'option3',
                  },
                ],
                disabled: true,
              },
            ],
          },
        ]);
      }
    }
  },
};
