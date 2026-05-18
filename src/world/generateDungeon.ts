import { createMonster } from "../encounters/encounter";
import type { WorldTile } from "./tile";

export function generateDungeon(width: number, height: number, level = 1): WorldTile[][] {
  const dungeon: WorldTile[][] = [];

  for (let y = 0; y < height; y++) {
    const row: WorldTile[] = [];

    for (let x = 0; x < width; x++) {
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
        row.push({ type: "wall" });
      } else {
        row.push({ type: "floor" });
      }
    }

    dungeon.push(row);
  }

  dungeon[height - 2][Math.floor(width / 2)] = { type: "exit" };
  dungeon[2][Math.floor(width / 2)] = { type: "stairsDown" };

  placeRandomLoot(dungeon, 5);
  placeRandomMonsters(dungeon, level, 5);

  return dungeon;
}

function placeRandomLoot(dungeon: WorldTile[][], count: number): void {
  for (let i = 0; i < count; i++) {
    const spot = findRandomFloor(dungeon);
    dungeon[spot.y][spot.x] = { type: "loot" };
  }
}

function placeRandomMonsters(dungeon: WorldTile[][], level: number, count: number): void {
  for (let i = 0; i < count; i++) {
    const spot = findRandomFloor(dungeon);
    dungeon[spot.y][spot.x] = {
      type: "floor",
      encounter: createMonster(level),
    };
  }
}

function findRandomFloor(dungeon: WorldTile[][]): { x: number; y: number } {
  while (true) {
    const y = Math.floor(Math.random() * dungeon.length);
    const x = Math.floor(Math.random() * dungeon[y].length);

    if (dungeon[y][x].type === "floor" && !dungeon[y][x].encounter) {
      return { x, y };
    }
  }
}