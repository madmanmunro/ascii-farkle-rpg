import type { Encounter } from "../encounters/encounter";

export type WorldMode = "overworld" | "town" | "building" | "dungeon";

export type TileType =
  | "ocean"
  | "plains"
  | "forest"
  | "desert"
  | "mountain"
  | "river"
  | "town"
  | "cave"
  | "road"
  | "wall"
  | "floor"
  | "building"
  | "tavern"
  | "trader"
  | "well"
  | "exit"
  | "stairsDown"
  | "loot";

export type WorldTile = {
  type: TileType;
  encounter?: Encounter;
};