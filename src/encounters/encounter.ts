export type EncounterType = "monster" | "trader";

export type Encounter = {
  id: string;
  type: EncounterType;
  name: string;
  level: number;
  threshold: number;
  reward: number;
};

const monsterNames = [
  "Bandit",
  "Mutant",
  "Raider",
  "Wraith",
  "Crawler",
  "Hunter",
];

const traderNames = [
  "Merchant",
  "Peddler",
  "Smuggler",
  "Broker",
  "Caravaner",
];

function randomFrom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function createMonster(level: number): Encounter {
  return {
    id: crypto.randomUUID(),
    type: "monster",
    name: randomFrom(monsterNames),
    level,
    threshold: 250 + level * 100,
    reward: 10 + level * 5,
  };
}

export function createTrader(level: number): Encounter {
  return {
    id: crypto.randomUUID(),
    type: "trader",
    name: randomFrom(traderNames),
    level,
    threshold: 300 + level * 100,
    reward: 15 + level * 5,
  };
}