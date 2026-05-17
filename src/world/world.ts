import type { WorldTile } from "./tile";
import { generateWorld } from "./generateWorld";

export const worldMap: WorldTile[][] = generateWorld(30, 18);

export function isBlocked(x: number, y: number): boolean {
  return worldMap[y]?.[x]?.type === "wall" || worldMap[y]?.[x] === undefined;
}

export function getTileSymbol(tile: WorldTile): string {
  if (tile.type === "wall") {
    return "#";
  }

  if (tile.encounter?.type === "monster") {
    return "M";
  }

  if (tile.encounter?.type === "trader") {
    return "T";
  }

  return ".";
}