/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

import { App } from '../App.js';

export class Base {
  public declare readonly client: App;

  constructor(client: App) {
    Object.defineProperty(this, 'client', { value: client });
  }

  _clone() {
    return Object.assign(Object.create(this), this);
  }

  _patch(data: any) {
    return data;
  }

  _update(data: any) {
    const clone = this._clone();
    this._patch(data);
    return clone;
  }
}
