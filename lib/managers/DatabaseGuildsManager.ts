/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

import { firestore } from 'firebase-admin';
import { CachedManager, Collection, DiscordjsErrorCodes, DiscordjsTypeError, Guild, Snowflake } from 'discord.js';
import { App } from '../App.js';
import { removeEmpty, SearchOptions, testConditions } from '../../src/utils.js';
import { GuildData, GuildDataSetOptions } from '../structures/GuildData.js';

export class DatabaseGuildsManager extends CachedManager<Snowflake, GuildData, GuildsDatabaseResolvable> {
  declare client: App;

  constructor(client: App) {
    super(client, GuildData);
  }

  async set(guild: GuildsDatabaseResolvable, data: GuildDataSetOptions, { merge = true, setFromCache = false } = {}) {
    const id = this.resolveId(guild);
    if (!id) throw new DiscordjsTypeError(DiscordjsErrorCodes.InvalidType, 'guild', 'GuildsDatabaseResolvable', true);

    const db = this.client.firestore.collection('guilds').doc(id),
      existing = this.cache.get(id);
    let cachedData =
        (existing ||
          (((await db.get()) as firestore.DocumentSnapshot<firestore.DocumentData>)?.data() as
            | GuildData
            | undefined)) ??
        null,
      newData = existing ? data : Object.assign(data, { id });

    if (!existing) {
      cachedData = new GuildData(this.client, Object.assign(Object.create(cachedData), newData));
      this.cache.set(id, cachedData);
    } else {
      cachedData.patch(newData);
    }

    if (setFromCache) newData = cachedData;
    await (db as firestore.DocumentReference<firestore.DocumentData>).set(removeEmpty(newData), {
      merge: merge,
    });

    return cachedData;
  }

  async fetch(id: Snowflake, { cache = true, force = false } = {}) {
    const existing = this.cache.get(id);
    if (!force && existing) return existing;

    let data = (await this.client.firestore.collection('guilds').doc(id).get()).data() as GuildData | undefined;
    if (!data) return;

    data = new GuildData(this.client, Object.assign(Object.create(data), data));
    if (cache) {
      if (existing) existing.patch(data);
      else this.cache.set(id, data);
    }
    return data;
  }

  async find(search: SearchOptions[][], { cache = true, returnCache = false } = {}) {
    const existing = this.cache.filter(r => testConditions(search, r));
    if (returnCache && existing.size) return existing;

    const data = new Collection<Snowflake, GuildData>();
    let db: firestore.Query<firestore.DocumentData> = this.client.firestore.collection('guilds');

    for (const x of search) {
      x.forEach(y => (db = db.where(y.field, y.operator, y.target)));
      for (const z of (await db.get()).docs) {
        const d = z.data();
        data.set(z.id, new GuildData(this.client, Object.assign(Object.create(d), d)));
      }
    }

    if (cache) {
      data.forEach(d => {
        const cachedData = this.cache.get(d.id);
        if (cachedData) cachedData.patch(d);
        else this.cache.set(d.id, d);
      });
    }

    return data;
  }

  async delete(guild: GuildsDatabaseResolvable, { leaveCached = false } = {}) {
    const id = this.resolveId(guild);
    if (!id) throw new DiscordjsTypeError(DiscordjsErrorCodes.InvalidType, 'guild', 'GuildsDatabaseResolvable', true);

    await this.client.firestore.collection('guilds').doc(id).delete();
    if (!leaveCached) this.cache.delete(id);
    return this.cache;
  }
}

export type GuildsDatabaseResolvable = Snowflake | GuildData | Guild;
