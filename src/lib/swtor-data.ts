import { LucideIcon } from "lucide-react";

export type LevelData = {
  level: number;
  xpToNextLevel: number;
  itemXp: {
    premium: number;
    prototype: number;
    artifact: number;
  }
};

export type GiftInfo = {
  name: string;
  type: string;
  imageUrl: string;
};

export type Companion = {
  id: string;
  name: string;
  imageUrl: string;
  gifts: {
    artifact: GiftInfo;
    prototype: GiftInfo;
    premium: GiftInfo;
  }
};

export const MAX_LEVEL = 50;
export const MIN_LEVEL = 1;
