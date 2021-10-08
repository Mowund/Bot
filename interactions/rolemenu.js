const { SlashCommandBuilder } = require('@discordjs/builders');
const {
  MessageSelectMenu,
  Permissions,
  MessageActionRow,
  Util,
  Collection,
} = require('discord.js');
const { botOwners } = require('../botdefaults');

module.exports = {
  data: [
    new SlashCommandBuilder()
      .setName('rolemenu')
      .setDescription('Manage a rolemenu.')
      .addSubcommand((sub) =>
        sub
          .setName('create')
          .setDescription('Create a rolemenu.')
          .addChannelOption((opt) =>
            opt
              .setName('channel')
              .setDescription('The channel to create the rolemenu.')
          )
          .addBooleanOption((opt) =>
            opt
              .setName('ephemeral')
              .setDescription(
                'Send reply as an ephemeral message. Defaults to true.'
              )
          )
      )
      .addSubcommand((sub) =>
        sub
          .setName('edit')
          .setDescription('Edit a rolemenu.')
          .addChannelOption((opt) =>
            opt
              .setName('channel')
              .setDescription('The channel to create the rolemenu.')
          )
          .addBooleanOption((opt) =>
            opt
              .setName('ephemeral')
              .setDescription(
                'Send reply as an ephemeral message. Defaults to true.'
              )
          )
      ),
  ],
  guildOnly: '420007989261500418',
  async execute(client, interaction, getTS, emb) {
    var { guild, user, values, options } = interaction;

    if (!interaction.inGuild())
      return interaction.reply({
        embeds: [emb({ type: 'error' }).setDescription(getTS(['ERROR', 'DM']))],
        ephemeral: ephemeralO,
      });
    if (!botOwners.includes(user.id))
      return interaction.reply({
        embeds: [emb({ type: 'wip' })],
        ephemeral: true,
      });

    var channelO = options?.getChannel('channel') ?? interaction.channel;
    var ephemeralO = options?.getBoolean('ephemeral') ?? true;

    if (interaction.isCommand()) {
      if (options?.getSubcommand() === 'create') {
        await interaction.deferReply({ ephemeral: ephemeralO });

        if (!channelO.isText())
          return interaction.editReply({
            embeds: [
              emb({ type: 'error' }).setDescription(
                'Not a text based channel.'
              ),
            ],
          });
        if (
          !channelO
            .permissionsFor(client.user)
            .has(Permissions.FLAGS.SEND_MESSAGES)
        )
          return interaction.editReply({
            embeds: [
              emb({ type: 'error' }).setDescription(
                "Can't send messages on this channel."
              ),
            ],
          });

        var row = new MessageActionRow().addComponents(
          new MessageSelectMenu()
            .setCustomId('rolemenu_giverole')
            .setPlaceholder('Escolha um cargo')
            .setMinValues(1)
            .setMaxValues(2)
            .addOptions([
              {
                label: 'Aniversariantes',
                description: 'Cargo de aniversariantes',
                emoji: '🎂',
                value: '503219168007421971',
              },
              {
                label: 'Mutados',
                description: 'Cargo de mutados',
                emoji: '⛔',
                value: '531313330703433758',
              },
            ])
        );
        await channelO.send({
          embeds: [
            emb()
              .setTitle('Escolha algum cargo.')
              .setDescription('🎂 Aniversariantes\n⛔ Mutados'),
          ],
          components: [row],
        });

        interaction.editReply({
          embeds: [
            emb().setDescription('rolemenu criado em: ' + channelO.toString()),
          ],
        });
      }
    } else if (interaction.isSelectMenu()) {
      if (interaction.customId === 'rolemenu_giverole') {
        await interaction.deferReply({ ephemeral: true });
        var roles = new Collection();
        for (let rID of values) {
          rID = rID.split(' ').join('');
          let role = guild.roles.cache.filter((r) => r.id == rID);
          if (role) {
            roles = roles.concat(role);
          } else {
            console.error(
              'Role ' + rID + ' does not exist within guild ' + guild.id
            );
            return interaction.reply('Role ' + rID + ' not found');
          }
        }
        roles = Util.discordSort(roles)
          .map((r) => `${r}`)
          .reverse()
          .join(', ');

        interaction.editReply({
          embeds: [emb().setTitle('Cargos selecionados').setDescription(roles)],
        });
      }
    }
  },
};
