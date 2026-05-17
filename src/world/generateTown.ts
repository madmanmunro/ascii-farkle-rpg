import type { WorldTile } from "./tile";

export function generateTown(width: number, height: number): WorldTile[][] {
  const town: WorldTile[][] = [];

  for (let y = 0; y < height; y++) {
    const row: WorldTile[] = [];

    for (let x = 0; x < width; x++) {
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
        row.push({ type: "wall" });
      } else {
        row.push({ type: "road" });
      }
    }

    town.push(row);
  }

  town[height - 2][Math.floor(width / 2)] = { type: "exit" };
  town[3][4] = { type: "trader" };
  town[3][8] = { type: "tavern" };
  town[6][5] = { type: "building" };
  town[6][10] = { type: "building" };
  town[8][Math.floor(width / 2)] = { type: "well" };

  return town;
}