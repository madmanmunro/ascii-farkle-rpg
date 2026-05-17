import type { WorldTile } from "./tile";
import { generateWorld } from "./generateWorld";

export const worldMap: WorldTile[][] = generateWorld(50, 25);

export function isBlocked(x: number, y: number): boolean {
  const tile = worldMap[y]?.[x];

  if (!tile) {
    return true;
  }

  return tile.type === "ocean" || tile.type === "mountain";
}

export function getTileSymbol(tile: WorldTile): string {
  if (tile.type === "ocean") return "~";
  if (tile.type === "plains") return ".";
  if (tile.type === "forest") return "F";
  if (tile.type === "desert") return "D";
  if (tile.type === "mountain") return "^";
  if (tile.type === "river") return "≈";
  if (tile.type === "town") return "T";
  if (tile.type === "cave") return "C";
  if (tile.type === "road") return "=";
  if (tile.type === "wall") return "#";
  if (tile.type === "floor") return ".";
  if (tile.type === "building") return "B";
  if (tile.type === "tavern") return "t";
  if (tile.type === "trader") return "$";
  if (tile.type === "well") return "w";
  if (tile.type === "exit") return "<";
  if (tile.type === "stairsDown") return ">";
  if (tile.type === "loot") return "*";

  return "?";
}