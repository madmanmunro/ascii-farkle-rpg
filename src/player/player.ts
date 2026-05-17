export type Player = {
  name: string;
  hp: number;
  maxHp: number;
  gold: number;
  x: number;
  y: number;
};

export function createPlayer(): Player {
  return {
    name: "Wanderer",
    hp: 20,
    maxHp: 20,
    gold: 25,
    x: 5,
    y: 5,
  };
}