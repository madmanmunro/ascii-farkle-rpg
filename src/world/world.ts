import type { WorldTile } from "./tile";
import { generateTown } from "./generateTown";
import { generateWorld } from "./generateWorld";

export let worldMap: WorldTile[][] = generateWorld();

export function setWorldMap(newMap: WorldTile[][]): void {
  worldMap = newMap;
}

export function createTownMap(): WorldTile[][] {
  return generateTown(20, 12);
}

export function createOverworldMap(): WorldTile[][] {
  return generateWorld();
}

export function isBlocked(x: number, y: number): boolean {
  const tile = worldMap[y]?.[x];

  if (!tile) return true;

  return tile.type === "ocean" || tile.type === "mountain" || tile.type === "wall";
}

export function getTileSymbol(tile: WorldTile): string {
  if (tile.type === "ocean") return "#";
  if (tile.type === "river") return "~";
  if (tile.type === "plains") return ",";
  if (tile.type === "desert") return ".";
  if (tile.type === "forest") return "Y";
  if (tile.type === "mountain") return "A";
  if (tile.type === "town") return "T";
  if (tile.type === "cave") return "n";
  if (tile.type === "road") return "=";
  if (tile.type === "wall") return "#";
  if (tile.type === "floor") return ",";
  if (tile.type === "building") return "B";
  if (tile.type === "tavern") return "t";
  if (tile.type === "trader") return "$";
  if (tile.type === "well") return "w";
  if (tile.type === "exit") return "<";
  if (tile.type === "stairsDown") return ">";
  if (tile.type === "loot") return "*";

  return "?";
}

export function getTileColorClass(tile: WorldTile): string {
  if (tile.type === "ocean") return "tile-ocean";
  if (tile.type === "river") return "tile-river";
  if (tile.type === "plains") return "tile-plains";
  if (tile.type === "desert") return "tile-desert";
  if (tile.type === "forest") return "tile-forest";
  if (tile.type === "mountain") return "tile-mountain";
  if (tile.type === "town") return "tile-town";
  if (tile.type === "cave") return "tile-cave";

  return "tile-default";
}