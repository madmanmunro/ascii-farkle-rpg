import type { Player } from "../player/player";
import { worldMap } from "../world/world";
import type { ExchangeState } from "../main";

export function renderGame(player: Player, log: string[], exchange: ExchangeState | null): string {
  let display = "";

  for (let y = 0; y < worldMap.length; y++) {
    for (let x = 0; x < worldMap[y].length; x++) {
      display += player.x === x && player.y === y ? "@" : worldMap[y][x];
    }

    display += "\n";
  }

  display += `\nHP: ${player.hp}/${player.maxHp}`;
  display += `\nGold: ${player.gold}`;

  if (exchange) {
    display += `\n\nEXCHANGE ACTIVE`;
    display += `\nType: ${exchange.type}`;
    display += `\nThreshold: ${exchange.threshold}`;
    display += `\nBanked Score: ${exchange.bankedScore}/${exchange.threshold}`;
    display += `\nDice Remaining: ${exchange.diceRemaining}`;
    display += `\nCurrent Roll: ${exchange.currentRoll.map((die, index) => `${index + 1}:${die}`).join("  ")}`;
    display += `\nHeld Dice: ${exchange.heldDice.join(", ") || "None"}`;
    display += `\n\nControls During Exchange:`;
    display += `\n1-6 = hold/unhold die`;
    display += `\nB = bank held dice and continue`;
  } else {
    display += `\n\nControls: W/A/S/D move, R start encounter`;
  }

  display += `\n\nLog:\n${log.slice(-10).join("\n")}`;

  return display;
}