import * as Phaser from "phaser";
import type { InventoryItem } from "../inventory/types";

export type LootCrate = {
  sprite: Phaser.GameObjects.Rectangle;
  opened: boolean;
  items: InventoryItem[];
};
