import * as Phaser from "phaser";

import type { Loot } from "../../entities/loot";
import type { RaidInventory } from "../../inventory/raidInventory";

import {
  addItemToInventory,
  getItemAmount,
} from "../../inventory/raidInventory";

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
    return {
      inventory,
      pickedUp: false,
    };
  }

  const beforeAmount = getItemAmount(inventory, item.type);

  const nextInventory = addItemToInventory(inventory, item.type, item.amount);

  const afterAmount = getItemAmount(nextInventory, item.type);

  const addedAmount = afterAmount - beforeAmount;

  if (addedAmount <= 0) {
    return {
      inventory,
      pickedUp: false,
    };
  }

  item.amount -= addedAmount;

  if (item.amount <= 0) {
    item.sprite.destroy();
  }

  return {
    inventory: nextInventory,
    pickedUp: true,
  };
};
