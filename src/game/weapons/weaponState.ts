import type { WeaponType } from "./weaponConfig";

let ownedWeapons: WeaponType[] = ["pistol"];

let selectedWeapon: WeaponType = "pistol";

export const getOwnedWeapons = () => {
  return ownedWeapons;
};

export const hasWeapon = (type: WeaponType) => {
  return ownedWeapons.includes(type);
};

export const buyWeapon = (type: WeaponType) => {
  if (hasWeapon(type)) {
    return false;
  }

  ownedWeapons = [...ownedWeapons, type];

  return true;
};

export const getSelectedWeapon = () => {
  return selectedWeapon;
};

export const selectWeapon = (type: WeaponType) => {
  if (!hasWeapon(type)) {
    return false;
  }

  selectedWeapon = type;

  return true;
};
