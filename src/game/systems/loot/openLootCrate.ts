import * as Phaser from "phaser";

import type { LootCrate } from "../../entities/lootCrate";
import type { RaidInventory } from "../../inventory/raidInventory";
import type { ItemType } from "../../inventory/types";

import { addItemToInventory } from "../../inventory/raidInventory";

type OpenLootCrateParams = {
  player: Phaser.Physics.Arcade.Sprite;
  crate: LootCrate;
  inventory: RaidInventory;
  interactDistance: number;
};

const getRandomLootType = (): ItemType => {
  const roll = Math.random();

  if (roll < 0.25) return "scrap";
  if (roll < 0.45) return "ammo";
  if (roll < 0.6) return "medkit";
  if (roll < 0.75) return "electronics";
  if (roll < 0.9) return "food";

  return "valuable";
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

  const lootType = getRandomLootType();

  const nextInventory = addItemToInventory(inventory, lootType, 1);

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
