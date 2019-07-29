import { CollectorFilter, Message, MessageEmbed, RoleData } from 'discord.js';
import { CustomCommand } from '../../classes/command';
import tinycolor from 'tinycolor2';
import { code } from '../../classes/utilities';

export default class extends CustomCommand {
	public constructor() {
		super({
			aliases: ['change', 'color', 'colour'],
			args: [{
				id: 'color',
				type: (_, phrase) => phrase ? tinycolor(phrase) : tinycolor.random(),
				match: 'content',
			}],
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS', 'MANAGE_MESSAGES'],
			description: {
				help: 'Mudar a cor do cargo',
				args: '(cor opcional)',
			},
		});
	}

	public async exec(message: Message, { color }: { color: tinycolor.Instance }): Promise<Message | Message[]> {
		if (!message.guild!.me!.hasPermission('MANAGE_ROLES')) return message.util!.send('Eu preciso de permissão para gerenciar cargos.');
		if (!color.isValid()) return message.util!.send('Invalid input', { embed: undefined });

		return this.pickColor(message, color);
	}

	private async pickColor(message: Message, color: tinycolor.Instance): Promise<Message | Message[]> {
		const embed = new MessageEmbed()
			.setColor(color.toHex())
			.setFooter('Você gostaria desta cor?')
			.setImage(`https://dummyimage.com/150x50/${color.toHex()}/000000&text=${color.toHex()}`);
		const response = await message.util!.send(embed) as Message;

		const reactions = ['🔄', '✅', '❌'];
		const filter: CollectorFilter = (reaction, user): boolean => reactions.includes(reaction.emoji.name) && user === message.author;
		const promise = response.awaitReactions(filter, { time: 1000 * 60, max: 1 });
		for (const emoji of reactions) await response.react(emoji);

		const reaction = (await promise).first();
		if (!reaction) {
			await response.reactions.removeAll();
			return message.util!.send('Tempo esgotado', { embed: undefined });
		}

		switch (reaction.emoji.name) {
			case reactions[0]: {
				await reaction.users.remove(message);
				return this.pickColor(message, tinycolor.random());
			}

			case reactions[1]: {
				await response.reactions.removeAll();
				return this.confirmColor(message, color);
			}

			case reactions[2]: {
				await response.reactions.removeAll();
				return message.util!.send('Cancelado', { embed: undefined });
			}
		}

		return response;
	}

	private async confirmColor(message: Message, color: tinycolor.Instance): Promise<Message | Message[]> {
		const managedRole = message.guild!.me!.roles.find(r => r.managed);
		const highestRole = message.guild!.me!.roles.highest;
		const data: RoleData = {
			color: color.toHex() === '000000' ? '000001' : color.toHex(),
			name: `USER-${message.author!.id}`,
			permissions: [],
			position: managedRole ? managedRole.position - 1 : 0,
		};
		const role = message.guild!.roles.find(r => r.name === data.name);
		const embed = new MessageEmbed()
			.setColor(data.color!)
			.setFooter('Alterada')
			.setImage(`https://dummyimage.com/150x50/${data.color}/000000&text=${data.color}`);

		if (role) {
			if (role.position > highestRole.position) {
				return message.util!.send(`${code(role.name)} está acima ${code(highestRole.name)}`, { embed: undefined });
			}

			await role.edit(data);
		} else {
			const hexRole = await message.guild!.roles.create({ data });
			await message.member!.roles.add(hexRole);
		}

		return message.util!.send(embed);
	}
}
