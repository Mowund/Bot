import { Message, MessageEmbed } from 'discord.js';
import { CustomCommand } from '../../classes/command';

export default class extends CustomCommand {
	public constructor() {
		super({
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS', 'MANAGE_ROLES'],
			description: {
				help: 'Remove a cor do cargo',
				args: '',
			},
		});
	}

	public async exec(message: Message): Promise<Message | Message[]> {
		const role = message.guild!.roles.find(r => r.name === `USER-${message.author!.id}`);
		if (!role) return message.util!.send('Você não tem um cargo!');

		await role.delete();

		const color = role.hexColor.replace('#', '');
		const embed = new MessageEmbed()
			.setColor(role.color)
			.setFooter('Removed role')
			.setImage(`https://dummyimage.com/150x50/${color}/000000&text=${color}`);

		return message.util!.send(embed);
	}
}
