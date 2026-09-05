import * as Phaser from "phaser";

import { createEnemy } from "./createEnemy";
import type { Enemy } from "./enemy";

import { createEnemyState } from "../systems/enemyState";

import { ENEMY_CONFIG, type EnemyType } from "../config/enemyConfig";

type Point = {
  x: number;
  y: number;
};

type SpawnArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type IsWalkablePoint = (x: number, y: number) => boolean;

const MIN_SPAWN_DISTANCE = 55;
const MAX_SPAWN_ATTEMPTS = 500;

const getRandomEnemyType = (): EnemyType => {
  const roll = Phaser.Math.Between(1, 100);

  if (roll <= 10) {
    return "tank";
  }

  if (roll <= 30) {
    return "fast";
  }

  return "normal";
};

const createEnemyAt = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  groupId?: number,
): Enemy => {
  const type = getRandomEnemyType();

  const config = ENEMY_CONFIG[type];

  return {
    sprite: createEnemy(scene, x, y, type),

    state: createEnemyState(config.hp),

    aggro: false,

    type,

    groupId,
  };
};

const getRandomPointInArea = (area: SpawnArea): Point => ({
  x: Phaser.Math.Between(area.x, area.x + area.width),
  y: Phaser.Math.Between(area.y, area.y + area.height),
});

const isPointFarEnough = (point: Point, points: Point[]): boolean => {
  return points.every((existingPoint) => {
    const distance = Phaser.Math.Distance.Between(
      point.x,
      point.y,
      existingPoint.x,
      existingPoint.y,
    );

    return distance >= MIN_SPAWN_DISTANCE;
  });
};

const createSpawnPoints = (
  area: SpawnArea,
  count: number,
  isWalkablePoint: IsWalkablePoint,
): Point[] => {
  const points: Point[] = [];

  let attempts = 0;

  while (points.length < count && attempts < MAX_SPAWN_ATTEMPTS) {
    const point = getRandomPointInArea(area);

    const isWalkable = isWalkablePoint(point.x, point.y);

    const isFarEnough = isPointFarEnough(point, points);

    if (isWalkable && isFarEnough) {
      points.push(point);
    }

    attempts++;
  }

  return points;
};

export const createRaidEnemies = (
  scene: Phaser.Scene,
  isWalkablePoint: IsWalkablePoint,
): Enemy[] => {
  const enemies: Enemy[] = [];

  // REGULAR ENEMIES

  const regularPositions: Point[] = [
    // START / STORAGE
    { x: 1300, y: 800 },
    { x: 1600, y: 1100 },
    { x: 2000, y: 900 },
    { x: 2300, y: 1300 },
    { x: 2600, y: 1600 },

    // FACTORY
    { x: 3000, y: 2200 },
    { x: 3300, y: 2500 },
    { x: 3600, y: 2900 },
    { x: 4000, y: 2300 },
    { x: 4300, y: 2700 },
    { x: 4700, y: 3200 },
    { x: 5000, y: 2600 },
    { x: 5400, y: 3000 },
    { x: 2900, y: 3400 },
    { x: 2400, y: 3200 },

    // FACTORY DEAD END
    { x: 1500, y: 3200 },
    { x: 1800, y: 3500 },
    { x: 2100, y: 3300 },

    // UNDERGROUND
    { x: 1800, y: 4600 },
    { x: 1600, y: 5000 },
    { x: 1600, y: 5400 },
    { x: 1600, y: 5800 },
    { x: 2100, y: 6100 },
    { x: 2500, y: 6100 },
    { x: 2900, y: 6200 },

    // UNDERGROUND SIDE
    { x: 800, y: 5200 },
    { x: 1100, y: 5400 },

    // DEAD END A
    { x: 800, y: 6800 },
    { x: 1100, y: 7100 },
    { x: 1500, y: 7400 },

    // ADMIN
    { x: 6500, y: 2500 },
    { x: 6800, y: 2900 },
    { x: 7100, y: 3300 },
    { x: 7400, y: 2600 },
    { x: 7700, y: 3600 },
    { x: 8100, y: 3100 },
    { x: 8300, y: 3900 },
    { x: 7200, y: 4500 },

    // SECURITY
    { x: 8200, y: 5000 },
    { x: 8500, y: 5300 },
    { x: 8900, y: 5200 },

    // LOADING YARD
    { x: 4700, y: 6400 },
    { x: 5000, y: 6900 },
    { x: 5400, y: 7400 },
    { x: 5800, y: 6600 },
    { x: 6200, y: 7100 },
    { x: 6600, y: 7600 },
    { x: 7000, y: 6800 },
    { x: 7400, y: 7300 },
    { x: 7900, y: 7000 },

    // SECRET
    { x: 5000, y: 9000 },
    { x: 5400, y: 8700 },
    { x: 5800, y: 9200 },
    { x: 6200, y: 8800 },
    { x: 6600, y: 9200 },
    { x: 7000, y: 9000 },
  ];

  for (const position of regularPositions) {
    if (!isWalkablePoint(position.x, position.y)) {
      continue;
    }

    enemies.push(createEnemyAt(scene, position.x, position.y));
  }

  // LARGE RANDOM SPAWN AREAS

  const largeSpawnAreas: SpawnArea[] = [
    // FACTORY
    {
      x: 3000,
      y: 2000,
      width: 2200,
      height: 1400,
    },

    // ADMIN
    {
      x: 6400,
      y: 2400,
      width: 1600,
      height: 1800,
    },

    // LOADING YARD
    {
      x: 4800,
      y: 6300,
      width: 2500,
      height: 1400,
    },

    // SECRET AREA
    {
      x: 5200,
      y: 8600,
      width: 1600,
      height: 700,
    },

    // UNDERGROUND
    {
      x: 1500,
      y: 4500,
      width: 1400,
      height: 1600,
    },
  ];

  const selectedLargeSpawnAreas = Phaser.Utils.Array.Shuffle([
    ...largeSpawnAreas,
  ]).slice(0, 3);

  let nextGroupId = 1;

  for (const area of selectedLargeSpawnAreas) {
    const groupId = nextGroupId++;

    const enemyCount = Phaser.Math.Between(45, 60);

    const spawnPoints = createSpawnPoints(area, enemyCount, isWalkablePoint);

    for (const point of spawnPoints) {
      enemies.push(createEnemyAt(scene, point.x, point.y, groupId));
    }
  }

  return enemies;
};
