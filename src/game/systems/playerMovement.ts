export type MovementInput = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

export const getMovementVelocity = (input: MovementInput, speed: number) => {
  let x = 0;
  let y = 0;

  if (input.left) x -= 1;
  if (input.right) x += 1;
  if (input.up) y -= 1;
  if (input.down) y += 1;

  const length = Math.hypot(x, y);

  if (length === 0) {
    return {
      x: 0,
      y: 0,
    };
  }

  return {
    x: (x / length) * speed,
    y: (y / length) * speed,
  };
};
