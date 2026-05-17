import "./style.css";
import { rollDice, scoreDice } from "./dice/farkle";
import { createPlayer } from "./player/player";
import { renderGame } from "./ui/render";
import { isBlocked, worldMap } from "./world/world";

const app = document.querySelector<HTMLDivElement>("#app")!;
const player = createPlayer();

const log: string[] = [
  "You enter the open road.",
  "T = trader, M = monster, # = wall, @ = you.",
];

function draw(): void {
  app.innerHTML = `<pre>${renderGame(player, log)}</pre>`;
}

function movePlayer(dx: number, dy: number): void {
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
    log.push("You meet a trader. Press R to barter.");
  } else if (tile === "M") {
    log.push("A hostile creature blocks your path. Press R to fight.");
  } else {
    log.push("You travel onward.");
  }

  draw();
}

function resolveCurrentTile(): void {
  const tile = worldMap[player.y][player.x];
  const dice = rollDice(6);
  const result = scoreDice(dice);

  // Each encounter type has a score threshold the player must meet or beat.
  const traderThreshold = 500;
  const monsterThreshold = 400;

  if (tile === "T") {
    if (result.isFarkle || result.score < traderThreshold) {
      player.gold -= 5;
      log.push(
        `Barter failed. Dice: ${dice.join(", ")}. Score: ${result.score}/${traderThreshold}. You lose 5 gold.`
      );
    } else {
      const profit = Math.floor(result.score / 100);
      player.gold += profit;
      log.push(
        `Barter success. Dice: ${dice.join(", ")}. Score: ${result.score}/${traderThreshold}. You gain ${profit} gold.`
      );
    }
  } else if (tile === "M") {
    if (result.isFarkle || result.score < monsterThreshold) {
      player.hp -= 4;
      log.push(
        `Combat failed. Dice: ${dice.join(", ")}. Score: ${result.score}/${monsterThreshold}. You take 4 damage.`
      );
    } else {
      log.push(
        `Combat success. Dice: ${dice.join(", ")}. Score: ${result.score}/${monsterThreshold}. Monster defeated.`
      );
      worldMap[player.y][player.x] = ".";
    }
  } else {
    log.push("There is nothing to resolve here.");
  }

  if (player.hp <= 0) {
    log.push("You have fallen. Refresh the page to restart.");
  }

  draw();
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (player.hp <= 0) {
    return;
  }

  if (key === "w") movePlayer(0, -1);
  if (key === "s") movePlayer(0, 1);
  if (key === "a") movePlayer(-1, 0);
  if (key === "d") movePlayer(1, 0);
  if (key === "r") resolveCurrentTile();
});

draw();