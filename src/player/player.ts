export type Player = {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  xp: number;
  nextLevelXp: number;
  gold: number;
  inventory: string[];
  x: number;
  y: number;
};

export function createPlayer(): Player {
  return {
    name: "Wanderer",
    level: 1,
    hp: 20,
    maxHp: 20,
    xp: 0,
    nextLevelXp: 300,
    gold: 25,
    inventory: ["Empty", "Empty", "Empty"],
    x: 5,
    y: 5,
  };
}