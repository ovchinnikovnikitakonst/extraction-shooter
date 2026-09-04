import {
  getItemAmount,
  removeItemFromInventory,
} from "../../inventory/raidInventory";

import type { RaidInventory } from "../../inventory/raidInventory";

import type { PlayerState } from "../playerState";

type UseMedkitParams = {
  playerState: PlayerState;
  inventory: RaidInventory;
  healAmount: number;
};

export const useMedkit = ({
  playerState,
  inventory,
  healAmount,
}: UseMedkitParams) => {
  const medkitAmount = getItemAmount(inventory, "medkit");

  if (medkitAmount <= 0 || playerState.hp >= playerState.maxHp) {
    return {
      playerState,
      inventory,
    };
  }

  return {
    playerState: {
      ...playerState,
      hp: Math.min(playerState.maxHp, playerState.hp + healAmount),
    },

    inventory: removeItemFromInventory(inventory, "medkit", 1),
  };
};
