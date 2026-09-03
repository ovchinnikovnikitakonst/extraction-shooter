import * as Phaser from "phaser";
import { Scene } from "phaser";
import { getMovementVelocity } from "../systems/playerMovement";
import { getShotDirection } from "../systems/shooting";

export class RaidScene extends Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private enemy!: Phaser.Physics.Arcade.Sprite;
  private bullets!: Phaser.Physics.Arcade.Group;

  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  constructor() {
    super("RaidScene");
  }

  create() {
    const worldWidth = 2000;
    const worldHeight = 2000;

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    for (let x = 0; x <= worldWidth; x += 200) {
      this.add.rectangle(x, worldHeight / 2, 4, worldHeight, 0x333833);
    }

    for (let y = 0; y <= worldHeight; y += 200) {
      this.add.rectangle(worldWidth / 2, y, worldWidth, 4, 0x333833);
    }

    const playerGraphics = this.add.graphics();

    playerGraphics.fillStyle(0xffffff);
    playerGraphics.fillRect(0, 0, 40, 20);

    playerGraphics.generateTexture("player", 40, 20);

    playerGraphics.destroy();

    this.bullets = this.physics.add.group();

    const enemyGraphics = this.add.graphics();

    enemyGraphics.fillStyle(0xff3333);
    enemyGraphics.fillRect(0, 0, 40, 40);

    enemyGraphics.generateTexture("enemy", 40, 40);
    enemyGraphics.destroy();

    this.enemy = this.physics.add.sprite(
      worldWidth / 2 + 300,
      worldHeight / 2,
      "enemy",
    );

    this.enemy.setImmovable(true);

    this.physics.add.overlap(this.bullets, this.enemy, (bullet, enemy) => {
      bullet.destroy();
      enemy.destroy();
    });

    const bulletGraphics = this.add.graphics();

    bulletGraphics.fillStyle(0xffff00);
    bulletGraphics.fillCircle(4, 4, 4);

    bulletGraphics.generateTexture("bullet", 8, 8);

    bulletGraphics.destroy();

    this.player = this.physics.add.sprite(
      worldWidth / 2,
      worldHeight / 2,
      "player",
    );

    this.player.setCollideWorldBounds(true);

    const keyboard = this.input.keyboard;

    if (!keyboard) {
      return;
    }

    this.wasd = {
      W: keyboard.addKey("W"),
      A: keyboard.addKey("A"),
      S: keyboard.addKey("S"),
      D: keyboard.addKey("D"),
    };

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.shoot(pointer);
      }
    });

    this.cameras.main.startFollow(this.player);

    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
  }

  update() {
    const velocity = getMovementVelocity(
      {
        up: this.wasd.W.isDown,
        down: this.wasd.S.isDown,
        left: this.wasd.A.isDown,
        right: this.wasd.D.isDown,
      },
      250,
    );

    this.player.setVelocity(velocity.x, velocity.y);

    const pointer = this.input.activePointer;

    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);

    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      worldPoint.x,
      worldPoint.y,
    );

    this.player.setRotation(angle);
  }

  private shoot(pointer: Phaser.Input.Pointer) {
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);

    const direction = getShotDirection(
      this.player.x,
      this.player.y,
      worldPoint.x,
      worldPoint.y,
    );

    const bullet = this.bullets.create(
      this.player.x,
      this.player.y,
      "bullet",
    ) as Phaser.Physics.Arcade.Image;

    const bulletSpeed = 700;

    bullet.setVelocity(direction.x * bulletSpeed, direction.y * bulletSpeed);
  }
}
