const Discord = require('discord.js');
const tc = require('tinycolor2');
const utils = require('../../utils/utils.js');
require('colors');
require('log-timestamp');

module.exports = async (client, instance) => {
  client.api.applications(client.user.id).commands.post({
    data: {
      name: 'echo',
      description: 'Ecoa uma mensagem pelo bot.',
      options: [
        {
          name: 'embed',
          description:
            'Ecoa uma mensagem em embed. (Requer: Gerenciar mensagens e webhooks)',
          type: 1,
          options: [
            {
              name: 'desc',
              description: 'A descrição obrigatória do embed.',
              type: 3,
              required: true,
            },
            {
              name: 'title',
              description: 'O título do embed. Desativado por padrão.',
              type: 3,
              required: false,
            },
            {
              name: 'url',
              description: 'A url do título do embed. Desativado por padrão.',
              type: 3,
              required: false,
            },
            {
              name: 'color',
              description:
                'A cor em hex do embed. Se omitido, a cor do embed será a mesma da sua.',
              type: 3,
              required: false,
            },
            {
              name: 'author',
              description:
                'Ativa ou desativa o seu avatar e nick no embed. Ativado por padrão.',
              type: 5,
              required: false,
            },
            {
              name: 'footer',
              description: 'O footer do embed. Desativado por padrão.',
              type: 3,
              required: false,
            },
            {
              name: 'timestamp',
              description:
                'Ativa ou desativa o timestamp no embed. Desativado por padrão.',
              type: 5,
              required: false,
            },
            {
              name: 'image',
              description: 'O link da imagem do embed. Desativado por padrão.',
              type: 3,
              required: false,
            },
            {
              name: 'thumb',
              description:
                'O link da thumbnail do embed. Desativado por padrão.',
              type: 3,
              required: false,
            },
            {
              name: 'tts',
              description:
                'Ecoa a mensagem em TTS. Desativado por padrão. (Requer: Enviar mensagens TTS)',
              type: 5,
              required: false,
            },
          ],
        },
        {
          name: 'say',
          description:
            'Ecoa uma mensagem normal. (Requer: Gerenciar mensagens caso não-efêmera)',
          type: 1,
          options: [
            {
              name: 'content',
              description: 'Texto da mensagem.',
              type: 3,
              required: true,
            },
            {
              name: 'ephemeral',
              description:
                'Ativa ou desativa a mensagem efêmera. Desativado por padrão.',
              type: 5,
              required: false,
            },
            {
              name: 'tts',
              description:
                'Ecoa a mensagem em TTS. Desativado por padrão. (Requer: Enviar mensagens TTS)',
              type: 5,
              required: false,
            },
          ],
        },
      ],
    },
  });

  client.ws.on('INTERACTION_CREATE', async (interaction) => {
    const command = interaction.data.name.toLowerCase();
    const args = interaction.data.options;

    const guildI = client.guilds.cache.get(interaction.guild_id);
    const uI = guildI.members.cache.get(interaction.member.user.id);
    const uIF = await client.users.fetch(uI.id);

    if (command == 'echo') {
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

        if (
          !uI.hasPermission('MANAGE_MESSAGES') &&
          !uI.hasPermission('MANAGE_WEBHOOKS')
        ) {
          if (tts != false && !uI.hasPermission('SEND_TTS_MESSAGES')) {
            return utils.iCP(
              client,
              interaction,
              '> **Você não tem permissão de `gerenciar mensagens`, `gerenciar webhooks` e `enviar mensagens TTS` para ecoar mensagens TTS em embed.**',
              1
            );
          }
          return utils.iCP(
            client,
            interaction,
            '> **Você não tem as permissões de `gerenciar mensagens` e `gerenciar webhooks` para ecoar mensagens em embed.**',
            1
          );
        } else if (!uI.hasPermission('MANAGE_MESSAGES')) {
          if (tts != false && !uI.hasPermission('SEND_TTS_MESSAGES')) {
            return utils.iCP(
              client,
              interaction,
              '> **Você não tem permissão de `gerenciar mensagens` e `enviar mensagens TTS` para ecoar mensagens TTS em embed.**',
              1
            );
          }
          return utils.iCP(
            client,
            interaction,
            '> **Você não tem permissão de `gerenciar mensagens` para ecoar mensagens em embed.**',
            1
          );
        } else if (!uI.hasPermission('MANAGE_WEBHOOKS')) {
          if (tts != false && !uI.hasPermission('SEND_TTS_MESSAGES')) {
            return utils.iCP(
              client,
              interaction,
              '> **Você não tem permissão de `gerenciar webhooks` e `enviar mensagens TTS` para ecoar mensagens TTS em embed.**',
              1
            );
          }
          return utils.iCP(
            client,
            interaction,
            '> **Você não tem permissão de `gerenciar webhooks` para ecoar mensagens em embed.**',
            1
          );
        } else if (tts != false && !uI.hasPermission('SEND_TTS_MESSAGES')) {
          return utils.iCP(
            client,
            interaction,
            '> **Você não tem permissão de `enviar mensagens TTS` para ecoar mensagens TTS em embed.**',
            1
          );
        }

        if (!eD.value)
          return utils.iCP(
            client,
            interaction,
            '> **Descrição não especificada.**',
            1
          );

        var eC = args
          .find((arg) => arg['options'])
          .options.find((arg) => arg.name == 'color');

        if (eC) {
          eC = eC.value;

          if (!tc(eC).isValid())
            return utils.iCP(client, interaction, '> **Cor inválida.**', 1);

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

        utils.iCP(client, interaction, emb, 0, tts, 1);
      }

      if (args.find((arg) => arg.name == 'say')) {
        var mCN = args
          .find((arg) => arg['options'])
          .options.find((arg) => arg.name == 'content');

        if (!mCN.value)
          return utils.iCP(
            client,
            interaction,
            '> **Texto não especificado.**',
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

        if (sEP == 0) {
          if (!uI.hasPermission('MANAGE_MESSAGES')) {
            if (tts != false && !uI.hasPermission('SEND_TTS_MESSAGES')) {
              return utils.iCP(
                client,
                interaction,
                '> **Você não tem permissão de `gerenciar mensagens` e `enviar mensagens TTS` para ecoar mensagens TTS públicas, somente mensagens TTS efêmeras.**',
                1
              );
            }
            return utils.iCP(
              client,
              interaction,
              '> **Você não tem permissão de `gerenciar mensagens` para ecoar mensagens públicas, somente mensagens efêmeras.**',
              1
            );
          }
          if (tts != false && !uI.hasPermission('SEND_TTS_MESSAGES')) {
            return utils.iCP(
              client,
              interaction,
              '> **Você não tem permissão de `enviar mensagens TTS` para ecoar mensagens TTS públicas, somente mensagens TTS efêmeras.**',
              1
            );
          }
        }

        utils.iCP(client, interaction, mCN.value, sEP, tts);
      }
    }
  });
  console.log('Interação echo iniciada!'.blue);
};

module.exports.config = {
  displayName: 'Echo Interaction',
  dbName: 'EchoI',
  loadDBFirst: true,
};
