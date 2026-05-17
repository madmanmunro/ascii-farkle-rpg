import { createMonster, createTrader } from "../encounters/encounter";
import type { WorldTile } from "./tile";

export function generateWorld(width: number, height: number): WorldTile[][] {
  const world: WorldTile[][] = [];

  for (let y = 0; y < height; y++) {
    const row: WorldTile[] = [];

    for (let x = 0; x < width; x++) {

      // Outer border walls.
      if (
        x === 0 ||
        y === 0 ||
        x === width - 1 ||
        y === height - 1
      ) {
        row.push({
          type: "wall",
        });

        continue;
      }

      const roll = Math.random();

      // Random monster.
      if (roll < 0.08) {
        row.push({
          type: "floor",
          encounter: createMonster(
            Math.floor(Math.random() * 5) + 1
          ),
        });

        continue;
      }

      // Random trader.
      if (roll < 0.12) {
        row.push({
          type: "floor",
          encounter: createTrader(
            Math.floor(Math.random() * 5) + 1
          ),
        });

        continue;
      }

      // Empty floor.
      row.push({
        type: "floor",
      });
    }

    world.push(row);
  }

  return world;
}