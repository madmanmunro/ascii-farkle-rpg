import type { WorldTile } from "./tile";

function randomChance(chance: number): boolean {
  return Math.random() < chance;
}

export function generateWorld(width: number, height: number): WorldTile[][] {
  const world: WorldTile[][] = [];

  for (let y = 0; y < height; y++) {
    const row: WorldTile[] = [];

    for (let x = 0; x < width; x++) {
      const nearEdge = x < 3 || y < 3 || x > width - 4 || y > height - 4;

      if (nearEdge) {
        row.push({ type: "ocean" });
        continue;
      }

      const roll = Math.random();

      if (roll < 0.08) {
        row.push({ type: "forest" });
      } else if (roll < 0.13) {
        row.push({ type: "desert" });
      } else if (roll < 0.18) {
        row.push({ type: "mountain" });
      } else {
        row.push({ type: "plains" });
      }
    }

    world.push(row);
  }

  placeFeature(world, "town", 4);
  placeFeature(world, "cave", 5);
  carveRiver(world);

  return world;
}

function placeFeature(world: WorldTile[][], type: WorldTile["type"], count: number): void {
  let placed = 0;

  while (placed < count) {
    const y = Math.floor(Math.random() * world.length);
    const x = Math.floor(Math.random() * world[0].length);

    if (world[y][x].type === "plains" || world[y][x].type === "forest") {
      world[y][x] = { type };
      placed++;
    }
  }
}

function carveRiver(world: WorldTile[][]): void {
  let x = Math.floor(world[0].length / 2);

  for (let y = 3; y < world.length - 3; y++) {
    world[y][x] = { type: "river" };

    if (randomChance(0.4)) {
      x += Math.random() < 0.5 ? -1 : 1;
    }

    x = Math.max(3, Math.min(world[0].length - 4, x));
  }
}