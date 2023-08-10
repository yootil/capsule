export type VanillaStorableType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null';
export const HYDRATEABLE_TYPES = ['date'] as const;
export type HydrateableType = typeof HYDRATEABLE_TYPES[number];
export type StorableType = VanillaStorableType | HydrateableType;

export const inferType = (value: any): StorableType | undefined => {
  if (value === undefined) {
    return undefined
  }

  if (value === null) {
    return 'null';
  }

  if (value instanceof Date) {
    if (!isNaN(value.getTime())) {
      return 'date';
    } else {
      return undefined;
    }
  }

  if (Array.isArray(value)) {
    return 'array';
  }

  const type = typeof value;

  if (type === 'string' || type === 'number' || type === 'boolean' || type === 'object') {
    return type;
  }

  // Not a supported type
  return undefined
}

export const narrowIfHydrateable = (type: StorableType): HydrateableType | undefined => {
  return HYDRATEABLE_TYPES.includes(type as HydrateableType) ? type as HydrateableType : undefined;
}

export const dateToJSON = (date: Date): string => {
  return date.toJSON();
}

export const dateFromJSON = (isoString: string): Date => {
  return new Date(isoString);
}