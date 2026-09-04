import * as Phaser from "phaser";

import type { LootCrate } from "../../entities/lootCrate";
import type { RaidInventory } from "../../inventory/raidInventory";

import { addItemToInventory } from "../../inventory/raidInventory";

type OpenLootCrateParams = {
  player: Phaser.Physics.Arcade.Sprite;
  crate: LootCrate;
  inventory: RaidInventory;
  interactDistance: number;
};

export const openLootCrate = ({
  player,
  crate,
  inventory,
  interactDistance,
}: OpenLootCrateParams) => {
  if (crate.opened) {
    return {
      inventory,
      opened: false,
    };
  }

  const distance = Phaser.Math.Distance.Between(
    player.x,
    player.y,
    crate.sprite.x,
    crate.sprite.y,
  );

  if (distance > interactDistance) {
    return {
      inventory,
      opened: false,
    };
  }

  const nextInventory = addItemToInventory(inventory, crate.lootType, 1);

  if (nextInventory === inventory) {
    return {
      inventory,
      opened: false,
    };
  }

  crate.opened = true;

  crate.sprite.setFillStyle(0x444444, 1);

  return {
    inventory: nextInventory,
    opened: true,
  };
};
