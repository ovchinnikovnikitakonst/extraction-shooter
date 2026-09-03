import * as Phaser from "phaser";
import { Scene } from "phaser";

import { createPlayer } from "../entities/createPlayer";
import { createEnemy } from "../entities/createEnemy";
import { createBulletTexture } from "../entities/createBulletTexture";

import { getMovementVelocity } from "../systems/playerMovement";
import { getShotDirection } from "../systems/shooting";
import { getEnemyVelocity } from "../systems/enemyMovement";

import {
  applyDamage,
  createEnemyState,
  isEnemyDead,
} from "../systems/enemyState";

export class RaidScene extends Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private enemy!: Phaser.Physics.Arcade.Sprite;
  private bullets!: Phaser.Physics.Arcade.Group;

  private enemyState = createEnemyState(3);
  private enemyAggro = false;

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

    this.createGrid(worldWidth, worldHeight);

    createBulletTexture(this);

    this.bullets = this.physics.add.group();

    this.player = createPlayer(this, worldWidth / 2, worldHeight / 2);

    this.enemy = createEnemy(this, worldWidth / 2 + 300, worldHeight / 2);

    this.setupBulletEnemyOverlap();
    this.setupKeyboard();
    this.setupShooting();

    this.cameras.main.startFollow(this.player);

    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
  }

  update() {
    this.updatePlayerMovement();
    this.updatePlayerAim();
    this.updateEnemy();
  }

  private createGrid(worldWidth: number, worldHeight: number) {
    for (let x = 0; x <= worldWidth; x += 200) {
      this.add.rectangle(x, worldHeight / 2, 4, worldHeight, 0x333833);
    }

    for (let y = 0; y <= worldHeight; y += 200) {
      this.add.rectangle(worldWidth / 2, y, worldWidth, 4, 0x333833);
    }
  }

  private setupKeyboard() {
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
  }

  private setupShooting() {
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.shoot(pointer);
      }
    });
  }

  private setupBulletEnemyOverlap() {
    this.physics.add.overlap(this.bullets, this.enemy, (object1, object2) => {
      const first = object1 as Phaser.Physics.Arcade.Image;

      const second = object2 as Phaser.Physics.Arcade.Image;

      const bullet = first.texture.key === "bullet" ? first : second;

      bullet.disableBody(true, true);

      this.enemyState = applyDamage(this.enemyState, 1);

      if (isEnemyDead(this.enemyState)) {
        this.enemy.destroy();
      }
    });
  }

  private updatePlayerMovement() {
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
  }

  private updatePlayerAim() {
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

  private updateEnemy() {
    if (!this.enemy.active) {
      return;
    }

    const distanceToPlayer = Phaser.Math.Distance.Between(
      this.enemy.x,
      this.enemy.y,
      this.player.x,
      this.player.y,
    );

    const aggroDistance = 250;
    const loseAggroDistance = 400;

    if (distanceToPlayer <= aggroDistance) {
      this.enemyAggro = true;
    }

    if (distanceToPlayer >= loseAggroDistance) {
      this.enemyAggro = false;
    }

    if (!this.enemyAggro) {
      this.enemy.setVelocity(0, 0);

      return;
    }

    const enemyVelocity = getEnemyVelocity(
      this.enemy.x,
      this.enemy.y,
      this.player.x,
      this.player.y,
      100,
    );

    this.enemy.setVelocity(enemyVelocity.x, enemyVelocity.y);
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
