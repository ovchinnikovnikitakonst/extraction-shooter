import { Scene } from "phaser";

export class RaidScene extends Scene {
  constructor() {
    super("RaidScene");
  }

  create() {
    this.add.text(40, 40, "Extraction Shooter", {
      fontSize: "32px",
      color: "#ffffff",
    });
  }
}
