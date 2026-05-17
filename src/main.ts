import "./style.css";
import { hasScoringDice, rollDice, scoreDice } from "./dice/farkle";
import { createPlayer } from "./player/player";
import { renderGame } from "./ui/render";
import { isBlocked, worldMap } from "./world/world";
import type { Encounter } from "./encounters/encounter";

export type ExchangeState = {
  type: "barter" | "combat";
  name: string;
  level: number;
  threshold: number;
  reward: number;
  damageOnFail: number;
  goldLossOnFail: number;
  diceRemaining: number;
  currentRoll: number[];
  heldIndexes: number[];
  heldDice: number[];
  bankedScore: number;
};

const app = document.querySelector<HTMLDivElement>("#app")!;
const player = createPlayer();

let exchange: ExchangeState | null = null;

const log: string[] = [
  "You enter a classic RPG overworld.",
  "Explore towns, caves, forests, rivers, deserts, and mountains.",
];

function draw(): void {
  app.innerHTML = `<pre>${renderGame(player, log, exchange)}</pre>`;
}

function movePlayer(dx: number, dy: number): void {
  if (exchange) {
    log.push("Finish the current exchange first.");
    draw();
    return;
  }

  const nextX = player.x + dx;
  const nextY = player.y + dy;

  if (isBlocked(nextX, nextY)) {
    log.push("The terrain blocks your path.");
    draw();
    return;
  }

  player.x = nextX;
  player.y = nextY;

  describeCurrentTile();
  draw();
}

function describeCurrentTile(): void {
  const tile = worldMap[player.y][player.x];

  if (tile.type === "town") {
    log.push("You arrive at a town. Press E to enter.");
    return;
  }

  if (tile.type === "cave") {
    log.push("You find a cave entrance. Press E to descend.");
    return;
  }

  if (tile.type === "forest") {
    log.push("You move beneath dense forest cover.");
    return;
  }

  if (tile.type === "desert") {
    log.push("You cross hot desert sands.");
    return;
  }

  if (tile.type === "river") {
    log.push("You follow the river current.");
    return;
  }

  log.push("You travel across the open plains.");
}

function interactWithTile(): void {
  const tile = worldMap[player.y][player.x];

  if (exchange) {
    log.push("Finish the current exchange first.");
    draw();
    return;
  }

  if (tile.type === "town") {
    log.push("Town entry system coming next: streets, tavern, trader, well, and buildings.");
    draw();
    return;
  }

  if (tile.type === "cave") {
    log.push("Dungeon crawler system coming next: rooms, monsters, loot, stairs, and exits.");
    draw();
    return;
  }

  log.push("There is nothing special to interact with here.");
  draw();
}

function createExchange(encounter: Encounter): ExchangeState {
  return {
    type: encounter.type === "trader" ? "barter" : "combat",
    name: encounter.name,
    level: encounter.level,
    threshold: encounter.threshold,
    reward: encounter.reward,
    damageOnFail: encounter.type === "monster" ? 3 + encounter.level : 0,
    goldLossOnFail: encounter.type === "trader" ? 3 + encounter.level : 0,
    diceRemaining: 6,
    currentRoll: [],
    heldIndexes: [],
    heldDice: [],
    bankedScore: 0,
  };
}

function rollForExchange(): void {
  if (!exchange) return;

  exchange.currentRoll = rollDice(exchange.diceRemaining);
  exchange.heldIndexes = [];
  exchange.heldDice = [];

  if (!hasScoringDice(exchange.currentRoll)) {
    failExchange(`Farkle! Roll: ${exchange.currentRoll.join(", ")}.`);
    return;
  }

  log.push(`Rolled: ${exchange.currentRoll.map((die, index) => `${index + 1}:${die}`).join("  ")}`);
  log.push("Choose dice with number keys, then press B to bank.");
  draw();
}

function toggleHeldDie(index: number): void {
  if (!exchange) return;
  if (index < 0 || index >= exchange.currentRoll.length) return;

  if (exchange.heldIndexes.includes(index)) {
    exchange.heldIndexes = exchange.heldIndexes.filter((heldIndex) => heldIndex !== index);
  } else {
    exchange.heldIndexes.push(index);
  }

  exchange.heldDice = exchange.heldIndexes.map((heldIndex) => exchange!.currentRoll[heldIndex]);
  draw();
}

function bankHeldDice(): void {
  if (!exchange) return;

  if (exchange.heldDice.length === 0) {
    log.push("You must hold at least one scoring die before banking.");
    draw();
    return;
  }

  const heldResult = scoreDice(exchange.heldDice);

  if (heldResult.isFarkle) {
    log.push(`Those held dice do not score: ${exchange.heldDice.join(", ")}.`);
    draw();
    return;
  }

  exchange.bankedScore += heldResult.score;
  exchange.diceRemaining -= exchange.heldDice.length;

  log.push(`Banked ${heldResult.score}. Total: ${exchange.bankedScore}/${exchange.threshold}.`);

  if (exchange.bankedScore >= exchange.threshold) {
    winExchange();
    return;
  }

  if (exchange.diceRemaining <= 0) {
    exchange.diceRemaining = 6;
    log.push("Hot dice! All dice scored, rolling all 6 again.");
  }

  rollForExchange();
}

function winExchange(): void {
  if (!exchange) return;

  const tile = worldMap[player.y][player.x];

  if (exchange.type === "barter") {
    player.gold += exchange.reward;
    log.push(`Barter won against ${exchange.name}. You gain ${exchange.reward} gold.`);
  }

  if (exchange.type === "combat") {
    player.gold += exchange.reward;
    log.push(`${exchange.name} defeated. You loot ${exchange.reward} gold.`);
  }

  tile.encounter = undefined;
  exchange = null;
  draw();
}

function failExchange(reason: string): void {
  if (!exchange) return;

  log.push(reason);

  if (exchange.type === "barter") {
    player.gold -= exchange.goldLossOnFail;
    log.push(`Barter lost. You lose ${exchange.goldLossOnFail} gold.`);
  }

  if (exchange.type === "combat") {
    player.hp -= exchange.damageOnFail;
    log.push(`Combat lost. You take ${exchange.damageOnFail} damage.`);
  }

  if (player.hp <= 0) {
    log.push("You have fallen. Refresh the page to restart.");
  }

  exchange = null;
  draw();
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (player.hp <= 0) return;

  if (exchange) {
    if (["1", "2", "3", "4", "5", "6"].includes(key)) {
      toggleHeldDie(Number(key) - 1);
    }

    if (key === "b") {
      bankHeldDice();
    }

    return;
  }

  if (key === "w") movePlayer(0, -1);
  if (key === "s") movePlayer(0, 1);
  if (key === "a") movePlayer(-1, 0);
  if (key === "d") movePlayer(1, 0);
  if (key === "e") interactWithTile();
});

draw();