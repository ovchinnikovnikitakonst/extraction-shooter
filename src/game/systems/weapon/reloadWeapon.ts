import {
  getItemAmount,
  removeItemFromInventory,
} from "../../inventory/raidInventory";

import type { RaidInventory } from "../../inventory/raidInventory";

type ReloadWeaponParams = {
  magazineAmmo: number;
  magazineSize: number;
  inventory: RaidInventory;
};

export const reloadWeapon = ({
  magazineAmmo,
  magazineSize,
  inventory,
}: ReloadWeaponParams) => {
  if (magazineAmmo >= magazineSize) {
    return {
      magazineAmmo,
      inventory,
    };
  }

  const reserveAmmo = getItemAmount(inventory, "ammo");

  if (reserveAmmo <= 0) {
    return {
      magazineAmmo,
      inventory,
    };
  }

  const missingAmmo = magazineSize - magazineAmmo;

  const ammoToLoad = Math.min(missingAmmo, reserveAmmo);

  return {
    magazineAmmo: magazineAmmo + ammoToLoad,

    inventory: removeItemFromInventory(inventory, "ammo", ammoToLoad),
  };
};
