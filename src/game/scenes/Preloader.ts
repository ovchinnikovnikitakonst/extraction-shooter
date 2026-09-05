import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  preload() {
    this.load.image("raid-floor-1", "/assets/tiles/floor_metal_plate_v1.png");

    this.load.image("raid-floor-2", "/assets/tiles/floor_metal_plate_v2.png");

    this.load.image("raid-floor-3", "/assets/tiles/floor_metal_plate_v3.png");

    this.load.image(
      "raid-floor-rust-1",
      "/assets/tiles/floor_metal_plate_more_rust_v1.png",
    );

    this.load.image(
      "raid-floor-rust-2",
      "/assets/tiles/floor_metal_plate_more_rust_v2.png",
    );

    this.load.image("blood-1", "/assets/decals/decal_blood_1.png");

    this.load.image("blood-2", "/assets/decals/decal_blood_2.png");

    this.load.image("blood-3", "/assets/decals/decal_blood_3.png");

    this.load.image("blood-4", "/assets/decals/decal_blood_4.png");

    this.load.image("blood-5", "/assets/decals/decal_blood_5.png");
  }

  create() {
    this.scene.start("StashScene");
  }
}
