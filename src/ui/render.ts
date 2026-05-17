import type { Player } from "../player/player";
import { worldMap } from "../world/world";

export function renderGame(player: Player, log: string[]): string {
  let display = "";

  for (let y = 0; y < worldMap.length; y++) {
    for (let x = 0; x < worldMap[y].length; x++) {
      display += player.x === x && player.y === y ? "@" : worldMap[y][x];
    }

    display += "\n";
  }

  display += `\nHP: ${player.hp}/${player.maxHp}`;
  display += `\nGold: ${player.gold}`;
  display += `\n\nControls: W/A/S/D move, R resolve encounter`;
  display += `\n\nLog:\n${log.slice(-8).join("\n")}`;

  return display;
}