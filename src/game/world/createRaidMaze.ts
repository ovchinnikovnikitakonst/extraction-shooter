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
const MAP_UNIT = GRID_SIZE * 4;

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

  const markUnitRect = (
    x: number,
    y: number,
    width: number,
    height: number,
  ) => {
    markRect({
      x: x * MAP_UNIT,
      y: y * MAP_UNIT,
      width: width * MAP_UNIT,
      height: height * MAP_UNIT,
    });
  };

  // =========================================================
  // START AREA
  // =========================================================

  markUnitRect(1, 1, 2, 2);

  // =========================================================
  // START -> STORAGE
  // =========================================================

  markUnitRect(2, 2, 2, 1);

  // =========================================================
  // STORAGE A
  // =========================================================

  markUnitRect(3, 1, 4, 4);

  // внутренняя боковая секция
  markUnitRect(5, 4, 2, 2);

  // =========================================================
  // STORAGE -> FACTORY
  // =========================================================

  markUnitRect(6, 4, 2, 3);

  markUnitRect(7, 6, 2, 1);

  // =========================================================
  // FACTORY HALL
  // =========================================================

  markUnitRect(7, 4, 8, 6);

  // левая нижняя секция
  markUnitRect(6, 7, 3, 3);

  // верхний выступ
  markUnitRect(9, 3, 4, 2);

  // правый выступ
  markUnitRect(14, 6, 2, 3);

  // =========================================================
  // FACTORY DEAD END
  // =========================================================

  markUnitRect(3, 7, 3, 3);

  markUnitRect(5, 8, 2, 1);

  // =========================================================
  // FACTORY -> UNDERGROUND
  // =========================================================

  markUnitRect(7, 9, 2, 3);

  // =========================================================
  // UNDERGROUND
  // =========================================================

  // верхняя горизонтальная часть
  markUnitRect(4, 11, 5, 2);

  // вертикальная часть
  markUnitRect(3, 11, 2, 6);

  // нижняя горизонтальная часть
  markUnitRect(3, 15, 5, 2);

  // правый участок
  markUnitRect(7, 14, 2, 3);

  // боковой тупик
  markUnitRect(1, 13, 3, 2);

  // =========================================================
  // DEAD END A
  // =========================================================

  markUnitRect(1, 17, 4, 3);

  markUnitRect(3, 16, 2, 2);

  // =========================================================
  // FACTORY -> ADMIN
  // =========================================================

  markUnitRect(14, 6, 2, 2);

  // =========================================================
  // ADMIN BUILDING
  // =========================================================

  markUnitRect(16, 5, 6, 7);

  // верхнее крыло
  markUnitRect(17, 4, 3, 2);

  // правое крыло
  markUnitRect(20, 7, 3, 4);

  // нижнее крыло
  markUnitRect(16, 11, 4, 2);

  // =========================================================
  // SECURITY
  // =========================================================

  markUnitRect(20, 12, 3, 3);

  markUnitRect(22, 13, 2, 1);

  // =========================================================
  // ADMIN -> LOADING
  // =========================================================

  markUnitRect(17, 12, 2, 4);

  markUnitRect(16, 15, 3, 2);

  // =========================================================
  // UNDERGROUND -> LOADING
  // =========================================================

  markUnitRect(7, 15, 6, 2);

  // =========================================================
  // LOADING YARD
  // =========================================================

  markUnitRect(11, 15, 9, 6);

  // левый выступ
  markUnitRect(10, 17, 2, 3);

  // правый выступ
  markUnitRect(19, 16, 3, 3);

  // нижний выступ
  markUnitRect(13, 20, 5, 2);

  // =========================================================
  // LOADING -> SECRET
  // =========================================================

  markUnitRect(14, 20, 2, 2);

  // =========================================================
  // SECRET AREA
  // =========================================================

  markUnitRect(12, 21, 6, 3);

  // левая секция
  markUnitRect(11, 22, 2, 2);

  // правая секция
  markUnitRect(17, 22, 3, 2);

  // нижняя часть к EXIT B
  markUnitRect(14, 23, 2, 2);
  // =========================================================
  // FLOOR
  // =========================================================

  const getRandomFloorTexture = () => {
    const roll = Phaser.Math.Between(1, 100);

    if (roll <= 35) {
      return "raid-floor-1";
    }

    if (roll <= 65) {
      return "raid-floor-2";
    }

    if (roll <= 85) {
      return "raid-floor-3";
    }

    if (roll <= 95) {
      return "raid-floor-rust-1";
    }

    return "raid-floor-rust-2";
  };

  const renderedFloorCells = Array.from({ length: rows }, () =>
    Array(columns).fill(false),
  );

  const canPlaceFloorTile = (
    row: number,
    column: number,
    sizeInCells: number,
  ) => {
    if (row + sizeInCells > rows || column + sizeInCells > columns) {
      return false;
    }

    for (let y = row; y < row + sizeInCells; y++) {
      for (let x = column; x < column + sizeInCells; x++) {
        if (!floor[y][x] || renderedFloorCells[y][x]) {
          return false;
        }
      }
    }

    return true;
  };

  const placeFloorTile = (row: number, column: number, sizeInCells: number) => {
    const texture = getRandomFloorTexture();

    const pixelSize = GRID_SIZE * sizeInCells;

    scene.add
      .image(
        column * GRID_SIZE + pixelSize / 2,
        row * GRID_SIZE + pixelSize / 2,
        texture,
      )
      .setDisplaySize(pixelSize, pixelSize)
      .setDepth(-10);

    for (let y = row; y < row + sizeInCells; y++) {
      for (let x = column; x < column + sizeInCells; x++) {
        renderedFloorCells[y][x] = true;
      }
    }
  };

  // 1) большие куски 4x4
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      if (canPlaceFloorTile(row, column, 4)) {
        placeFloorTile(row, column, 4);
      }
    }
  }

  // 2) средние 2x2
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      if (canPlaceFloorTile(row, column, 2)) {
        placeFloorTile(row, column, 2);
      }
    }
  }

  // 3) остатки 1x1
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      if (canPlaceFloorTile(row, column, 1)) {
        placeFloorTile(row, column, 1);
      }
    }
  }

  // =========================================================
  // BLOOD DECALS
  // =========================================================

  const bloodTextures = ["blood-1", "blood-2", "blood-3", "blood-4", "blood-5"];

  const getRandomBloodTexture = () => {
    return Phaser.Utils.Array.GetRandom(bloodTextures);
  };

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      if (!floor[row][column]) {
        continue;
      }

      const shouldPlaceBlood = Phaser.Math.Between(1, 100) <= 7;

      if (!shouldPlaceBlood) {
        continue;
      }

      const texture = getRandomBloodTexture();

      const x =
        column * GRID_SIZE + GRID_SIZE / 2 + Phaser.Math.Between(-20, 20);

      const y = row * GRID_SIZE + GRID_SIZE / 2 + Phaser.Math.Between(-20, 20);

      const rotation = Phaser.Math.FloatBetween(0, Math.PI * 2);

      const scale = Phaser.Math.FloatBetween(0.55, 0.9);

      scene.add
        .image(x, y, texture)
        .setRotation(rotation)
        .setScale(scale)
        .setAlpha(0.75)
        .setDepth(-9);
    }
  }

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
