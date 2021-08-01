const Discord = require('discord.js');
const { Util } = Discord;
const utils = require('../utils/utils.js');
require('colors');
require('log-timestamp');

module.exports = async (client, instance) => {
  /*client.api
    .applications(client.user.id)
    .guilds('420007989261500418')
    .commands.post({
      data: {
        name: 'color',
        description: 'Sistema de cor.',
        options: [
          {
            name: 'change',
            description: 'Muda a cor do cargo de cor.',
            type: 1,
            options: [
              {
                name: 'color',
                description: 'Alguma cor de tipo suportada.',
                type: 3,
                required: false,
              },
              {
                name: 'user',
                description: 'Algum usuário. (Requer: Gerenciar cargos)',
                type: 3,
                required: false,
              },
            ],
          },
          {
            name: 'current',
            description: 'A cor do cargo de cor.',
            type: 1,
            options: [
              {
                name: 'user',
                description: 'Algum usuário.',
                type: 3,
                required: false,
              },
            ],
          },
          {
            name: 'remove',
            description: 'Deleta o cargo de cor.',
            type: 1,
            options: [
              {
                name: 'user',
                description: 'Algum usuário. (Requer: Gerenciar cargos)',
                type: 3,
                required: false,
              },
            ],
          },
        ],
      },
    });*/
  /*client.api
    .applications(client.user.id)
    .guilds('420007989261500418')
    .commands.post({
      data: {
        name: 'components',
        description: 'Interação de botões.',
        options: [
          {
            name: 'test',
            description: 'Teste de botões.',
            type: 1,
          },
        ],
      },
    });*/
  /*client.api
    .applications(client.user.id)
    .guilds('420007989261500418')
    .commands.post({
      data: {
        name: 'config',
        description: 'Configura o bot. (Somente dono)',
        options: [
          {
            name: 'interaction',
            description: 'Configura as interações. (Somente dono)',
            type: 2,
            options: [
              {
                name: 'delete',
                description: 'Deleta uma interação. (Somente dono)',
                type: 1,
                options: [
                  {
                    name: 'id',
                    description: 'ID da interação.',
                    type: 3,
                    required: true,
                  },
                  {
                    name: 'server',
                    description: 'ID do servidor.',
                    type: 3,
                    required: false,
                  },
                ],
              },
              {
                name: 'list',
                description:
                  'Lista todas as interações no console. (Somente dono)',
                type: 1,
                options: [
                  {
                    name: 'perms',
                    description:
                      'Listar permissões. Desativado por padrão. (Somente dono)',
                    type: 5,
                    required: false,
                  },
                  {
                    name: 'server',
                    description: 'ID do servidor.',
                    type: 3,
                    required: false,
                  },
                ],
              },
              {
                name: 'permission',
                description:
                  'Configura a permissão de uma interação. (Somente dono)',
                type: 1,
                options: [
                  {
                    name: 'id',
                    description: 'ID da interação.',
                    type: 3,
                    required: true,
                  },
                  {
                    name: 'restriction',
                    description: 'O cargo ou usuário que pode usar.',
                    type: 9,
                    required: false,
                  },
                  {
                    name: 'server',
                    description: 'ID do servidor.',
                    type: 3,
                    required: false,
                  },
                ],
              },
            ],
          },
          {
            name: 'bot',
            description: 'Configura o bot. (Somente dono)',
            type: 2,
            options: [
              {
                name: 'power',
                description: 'Desliga ou reinicia o bot. (Somente dono)',
                type: 1,
                options: [
                  {
                    name: 'option',
                    description: 'Opções. (Somente dono)',
                    type: 3,
                    required: true,
                    choices: [
                      {
                        name: 'Restart',
                        value: 'restart',
                      },
                      {
                        name: 'Shutdown',
                        value: 'shutdown',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    });*/
  /*client.api.applications(client.user.id).commands.post({
    data: {
      name: 'echo',
      description: 'Ecoa uma mensagem pelo bot.',
      options: [
        {
          name: 'embed',
          description:
            'Ecoa uma mensagem em embed. (Requer: Gerenciar mensagens caso não-efêmera)',
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
                'A cor do embed. Se omitido, a cor do embed será a mesma da sua.',
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
            {
              name: 'ephemeral',
              description:
                'Ativa ou desativa a mensagem efêmera. Desativado por padrão.',
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
  });*/
  /*client.api.applications(client.user.id).commands.post({
    data: {
      name: 'emoji',
      description: 'Configura os emojis do servidor.',
      options: [
        {
          name: 'view',
          description: 'Visualiza um emoji.',
          type: 1,
          options: [
            {
              name: 'emoji',
              description: 'ID, menção ou nome (caso esteja no mesmo servidor).',
              type: 3,
              required: true,
            },
          ],
        },
        {
          name: 'edit',
          description: 'Atualiza um emoji. (Requer: Gerenciar Emojis)',
          type: 1,
          options: [
            {
              name: 'emoji',
              description: 'ID, menção ou nome (caso esteja no mesmo servidor).',
              type: 3,
              required: true,
            },
          ],
        },
      ],
    },
  });*/
  /*client.api.applications(client.user.id).commands.post({
    data: {
      name: 'kill',
      description: 'Mata alguém.',
      options: [
        {
          name: 'user',
          description: 'Algum usuário para matar.',
          type: 6,
          required: false,
        },
      ],
    },
  });*/
};

module.exports.config = {
  displayName: 'Post Interactions',
  dbName: 'PostsI',
  loadDBFirst: true,
};
