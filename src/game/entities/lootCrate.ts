import * as Phaser from "phaser";
import type { ItemType } from "../inventory/types";

export type LootCrate = {
  sprite: Phaser.GameObjects.Rectangle;
  opened: boolean;
  lootType: ItemType;
};
