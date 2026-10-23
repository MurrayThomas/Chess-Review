export const PUZZLE_RUN_MODES = {
  timeAttack: {name:'Time attack', duration:180, lives:3, description:'3 minutes · 3 lives'},
  knockout: {name:'Knockout', duration:null, lives:1, description:'No timer · 1 life'}
};

// Eight quick, approachable puzzles build momentum before the steeper climb.
export function runPuzzleRating(index) {
  return index < 8 ? 450 + index * 40 : Math.min(3000, 850 + (index - 8) * 85);
}

export function pickRunPuzzle(puzzles, results = [], random = Math.random) {
  const seen = new Set(results.map(r=>r.id));
  const available = puzzles.filter(p=>!seen.has(p.id));
  if (!available.length) return null;
  const previous = results.at(-1)?.rating || 0;
  const target = Math.max(previous, runPuzzleRating(results.length));
  const rising = available.filter(p=>p.rating >= previous);
  let pool = rising.length ? rising : available;
  if (results.length < 8 && pool.some(p=>p.rating <= 800)) pool = pool.filter(p=>p.rating <= 800);
  let distance = Infinity;
  for (const puzzle of pool) distance = Math.min(distance, Math.abs(puzzle.rating-target));
  let candidates = pool.filter(p=>Math.abs(p.rating-target) <= distance + 50);
  if (results.length < 8 && candidates.some(p=>p.solution.length <= 3)) candidates = candidates.filter(p=>p.solution.length <= 3);
  return candidates[Math.min(candidates.length-1, Math.floor(random()*candidates.length))];
}

export function runBest(progress, mode) {
  const best = progress.bests[mode];
  return Number.isSafeInteger(best) && best > 0 ? best : 0;
}
