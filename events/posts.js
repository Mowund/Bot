module.exports = {
  name: 'ready',
  async execute(client) {
    if (false) {
      await client.application?.commands.create({
        name: 'botinfo',
        description: "Send bot's information.",
        options: [
          {
            name: 'ephemeral',
            description: 'Send as an ephemeral message. Enabled by default.',
            type: 5,
            required: false,
          },
        ],
      });
      await client.guilds.cache.get('420007989261500418')?.commands.create({
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
      });
      await client.guilds.cache.get('420007989261500418')?.commands.create({
        name: 'components',
        description: 'Interação de botões.',
        options: [
          {
            name: 'test',
            description: 'Teste de botões.',
            type: 1,
          },
        ],
      });
      await client.guilds.cache.get('420007989261500418')?.commands.create({
        name: 'config',
        description: 'Configura o bot. (Bot owner only)',
        options: [
          {
            name: 'interaction',
            description: 'Configura as interações. (Bot owner only)',
            type: 2,
            options: [
              {
                name: 'delete',
                description: 'Deleta uma interação. (Bot owner only)',
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
                  'Lista todas as interações no console. (Bot owner only)',
                type: 1,
                options: [
                  {
                    name: 'perms',
                    description:
                      'Listar permissões. Desativado por padrão. (Bot owner only)',
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
                  'Configura a permissão de uma interação. (Bot owner only)',
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
            description: 'Configura o bot. (Bot owner only)',
            type: 2,
            options: [
              {
                name: 'power',
                description: 'Desliga ou reinicia o bot. (Bot owner only)',
                type: 1,
                options: [
                  {
                    name: 'option',
                    description: 'Opções. (Bot owner only)',
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
      });
      await client.application?.commands.create({
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
                name: 'description',
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
                description:
                  'O link da imagem do embed. Desativado por padrão.',
                type: 3,
                required: false,
              },
              {
                name: 'thumbnail',
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
                  'Send as an ephemeral message. Enabled by default.',
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
                  'Send as an ephemeral message. Enabled by default.',
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
      });
      await client.application?.commands.create({
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
                description:
                  'ID, menção ou nome (caso esteja no mesmo servidor).',
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
                description:
                  'ID, menção ou nome (caso esteja no mesmo servidor).',
                type: 3,
                required: true,
              },
            ],
          },
        ],
      });
      await client.application?.commands.create({
        name: 'kill',
        description: 'Mata alguém.',
        options: [
          {
            name: 'user',
            description: 'An user to kill.',
            type: 6,
            required: false,
          },
          {
            name: 'ephemeral',
            description: 'Send as an ephemeral message. Enabled by default.',
            type: 5,
            required: false,
          },
        ],
      });
      await client.application?.commands.create({
        name: 'language',
        description: "Change server's language.",
        options: [
          {
            name: 'language',
            description: 'The language to change.',
            type: 3,
            choices: [
              {
                name: 'English (United States)',
                value: 'en-us',
              },
              {
                name: 'Portuguese (Brazil)',
                value: 'pt-br',
              },
              {
                name: 'Spanish',
                value: 'es',
              },
            ],
          },
          {
            name: 'ephemeral',
            description: 'Send as an ephemeral message. Enabled by default.',
            type: 5,
            required: false,
          },
        ],
      });
      await client.application?.commands.create({
        name: 'ping',
        description: "Shows bot's latency.",
      });
      await client.guilds.cache.get('420007989261500418')?.commands.create({
        name: 'punish',
        description: 'Punish or unpunish a member.',
        options: [
          {
            name: 'add',
            description: 'Punishes a member. (Bot owner only)',
            type: 1,
            options: [
              {
                name: 'type',
                description: 'Punishment type.',
                type: 3,
                required: true,
                choices: [
                  {
                    name: 'Warn',
                    value: 'warn',
                  },
                  {
                    name: 'Strike',
                    value: 'strike',
                  },
                  {
                    name: 'Ban',
                    value: 'ban',
                  },
                ],
              },
              {
                name: 'user',
                description: 'Member that will be punished.',
                type: 6,
                required: true,
              },
            ],
          },
          {
            name: 'remove',
            description: 'Unpunishes a member. (Bot owner only)',
            type: 1,
            options: [
              {
                name: 'user',
                description: 'Member that will be unpunished.',
                type: 6,
                required: true,
              },
            ],
          },
        ],
      });
      /*client.api
        .applications(client.user.id)
        .guilds('420007989261500418')
        .commands.post({
          type: 2,
          name: 'User Info',
          description: "Shows user's info.",
        });

      client.api
        .applications(client.user.id)
        .guilds('420007989261500418')
        .commands.post({
          data: {
            type: 3,
            name: 'Message Info',
            description: "Shows message's info.",
          },
        });*/
    }
  },
};
