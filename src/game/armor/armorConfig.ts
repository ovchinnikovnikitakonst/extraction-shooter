export type ArmorType = "light" | "heavy";

export type ArmorConfig = {
  damageReduction: number;
  durability: number;
  price: number;
};

export const ARMOR_CONFIG: Record<ArmorType, ArmorConfig> = {
  light: {
    damageReduction: 0.2,
    durability: 100,
    price: 500,
  },

  heavy: {
    damageReduction: 0.4,
    durability: 160,
    price: 1200,
  },
};
