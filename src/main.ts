import "./style.css";
import { hasScoringDice, rollDice, scoreDice } from "./dice/farkle";
import { createPlayer } from "./player/player";
import { renderGame } from "./ui/render";
import {
  createTownMap,
  isBlocked,
  setWorldMap,
  worldMap,
} from "./world/world";
import type { Encounter } from "./encounters/encounter";
import type { WorldMode } from "./world/tile";

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

type Position = {
  x: number;
  y: number;
};

const app = document.querySelector<HTMLDivElement>("#app")!;
const player = createPlayer();

let exchange: ExchangeState | null = null;
let worldMode: WorldMode = "overworld";
let overworldMap = worldMap;
let overworldPosition = { x: player.x, y: player.y };

const log: string[] = [
  "You enter a classic RPG overworld.",
  "Explore towns, caves, forests, rivers, deserts, and mountains.",
];

function draw(): void {
  app.innerHTML = renderGame(player, log, exchange);
}

function isWalkablePosition(x: number, y: number): boolean {
  return !isBlocked(x, y);
}

function hasOpenAdjacentTile(x: number, y: number): boolean {
  return (
    isWalkablePosition(x, y - 1) ||
    isWalkablePosition(x, y + 1) ||
    isWalkablePosition(x - 1, y) ||
    isWalkablePosition(x + 1, y)
  );
}

function findSafeStartingPosition(): Position {
  for (let y = 0; y < worldMap.length; y++) {
    for (let x = 0; x < worldMap[y].length; x++) {
      if (isWalkablePosition(x, y) && hasOpenAdjacentTile(x, y)) {
        return { x, y };
      }
    }
  }

  return { x: 1, y: 1 };
}

function placePlayerAtSafeStart(): void {
  const safeStart = findSafeStartingPosition();

  player.x = safeStart.x;
  player.y = safeStart.y;

  overworldPosition = { x: player.x, y: player.y };
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

  if (tile.type === "exit") {
    log.push("You see the town exit. Press E to leave.");
    return;
  }

  if (tile.type === "trader") {
    log.push("A trader waits here. Press E to interact.");
    return;
  }

  if (tile.type === "tavern") {
    log.push("You hear noise from the tavern. Press E to enter.");
    return;
  }

  if (tile.type === "well") {
    log.push("An old well descends into darkness. Press E to inspect.");
    return;
  }

  if (tile.type === "building") {
    log.push("A small building stands here. Press E to enter.");
    return;
  }

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

  if (tile.type === "road") {
    log.push("You walk along the town road.");
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

  if (worldMode === "overworld" && tile.type === "town") {
    overworldPosition = { x: player.x, y: player.y };
    overworldMap = worldMap;
    setWorldMap(createTownMap());
    worldMode = "town";

    player.x = Math.floor(worldMap[0].length / 2);
    player.y = worldMap.length - 3;

    log.push("You enter town. Visit the trader, tavern, buildings, or well.");
    draw();
    return;
  }

  if (worldMode === "town" && tile.type === "exit") {
    setWorldMap(overworldMap);
    worldMode = "overworld";

    player.x = overworldPosition.x;
    player.y = overworldPosition.y;

    log.push("You leave town and return to the overworld.");
    draw();
    return;
  }

  if (worldMode === "town" && tile.type === "trader") {
    log.push("You approach the trader. Bartering system will connect here next.");
    draw();
    return;
  }

  if (worldMode === "town" && tile.type === "tavern") {
    log.push("You enter the tavern. Rumors, disputes, and quests will connect here next.");
    draw();
    return;
  }

  if (worldMode === "town" && tile.type === "well") {
    log.push("You peer into the well. Dungeon descent will connect here next.");
    draw();
    return;
  }

  if (worldMode === "town" && tile.type === "building") {
    log.push("You enter a quiet building. Interior maps will connect here later.");
    draw();
    return;
  }

  if (worldMode === "overworld" && tile.type === "cave") {
    log.push("Dungeon crawler system coming next.");
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

  log.push(
    `Rolled: ${exchange.currentRoll
      .map((die, index) => `${index + 1}:${die}`)
      .join("  ")}`
  );

  log.push("Choose dice with number keys, then press B to bank.");
  draw();
}

function toggleHeldDie(index: number): void {
  if (!exchange) return;
  if (index < 0 || index >= exchange.currentRoll.length) return;

  if (exchange.heldIndexes.includes(index)) {
    exchange.heldIndexes = exchange.heldIndexes.filter(
      (heldIndex) => heldIndex !== index
    );
  } else {
    exchange.heldIndexes.push(index);
  }

  exchange.heldDice = exchange.heldIndexes.map(
    (heldIndex) => exchange!.currentRoll[heldIndex]
  );

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

placePlayerAtSafeStart();
describeCurrentTile();
draw();