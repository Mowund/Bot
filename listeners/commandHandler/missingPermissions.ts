import { CustomListener } from '../../classes/listener';
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class extends CustomListener {
	public async exec(message: Message, command: Command, type: string, missing: any): Promise<void> {
		await message.util!.send(`Eu preciso de permissão para ${missing}`);
	}
}
