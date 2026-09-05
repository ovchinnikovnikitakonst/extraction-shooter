export type EnemyType = "normal" | "fast" | "tank";

export const ENEMY_CONFIG = {
  normal: {
    hp: 60,
    speed: 100,
    damage: 10,
    color: 0xff3333,
    size: 40,
  },

  fast: {
    hp: 35,
    speed: 180,
    damage: 7,
    color: 0xffff33,
    size: 32,
  },

  tank: {
    hp: 180,
    speed: 60,
    damage: 20,
    color: 0x9933ff,
    size: 60,
  },
} as const;
