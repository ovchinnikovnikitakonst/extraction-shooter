import * as Phaser from "phaser";

import { createEnemy } from "./createEnemy";
import type { Enemy } from "./enemy";

import { RAID_CONFIG } from "../config/raidConfig";
import { createEnemyState } from "../systems/enemyState";

export const createRaidEnemies = (scene: Phaser.Scene): Enemy[] => {
  const { width, height } = RAID_CONFIG.world;

  return [
    {
      sprite: createEnemy(scene, width / 2 + 300, height / 2),
      state: createEnemyState(RAID_CONFIG.enemy.hp),
      aggro: false,
    },
    {
      sprite: createEnemy(scene, width / 2 - 500, height / 2 + 300),
      state: createEnemyState(RAID_CONFIG.enemy.hp),
      aggro: false,
    },
    {
      sprite: createEnemy(scene, width / 2 + 400, height / 2 - 500),
      state: createEnemyState(RAID_CONFIG.enemy.hp),
      aggro: false,
    },
  ];
};
