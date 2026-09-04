import * as Phaser from "phaser";

import type { ItemType } from "../inventory/types";

export type Loot = {
  sprite: Phaser.Physics.Arcade.Image;
  type: ItemType;
  amount: number;
};
