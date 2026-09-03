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

import { createLoot, createLootTexture } from "../entities/createLoot";

import type { Loot } from "../entities/loot";

import {
  applyDamage,
  createEnemyState,
  isEnemyDead,
} from "../systems/enemyState";

export class RaidScene extends Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private bullets!: Phaser.Physics.Arcade.Group;

  private enemies: Enemy[] = [];

  private loot: Loot[] = [];
  private scrapCount = 0;

  private playerState = createPlayerState(100);
  private lastEnemyHitAt = 0;
  private playerDead = false;

  private healthText!: Phaser.GameObjects.Text;
  private deathText!: Phaser.GameObjects.Text;
  private lootText!: Phaser.GameObjects.Text;

  private restartKey!: Phaser.Input.Keyboard.Key;
  private interactKey!: Phaser.Input.Keyboard.Key;

  private extractionZone!: Phaser.GameObjects.Rectangle;

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
    this.loot = [];
    this.scrapCount = 0;
    this.playerState = createPlayerState(100);
    this.enemies = [];
    this.lastEnemyHitAt = 0;
    this.playerDead = false;
  }

  create() {
    const worldWidth = 2000;
    const worldHeight = 2000;

    const playerSpawn = {
      x: 200,
      y: 200,
    };

    const extractionPoint = {
      x: worldWidth - 200,
      y: worldHeight - 200,
    };

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    this.createGrid(worldWidth, worldHeight);

    createBulletTexture(this);

    createLootTexture(this);

    this.bullets = this.physics.add.group();

    this.player = createPlayer(this, playerSpawn.x, playerSpawn.y);

    this.extractionZone = this.add.rectangle(
      extractionPoint.x,
      extractionPoint.y,
      120,
      120,
      0x00ff66,
      0.25,
    );

    this.physics.add.existing(this.extractionZone, true);

    this.add
      .text(extractionPoint.x, extractionPoint.y - 90, "EXIT", {
        fontSize: "24px",
        color: "#00ff66",
      })
      .setOrigin(0.5);

    this.add
      .text(playerSpawn.x, playerSpawn.y - 60, "START", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.healthText = this.add.text(20, 20, "", {
      fontSize: "24px",
      color: "#ffffff",
    });

    this.lootText = this.add.text(20, 55, "", {
      fontSize: "20px",
      color: "#ffffff",
    });

    this.lootText.setScrollFactor(0);

    this.updateLootHud();

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

    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      if (this.isPlayerInExtractionZone()) {
        this.extract();
        return;
      }

      this.tryPickupLoot();
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
    this.interactKey = keyboard.addKey("E");
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
        const loot = createLoot(this, enemy.sprite.x, enemy.sprite.y);

        this.loot.push(loot);

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

  private tryPickupLoot() {
    const pickupDistance = 70;

    const loot = this.loot.find((item) => {
      if (!item.sprite.active) {
        return false;
      }

      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        item.sprite.x,
        item.sprite.y,
      );

      return distance <= pickupDistance;
    });

    if (!loot) {
      return;
    }

    this.scrapCount += 1;

    loot.sprite.destroy();

    this.updateLootHud();
  }

  private updateLootHud() {
    this.lootText.setText(`Scrap: ${this.scrapCount}`);
  }

  private isPlayerInExtractionZone() {
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.extractionZone.x,
      this.extractionZone.y,
    );

    return distance <= 80;
  }

  private extract() {
    this.playerDead = true;

    this.player.setVelocity(0, 0);

    for (const enemy of this.enemies) {
      if (enemy.sprite.active) {
        enemy.sprite.setVelocity(0, 0);
      }
    }

    this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2,
        `EXTRACTED\nScrap: ${this.scrapCount}`,
        {
          fontSize: "36px",
          color: "#00ff66",
          align: "center",
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0);
  }
}
