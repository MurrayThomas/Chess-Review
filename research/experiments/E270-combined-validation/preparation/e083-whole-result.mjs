// Prepared outside the active freeze. NOT executed/qualified by that regression.
// Independent E083 segment reconstruction; E082 semantics require separate replay.
import assert from 'node:assert/strict';
import {Chess} from '../../../../lib/chess.js';
import {openResearchData} from '../../../data-policy.mjs';

const squares = [...'abcdefgh'].flatMap(file => [...'12345678'].map(rank => file + rank));
const code = move => move.from + move.to + (move.promotion || '');
const inventory = board => squares.flatMap(square => {
  const piece = board.get(square);
  return piece ? [{square, type: piece.type, color: piece.color}] : [];
});
const pawnList = board => inventory(board).filter(piece => piece.type === 'p');
const nonPawnCount = board => inventory(board).filter(piece => !'pk'.includes(piece.type)).length;
const region = square => square[0] < 'd' ? 'queenside' : square[0] > 'e' ? 'kingside' : 'central';
const title = word => word[0].toUpperCase() + word.slice(1);
const clone = value => structuredClone(value);

// Geometric attack, deliberately distinct from legal capture. A pin does not
// suppress an attack in the historical E083 prior-contact interpretation.
function geometric(board, from, to) {
  const piece = board.get(from);
  assert.ok(piece);
  const dx = to.charCodeAt(0) - from.charCodeAt(0), dy = Number(to[1]) - Number(from[1]);
  if (!dx && !dy) return false;
  if (piece.type === 'p') return Math.abs(dx) === 1 && dy === (piece.color === 'w' ? 1 : -1);
  if (piece.type === 'n') return Math.abs(dx) * Math.abs(dy) === 2;
  if (piece.type === 'k') return Math.max(Math.abs(dx), Math.abs(dy)) === 1;
  const diagonal = Math.abs(dx) === Math.abs(dy), orthogonal = dx === 0 || dy === 0;
  if (!(piece.type === 'q' && (diagonal || orthogonal) || piece.type === 'b' && diagonal || piece.type === 'r' && orthogonal)) return false;
  for (let step = 1; step < Math.max(Math.abs(dx), Math.abs(dy)); step++) {
    const square = String.fromCharCode(from.charCodeAt(0) + step * Math.sign(dx)) + (Number(from[1]) + step * Math.sign(dy));
    if (board.get(square)) return false;
  }
  return true;
}

function historyBoard(input) {
  const h = input.history;
  if (h !== undefined) {
    assert.ok(h && typeof h.fen === 'string' && Array.isArray(h.moves) && h.moves.length <= 1000, 'Invalid history');
  }
  const board = new Chess(h === undefined ? input.fen : h.fen), records = [];
  for (const uci of h?.moves || []) {
    assert.equal(board.isGameOver(), false, 'History continues terminal position');
    assert.equal(typeof uci, 'string');
    assert.match(uci, /^[a-h][1-8][a-h][1-8][qrbn]?$/);
    const before = board.fen();
    const move = board.move(uci);
    records.push({before, after: board.fen(), move});
  }
  assert.equal(board.fen(), new Chess(input.fen).fen(), 'History final FEN differs');
  return {board, records, history: h === undefined ? null : {fen: h.fen, moves: clone(h.moves)}};
}

// Source-reviewed E025..E082 policy: these are the ONLY inherited IDs with
// priority below 39. Remaining inherited IDs use >=60/default or higher overrides.
// Parent winner correctness remains an explicit parent-replay prerequisite.
const lowerThan39 = new Set([
  'bishop-pawn-color', 'capture', 'material-balance',
  'nominal-balance', 'material-imbalance', 'piece-movement', 'material-inventory', 'legal-input', 'board-coordinates',
  'pawn-skeleton', 'paired-bishop-armies', 'rook-minor-armies', 'passed-count-imbalance', 'flank-count-imbalance',
  'connected-passer-proof', 'open-pawn-file-proof', 'open-rank-proof',
  'outside-chain-proof', 'behind-chain-proof', 'slider-battery-proof',
  'direct-attack', 'attack-on-pawn', 'attack-on-piece'
]);

