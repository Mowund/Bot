import { Message, MessageEmbed } from 'discord.js';
import { CustomCommand } from '../../classes/command';

export default class extends CustomCommand {
	public constructor() {
		super({
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			description: {
				help: 'Cor do cargo atual',
				args: '',
			},
		});
	}

	public async exec(message: Message): Promise<Message | Message[]> {
		const role = message.guild!.roles.find(r => r.name === `USER-${message.author!.id}`);
		if (!role) return message.util!.send('Você não tem um cargo!');

		const color = role.hexColor.replace('#', '');
		const embed = new MessageEmbed()
			.setColor(role.color)
			.setImage(`https://dummyimage.com/150x50/${color}/000000&text=${color}`);

		return message.util!.send(embed);
	}
}
