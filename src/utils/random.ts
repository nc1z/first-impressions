export interface RandomSource {
  next(): number;
  pick<T>(values: T[]): T;
  shuffle<T>(values: T[]): T[];
  integer(min: number, max: number): number;
}

export function createRandomSource(seed: number): RandomSource {
  let state = seed >>> 0;

  const next = (): number => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    pick<T>(values: T[]): T {
      if (values.length === 0) {
        throw new Error("Cannot pick from an empty array.");
      }

      return values[Math.floor(next() * values.length)] as T;
    },
    shuffle<T>(values: T[]): T[] {
      const clone = [...values];

      for (let index = clone.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(next() * (index + 1));
        [clone[index], clone[swapIndex]] = [clone[swapIndex] as T, clone[index] as T];
      }

      return clone;
    },
    integer(min: number, max: number): number {
      return Math.floor(next() * (max - min + 1)) + min;
    },
  };
}

export function createSeedFromText(value: string): number {
  let hash = 2166136261;

  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}
