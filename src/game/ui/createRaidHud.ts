import * as Phaser from "phaser";

export const createRaidHud = (scene: Phaser.Scene) => {
  const healthText = scene.add
    .text(20, 20, "", {
      fontSize: "24px",
      color: "#ffffff",
    })
    .setScrollFactor(0);

  const lootText = scene.add
    .text(20, 55, "", {
      fontSize: "20px",
      color: "#ffffff",
    })
    .setScrollFactor(0);

  const deathText = scene.add
    .text(
      scene.scale.width / 2,
      scene.scale.height / 2,
      "YOU DIED\nPress R to restart",
      {
        fontSize: "36px",
        color: "#ff4444",
        align: "center",
      },
    )
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setVisible(false);

  return {
    healthText,
    lootText,
    deathText,
  };
};
