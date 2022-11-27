/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

import { firestore } from 'firebase-admin';
import { CachedManager, Collection, DiscordjsErrorCodes, DiscordjsTypeError, Snowflake, User } from 'discord.js';
import { App } from '../App.js';
import { removeEmpty, SearchOptions, testConditions } from '../../src/utils.js';
import { UserData, UserDataSetOptions } from '../structures/UserData.js';

export class UsersDataManager extends CachedManager<Snowflake, UserData, UsersDatabaseResolvable> {
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

    if (!existing) {
      cachedData = new UserData(this.client, Object.assign(Object.create(cachedData), newData));
      this.cache.set(id, cachedData);
    } else {
      cachedData._patch(newData);
    }

    if (setFromCache) newData = cachedData;
    await (db as firestore.DocumentReference<firestore.DocumentData>).set(removeEmpty(newData), {
      merge: merge,
    });

    return cachedData;
  }

  async fetch(id: Snowflake, { cache = true, force = false } = {}) {
    const existing = this.cache.get(id);
    console.log(existing);
    if (!force && existing) return existing;

    let data = (await this.client.firestore.collection('users').doc(id).get()).data() as UserData | undefined;
    if (!data) return;
    console.log(data);

    data = new UserData(this.client, Object.assign(Object.create(data), data));
    console.log(data);
    if (cache) {
      if (existing) existing._patch(data);
      else this.cache.set(id, data);
    }
    return data;
  }

  async find(search: SearchOptions[][], { cache = true, returnCache = false } = {}) {
    const existing = this.cache.filter(r => testConditions(search, r));
    if (returnCache && existing.size) return existing;

    const data = new Collection<Snowflake, UserData>();
    let db: firestore.Query<firestore.DocumentData> = this.client.firestore.collection('users');

    for (const x of search) {
      x.forEach(y => (db = db.where(y.field, y.operator, y.target)));
      for (const z of (await db.get()).docs) {
        const d = z.data();
        data.set(z.id, new UserData(this.client, Object.assign(Object.create(d), d)));
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

  async delete(user: UsersDatabaseResolvable, { leaveCached = false } = {}) {
    const id = this.resolveId(user);
    if (!id) throw new DiscordjsTypeError(DiscordjsErrorCodes.InvalidType, 'user', 'UsersDatabaseResolvable', true);

    await this.client.firestore.collection('users').doc(id).delete();
    if (!leaveCached) this.cache.delete(id);
    return this.cache;
  }
}

export type UsersDatabaseResolvable = Snowflake | UserData | User;
