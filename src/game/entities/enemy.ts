import * as Phaser from "phaser";

import type { EnemyState } from "../systems/enemyState";
import type { EnemyType } from "../config/enemyConfig";

export type Enemy = {
  sprite: Phaser.Physics.Arcade.Sprite;
  state: EnemyState;
  aggro: boolean;
  type: EnemyType;
};
