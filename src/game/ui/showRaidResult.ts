import * as Phaser from "phaser";

import type { RaidStatus } from "../systems/raidState";

type ShowRaidResultParams = {
  scene: Phaser.Scene;
  status: Exclude<RaidStatus, "playing">;
  scrapCount: number;
};

export const showRaidResult = ({
  scene,
  status,
  scrapCount,
}: ShowRaidResultParams) => {
  const isDead = status === "dead";

  const text = isDead
    ? "YOU DIED\nLoot lost\nPress R to return to stash"
    : `EXTRACTED\nScrap: ${scrapCount}\nPress R to return to stash`;

  const color = isDead ? "#ff4444" : "#00ff66";

  return scene.add
    .text(scene.scale.width / 2, scene.scale.height / 2, text, {
      fontSize: "36px",
      color,
      align: "center",
    })
    .setOrigin(0.5)
    .setScrollFactor(0);
};
