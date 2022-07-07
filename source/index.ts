import localStorage from '@yootil/capsule/local-storage';

type CapsuleValue <T> = {
  __data__: T,
};

const DELIMITER = '_';

export const toDataString = <T = any>(data: T): string => {
  const capsuleValue: CapsuleValue<T> = {
    '__data__': data,
  };
  return JSON.stringify(capsuleValue);
}

export const fromDataString = <T = any>(raw: string): T => {
  const parsed: CapsuleValue<T> = JSON.parse(raw);
  return parsed.__data__;
}

export class Capsule {
  private readonly prefix: string;
  private keys: Set<string>;
  private get prefixDel(): string {
    return `${this.prefix}${DELIMITER}`;
  }

  constructor(prefix: string, data: Object) {
    this.prefix = prefix || '';
    this.keys = new Set();

    this.setDefaults(data);
    this.sync();
  }

  private setDefaults(data: Object = {}) {
    for(let key in data) {
      if(data.hasOwnProperty(key) && !this.has(key)) {
        this.set(key, data[key]);
      }
    }
  }

  private sync() {
    for(let pre_key in localStorage) {
      if(localStorage.hasOwnProperty(pre_key)) {
        if(pre_key.indexOf(this.prefixDel) === 0) {
          const key = this.unprefixKey_(pre_key);
          this.keys.add(key);
        }
      }
    }
  }

  private unprefixKey_(pre_key: string): string {
    return pre_key.replace(new RegExp(this.prefixDel), '');
  }

  private prefixKey_(key: string): string {
    return `${this.prefixDel}${key}`;
  }

  public has(key: string): boolean {
    const pre_key = this.prefixKey_(key);

    return localStorage.hasOwnProperty(pre_key);
  }

  public set(key: string, value: any): void {
    const pre_key = this.prefixKey_(key);
    this.keys.add(key);

    try {
      const dataString = toDataString(value);
      localStorage.setItem(pre_key, dataString);
    } catch (e) {
      console.warn(`Capsule (${this.prefix}) failed to save '{ ${key}: ${value} }'. localStorage may be full.`);
      throw new Error(`Capsule (${this.prefix}) failed to save '{ ${key}: ${value} }'. localStorage may be full.`);
    }
  }

  public get<T>(key: string, defaultValue: T = undefined): T {
    const pre_key = this.prefixKey_(key);

    if(!localStorage.hasOwnProperty(pre_key)) {
      return defaultValue;
    }

    try {
      const dataString = localStorage.getItem(pre_key);
      return fromDataString<T>(dataString);
    } catch (e) {
      console.warn(`Capsule (${this.prefix}) could not load the item with key: ${key}`);
      throw new Error(`Capsule (${this.prefix}) could not load the item with key: ${key}`);
    }
  }

  public remove(key: string): void {
    const pre_key = this.prefixKey_(key);
    this.keys.delete(key);

    localStorage.removeItem(pre_key);
  }

  public flush() {
    Array.from(this.keys).forEach((key: string) => {
      this.remove(key);
    });
  }
}
