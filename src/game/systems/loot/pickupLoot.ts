import * as Phaser from "phaser";

import type { Loot } from "../../entities/loot";
import type { RaidInventory } from "../../inventory/raidInventory";

import { addItemToInventory } from "../../inventory/raidInventory";

type PickupLootParams = {
  player: Phaser.Physics.Arcade.Sprite;
  loot: Loot[];
  inventory: RaidInventory;
  pickupDistance: number;
};

export const pickupLoot = ({
  player,
  loot,
  inventory,
  pickupDistance,
}: PickupLootParams) => {
  const item = loot.find((lootItem) => {
    if (!lootItem.sprite.active) {
      return false;
    }

    const distance = Phaser.Math.Distance.Between(
      player.x,
      player.y,
      lootItem.sprite.x,
      lootItem.sprite.y,
    );

    return distance <= pickupDistance;
  });

  if (!item) {
    return inventory;
  }

  item.sprite.destroy();

  return addItemToInventory(inventory, item.type, 1);
};
