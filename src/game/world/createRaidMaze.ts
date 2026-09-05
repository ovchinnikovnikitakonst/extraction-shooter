import * as Phaser from "phaser";

import { RAID_CONFIG } from "../config/raidConfig";

type Point = {
  x: number;
  y: number;
};

type RaidMazeResult = {
  walls: Phaser.Physics.Arcade.StaticGroup;
  extractionPoints: Point[];
  lootCrateSpawnPoints: Point[];
  isWalkablePoint: (x: number, y: number) => boolean;
};

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const GRID_SIZE = 100;
const WALL_THICKNESS = 10;

export const createRaidMaze = (scene: Phaser.Scene): RaidMazeResult => {
  const worldWidth = RAID_CONFIG.world.width;
  const worldHeight = RAID_CONFIG.world.height;

  const columns = Math.floor(worldWidth / GRID_SIZE);

  const rows = Math.floor(worldHeight / GRID_SIZE);

  // true = проходимая зона
  // false = за стеной
  const floor = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => false),
  );

  const markRect = ({ x, y, width, height }: Rect) => {
    const startColumn = Math.floor(x / GRID_SIZE);

    const endColumn = Math.ceil((x + width) / GRID_SIZE);

    const startRow = Math.floor(y / GRID_SIZE);

    const endRow = Math.ceil((y + height) / GRID_SIZE);

    for (let row = startRow; row < endRow; row++) {
      for (let column = startColumn; column < endColumn; column++) {
        if (row < 0 || row >= rows || column < 0 || column >= columns) {
          continue;
        }

        floor[row][column] = true;
      }
    }
  };

  // =========================================================
  // START AREA
  // =========================================================

  markRect({
    x: 300,
    y: 300,
    width: 900,
    height: 900,
  });

  // =========================================================
  // START -> STORAGE
  // =========================================================

  markRect({
    x: 900,
    y: 650,
    width: 700,
    height: 400,
  });

  // =========================================================
  // STORAGE A
  // =========================================================

  markRect({
    x: 1200,
    y: 500,
    width: 1600,
    height: 1300,
  });

  // внутренняя боковая секция
  markRect({
    x: 1900,
    y: 1500,
    width: 700,
    height: 700,
  });

  // =========================================================
  // STORAGE -> FACTORY
  // =========================================================

  markRect({
    x: 2200,
    y: 1500,
    width: 700,
    height: 1100,
  });

  markRect({
    x: 2500,
    y: 2200,
    width: 900,
    height: 500,
  });

  // =========================================================
  // FACTORY HALL
  // большая асимметричная зона
  // =========================================================

  markRect({
    x: 2800,
    y: 1700,
    width: 3000,
    height: 2100,
  });

  // левая нижняя секция
  markRect({
    x: 2400,
    y: 2700,
    width: 1100,
    height: 1200,
  });

  // верхний выступ
  markRect({
    x: 3600,
    y: 1300,
    width: 1500,
    height: 700,
  });

  // правый выступ
  markRect({
    x: 5300,
    y: 2300,
    width: 900,
    height: 1000,
  });

  // Factory dead-end room
  markRect({
    x: 1200,
    y: 2900,
    width: 1200,
    height: 900,
  });

  markRect({
    x: 2200,
    y: 3150,
    width: 500,
    height: 400,
  });

  // =========================================================
  // FACTORY -> UNDERGROUND
  // =========================================================

  markRect({
    x: 3000,
    y: 3600,
    width: 500,
    height: 1300,
  });

  // =========================================================
  // UNDERGROUND
  // длинный Г-образный маршрут
  // =========================================================

  markRect({
    x: 1800,
    y: 4300,
    width: 1700,
    height: 600,
  });

  markRect({
    x: 1400,
    y: 4300,
    width: 600,
    height: 2200,
  });

  markRect({
    x: 1400,
    y: 5900,
    width: 1800,
    height: 600,
  });

  markRect({
    x: 2700,
    y: 5700,
    width: 600,
    height: 900,
  });

  // боковой тупик
  markRect({
    x: 500,
    y: 5000,
    width: 1100,
    height: 600,
  });

  // =========================================================
  // DEAD END A
  // =========================================================

  markRect({
    x: 500,
    y: 6500,
    width: 1400,
    height: 1200,
  });

  markRect({
    x: 1400,
    y: 6200,
    width: 500,
    height: 700,
  });

  // =========================================================
  // FACTORY -> ADMIN
  // =========================================================

  markRect({
    x: 5600,
    y: 2400,
    width: 900,
    height: 600,
  });

  // =========================================================
  // ADMIN BUILDING
  // =========================================================

  markRect({
    x: 6200,
    y: 2100,
    width: 2300,
    height: 2600,
  });

  // верхнее крыло
  markRect({
    x: 6800,
    y: 1600,
    width: 1200,
    height: 700,
  });

  // правое крыло
  markRect({
    x: 8100,
    y: 2800,
    width: 1000,
    height: 1500,
  });

  // нижнее крыло
  markRect({
    x: 6600,
    y: 4400,
    width: 1300,
    height: 900,
  });

  // =========================================================
  // SECURITY
  // =========================================================

  markRect({
    x: 8000,
    y: 4700,
    width: 1200,
    height: 1100,
  });

  markRect({
    x: 8900,
    y: 5000,
    width: 700,
    height: 500,
  });

  // =========================================================
  // ADMIN -> LOADING
  // =========================================================

  markRect({
    x: 7000,
    y: 5000,
    width: 600,
    height: 1600,
  });

  markRect({
    x: 6300,
    y: 6000,
    width: 1200,
    height: 600,
  });

  // =========================================================
  // UNDERGROUND -> LOADING
  // длинный соединительный маршрут
  // =========================================================

  markRect({
    x: 3000,
    y: 6100,
    width: 2300,
    height: 600,
  });

  // =========================================================
  // LOADING YARD
  // большая неровная зона
  // =========================================================

  markRect({
    x: 4500,
    y: 6000,
    width: 3300,
    height: 2200,
  });

  // левый выступ
  markRect({
    x: 4000,
    y: 6600,
    width: 900,
    height: 1100,
  });

  // правый выступ
  markRect({
    x: 7600,
    y: 6500,
    width: 1000,
    height: 1000,
  });

  // нижний выступ
  markRect({
    x: 5200,
    y: 7900,
    width: 1700,
    height: 700,
  });

  // =========================================================
  // LOADING -> SECRET
  // =========================================================

  markRect({
    x: 5700,
    y: 8000,
    width: 700,
    height: 700,
  });

  // =========================================================
  // SECRET AREA
  // =========================================================

  markRect({
    x: 5000,
    y: 8500,
    width: 2200,
    height: 1100,
  });

  // левая секция
  markRect({
    x: 4600,
    y: 8700,
    width: 800,
    height: 700,
  });

  // правая секция
  markRect({
    x: 6900,
    y: 8800,
    width: 900,
    height: 700,
  });

  // нижняя часть к Exit B
  markRect({
    x: 5800,
    y: 9400,
    width: 700,
    height: 500,
  });

  // =========================================================
  // WALL TEXTURES
  // =========================================================

  if (!scene.textures.exists("maze-wall-h")) {
    const graphics = scene.add.graphics();

    graphics.fillStyle(0x444444);

    graphics.fillRect(0, 0, GRID_SIZE, WALL_THICKNESS);

    graphics.generateTexture("maze-wall-h", GRID_SIZE, WALL_THICKNESS);

    graphics.destroy();
  }

  if (!scene.textures.exists("maze-wall-v")) {
    const graphics = scene.add.graphics();

    graphics.fillStyle(0x444444);

    graphics.fillRect(0, 0, WALL_THICKNESS, GRID_SIZE);

    graphics.generateTexture("maze-wall-v", WALL_THICKNESS, GRID_SIZE);

    graphics.destroy();
  }

  const walls = scene.physics.add.staticGroup();

  const horizontalEdges = new Set<string>();
  const verticalEdges = new Set<string>();

  const isFloor = (row: number, column: number) => {
    if (row < 0 || row >= rows || column < 0 || column >= columns) {
      return false;
    }

    return floor[row][column];
  };

  const isWalkablePoint = (x: number, y: number): boolean => {
    const column = Math.floor(x / GRID_SIZE);

    const row = Math.floor(y / GRID_SIZE);

    return isFloor(row, column);
  };

  // =========================================================
  // AUTOMATIC WALL GENERATION
  // =========================================================

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      if (!floor[row][column]) {
        continue;
      }

      // TOP
      if (!isFloor(row - 1, column)) {
        horizontalEdges.add(`${column}:${row}`);
      }

      // BOTTOM
      if (!isFloor(row + 1, column)) {
        horizontalEdges.add(`${column}:${row + 1}`);
      }

      // LEFT
      if (!isFloor(row, column - 1)) {
        verticalEdges.add(`${column}:${row}`);
      }

      // RIGHT
      if (!isFloor(row, column + 1)) {
        verticalEdges.add(`${column + 1}:${row}`);
      }
    }
  }

  // =========================================================
  // CREATE HORIZONTAL WALLS
  // =========================================================

  for (const edge of horizontalEdges) {
    const [column, row] = edge.split(":").map(Number);

    const wall = walls.create(
      column * GRID_SIZE + GRID_SIZE / 2,
      row * GRID_SIZE,
      "maze-wall-h",
    ) as Phaser.Physics.Arcade.Image;

    wall.refreshBody();
  }

  // =========================================================
  // CREATE VERTICAL WALLS
  // =========================================================

  for (const edge of verticalEdges) {
    const [column, row] = edge.split(":").map(Number);

    const wall = walls.create(
      column * GRID_SIZE,
      row * GRID_SIZE + GRID_SIZE / 2,
      "maze-wall-v",
    ) as Phaser.Physics.Arcade.Image;

    wall.refreshBody();
  }

  // =========================================================
  // EXTRACTIONS
  // =========================================================

  const extractionPoints: Point[] = [
    // EXIT A — справа от Loading Yard
    {
      x: 8450,
      y: 7000,
    },

    // EXIT B — нижний выход из Secret Area
    {
      x: 6150,
      y: 9750,
    },

    // EXIT C — справа от Security
    {
      x: 9450,
      y: 5250,
    },
  ];

  // =========================================================
  // LOOT SPAWNS
  // =========================================================

  const lootCrateSpawnPoints: Point[] = [
    // START / STORAGE
    { x: 600, y: 600 },
    { x: 1500, y: 900 },
    { x: 2400, y: 1200 },

    // FACTORY
    { x: 2900, y: 2200 },
    { x: 3500, y: 3200 },
    { x: 4400, y: 2200 },
    { x: 5400, y: 3300 },

    // Factory dead-end
    { x: 1600, y: 3400 },

    // UNDERGROUND
    { x: 1800, y: 4600 },
    { x: 1600, y: 5600 },
    { x: 800, y: 5300 },

    // DEAD END A
    { x: 900, y: 7000 },
    { x: 1500, y: 7400 },

    // ADMIN
    { x: 6500, y: 2500 },
    { x: 7300, y: 1900 },
    { x: 8200, y: 3500 },
    { x: 7000, y: 4800 },

    // SECURITY
    { x: 8400, y: 5200 },
    { x: 9000, y: 5400 },

    // LOADING
    { x: 4700, y: 6400 },
    { x: 5700, y: 6900 },
    { x: 7100, y: 7000 },
    { x: 8100, y: 7000 },
    { x: 5600, y: 8100 },

    // SECRET
    { x: 4900, y: 9000 },
    { x: 5700, y: 8900 },
    { x: 6900, y: 9100 },
    { x: 6200, y: 9500 },
  ];

  return {
    walls,
    extractionPoints,
    lootCrateSpawnPoints,
    isWalkablePoint,
  };
};
