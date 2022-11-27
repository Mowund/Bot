/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

import { firestore } from 'firebase-admin';
import { CachedManager, Collection, DiscordjsErrorCodes, DiscordjsTypeError, Snowflake } from 'discord.js';
import { App } from '../App.js';
import { removeEmpty, SearchOptions, testConditions } from '../../src/utils.js';
import { ReminderData, ReminderDataSetOptions } from '../structures/ReminderData.js';

export class RemindersDataManager extends CachedManager<Snowflake, ReminderData, RemindersDatabaseResolvable> {
  declare client: App;

  constructor(client: App) {
    super(client, ReminderData);
  }

  async set(
    reminder: RemindersDatabaseResolvable,
    userId: Snowflake,
    data: ReminderDataSetOptions,
    { merge = true, setFromCache = false } = {},
  ) {
    const id = this.resolveId(reminder);
    if (!id) throw new DiscordjsTypeError(DiscordjsErrorCodes.InvalidType, 'reminder', 'ReminderData', true);

    const db = this.client.firestore.collection('users').doc(userId).collection('reminders').doc(id),
      existing = this.cache.get(id);
    let cachedData =
        (existing ||
          (((await db.get()) as firestore.DocumentSnapshot<firestore.DocumentData>)?.data() as ReminderData)) ??
        null,
      newData = existing ? data : Object.assign(data, { id });

    if (!existing) {
      cachedData = new ReminderData(this.client, Object.assign(Object.create(cachedData), newData));
      this.cache.set(id, cachedData);
    } else {
      cachedData._patch(newData);
    }

    if (setFromCache) newData = cachedData;
    await db.set(removeEmpty(newData), {
      merge: merge,
    });

    return cachedData;
  }

  async fetch(id: Snowflake, userId: Snowflake, { cache = true, force = false } = {}) {
    const existing = this.cache.get(id);
    if (!force && existing) return existing;

    let data = (
      await this.client.firestore.collection('users').doc(userId).collection('reminders').doc(id).get()
    ).data() as ReminderData | undefined;

    if (!data) return;
    data = new ReminderData(this.client, Object.assign(Object.create(data), data));

    if (cache) {
      if (existing) existing._patch(data);
      else this.cache.set(id, data);
    }

    return data;
  }

  async find(search: SearchOptions[][], { cache = true, returnCache = false } = {}) {
    const existing = this.cache.filter(r => testConditions(search, r));
    if (returnCache && existing.size) return existing;

    const data = new Collection<Snowflake, ReminderData>();
    let db: firestore.Query<firestore.DocumentData> = this.client.firestore.collectionGroup('reminders');

    for (const x of search) {
      x.forEach(y => (db = db.where(y.field, y.operator, y.target)));
      for (const z of (await db.get()).docs) {
        const d = z.data();
        data.set(z.id, new ReminderData(this.client, Object.assign(Object.create(d), d)));
      }
    }

    if (cache) {
      data.forEach(d => {
        const cachedData = this.cache.get(d.id);
        if (cachedData) cachedData._patch(d);
        else this.cache.set(d.id, d);
      });
    }

    return data;
  }

  async delete(reminder: RemindersDatabaseResolvable, userId: Snowflake, { leaveCached = false } = {}) {
    const id = this.resolveId(reminder);
    if (!id) throw new DiscordjsTypeError(DiscordjsErrorCodes.InvalidType, 'reminder', 'ReminderData', true);

    await this.client.firestore.collection('users').doc(userId).collection('reminders').doc(id).delete();
    if (!leaveCached) this.cache.delete(id);

    return this.cache;
  }
}

export type RemindersDatabaseResolvable = Snowflake | ReminderData;
