import localStorage from './local-storage';
import { HydrateableType, inferType, narrowIfHydrateable } from './type-transforms';

export type CapsuleConfig = {
  /**
   * Whether to hydrate date strings into Date objects when reading from localStorage.
   * _Timezone information will be lost_
   */
  hydrateDates?: boolean,
}

export const DEFAULT_CONFIG: CapsuleConfig = {
  hydrateDates: true,
}

type CapsuleValue <T> = {
  __data__: T,
  __type__?: HydrateableType,
};

const DELIMITER = '_';

export const toDataString = <T = any>(data: T, {
  transforms = {},
}: {
  transforms: {
    Date?: boolean,
  },
} = {
  transforms: {},
}): string => {
  const type = inferType(data);

  let transformedData: T | string = data;

  if (type === 'date' && transforms.Date) {
    transformedData = (data as unknown as Date).toJSON();
  }

  const capsuleValue: CapsuleValue<typeof transformedData> = {
    '__data__': transformedData,
    '__type__': narrowIfHydrateable(type),
  };

  return JSON.stringify(capsuleValue);
}

export const fromDataString = <T = any>(raw: string, {
  transforms = {},
}: {
  transforms: {
    Date?: boolean,
  },
} = {
  transforms: {},
}): T => {
  const parsedCapsuleValue: CapsuleValue<T> = JSON.parse(raw);

  if (parsedCapsuleValue.__type__ === 'date' && transforms.Date) {
    return new Date(parsedCapsuleValue.__data__ as unknown as string) as unknown as T;
  }

  return parsedCapsuleValue.__data__;
}

export class Capsule<T extends Record<string, unknown>> {
  private readonly prefix: string;
  private keys: Set<keyof T>;
  private config: CapsuleConfig;
  private get prefixDel(): string {
    return `${this.prefix}${DELIMITER}`;
  }
  get typeref(): T { return null };

  constructor(prefix: string, data: Partial<T> = {}, config: CapsuleConfig = {}) {
    this.prefix = prefix || '';
    this.keys = new Set();
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    this.setDefaults(data);
    this.sync();
  }

  private setDefaults(data: Partial<T> = {}) {
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

  private unprefixKey_(pre_key: string): keyof T {
    return pre_key.replace(new RegExp(this.prefixDel), '');
  }

  private prefixKey_(key: keyof T): string {
    return `${this.prefixDel}${String(key)}`;
  }

  public has(key: keyof T): boolean {
    const pre_key = this.prefixKey_(key);

    return localStorage.hasOwnProperty(pre_key);
  }

  public set<K extends keyof T, V = T[K]>(key: K, value: V): void {
    const pre_key = this.prefixKey_(key);
    this.keys.add(key);

    try {
      const dataString = toDataString(value, {
        transforms: {
          'Date': this.config.hydrateDates,
        },
      });
      localStorage.setItem(pre_key, dataString);
    } catch (e) {
      console.warn(`Capsule (${this.prefix}) failed to save '{ ${String(key)}: ${value} }'. localStorage may be full.`);
      throw new Error(`Capsule (${this.prefix}) failed to save '{ ${String(key)}: ${value} }'. localStorage may be full.`);
    }
  }

  public get<K extends keyof T, V = T[K]>(key: K, defaultValue: V = undefined): V {
    const pre_key = this.prefixKey_(key);

    if(!localStorage.hasOwnProperty(pre_key)) {
      return defaultValue;
    }

    try {
      const dataString = localStorage.getItem(pre_key);
      return fromDataString<V>(dataString, {
        transforms: {
          'Date': this.config.hydrateDates,
        },
      });
    } catch (e) {
      console.warn(`Capsule (${this.prefix}) could not load the item with key: ${String(key)}`);
      throw new Error(`Capsule (${this.prefix}) could not load the item with key: ${String(key)}`);
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
