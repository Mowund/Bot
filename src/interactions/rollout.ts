import util from 'node:util';
import { ApplicationCommandOptionType, BaseInteraction, Guild } from 'discord.js';
import murmurhash from 'murmurhash';
import { search } from 'fast-fuzzy';
import { ExperimentRollout } from '../../lib/App.js';
import { Command, CommandArgs } from '../../lib/structures/Command.js';
import { botOwners, emojis } from '../defaults.js';
import { fetchURL, toUTS, truncate } from '../utils.js';

// TODO: Add info about all treatments and their rollouts and overrides, along with checking if the guild actually is in the experiment
export default class Rollout extends Command {
  constructor() {
    super([
      {
        description: 'ROLLOUT.DESCRIPTION',
        name: 'ROLLOUT.NAME',
        options: [
          {
            autocomplete: true,
            description: 'ROLLOUT.OPTIONS.EXPERIMENT.DESCRIPTION',
            name: 'ROLLOUT.OPTIONS.EXPERIMENT.NAME',
            required: true,
            type: ApplicationCommandOptionType.String,
          },
          {
            description: 'ROLLOUT.OPTIONS.GUILD.DESCRIPTION',
            name: 'ROLLOUT.OPTIONS.GUILD.NAME',
            type: ApplicationCommandOptionType.String,
          },
        ],
      },
    ]);
  }

