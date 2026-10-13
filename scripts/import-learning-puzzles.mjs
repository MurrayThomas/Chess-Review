// Explicit maintenance command; never called by the extension or normal build.
// Only a small ranged prefix is downloaded. No full database download is needed.
import {Readable, Transform} from 'node:stream';
import {createZstdDecompress} from 'node:zlib';
import {createHash} from 'node:crypto';
import {writeFile, mkdir} from 'node:fs/promises';
import {legalPosition, uci} from '../lib/concepts/detectors/E020-concepts.mjs';

const source = 'https://database.lichess.org/lichess_db_puzzle.csv.zst';
const themes = ['mateIn1', 'mateIn2', 'fork', 'pin', 'skewer', 'discoveredAttack', 'defensiveMove', 'promotion', 'hangingPiece', 'sacrifice', 'backRankMate', 'endgame'];
const counts = new Map(), positions = new Set(), puzzles = [];
const play = (chess, move) => chess.move({from: move.slice(0, 2), to: move.slice(2, 4), promotion: move[4]});
const abort = new AbortController();
const response = await fetch(source, {headers: {Range: 'bytes=0-8388607'}, signal: abort.signal});
if (response.status !== 206) throw Error('Server must support a bounded range download');
const compressed = Readable.fromWeb(response.body), decoder = createZstdDecompress();
compressed.on('error', error => decoder.destroy(error));
// Node's decoder rejects zstd's leading skippable metadata frame. Strip only
// the frame declared by its signature and size, preserving compressed bytes.
let prefix = Buffer.alloc(0), started = false;
const stripMetadata = new Transform({transform(chunk, encoding, done) {
  if (started) return done(null, chunk);
  prefix = Buffer.concat([prefix, chunk]);
  if (prefix.length < 8) return done();
  const magic = prefix.readUInt32LE(0), skip = (magic & 0xfffffff0) === 0x184d2a50 ? 8 + prefix.readUInt32LE(4) : 0;
  if (skip > 1024 * 1024) return done(Error('Unexpected archive metadata size'));
  if (prefix.length < skip) return done();
  started = true; done(null, prefix.subarray(skip)); prefix = Buffer.alloc(0);
}});
stripMetadata.on('error', error => decoder.destroy(error));
compressed.pipe(stripMetadata).pipe(decoder);
let pending = '', rows = 0;
try {
  for await (const chunk of decoder) {
    pending += chunk.toString('utf8');
    let end;
    while ((end = pending.indexOf('\n')) >= 0) {
      const raw = pending.slice(0, end).trim(); pending = pending.slice(end + 1); rows++;
      const [id, fen, moves, rating, deviation, popularity, plays, tags, gameUrl] = raw.split(',');
      if (!id || !fen || !tags || +popularity < 85 || +plays < 500 || +deviation > 100) continue;
      const allThemes = tags.split(' '), difficulty = +rating < 1300 ? 'Introductory' : +rating < 1850 ? 'Intermediate' : 'Advanced';
      const theme = themes.find(theme => allThemes.includes(theme) && (counts.get(theme + difficulty) || 0) < 6);
      if (!theme) continue;
      try {
        const chess = legalPosition(fen), line = moves.split(' ');
        const setup = play(chess, line[0]), start = chess.fen();
        const key = start.split(' ').slice(0, 4).join(' ');
        if (positions.has(key) || line.length < 2 || line.length > 10 || line.length % 2 !== 0) continue;
        for (const move of line.slice(1)) play(chess, move);
        legalPosition(chess.fen());
        puzzles.push({id, fen: start, setup: {fen, move: uci(setup)}, solution: line.slice(1), rating: +rating, difficulty,
          theme, themes: allThemes, phase: allThemes.includes('opening') ? 'Opening' : allThemes.includes('endgame') ? 'Endgame' : 'Middlegame',
          source: {url: 'https://lichess.org/training/' + id, gameUrl, license: 'CC0-1.0', rowSha256: createHash('sha256').update(raw).digest('hex')}});
        positions.add(key); counts.set(theme + difficulty, (counts.get(theme + difficulty) || 0) + 1);
      } catch { /* Invalid or unsupported records never enter the library. */ }
    }
    if (puzzles.length >= themes.length * 18) break;
  }
} catch (error) {
  // A truncated ranged frame can end with an incomplete trailing record.
  if (error.code !== 'Z_BUF_ERROR') throw error;
} finally { abort.abort(); compressed.destroy(); decoder.destroy(); }
if (puzzles.length < 150) throw Error('Insufficient varied content: ' + puzzles.length + ' in ' + rows + ' rows');
await mkdir('data/learning', {recursive: true});
await writeFile('data/learning/puzzles.json', JSON.stringify({schema: 1, source, license: 'CC0-1.0',
  sourceDocumentation: 'https://database.lichess.org/#puzzles', retrievedAt: new Date().toISOString(), rowsRead: rows,
  validation: 'All setup and solution moves replayed legally using bundled chess.js and exact-position admission. Solutions and tactical tags are supplied by the Lichess Stockfish puzzle pipeline. Any mate-in-one checkmate is accepted.', puzzles}, null, 2) + '\n');
console.log(JSON.stringify({puzzles: puzzles.length, quotas: Object.fromEntries(counts)}, null, 2));