function reconstruct(input, parent) {
  const enabled = input.changeTags === undefined ? false : input.changeTags;
  assert.equal(typeof enabled, 'boolean', 'changeTags must be boolean');
  if (!enabled) return clone(parent);
  const limit = input.maxChangeNodes === undefined ? 50000 : input.maxChangeNodes;
  assert.ok(Number.isSafeInteger(limit) && limit >= 0 && limit <= 50000, 'maxChangeNodes must be integer 0..50000');
  assert.ok(Array.isArray(parent.events));
  assert.ok(!parent.events.some(event => event.evidence?.experiment === 'E083'), 'Parent contains E083 result');
  const result = (status, requiredNodes, witness = null, extra = []) => {
    const exhausted = requiredNodes > limit;
    const committed = exhausted ? [] : extra;
    const events = [...clone(parent.events), ...committed];
    const comment = committed.length && parent.events.every(event => lowerThan39.has(event.id)) ? committed[0].text : parent.comment;
    return {...clone(parent), schema: 'coach-concepts-E083-prototype', events, comment,
      changeAnalysis: {limit, nodes: exhausted ? limit + 1 : requiredNodes,
        status: exhausted ? 'exhausted' : status, witness: exhausted ? null : witness}};
  };
  if (parent.error || parent.foundationAnalysis && parent.foundationAnalysis.status !== 'accepted') return result('not-applicable', 0);
  // Work units are derived from complete domains, rather than candidate tick calls.
  // Terminal-before requires history reconstruction; terminal-after also plays once.
  const {board, records, history} = historyBoard(input);
  const beforeNodes = 1 + records.length;
  if (board.isGameOver()) return result('not-live', beforeNodes);
  const before = board.fen(), actor = board.turn(), root = new Chess(before);
  assert.equal(typeof input.move, 'string');
  assert.match(input.move, /^[a-h][1-8][a-h][1-8][qrbn]?$/);
  const move = board.move(input.move), after = board.fen();
  assert.equal(parent.after, after, 'Parent played position differs');
  const afterNodes = beforeNodes + 1;
  if (board.isGameOver()) return result('not-live', afterNodes);
  const witness = {experiment: 'E083', actor, history, before, after,
    beforePieces: inventory(root), afterPieces: inventory(board),
    played: {uci: code(move), san: move.san, piece: move.piece, captured: move.captured || null, promotion: move.promotion || null},
    beforePawns: pawnList(root), afterPawns: pawnList(board), beforeCount: nonPawnCount(root), afterCount: nonPawnCount(board),
    contacts: [], exchange: null};
  const extra = [];
  const event = (id, text, details = {}) => {
    assert.ok(text.split(/\s+/).length <= 24);
    // Snapshot the relevant phase: earlier contact events have exchange:null.
    extra.push({id, text, qualityClaim: false, evidence: {...clone(witness), ...clone(details)}});
  };
  let contactNodes = 0;
  if (!root.isCheck() && !board.isCheck()) {
    const fields = after.split(' ');
    fields[1] = actor;
    fields[3] = '-';
    const hypothetical = new Chess(fields.join(' '));
    const legal = hypothetical.moves({verbose: true});
    contactNodes = 2 + legal.length;
    // Enumerate enemy squares independently, then establish actual legal capture
    // existence. The saved UCI is the first legal representative for that target.
    for (const target of inventory(board).filter(piece => piece.color !== actor)) {
      if (geometric(root, move.from, target.square)) continue;
      const capture = legal.find(candidate => candidate.from === move.to && candidate.to === target.square && candidate.captured && !candidate.flags.includes('e'));
      if (capture) witness.contacts.push({square: target.square, type: capture.captured, capture: code(capture)});
    }
    witness.hypotheticalActorFen = hypothetical.fen();
    if (witness.contacts.length >= 2) event('double-legal-contact', `Double attack: the piece on ${move.to} has legal capture contacts with ${witness.contacts.slice(0, 2).map(target => target.square).join(' and ')}.`);
    for (const target of witness.contacts) {
      const wing = region(target.square);
      const shade = (target.square.charCodeAt(0) - 97 + Number(target.square[1])) % 2 === 0 ? 'light' : 'dark';
      event(wing + '-attack-contact', `${title(wing)} attack contact: ${move.to} can capture the enemy piece on ${target.square} in an actor-turn snapshot.`, {target});
      event(shade + '-square-contact', `${title(shade)}-square attack contact: ${move.to} can capture on ${target.square} in an actor-turn snapshot.`, {target});
      if (target.type === 'p' && target.square[1] === (actor === 'w' ? '7' : '2') && 'fgh'.includes(target.square[0]))
        event('attack-' + target.square[0] + '-pawn', `Pawn attack: ${move.to} has a legal capture contact with the pawn on ${target.square}.`, {target});
    }
  }
  const previous = records.at(-1), priorMove = previous?.move;
  const immediateExchange = priorMove?.captured && move.captured && !priorMove.promotion && !move.promotion && priorMove.color !== actor &&
    priorMove.to === move.to && move.captured === priorMove.piece && !move.flags.includes('e');
  if (immediateExchange) {
    const prePairCount = nonPawnCount(new Chess(previous.before)), afterCount = witness.afterCount;
    witness.exchange = {previous: code(priorMove), previousBefore: previous.before, previousAfter: previous.after,
      lost: priorMove.captured, captured: move.captured, prePairCount, afterCount};
    if (priorMove.captured === 'q' && move.captured === 'q') event('trading-queens-fact', 'Trading queens: both queens were captured in this immediate exchange.');
    const ownKing = witness.beforePieces.find(piece => piece.color === actor && piece.type === 'k').square;
    if (root.isCheck() && geometric(root, priorMove.to, ownKing)) event('trading-checking-attacker', 'Trading attackers: this recapture removes the piece that was checking your king.');
    if (prePairCount > afterCount) {
      event('exchange-simplification', `Simplification by exchange: non-pawn pieces fall from ${prePairCount} to ${afterCount} across the two captures.`);
      event('exchange-liquidation', 'Liquidation fact: this recorded exchange removes pieces from both armies.');
      if (witness.afterPieces.every(piece => 'pkr'.includes(piece.type))) event('endgame-exchange-simplification', 'Endgame simplification fact: this exchange leaves only kings, pawns and optional rooks.');
    }
  }
  if (JSON.stringify(witness.beforePawns) !== JSON.stringify(witness.afterPawns))
    event('pawn-structure-change', `Pawn structure changed: the legal move ${move.san} changes the pawn-square inventory.`);
  if (move.piece === 'p' && !move.promotion) {
    const wing = region(move.to);
    event(wing + '-pawn-expansion', `${title(wing)} pawn advance: your pawn moves from ${move.from} to ${move.to}.`);
    const startRegion = region(move.from), counts = {w: 0, b: 0};
    for (const pawn of witness.beforePawns) if (region(pawn.square) === startRegion) counts[pawn.color]++;
    const own = counts[actor], enemy = counts[actor === 'w' ? 'b' : 'w'];
    if (own > enemy) event('majority-pawn-advance', `Majority advance: this pawn belonged to a ${own}-against-${enemy} pawn majority in the ${startRegion} region.`,
      {majority: {own, enemy, region: startRegion}});
  }
  return result(extra.length ? 'proven' : 'no-new-fact', afterNodes + contactNodes + extra.length, extra.length ? witness : null, extra);
}

/** Whole E083 segment + inherited equality, conditional on separate E082 replay.
 * Caller must bind/authenticate the canonical artifact and source epoch first.
 * This is not a complete coach acceptance entrypoint or a fresh candidate run.
 */
export async function openE083Replay() {
  const {receipt} = await openResearchData(['D001'], {purpose: 'test'});
  return {
    receipt: clone(receipt),
    check(input, actual, parentResult) {
      const expected = reconstruct(input, parentResult);
      assert.deepEqual(actual, expected, 'E083 whole result differs from independent segment reconstruction');
      return {segment: 'E083', exactResult: true, inheritedComparisonOnly: true,
        parentSemanticReplayRequired: true, sharedChessDependency: true, acceptedCredit: 0, receipt: clone(receipt)};
    }
  };
}
export async function checkSavedE083(input, actual, parentResult) {
  return (await openE083Replay()).check(input, actual, parentResult);
}