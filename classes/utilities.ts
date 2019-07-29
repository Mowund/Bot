export function code(input: string): string {
	return `\`${input.replace('`', '‵')}\``;
}
