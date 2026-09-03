export const getEnemyVelocity = (
  enemyX: number,
  enemyY: number,
  playerX: number,
  playerY: number,
  speed: number,
) => {
  const x = playerX - enemyX;
  const y = playerY - enemyY;

  const distance = Math.hypot(x, y);

  if (distance === 0) {
    return {
      x: 0,
      y: 0,
    };
  }

  return {
    x: (x / distance) * speed,
    y: (y / distance) * speed,
  };
};
