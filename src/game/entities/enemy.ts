import * as Phaser from "phaser";
import type { EnemyState } from "../systems/enemyState";

export type Enemy = {
  sprite: Phaser.Physics.Arcade.Sprite;
  state: EnemyState;
  aggro: boolean;
};
