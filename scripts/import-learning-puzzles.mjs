// Explicit maintenance command; never called by the extension or normal build.
// Only a bounded archive prefix is downloaded. No full database is needed.
import {createHash} from 'node:crypto';
import {readFile, writeFile, rename} from 'node:fs/promises';
import {legalPosition, uci} from '../lib/learning/rules/E020-concepts.mjs';
import {readPuzzleArchive} from './puzzle-archive.mjs';

const source = 'https://database.lichess.org/lichess_db_puzzle.csv.zst';
const themes = ['mateIn1', 'mateIn2', 'fork', 'pin', 'skewer', 'discoveredAttack', 'defensiveMove', 'promotion', 'hangingPiece', 'sacrifice', 'backRankMate', 'endgame'];
const target = 50_000, minimum = 12, maximum = Math.ceil(target / 36 * 1.5);
const maxBytes = 64 * 1024 * 1024;
const output = new URL('../data/learning/puzzles.json', import.meta.url);
const previous = JSON.parse(await readFile(output, 'utf8'));
// Preserve original records, IDs, saved solve history and resumable puzzles.
const puzzles = [...previous.puzzles];
if (puzzles.length > target) throw Error('Refusing to shrink an existing puzzle library');
const counts = new Map(themes.flatMap(theme => ['Introductory', 'Intermediate', 'Advanced'].map(difficulty => [theme + difficulty, 0])));
const positions = new Set(), ids = new Set();
for (const p of puzzles) {
  const key = p.fen.split(' ').slice(0, 4).join(' '), bucket = p.theme + p.difficulty;
  if (positions.has(key) || ids.has(p.id) || !counts.has(bucket)) throw Error('Invalid retained puzzle: ' + p.id);
  positions.add(key); ids.add(p.id); counts.set(bucket, counts.get(bucket) + 1);
}
const complete = () => puzzles.length === target && [...counts.values()].every(n => n >= minimum);
if (complete()) { console.log(`The existing ${target.toLocaleString('en-US')}-puzzle library already meets the selection quotas.`); process.exit(0); }
const play = (chess, move) => chess.move({from: move.slice(0, 2), to: move.slice(2, 4), promotion: move[4]});
const abort = new AbortController();
const response = await fetch(source, {headers: {Range: `bytes=0-${maxBytes - 1}`},
  signal: AbortSignal.any([abort.signal, AbortSignal.timeout(10 * 60 * 1000)])});
const range = /^bytes 0-(\d+)\/(\d+)$/.exec(response.headers.get('content-range') || '');
if (response.status !== 206 || !range || +range[1] >= maxBytes) {
  await response.body?.cancel();
  throw Error('Server must support a bounded range download starting at byte zero');
}
let pending = '', rows = 0, reported = 0;
let bytes = 0;
try {
  const archive = await readPuzzleArchive(response.body, maxBytes);
  bytes = archive.bytes;
  for (const chunk of archive.frames()) {
    pending += chunk.toString('utf8');
    let end;
    while ((end = pending.indexOf('\n')) >= 0) {
      const raw = pending.slice(0, end).trim(); pending = pending.slice(end + 1); rows++;
      const [id, fen, moves, rating, deviation, popularity, plays, tags, gameUrl] = raw.split(',');
      if (!/^[a-zA-Z0-9]{5}$/.test(id) || ids.has(id) || !fen || !tags ||
          ![rating, deviation, popularity, plays].every(v => v?.trim() && Number.isFinite(+v)) ||
          +rating < 0 || +popularity < 85 || +plays < 500 || +deviation < 0 || +deviation > 100) continue;
      const allThemes = tags.split(' '), difficulty = +rating < 1300 ? 'Introductory' : +rating < 1850 ? 'Intermediate' : 'Advanced';
      // Prefer underrepresented tags. Reserve enough final slots to give even
      // rarer themes a useful minimum in every difficulty band.
      const shortage = [...counts.values()].reduce((n, count) => n + Math.max(0, minimum - count), 0);
      const options = themes.filter(theme => allThemes.includes(theme) && counts.get(theme + difficulty) < maximum &&
        (target - puzzles.length > shortage || counts.get(theme + difficulty) < minimum));
      options.sort((a, b) => counts.get(a + difficulty) - counts.get(b + difficulty));
      const theme = options[0];
      if (!theme) continue;
      try {
        const chess = legalPosition(fen), line = moves.split(' ');
        if (line.length < 2 || line.length > 10 || line.length % 2 !== 0 ||
            !line.every(move => /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move))) continue;
        const setup = play(chess, line[0]), start = chess.fen();
        const key = start.split(' ').slice(0, 4).join(' ');
        if (positions.has(key)) continue;
        for (const move of line.slice(1)) { play(chess, move); legalPosition(chess.fen()); }
        if (allThemes.includes('mate') && !chess.isCheckmate()) continue;
        puzzles.push({id, fen: start, setup: {fen, move: uci(setup)}, solution: line.slice(1), rating: +rating, difficulty,
          theme, themes: allThemes, phase: allThemes.includes('opening') ? 'Opening' : allThemes.includes('endgame') ? 'Endgame' : 'Middlegame',
          source: {url: 'https://lichess.org/training/' + id, gameUrl, license: 'CC0-1.0', rowSha256: createHash('sha256').update(raw).digest('hex')}});
        positions.add(key); ids.add(id); counts.set(theme + difficulty, counts.get(theme + difficulty) + 1);
        if (complete()) break;
      } catch { /* Invalid or unsupported records never enter the library. */ }
    }
    if (complete()) break;
    if (rows - reported >= 10_000) { reported = rows; console.error(`Read ${rows} rows; selected ${puzzles.length}/${target}`); }
  }
} finally { abort.abort(); }
if (!complete()) throw Error(`Insufficient varied content: ${puzzles.length}/${target} in ${rows} rows; smallest group ${Math.min(...counts.values())}`);
const header = {schema: 1, source, license: 'CC0-1.0',
  sourceDocumentation: 'https://database.lichess.org/#puzzles', retrievedAt: new Date().toISOString(), rowsRead: rows,
  selection: {target, retained: previous.puzzles.length, maxDownloadBytes: maxBytes, compressedBytesRead: bytes,
    minimumPerGroup: minimum, maximumPerGroup: maximum, groups: Object.fromEntries(counts)},
  validation: 'All setup and solution moves replayed legally using bundled chess.js and exact-position admission. Advertised mates end in checkmate. Solutions and tactical tags are supplied by the Lichess Stockfish puzzle pipeline. Any mate-in-one checkmate is accepted.'};
// One puzzle per line keeps the offline library compact and diffs readable.
const json = JSON.stringify(header, null, 2).slice(0, -2) + ',\n  "puzzles": [\n' +
  puzzles.map(p => '    ' + JSON.stringify(p)).join(',\n') + '\n  ]\n}\n';
const temporary = new URL('./puzzles.json.tmp', output);
await writeFile(temporary, json);
await rename(temporary, output);
console.log(JSON.stringify({puzzles: puzzles.length, quotas: Object.fromEntries(counts)}, null, 2));
