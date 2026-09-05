import * as Phaser from "phaser";

import { createEnemy } from "./createEnemy";
import type { Enemy } from "./enemy";

import { RAID_CONFIG } from "../config/raidConfig";
import { createEnemyState } from "../systems/enemyState";

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

const MIN_SPAWN_DISTANCE = 70;
const MAX_SPAWN_ATTEMPTS = 500;

const createEnemyAt = (scene: Phaser.Scene, x: number, y: number): Enemy => ({
  sprite: createEnemy(scene, x, y),
  state: createEnemyState(RAID_CONFIG.enemy.hp),
  aggro: false,
});

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
    // STORAGE / FACTORY
    { x: 1700, y: 1000 },
    { x: 2400, y: 1500 },
    { x: 3000, y: 2200 },
    { x: 3400, y: 2800 },
    { x: 4000, y: 2500 },
    { x: 4700, y: 3200 },
    { x: 5400, y: 2600 },

    // UNDERGROUND
    { x: 1800, y: 4600 },
    { x: 1600, y: 5200 },
    { x: 1500, y: 6100 },
    { x: 2500, y: 6100 },
    { x: 900, y: 5300 },

    // DEAD END
    { x: 900, y: 6900 },
    { x: 1400, y: 7300 },

    // ADMIN
    { x: 6500, y: 2500 },
    { x: 7000, y: 3000 },
    { x: 7600, y: 3500 },
    { x: 8200, y: 3200 },

    // SECURITY
    { x: 8300, y: 5100 },
    { x: 8800, y: 5400 },

    // LOADING
    { x: 4800, y: 6400 },
    { x: 5400, y: 6900 },
    { x: 6100, y: 7200 },
    { x: 6900, y: 6800 },
    { x: 7600, y: 7200 },

    // SECRET
    { x: 5200, y: 8800 },
    { x: 6000, y: 9000 },
    { x: 6900, y: 9100 },
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

  for (const area of selectedLargeSpawnAreas) {
    const enemyCount = Phaser.Math.Between(30, 40);

    const spawnPoints = createSpawnPoints(area, enemyCount, isWalkablePoint);

    for (const point of spawnPoints) {
      enemies.push(createEnemyAt(scene, point.x, point.y));
    }
  }

  return enemies;
};
