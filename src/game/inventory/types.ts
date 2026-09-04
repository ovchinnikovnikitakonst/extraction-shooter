export type ItemType = "scrap" | "ammo" | "medkit";

export type InventoryItem = {
  type: ItemType;
  amount: number;
};
