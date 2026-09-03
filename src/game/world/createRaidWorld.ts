import * as Phaser from "phaser";
import { RAID_CONFIG } from "../config/raidConfig";

export const createRaidWorld = (scene: Phaser.Scene) => {
  const { width, height, gridSize } = RAID_CONFIG.world;

  scene.physics.world.setBounds(0, 0, width, height);

  for (let x = 0; x <= width; x += gridSize) {
    scene.add.rectangle(x, height / 2, 4, height, 0x333833);
  }

  for (let y = 0; y <= height; y += gridSize) {
    scene.add.rectangle(width / 2, y, width, 4, 0x333833);
  }

  const { x, y, size } = RAID_CONFIG.extraction;

  const extractionZone = scene.add.rectangle(x, y, size, size, 0x00ff66, 0.25);

  scene.physics.add.existing(extractionZone, true);

  scene.add
    .text(x, y - 90, "EXIT", {
      fontSize: "24px",
      color: "#00ff66",
    })
    .setOrigin(0.5);

  const spawn = RAID_CONFIG.player.spawn;

  scene.add
    .text(spawn.x, spawn.y - 60, "START", {
      fontSize: "20px",
      color: "#ffffff",
    })
    .setOrigin(0.5);

  return {
    extractionZone,
  };
};
