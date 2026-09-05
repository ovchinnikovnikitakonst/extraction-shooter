import type { ArmorType } from "./armorConfig";

let ownedArmor: ArmorType[] = [];

let selectedArmor: ArmorType | null = null;

export const getOwnedArmor = () => {
  return ownedArmor;
};

export const hasArmor = (type: ArmorType) => {
  return ownedArmor.includes(type);
};

export const buyArmor = (type: ArmorType) => {
  if (hasArmor(type)) {
    return false;
  }

  ownedArmor = [...ownedArmor, type];

  return true;
};

export const getSelectedArmor = () => {
  return selectedArmor;
};

export const selectArmor = (type: ArmorType) => {
  if (!hasArmor(type)) {
    return false;
  }

  selectedArmor = type;

  return true;
};

export const clearSelectedArmor = () => {
  selectedArmor = null;
};
