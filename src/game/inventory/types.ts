export type ItemType =
  | "scrap"
  | "ammo"
  | "medkit"
  | "electronics"
  | "food"
  | "valuable";

export type InventoryItem = {
  type: ItemType;
  amount: number;
};
