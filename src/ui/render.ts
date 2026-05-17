import type { Player } from "../player/player";
import type { ExchangeState } from "../main";
import { getTileColorClass, getTileSymbol, worldMap } from "../world/world";

const BOX_WIDTH = 35;
const LOG_WIDTH = 53;
const LOG_ROWS = 5;

function padLine(text: string, width: number): string {
  return text.length > width ? text.slice(0, width) : text.padEnd(width, " ");
}

function wrapText(text: string, width: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine.length === 0 ? word : `${currentLine} ${word}`;

    if (testLine.length > width) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine.length > 0) lines.push(currentLine);

  return lines;
}

function makeBox(title: string, lines: string[], width = BOX_WIDTH): string {
  const top = `+${"-".repeat(width)}+`;
  const titleLine = `|${padLine(title.padStart(Math.floor((width + title.length) / 2)), width)}|`;
  const body = lines.map((line) => `|${padLine(line, width)}|`).join("\n");

  return `${top}\n${titleLine}\n${top}\n${body}\n${top}`;
}

function makeLogBox(log: string[]): string {
  const wrappedLines = log.slice(-LOG_ROWS).flatMap((entry) => wrapText(entry, LOG_WIDTH));

  while (wrappedLines.length < LOG_ROWS) {
    wrappedLines.push("");
  }

  return makeBox("LOG", wrappedLines.slice(0, LOG_ROWS), LOG_WIDTH);
}

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

  const playerBox = makeBox("PLAYER", [
    `LV          ${player.level}`,
    `HP          ${player.hp}/${player.maxHp}`,
    `XP          ${player.xp}/${player.nextLevelXp}`,
    `XY          ${player.x.toString().padStart(2, "0")},${player.y.toString().padStart(2, "0")}`,
    `$$          ${player.gold}`,
    `S1          ${player.inventory[0]}`,
    `S2          ${player.inventory[1]}`,
    `S3          ${player.inventory[2]}`,
  ]);

  const controlsBox = exchange
    ? makeBox("EXCHANGE", [
        `Opponent: ${exchange.name}`,
        `Type: ${exchange.type}`,
        `Level: ${exchange.level}`,
        `Threshold: ${exchange.threshold}`,
        `Banked: ${exchange.bankedScore}/${exchange.threshold}`,
        `Dice Remaining: ${exchange.diceRemaining}`,
        `Roll: ${exchange.currentRoll.map((die, index) => `${index + 1}:${die}`).join(" ")}`,
        `Held: ${exchange.heldDice.join(", ") || "None"}`,
        "1-6 Hold/Unhold",
        "B Bank",
      ])
    : makeBox("CONTROLS", ["W/A/S/D - Move", "E       - Interact"]);

  const legendBox = makeBox("WORLD MAP", [
    "# Ocean   Dark Navy Blue",
    "~ River   Light Blue",
    ", Plains  Light Olive Green",
    ". Desert  Orange",
    "Y Forest  Hunter Green",
    "A Mountain Grey",
    "T Town    White",
    "n Cave    White",
    "@ You     White",
  ]);

  const logBox = makeLogBox(log);

  return `
<div class="game-layout">
  <div class="left-panel">
    <pre class="map-panel">${mapDisplay}</pre>
    <pre class="log-panel">${logBox}</pre>
  </div>

  <div class="side-panel">
    <pre class="box">${playerBox}</pre>
    <pre class="box">${controlsBox}</pre>
    <pre class="box">${legendBox}</pre>
  </div>
</div>
`;
}