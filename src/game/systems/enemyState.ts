export type EnemyState = {
  hp: number;
  maxHp: number;
};

export const createEnemyState = (hp: number): EnemyState => ({
  hp,
  maxHp: hp,
});

export const applyDamage = (enemy: EnemyState, damage: number): EnemyState => ({
  ...enemy,
  hp: Math.max(0, enemy.hp - damage),
});

export const isEnemyDead = (enemy: EnemyState) => enemy.hp <= 0;
