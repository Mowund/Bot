import { CustomListener } from '../../classes/listener';
import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { code } from '../../classes/utilities';

export default class extends CustomListener {
	public async exec(error: Error, message: Message, command: Command): Promise<void> {
		const { DISCORD_WEBHOOK_ID, DISCORD_WEBHOOK_TOKEN } = process.env;
		if (!DISCORD_WEBHOOK_ID || !DISCORD_WEBHOOK_TOKEN) return;

		const webhook = await this.client.fetchWebhook(DISCORD_WEBHOOK_ID, DISCORD_WEBHOOK_TOKEN);
		const embed = new MessageEmbed()
			.setTitle(`Comando: ${command.id}`)
			.setDescription(`Mensagem: ${code(message.content)}`)
			.setAuthor(message.author!.username, message.author!.displayAvatarURL({ format: 'webp' }))
			.setColor(16711680);

		await webhook.send(error.stack, {
			code: true,
			embeds: [embed],
		});
	}
}
