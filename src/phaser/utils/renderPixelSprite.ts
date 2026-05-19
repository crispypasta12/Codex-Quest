export type PixelSprite = (string | null)[][];

export function spriteSize(sprite: PixelSprite, pixelSize = 1) {
  return {
    width: Math.max(...sprite.map((row) => row.length)) * pixelSize,
    height: sprite.length * pixelSize,
  };
}

export function createSpriteCanvas(sprite: PixelSprite, pixelSize = 1) {
  const { width, height } = spriteSize(sprite, pixelSize);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = false;
  for (let y = 0; y < sprite.length; y++) {
    const row = sprite[y];
    for (let x = 0; x < row.length; x++) {
      const color = row[x];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }

  return canvas;
}
