export type WeaponType = "pistol" | "rifle";

export type WeaponConfig = {
  damage: number;
  fireRate: number;
  magazineSize: number;
  reloadTime: number;
  price: number;
};

export const WEAPON_CONFIG: Record<WeaponType, WeaponConfig> = {
  pistol: {
    damage: 20,
    fireRate: 400,
    magazineSize: 12,
    reloadTime: 1200,
    price: 300,
  },

  rifle: {
    damage: 35,
    fireRate: 150,
    magazineSize: 30,
    reloadTime: 1800,
    price: 1000,
  },
};
