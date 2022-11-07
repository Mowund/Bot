/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

import { firestore } from 'firebase-admin';
import { CachedManager, Collection, DiscordjsErrorCodes, DiscordjsTypeError, Snowflake, User } from 'discord.js';
import { App } from '../App.js';
import { removeEmpty, SearchOptions, testConditions } from '../../src/utils.js';
import { UserData, UserDataSetOptions } from '../structures/UserData.js';
import { ReminderData } from '../structures/ReminderData.js';

export class DatabaseUsersManager extends CachedManager<Snowflake, UserData, UsersDatabaseResolvable> {
  declare client: App;

  constructor(client: App) {
    super(client, UserData);
  }

  async set(user: UsersDatabaseResolvable, data: UserDataSetOptions, { merge = true, setFromCache = false } = {}) {
    const id = this.resolveId(user);
    if (!id) throw new DiscordjsTypeError(DiscordjsErrorCodes.InvalidType, 'user', 'UsersDatabaseResolvable', true);

    const db = this.client.firestore.collection('users').doc(id),
      existing = this.cache.get(id);
    let cachedData =
        (existing ||
          (((await db.get()) as firestore.DocumentSnapshot<firestore.DocumentData>)?.data() as UserData | undefined)) ??
        null,
      newData = existing ? data : Object.assign(data, { id });

    if (cachedData) cachedData.reminders = await this.fetchAllReminders(id);
    if (!existing) {
      cachedData = new UserData(this.client, Object.assign(Object.create(cachedData), newData));
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

    let data = (await this.client.firestore.collection('users').doc(id).get()).data() as UserData | undefined;
    const reminders = await this.fetchAllReminders(id, { cache: cache });

    if (!data && !reminders.size) return;

    data = new UserData(this.client, Object.assign(Object.create(data), reminders.size ? { id, reminders } : data));
    if (cache) {
      if (existing) existing.patch(data);
      else this.cache.set(id, data);
    }
    return data;
  }

  async fetchAllReminders(user: Snowflake, { cache = true, force = false } = {}) {
    const id = this.resolveId(user);
    if (!id) throw new DiscordjsTypeError(DiscordjsErrorCodes.InvalidType, 'user', 'UsersDatabaseResolvable', true);

    const existing = this.client.database.reminders.cache.filter(r => r.userId === id);
    if (!force && existing.size) return existing;

    const reminders = new Collection<string, ReminderData>();
    (await this.client.firestore.collection('users').doc(id).collection('reminders').get()).docs
      .map(doc => {
        const d = doc.data();
        return new ReminderData(this.client, Object.assign(Object.create(d), d));
      })
      .forEach(r => reminders.set(r.id, r));

    if (cache) {
      reminders.forEach(
        r =>
          (cache && existing.find(r2 => r2.id === r.id)?.patch(r)) || this.client.database.reminders.cache.set(r.id, r),
      );
    }
    return reminders;
  }

  async find(search: SearchOptions[][], { cache = true, returnCache = false } = {}) {
    const existing = this.cache.filter(r => testConditions(search, r));
    if (returnCache && existing.size) return existing;

    const data = new Collection<Snowflake, UserData>();
    let db: firestore.Query<firestore.DocumentData> = this.client.firestore.collection('guilds');

    for (const x of search) {
      x.forEach(y => (db = db.where(y.field, y.operator, y.target)));
      for (const z of (await db.get()).docs) {
        const d = z.data();
        data.set(z.id, new UserData(this.client, Object.assign(Object.create(d), d)));
      }
    }

    if (cache) {
      data.forEach(async d => {
        const cachedData = this.cache.get(d.id);
        if (cachedData) {
          cachedData.patch(d);
        } else {
          this.cache.set(d.id, d);
          await this.client.database.users.fetchAllReminders(d.id);
        }
      });
    }

    return data;
  }

  async delete(user, { leaveCached = false } = {}) {
    const id = this.resolveId(user);
    if (!id) throw new DiscordjsTypeError(DiscordjsErrorCodes.InvalidType, 'user', 'UsersDatabaseResolvable', true);

    await this.client.firestore.collection('users').doc(id).delete();
    if (!leaveCached) this.cache.delete(id);
    return this.cache;
  }
}

export type UsersDatabaseResolvable = Snowflake | UserData | User;
