import type { Player } from "../player/player";
import type { ExchangeState } from "../main";
import { getTileColorClass, getTileSymbol, worldMap } from "../world/world";

export function renderGame(
  player: Player,
  log: string[],
  exchange: ExchangeState | null
): string {
  let mapDisplay = "";

  for (let y = 0; y < worldMap.length; y++) {
    for (let x = 0; x < worldMap[y].length; x++) {
      const tile = worldMap[y][x];

      if (player.x === x && player.y === y) {
        mapDisplay += `<span class="tile-player">@</span>`;
      } else {
        mapDisplay += `<span class="${getTileColorClass(tile)}">${getTileSymbol(tile)}</span>`;
      }
    }

    mapDisplay += "\n";
  }

  const exchangeDisplay = exchange
    ? `
+--------------------------------+
|            EXCHANGE            |
+--------------------------------+
| Opponent: ${exchange.name}
| Type: ${exchange.type}
| Level: ${exchange.level}
| Threshold: ${exchange.threshold}
| Banked: ${exchange.bankedScore}/${exchange.threshold}
| Dice Remaining: ${exchange.diceRemaining}
| Roll: ${exchange.currentRoll.map((die, index) => `${index + 1}:${die}`).join(" ")}
| Held: ${exchange.heldDice.join(", ") || "None"}
+--------------------------------+
| 1-6 Hold/Unhold | B Bank       |
+--------------------------------+`
    : `
+--------------------------------+
|            CONTROLS            |
+--------------------------------+
| W/A/S/D - Move                 |
| E       - Interact             |
+--------------------------------+`;

  return `
<div class="game-layout">
  <pre class="map-panel">${mapDisplay}</pre>

  <div class="side-panel">
<pre class="box">
+--------------------------------+
|            WORLD MAP           |
+--------------------------------+
| <span class="tile-ocean">#</span> Ocean   Dark Navy Blue       |
| <span class="tile-river">~</span> River   Light Blue           |
| <span class="tile-plains">,</span> Plains  Light Olive Green    |
| <span class="tile-desert">.</span> Desert  Orange               |
| <span class="tile-forest">Y</span> Forest  Hunter Green         |
| <span class="tile-mountain">A</span> Mountain Grey               |
| <span class="tile-town">T</span> Town    White                |
| <span class="tile-cave">n</span> Cave    White                |
| <span class="tile-player">@</span> You     White                |
+--------------------------------+
</pre>

<pre class="box">
+--------------------------------+
| HP: ${player.hp}/${player.maxHp}
| Gold: ${player.gold}
+--------------------------------+
</pre>

<pre class="box">${exchangeDisplay}</pre>

<pre class="box">
+--------------------------------+
|              LOG               |
+--------------------------------+
${log.slice(-8).map((entry) => `| ${entry}`).join("\n")}
+--------------------------------+
</pre>
  </div>
</div>
`;
}