  async run(args: CommandArgs, interaction: BaseInteraction<'cached'>): Promise<any> {
    if (!botOwners.includes(interaction.user.id)) return;

    const { client, embed, isEphemeral, localize } = args,
      { experiments } = client;

    if (interaction.isAutocomplete()) {
      const focused = interaction.options.getFocused(),
        hashFilter = search(focused, experiments.data, { keySelector: e => `${e.hash}`, threshold: 0.95 }),
        idFilter = search(focused, experiments.data, { keySelector: e => e.id, threshold: 0.95 });

      return interaction.respond(
        (!focused.length
          ? experiments.data
              .sort((a, b) => b.created_at - a.created_at)
              .filter(exp => exp.in_client && exp.type === 'guild')
              .map(exp => ({ name: truncate(exp.title, 100), value: exp.id }))
          : (hashFilter.length
              ? hashFilter
              : idFilter.length
              ? idFilter
              : search(focused, experiments.data, { keySelector: e => e.title })
            )
              .sort((a, b) => +(b.type === 'guild') - +(a.type === 'guild'))
              .map(exp => ({
                name: truncate(`(${exp.type === 'guild' ? 'Guild' : 'User'}) ${exp.title}`, 100),
                value: exp.id,
              }))
        ).slice(0, 25),
      );
    }

    if (interaction.isChatInputCommand()) {
      const { options } = interaction,
        experimentO = options.getString('experiment'),
        guildO = options.getString('guild'),
        guildId = guildO ?? interaction.guildId;

      await interaction.deferReply({ ephemeral: isEphemeral });

      const guild = guildO
        ? await client.shard
            .broadcastEval((c, { id }) => c.guilds.cache.get(id), {
              context: {
                id: guildO,
              },
            })
            .then((gA: Guild[]) => gA.find(g => g))
        : interaction.guild;

      if (!experimentO) {
        const embs = [embed({ title: `${emojis.info} Experiments List` })],
          descriptions = [[]];

        let length = 0,
          counter = 0;

        for (const exp of experiments.data) {
          if (length >= 4000) {
            length = 0;
            embs[counter++].data.footer = null;
            embs.push(embed());
            descriptions.push([]);
          }

          const rollout = (await fetchURL(
              `https://distools.app/_next/data/bjZQmKO4_a8K8UwYRujPg/experiments/${exp.id}.json`,
            )) as ExperimentRollout,
            pos = murmurhash.v3(`${exp.hash}:${guildId}`) % 10000,
            rollout_data_dict = {};
          let enabled: boolean;

          for (const i of rollout.populations[0].buckets) rollout_data_dict[i[0]] = i[1];
          for (const i of exp.buckets) {
            if (rollout_data_dict[i.bucket])
              for (const item of rollout_data_dict[i.bucket]) enabled = item.s < pos && pos < item.e;
          }

          const text = `• ${enabled ? '✅' : '❌'} [${exp.title}](https://distools.app/experiments/${exp.hash})`;

          length += text.length;
          descriptions[counter].push(text);
        }

        descriptions.forEach((e, i) => embs[i].setDescription(e.join('\n')));

        return interaction.editReply({ embeds: embs });
      }

      const experiment = experiments.data.find(exp => exp.id === experimentO);

      if (!experiment)
        return interaction.editReply({ embeds: [embed({ type: 'error' }).setDescription('Experiment not found')] });

      const rollout = (
          await fetchURL(`https://distools.app/_next/data/bjZQmKO4_a8K8UwYRujPg/experiments/${experiment.id}.json`)
        ).pageProps.rollout as ExperimentRollout,
        rPos = murmurhash.v3(`${experiment.hash}:${guildId}`) % 10000,
        emb = embed({
          title: `${emojis.info} (${experiment.type === 'guild' ? 'Guild' : 'User'}) ${experiment.title}`,
        })
          .setURL(`https://distools.app/experiments/${experiment.hash}`)
          .addFields(
            {
              inline: true,
              name: `🪪 ${localize('GENERIC.ID')}`,
              value: `\`${experiment.id}\``,
            },
            { inline: true, name: '#️⃣ Hash', value: `\`${experiment.hash}\`` },
            { inline: true, name: '🚩 Position', value: `\`${rPos}\`` },
            {
              inline: true,
              name: `📅 ${localize('GENERIC.CREATION_DATE')}`,
              value: toUTS(experiment.created_at * 1000),
            },
            { inline: true, name: `🕑 ${localize('ROLLOUT.LAST_UPDATE')}`, value: toUTS(experiment.updated_at * 1000) },
          );
      // overrides = []

      // for (const o of experiment.rollout[4]) if (o.k.find(g => g === guildId)) overrides.push(o.b);
      console.log(util.inspect(experiment, false, null, true));
      console.log(util.inspect(rollout, false, null, true));

      if (rollout) {
        for (const pop of rollout.populations) {
          const inFilters = pop.filters.every(
              fl =>
                guild &&
                (fl.type === 'guild_features'
                  ? fl.features.some(f => (guild.features as any)?.includes(f))
                  : fl.type === 'member_count_range'
                  ? fl.min <= guild.memberCount && guild.memberCount <= fl.max
                  : fl.type === 'guild_id_range'
                  ? fl.min <= guild.id && guild.id <= fl.max
                  : fl.type === 'guild_ids' && fl.ids.includes(guild.id)),
            ),
            fieldValues = [];

          let control = 10000;
          for (const pBkt of pop.buckets) {
            const bkt = experiment.buckets.find(b => b.bucket === pBkt.bucket);
            if (bkt) {
              let inHash: boolean,
                pr = 0;

              for (const pos of pBkt.positions) {
                inHash = pos.start <= rPos && rPos <= pos.end;
                pr += pos.end - pos.start;
              }
              control -= pr;

              fieldValues.push(
                `${
                  inHash
                    ? pop.filters.length
                      ? guild
                        ? inFilters
                          ? emojis.check
                          : emojis.maybe
                        : emojis.neutral
                      : emojis.check
                    : emojis.no
                } **${bkt.title}${bkt.description ? `: ${bkt.description}` : ''}:** ${pr / 100}%`,
              );
            }
          }

          if (control) fieldValues.push(`🔘 **Control:** ${control / 100}%`);

          emb.addFields({
            name: pop.filters.length
              ? pop.filters
                  .map(
                    f =>
                      `${
                        f.type === 'guild_features'
                          ? f.features.map((f1, i) => (i === 0 ? `Guild has feature ${f1}` : `or ${f1}`)).join(' ')
                          : f.type === 'guild_id_range'
                          ? `Guild ID is in range ${f.min}${f.max ? `-${f.max}` : '+'}`
                          : f.type === 'member_count_range'
                          ? `Member count is in range ${f.min}${f.max ? `-${f.max}` : '+'}`
                          : 'Unknown filter'
                      }`,
                  )
                  .join(' & ')
              : 'Default',
            value: fieldValues.join('\n'),
          });
        }
      }

      return interaction.editReply({ embeds: [emb] });
    }
  }
}
