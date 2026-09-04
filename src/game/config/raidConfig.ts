export const RAID_CONFIG = {
  world: {
    width: 2000,
    height: 2000,
    gridSize: 200,
  },

  player: {
    spawn: {
      x: 200,
      y: 200,
    },
    speed: 250,
    hp: 100,
    startingAmmo: 10,
  },

  enemy: {
    speed: 100,
    hp: 3,
    damage: 10,
    aggroDistance: 250,
    loseAggroDistance: 400,
    hitCooldown: 500,
  },

  bullet: {
    speed: 700,
    damage: 1,
  },

  loot: {
    pickupDistance: 70,
  },

  extraction: {
    x: 1800,
    y: 1800,
    size: 120,
    interactDistance: 80,
  },

  weapon: {
    magazineSize: 5,
  },

  medkit: {
    healAmount: 30,
  },

  inventory: {
    maxSlots: 6,
  },

  lootCrate: {
    interactDistance: 90,
  },
} as const;
