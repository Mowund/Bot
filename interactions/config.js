const Discord = require('discord.js');
const tc = require('tinycolor2');
const utils = require('../utils/utils.js');
const pm2 = require('pm2');
require('colors');
require('log-timestamp');

module.exports = {
  name: 'INTERACTION_CREATE',
  async execute(client, interaction) {
    function getTS(path, values) {
      return utils.getTSE(interaction.guild_id, path, values);
    }
    var guildI = client.guilds.cache.get(interaction.guild_id);
    var intChan;

    if (guildI) {
      var uI = guildI.members.cache.get(interaction.member.user.id);
      var uIF = await client.users.fetch(interaction.member.user.id);
      var channelI = guildI.channels.cache.get(interaction.channel_id);
      intChan =
        uIF.username.blue +
        ' ('.gray +
        uIF.id.blue +
        ') - '.gray +
        guildI.name.green +
        ' ('.gray +
        guildI.id.green +
        ') - '.gray +
        '#'.cyan +
        channelI.name.cyan;
    } else {
      intChan =
        interaction.user.username.blue +
        ' ('.gray +
        interaction.user.id.blue +
        ') -'.gray;
    }

    var intValue = interaction.data;
    var intName = intValue.name || intValue.custom_id;

    var intType = 'commands'.red + ':'.gray;
    if (intValue.component_type) {
      intType =
        'components'.red +
        ':'.gray +
        `${intValue.component_type}`.red +
        ':'.gray;
    } else if (interaction.type) {
      intType =
        'components'.red + ':'.gray + `${interaction.type}`.red + ':'.gray;
    }

    console.log(
      intChan +
        ' ('.gray +
        interaction.channel_id.cyan +
        '): '.gray +
        intType +
        intName.yellow +
        ':'.gray +
        JSON.stringify(intValue)
    );

    if (interaction.data.name) {
      var command = interaction.data.name.toLowerCase();

      args = interaction.data.options;
      if (args) {
        if (args.find((arg) => arg['options'])) {
          var argsO = args
            .find((arg) => arg['options'])
            .options.find((arg) => arg['options']);
        }
      }

      if (guildI) {
        var getId = await client.api
          .applications(client.user.id)
          .commands.get();
        var getIdG = await client.api
          .applications(client.user.id)
          .guilds(guildI.id)
          .commands.get();
      }

      if (command == 'config') {
        if (!guildI)
          return utils.iCP(
            client,
            0,
            interaction,
            [0, await getTS('GENERIC_NO_DM')],
            1,
            0,
            1
          );

        if (uI.id != '205130563424616450')
          return utils.iCP(
            client,
            0,
            interaction,
            [await getTS('GENERIC_ERROR'), 'Somente o dono pode usar esse comando.'],
            1,
            0,
            1
          );

        if (
          args
            .find((arg) => arg['options'])
            .options.find((arg) => arg.name.toLowerCase() == 'delete')
        ) {
          iO = argsO.options.find((arg) => arg.name == 'id');

          var sO = [];
          if (argsO.options.find((arg) => arg.name == 'server')) {
            sO = argsO.options.find((arg) => arg.name == 'server').value;
          }

          var getIdG = await client.api
            .applications(client.user.id)
            .guilds(sO)
            .commands.get();

          if (!iO)
            return utils.iCP(
              client,
              0,
              interaction,
              [await getTS('GENERIC_ERROR'), 'ID não especificado.'],
              1,
              0,
              1
            );

          if (
            !getId.find((f) => f.id == iO.value) &&
            !getIdG.find((f) => f.id == iO.value)
          )
            return utils.iCP(
              client,
              0,
              interaction,
              [await getTS('GENERIC_ERROR'), 'Interação não encontrada.'],
              1,
              0,
              1
            );

          if (sO) {
            client.api
              .applications(client.user.id)
              .guilds(sO)
              .commands(iO.value)
              .delete();
          } else {
            client.api.applications(client.user.id).commands(iO.value).delete();
          }

          utils.iCP(
            client,
            0,
            interaction,
            [await getTS('GENERIC_SUCCESS'), 'Interação deletada.', '00ff00'],
            1,
            0,
            1
          );
        }

        if (
          args
            .find((arg) => arg['options'])
            .options.find((arg) => arg.name.toLowerCase() == 'list')
        ) {
          var pBoolean = false;
          if (argsO) {
            if (argsO.options.find((arg) => arg.name == 'perms')) {
              pBoolean = argsO.options.find((arg) => arg.name == 'perms').value;
            } else {
              var sO = argsO.options.find((arg) => arg.name == 'server');
            }
          }

          var guildL = guildI.id;
          if (sO) {
            if (client.guilds.cache.get(sO.value)) {
              guildL = client.guilds.cache.get(sO.value).id;
              getIdG = await client.api
                .applications(client.user.id)
                .guilds(guildL)
                .commands.get();
            } else {
              return utils.iCP(
                client,
                0,
                interaction,
                [await getTS('GENERIC_ERROR'), 'Servidor inválido.'],
                1,
                0,
                1
              );
            }
          }

          var getIdPG = await client.api
            .applications(client.user.id)
            .guilds(guildL)
            .commands.permissions.get();

          if (pBoolean == true) {
            console.log(getIdPG.find((arg) => arg['permissions']));
          } else {
            console.table(getId);
            console.table(getIdG);
          }
          utils.iCP(
            client,
            0,
            interaction,
            [
              await getTS('GENERIC_SUCCESS'),
              'Interações listadas no console.',
              '00ff00',
            ],
            1,
            0,
            1
          );
        }

        if (
          args
            .find((arg) => arg['options'])
            .options.find((arg) => arg.name.toLowerCase() == 'permission')
        ) {
          var iO = argsO.options.find((arg) => arg.name == 'id');
          var rO = argsO.options.find((arg) => arg.name == 'restriction');
          var sO = argsO.options.find((arg) => arg.name == 'server');

          var rC;
          if (rO) {
            rC = guildI.members.cache.get(rO.value);
            var pType = 1;
            if (!rC) {
              rC = guildI.roles.cache.get(rO.value);
              pType = 2;
              if (!rC.id) {
                return utils.iCP(
                  client,
                  0,
                  interaction,
                  [await getTS('GENERIC_ERROR'), 'Cargo ou usuário inválido.'],
                  1,
                  0,
                  1
                );
              }
            }
          }

          var guildP = guildI.id;
          if (sO) {
            if (client.guilds.cache.get(sO.value)) {
              guildP = client.guilds.cache.get(sO.value).id;
            } else {
              return utils.iCP(
                client,
                0,
                interaction,
                [await getTS('GENERIC_ERROR'), 'Servidor inválido.'],
                1,
                0,
                1
              );
            }
          }

          if (!iO)
            return utils.iCP(
              client,
              0,
              interaction,
              [await getTS('GENERIC_ERROR'), 'ID não especificado.'],
              1,
              0,
              1
            );

          if (
            !getId.find((id) => id.id == iO.value) &&
            !getIdG.find((id) => id.id == iO.value)
          )
            return utils.iCP(
              client,
              0,
              interaction,
              [await getTS('GENERIC_ERROR'), 'Interação não encontrada.'],
              1,
              0,
              1
            );

          if (rO) {
            client.api
              .applications(client.user.id)
              .guilds(guildP)
              .commands(iO.value)
              .permissions.put({
                data: {
                  permissions: [
                    {
                      id: rC.id,
                      type: pType,
                      permission: true,
                    },
                  ],
                },
              });
          } else {
            client.api
              .applications(client.user.id)
              .guilds(guildP)
              .commands(iO.value)
              .permissions.put({
                data: {
                  id: iO.value,
                },
              });
          }
          utils.iCP(
            client,
            0,
            interaction,
            [
              await getTS('GENERIC_SUCCESS'),
              'Permissão da interação alterada.',
              '00ff00',
            ],
            1,
            0,
            1
          );
        }

        if (
          args
            .find((arg) => arg['options'])
            .options.find((arg) => arg.name.toLowerCase() == 'power')
        ) {
          iO = argsO.options.find((arg) => arg['value']);

          if (!iO)
            return utils.iCP(
              client,
              0,
              interaction,
              [await getTS('GENERIC_ERROR'), 'Opção não especificada.'],
              1,
              0,
              1
            );

          if (iO.value == 'shutdown') {
            client.user.setPresence({
              activity: { name: 'Desligando...' },
              status: 'dnd',
            });
            pm2.stop(
              'index.js',
              utils.iCP(
                client,
                0,
                interaction,
                [await getTS('GENERIC_SUCCESS'), 'Desligando...', '00ff00'],
                1,
                0,
                1
              )
            );
          }

          if (iO.value == 'restart') {
            client.user.setPresence({
              activity: { name: 'Reiniciando...' },
              status: 'idle',
            });

            pm2.restart(
              'index.js',
              utils.iCP(
                client,
                0,
                interaction,
                [await getTS('GENERIC_SUCCESS'), 'Reiniciando...', '00ff00'],
                1,
                0,
                1
              )
            );
          }
        }
      }
    }
  },
};
