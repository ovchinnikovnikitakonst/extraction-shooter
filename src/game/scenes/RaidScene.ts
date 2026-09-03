import * as Phaser from "phaser";
import { Scene } from "phaser";

import { createPlayer } from "../entities/createPlayer";
import { createEnemy } from "../entities/createEnemy";
import { createBulletTexture } from "../entities/createBulletTexture";
import type { Enemy } from "../entities/enemy";

import {
  applyPlayerDamage,
  createPlayerState,
  isPlayerDead,
} from "../systems/playerState";

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
  private bullets!: Phaser.Physics.Arcade.Group;

  private enemies: Enemy[] = [];
  private playerState = createPlayerState(100);
  private lastEnemyHitAt = 0;
  private playerDead = false;

  private healthText!: Phaser.GameObjects.Text;
  private deathText!: Phaser.GameObjects.Text;

  private restartKey!: Phaser.Input.Keyboard.Key;

  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  constructor() {
    super("RaidScene");
  }

  init() {
    this.playerState = createPlayerState(100);
    this.enemies = [];
    this.lastEnemyHitAt = 0;
    this.playerDead = false;
  }

  create() {
    const worldWidth = 2000;
    const worldHeight = 2000;

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    this.createGrid(worldWidth, worldHeight);

    createBulletTexture(this);

    this.bullets = this.physics.add.group();

    this.player = createPlayer(this, worldWidth / 2, worldHeight / 2);

    this.healthText = this.add.text(20, 20, "", {
      fontSize: "24px",
      color: "#ffffff",
    });

    this.healthText.setScrollFactor(0);

    this.updateHealthHud();

    this.deathText = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2,
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

    this.enemies = [
      {
        sprite: createEnemy(this, worldWidth / 2 + 300, worldHeight / 2),
        state: createEnemyState(3),
        aggro: false,
      },
      {
        sprite: createEnemy(this, worldWidth / 2 - 500, worldHeight / 2 + 300),
        state: createEnemyState(3),
        aggro: false,
      },
      {
        sprite: createEnemy(this, worldWidth / 2 + 400, worldHeight / 2 - 500),
        state: createEnemyState(3),
        aggro: false,
      },
    ];

    for (const enemy of this.enemies) {
      this.setupBulletEnemyOverlap(enemy);
      this.setupEnemyPlayerOverlap(enemy);
    }
    this.setupKeyboard();
    this.setupShooting();

    this.cameras.main.startFollow(this.player);

    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
  }

  update() {
    if (this.playerDead) {
      if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
        this.scene.restart();
      }

      return;
    }

    this.updatePlayerMovement();
    this.updatePlayerAim();

    for (const enemy of this.enemies) {
      this.updateEnemy(enemy);
    }
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

    this.restartKey = keyboard.addKey("R");
  }

  private setupShooting() {
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.playerDead) {
        return;
      }

      if (pointer.leftButtonDown()) {
        this.shoot(pointer);
      }
    });
  }

  private setupBulletEnemyOverlap(enemy: Enemy) {
    this.physics.add.overlap(this.bullets, enemy.sprite, (object1, object2) => {
      const first = object1 as Phaser.Physics.Arcade.Image;

      const second = object2 as Phaser.Physics.Arcade.Image;

      const bullet = first.texture.key === "bullet" ? first : second;

      bullet.disableBody(true, true);

      enemy.state = applyDamage(enemy.state, 1);

      if (isEnemyDead(enemy.state)) {
        enemy.sprite.destroy();
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

  private updateEnemy(enemy: Enemy) {
    if (!enemy.sprite.active) {
      return;
    }

    const distanceToPlayer = Phaser.Math.Distance.Between(
      enemy.sprite.x,
      enemy.sprite.y,
      this.player.x,
      this.player.y,
    );

    const aggroDistance = 250;
    const loseAggroDistance = 400;

    if (distanceToPlayer <= aggroDistance) {
      enemy.aggro = true;
    }

    if (distanceToPlayer >= loseAggroDistance) {
      enemy.aggro = false;
    }

    if (!enemy.aggro) {
      enemy.sprite.setVelocity(0, 0);
      return;
    }

    const velocity = getEnemyVelocity(
      enemy.sprite.x,
      enemy.sprite.y,
      this.player.x,
      this.player.y,
      100,
    );

    enemy.sprite.setVelocity(velocity.x, velocity.y);
  }

  private updateHealthHud() {
    this.healthText.setText(
      `HP: ${this.playerState.hp}/${this.playerState.maxHp}`,
    );
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

  private setupEnemyPlayerOverlap(enemy: Enemy) {
    this.physics.add.overlap(enemy.sprite, this.player, () => {
      const now = this.time.now;
      const hitCooldown = 500;

      if (now - this.lastEnemyHitAt < hitCooldown) {
        return;
      }

      this.lastEnemyHitAt = now;

      this.playerState = applyPlayerDamage(this.playerState, 10);

      this.updateHealthHud();

      if (isPlayerDead(this.playerState)) {
        this.killPlayer();
      }
    });
  }

  private killPlayer() {
    this.playerDead = true;

    this.player.setVelocity(0, 0);

    for (const enemy of this.enemies) {
      if (enemy.sprite.active) {
        enemy.sprite.setVelocity(0, 0);
      }
    }

    this.player.setAlpha(0.4);

    this.deathText.setVisible(true);
  }
}
