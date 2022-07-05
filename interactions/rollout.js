import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  InteractionType,
} from 'discord.js';
import murmurhash from 'murmurhash';
import { emojis } from '../defaults.js';
import { smp } from '../utils.js';

// TODO: Add info about all treatments and their rollouts and overrides, along with checking if the guild actually is in the experiment
export const data = [
  {
    description: 'Shows information about guild experiments rollouts',
    description_localizations: { 'pt-BR': 'Mostra informações sobre lançamentos de experimentos de servidores' },
    name: 'rollout',
    name_localizations: { 'pt-BR': 'lançamento' },
    options: [
      {
        autocomplete: true,
        description: 'The experiment to get its information',
        description_localizations: { 'pt-BR': 'O experimento para obter suas informações' },
        name: 'experiment',
        name_localizations: { 'pt-BR': 'experimento' },
        required: true,
        type: ApplicationCommandOptionType.String,
      },
      {
        description: 'A guild to get its experiments information (Default: Invoked guild)',
        description_localizations: {
          'pt-BR': 'Um servidor para obter informações sobre seus experimentos (Padrão: Servidor invocado)',
        },
        name: 'guild',
        name_localizations: { 'pt-BR': 'servidor' },
        type: ApplicationCommandOptionType.String,
      },
      {
        description: 'Send reply as an ephemeral message (Default: True)',
        description_localizations: { 'pt-BR': 'Envia a resposta como uma mensagem efêmera (Padrão: Verdadeiro)' },
        name: 'ephemeral',
        name_localizations: { 'pt-BR': 'efêmero' },
        type: ApplicationCommandOptionType.Boolean,
      },
    ],
  },
];
export async function execute({ embed, interaction, st }) {
  const { client, guild, options } = interaction,
    { rollouts } = client,
    experimentO = options?.getString('experiment'),
    guildO = options?.getString('guild') ?? guild?.id,
    ephemeralO = options?.getBoolean('ephemeral') ?? true;

  if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
    const focused = options.getFocused();

    return interaction.respond(
      rollouts.data
        .filter(exp => smp(exp.data.title).includes(smp(focused)) || smp(exp.data.id).startsWith(smp(focused)))
        .slice(0, 25)
        .map(exp => ({ name: exp.data.title, value: exp.data.id })),
    );
  }

  if (interaction.isChatInputCommand()) {
    await interaction.deferReply({ ephemeral: ephemeralO });

    if (!experimentO) {
      const embs = [embed({ title: `${emojis.info} Experiments List` })],
        descriptions = [[]];

      let length = 0,
        counter = 0;

      for (const e of rollouts.data) {
        if (length >= 4000) {
          length = 0;
          embs[counter++].footer = null;
          embs.push(embed());
          descriptions.push([]);
        }

        const pos = murmurhash.v3(`${e.data.id}:${guildO}`) % 10000,
          rollout_data_dict = {};
        let enabled;

        for (const i of e.rollout[3][0][0]) rollout_data_dict[i[0]] = i[1];
        for (const i of e.data.buckets)
          if (rollout_data_dict[i]) for (const item of rollout_data_dict[i]) enabled = item.s < pos && pos < item.e;

        const text = `• ${enabled ? '✅' : '❌'} [${e.data.title}](https://rollouts.advaith.io/#${
          e.data.id.split(' ')[0]
        })`;

        length += text.length;
        descriptions[counter].push(text);
      }

      descriptions.forEach((e, i) => embs[i].setDescription(e.join('\n')));

      return interaction.editReply({
        components: !ephemeralO
          ? [
              new ActionRowBuilder().addComponents([
                new ButtonBuilder()
                  .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
                  .setEmoji('🧹')
                  .setStyle(ButtonStyle.Danger)
                  .setCustomId('generic_message_delete'),
              ]),
            ]
          : [],
        embeds: embs,
      });
    }

    const experiment = rollouts.data.find(exp => exp.data.id === experimentO);

    if (!experiment) {
      return interaction.editReply({
        components: !ephemeralO
          ? [
              new ActionRowBuilder().addComponents([
                new ButtonBuilder()
                  .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
                  .setEmoji('🧹')
                  .setStyle(ButtonStyle.Danger)
                  .setCustomId('generic_message_delete'),
              ]),
            ]
          : [],
        embeds: [embed({ type: 'error' }).setDescription('Experiment not found')],
      });
    }

    const experimentId = experiment.data.id.split(' ')[0],
      pos = murmurhash.v3(`${experiment.data.id}:${guildO}`) % 10000,
      emb = embed({
        title: `${emojis.info} ${experiment.data.title}`,
      })
        .setURL(`https://rollouts.advaith.io/#${experimentId}`)
        .addFields([
          { inline: true, name: `🏷️ ${st.__('GENERIC.ID')}`, value: `\`${experimentId}\`` },
          { inline: true, name: 'Derandomized Number', value: `\`${pos}\`` },
        ]),
      // overrides = [],
      rollout_data_dict = {};

    // for (const o of experiment.rollout[4]) if (o.k.find(g => g === guildO)) overrides.push(o.b);

    for (const i of experiment.rollout[3][0][0]) rollout_data_dict[i[0]] = i[1];
    for (const i of experiment.data.buckets) {
      let enabled,
        pr = 0;
      if (rollout_data_dict[i]) {
        console.log(i, rollout_data_dict);
        for (const item of rollout_data_dict[i]) {
          enabled = item.s < pos && pos < item.e;
          pr += item.e - item.s;
        }
      }

      console.log(pr, enabled);

      if (i && pr / 100 !== 0) {
        emb.addFields([
          {
            name: experiment.data.description[i].split(':')[1],
            value: `${enabled ? '✅' : '❌'} ${pr / 100}%`,
          },
        ]);
      }
    }

    return interaction.editReply({
      components: !ephemeralO
        ? [
            new ActionRowBuilder().addComponents([
              new ButtonBuilder()
                .setLabel(st.__('GENERIC.COMPONENT.MESSAGE_DELETE'))
                .setEmoji('🧹')
                .setStyle(ButtonStyle.Danger)
                .setCustomId('generic_message_delete'),
            ]),
          ]
        : [],
      embeds: [emb],
    });
  }
}
