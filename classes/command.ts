import { Command, CommandOptions } from 'discord-akairo';
import { parse } from 'path';

function getFilename(module: NodeModule): string {
	delete require.cache[module.filename];

	return parse(module.parent!.filename).name;
}

export class CustomCommand extends Command {
	public constructor(options?: CommandOptions) {
		const filename = getFilename(module);
		super(filename, { aliases: [filename], ...options });
	}
}
