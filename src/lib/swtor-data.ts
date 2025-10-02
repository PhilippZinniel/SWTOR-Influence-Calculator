
export type LevelData = {
  level: number;
  xpToNextLevel: number;
};

export const ITEM_XP = {
  PREMIUM: 250, // Green
  PROTOTYPE: 500, // Blue
  ARTIFACT: 1000, // Purple
};

function getXpForLevel(level: number): number {
  if (level >= 1 && level <= 10) return 2000;
  if (level >= 11 && level <= 15) return 3000;
  if (level >= 16 && level <= 20) return 4000;
  if (level >= 21 && level <= 25) return 5000;
  if (level >= 26 && level <= 30) return 6000;
  if (level >= 31 && level <= 35) return 7000;
  if (level >= 36 && level <= 40) return 8000;
  if (level >= 41 && level <= 45) return 9000;
  if (level >= 46 && level < 50) return 10000;
  return 0; // Level 50 is max
}

export const LEVEL_DATA: LevelData[] = Array.from({ length: 50 }, (_, i) => {
  const level = i + 1;
  return {
    level,
    xpToNextLevel: getXpForLevel(level),
  };
});

export const MAX_LEVEL = 50;
export const MIN_LEVEL = 1;

export type Companion = {
  id: string;
  name: string;
  imageUrl: string;
};

export const COMPANIONS: Companion[] = [
  {
    id: "2v-r8",
    name: "2V-R8",
    imageUrl: "https://swtorista.com/articles/wp-content/uploads/2016/12/2vr8.jpg",
  },
  {
    id: "c2-n2",
    name: "C2-N2",
    imageUrl: "https://swtorista.com/articles/wp-content/uploads/2016/12/c2n2.jpg",
  },
  {
    id: "khem-val",
    name: "Khem Val",
    imageUrl: "https://swtorista.com/articles/wp-content/uploads/2015/10/khem-val.jpg",
  },
  {
    id: "vette",
    name: "Vette",
    imageUrl: "https://swtorista.com/articles/wp-content/uploads/2015/10/vette.jpg",
  },
  {
    id: "mako",
    name: "Mako",
    imageUrl: "https://swtorista.com/articles/wp-content/uploads/2015/10/mako.jpg",
  },
  {
    id: "kaliyo-djannis",
    name: "Kaliyo Djannis",
    imageUrl: "https://swtorista.com/articles/wp-content/uploads/2015/10/kaliyo.jpg",
  },
];
