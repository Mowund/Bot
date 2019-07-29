import { Snowflake } from 'discord.js';
import { Column, Entity, getRepository, PrimaryColumn } from 'typeorm';

@Entity({ name: 'guilds' })
export class GuildEntity {
	@PrimaryColumn()
	public id!: Snowflake;

	@Column({ 'default': 'h!' })
	public prefix!: string;

	public async updatePrefix(prefix: string): Promise<void> {
		const repository = getRepository(GuildEntity);
		await GuildEntity.get(this.id);
		await repository.update(this.id, { prefix });
	}

	public static async get(id: Snowflake): Promise<GuildEntity> {
		const repository = getRepository(GuildEntity);
		let entity = await repository.findOne(id);
		if (!entity) {
			entity = repository.create({ id });
			await repository.insert(entity);
		}

		return entity;
	}
}
