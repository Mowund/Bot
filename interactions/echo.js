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

      if (command == 'echo') {
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

        var tts = args
          .find((arg) => arg['options'])
          .options.find((arg) => arg.name == 'tts');
        if (!tts) {
          tts = false;
        } else {
          tts = tts.value;
        }

        if (args.find((arg) => arg.name == 'embed')) {
          var eD = args
            .find((arg) => arg['options'])
            .options.find((arg) => arg.name == 'desc');

          var sEP = args
            .find((arg) => arg['options'])
            .options.find((arg) => arg.name == 'ephemeral');

          if (sEP) {
            sEP = sEP.value.toString().replace('false', 0).replace('true', 64);
          } else {
            sEP = 0;
          }

          if (sEP === 0) {
            if (!uI.hasPermission('MANAGE_MESSAGES')) {
              if (tts == true && !uI.hasPermission('SEND_TTS_MESSAGES')) {
                return utils.iCP(
                  client,
                  interaction,
                  [
                    await getTS('GENERIC_ERROR'),
                    'Você não tem permissão de `gerenciar mensagens` e `enviar mensagens TTS` para ecoar mensagens TTS em embed públicas, somente efêmeras.',
                  ],
                  1,
                  0,
                  1
                );
              }
              return utils.iCP(
                client,
                0,
                interaction,
                [
                  await getTS('GENERIC_ERROR'),
                  'Você não tem permissão de `gerenciar mensagens` para ecoar mensagens em embed públicas, somente efêmeras.',
                ],
                1,
                0,
                1
              );
            } else if (tts == true && !uI.hasPermission('SEND_TTS_MESSAGES')) {
              return utils.iCP(
                client,
                0,
                interaction,
                [
                  await getTS('GENERIC_ERROR'),
                  'Você não tem permissão de `enviar mensagens TTS` para ecoar mensagens TTS em embed públicas, somente efêmeras.',
                ],
                1,
                0,
                1
              );
            }
          }

          if (!eD.value)
            return utils.iCP(
              client,
              interaction,
              'Descrição não especificada.',
              1,
              0,
              1
            );

          var eC = args
            .find((arg) => arg['options'])
            .options.find((arg) => arg.name == 'color');

          if (eC) {
            eC = eC.value;

            if (!tc(eC).isValid())
              return utils.iCP(
                client,
                0,
                interaction,
                [await getTS('GENERIC_ERROR'), 'Cor inválida.'],
                1,
                0,
                1
              );

            eC = tc(eC).toHex().replace('ffffff', 'fffffe');
          } else {
            eC = uI.displayHexColor;
          }

          var eT = args
            .find((arg) => arg['options'])
            .options.find((arg) => arg.name == 'title');

          var eURL = args
            .find((arg) => arg['options'])
            .options.find((arg) => arg.name == 'url');

          var eA = args
            .find((arg) => arg['options'])
            .options.find((arg) => arg.name == 'author');

          var eFT = args
            .find((arg) => arg['options'])
            .options.find((arg) => arg.name == 'footer');

          var eTS = args
            .find((arg) => arg['options'])
            .options.find((arg) => arg.name == 'timestamp');

          var eI = args
            .find((arg) => arg['options'])
            .options.find((arg) => arg.name == 'image');

          var eTH = args
            .find((arg) => arg['options'])
            .options.find((arg) => arg.name == 'thumb');

          var emb = new Discord.MessageEmbed()
            .setDescription(eD.value)
            .setColor(eC);

          if (eT) {
            emb = emb.setTitle(eT.value);
          }

          if (eURL) {
            emb = emb.setURL(eURL.value);
          }

          if (eA) {
            if (eA.value == true) {
              emb = emb.setAuthor(uIF.username, uIF.avatarURL());
            }
          } else {
            emb = emb.setAuthor(uIF.username, uIF.avatarURL());
          }

          if (eFT) {
            emb = emb.setFooter(eFT.value);
          }

          if (eTS) {
            if (eTS.value == true) {
              emb = emb.setTimestamp(Date.now());
            }
          }

          if (eI) {
            emb = emb.setImage(eI.value);
          }

          if (eTH) {
            emb = emb.setThumbnail(eTH.value);
          }

          utils.iCP(client, 0, interaction, 0, sEP, tts, emb);
        }

        if (args.find((arg) => arg.name == 'say')) {
          var mCN = args
            .find((arg) => arg['options'])
            .options.find((arg) => arg.name == 'content');

          if (!mCN.value)
            return utils.iCP(
              client,
              interaction,
              [await getTS('GENERIC_ERROR'), 'Texto não especificado.'],
              1,
              0,
              1
            );

          var sEP = args
            .find((arg) => arg['options'])
            .options.find((arg) => arg.name == 'ephemeral');

          if (sEP) {
            sEP = sEP.value.toString().replace('false', 0).replace('true', 64);
          } else {
            sEP = 0;
          }

          if (sEP === 0) {
            if (!uI.hasPermission('MANAGE_MESSAGES')) {
              if (tts == true && !uI.hasPermission('SEND_TTS_MESSAGES')) {
                return utils.iCP(
                  client,
                  interaction,
                  [
                    await getTS('GENERIC_ERROR'),
                    'Você não tem permissão de `gerenciar mensagens` e `enviar mensagens TTS` para ecoar mensagens TTS públicas, somente efêmeras.',
                  ],
                  1,
                  0,
                  1
                );
              }
              return utils.iCP(
                client,
                0,
                interaction,
                [
                  await getTS('GENERIC_ERROR'),
                  'Você não tem permissão de `gerenciar mensagens` para ecoar mensagens públicas, somente efêmeras.',
                ],
                1,
                0,
                1
              );
            }
            if (tts == true && !uI.hasPermission('SEND_TTS_MESSAGES')) {
              return utils.iCP(
                client,
                0,
                interaction,
                [
                  await getTS('GENERIC_ERROR'),
                  'Você não tem permissão de `enviar mensagens TTS` para ecoar mensagens TTS públicas, somente efêmeras.',
                ],
                1,
                0,
                1
              );
            }
          }

          utils.iCP(client, 0, interaction, mCN.value, sEP, tts);
        }
      }
    }
  },
};
