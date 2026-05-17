import "./style.css";
import { hasScoringDice, rollDice, scoreDice } from "./dice/farkle";
import { createPlayer } from "./player/player";
import { renderGame } from "./ui/render";
import { isBlocked, worldMap } from "./world/world";

export type ExchangeState = {
  type: "barter" | "combat";
  threshold: number;
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
  "You enter the open road.",
  "T = trader, M = monster, # = wall, @ = you.",
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
    log.push("You cannot move there.");
    draw();
    return;
  }

  player.x = nextX;
  player.y = nextY;

  const tile = worldMap[player.y][player.x];

  if (tile === "T") {
    log.push("You meet a trader. Press R to start bartering.");
  } else if (tile === "M") {
    log.push("A hostile creature blocks your path. Press R to fight.");
  } else {
    log.push("You travel onward.");
  }

  draw();
}

function startExchange(): void {
  const tile = worldMap[player.y][player.x];

  if (exchange) {
    log.push("An exchange is already active.");
    draw();
    return;
  }

  if (tile === "T") {
    exchange = createExchange("barter", 500);
    log.push("Barter started. Bank enough dice points to meet 500.");
    rollForExchange();
    return;
  }

  if (tile === "M") {
    exchange = createExchange("combat", 400);
    log.push("Combat started. Bank enough dice points to meet 400.");
    rollForExchange();
    return;
  }

  log.push("There is nothing to resolve here.");
  draw();
}

function createExchange(type: "barter" | "combat", threshold: number): ExchangeState {
  return {
    type,
    threshold,
    damageOnFail: type === "combat" ? 4 : 0,
    goldLossOnFail: type === "barter" ? 5 : 0,
    diceRemaining: 6,
    currentRoll: [],
    heldIndexes: [],
    heldDice: [],
    bankedScore: 0,
  };
}

function rollForExchange(): void {
  if (!exchange) {
    return;
  }

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
  if (!exchange) {
    return;
  }

  if (index < 0 || index >= exchange.currentRoll.length) {
    return;
  }

  if (exchange.heldIndexes.includes(index)) {
    exchange.heldIndexes = exchange.heldIndexes.filter((heldIndex) => heldIndex !== index);
  } else {
    exchange.heldIndexes.push(index);
  }

  exchange.heldDice = exchange.heldIndexes.map((heldIndex) => exchange!.currentRoll[heldIndex]);

  draw();
}

function bankHeldDice(): void {
  if (!exchange) {
    return;
  }

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

  log.push(
    `Banked ${heldResult.score}. Total: ${exchange.bankedScore}/${exchange.threshold}.`
  );

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
  if (!exchange) {
    return;
  }

  const tile = worldMap[player.y][player.x];

  if (exchange.type === "barter") {
    const profit = Math.floor(exchange.bankedScore / 100);
    player.gold += profit;
    log.push(`Barter won. You gain ${profit} gold.`);
  }

  if (exchange.type === "combat") {
    log.push("Combat won. Monster defeated.");
    if (tile === "M") {
      worldMap[player.y][player.x] = ".";
    }
  }

  exchange = null;
  draw();
}

function failExchange(reason: string): void {
  if (!exchange) {
    return;
  }

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

  if (player.hp <= 0) {
    return;
  }

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
  if (key === "r") startExchange();
});

draw();