export type DiceResult = {
  dice: number[];
  score: number;
  isFarkle: boolean;
};

export function rollDice(count: number): number[] {
  const dice: number[] = [];

  for (let i = 0; i < count; i++) {
    dice.push(Math.floor(Math.random() * 6) + 1);
  }

  return dice;
}

export function scoreDice(dice: number[]): DiceResult {
  let score = 0;
  const counts = new Map<number, number>();

  for (const die of dice) {
    counts.set(die, (counts.get(die) ?? 0) + 1);
  }

  for (const [value, count] of counts) {
    if (count >= 3) {
      score += value === 1 ? 1000 : value * 100;
    }
  }

  if ((counts.get(1) ?? 0) < 3) score += (counts.get(1) ?? 0) * 100;
  if ((counts.get(5) ?? 0) < 3) score += (counts.get(5) ?? 0) * 50;

  return {
    dice,
    score,
    isFarkle: score === 0,
  };
}