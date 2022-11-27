import { ApplicationCommandOptionType, BaseInteraction, Colors } from 'discord.js';
import { Command, CommandArgs } from '../../lib/structures/Command.js';
import { imgOpts } from '../defaults.js';

export default class Kill extends Command {
  constructor() {
    super([
      {
        description: 'KILL.DESCRIPTION',
        name: 'KILL.NAME',
        options: [
          {
            description: 'KILL.OPTIONS.USER.DESCRIPTION',
            name: 'KILL.OPTIONS.USER.NAME',
            type: ApplicationCommandOptionType.User,
          },
        ],
      },
    ]);
  }

  run(args: CommandArgs, interaction: BaseInteraction<'cached'>): Promise<any> {
    if (!interaction.isChatInputCommand()) return;

    const { embed, isEphemeral, localize } = args,
      { member, options, user } = interaction,
      userO = options.getUser('user') ?? user,
      memberO = options.getMember('user') ?? member;

    return interaction.reply({
      embeds: [
        embed()
          .setColor(Colors.Red)
          .setAuthor({
            iconURL: (memberO ?? userO).displayAvatarURL(imgOpts),
            name: memberO?.displayName ?? userO.username,
          })
          .setDescription(localize('KILL.DIED')),
      ],
      ephemeral: isEphemeral,
    });
  }
}
