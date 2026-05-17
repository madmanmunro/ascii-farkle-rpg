import type { Encounter } from "../encounters/encounter";

export type TileType =
  | "floor"
  | "wall";

export type WorldTile = {
  type: TileType;
  encounter?: Encounter;
};