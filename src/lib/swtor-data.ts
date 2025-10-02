
export type LevelData = {
  level: number;
  xpToNextLevel: number;
};

export type Companion = {
  id: string;
  name: string;
  imageUrl: string;
  gifts: {
    artifact: string;
    prototype: string;
    premium: string;
  }
};

export const MAX_LEVEL = 50;
export const MIN_LEVEL = 1;
