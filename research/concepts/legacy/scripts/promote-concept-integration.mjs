import {readFile, writeFile, readdir, mkdir} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

// This is an implementation promotion, separate from research acceptance. Freeze
// source identity, adapt only browser imports and bind the existing parent chain.
const root = path.resolve(import.meta.dirname, '..');
const destination = 'lib/concepts/detectors';
const read = async file => (await readFile(path.join(root, file), 'utf8')).replaceAll('\r\n', '\n');
const sha = text => createHash('sha256').update(text).digest('hex');
const folders = await readdir(path.join(root, 'research/experiments'));
const sources = new Map();
const entries = [];
const promotedName = file => file.split('/')[2].match(/^(E\d{3}|FRIEND-\d{2})/)[0] + '-' + path.posix.basename(file);
const buildRecord = folder => read('research/experiments/' + folder + '/build.json').then(JSON.parse, () => null);
const isSelected = folder => (/^E\d{3}-/.test(folder) && +folder.slice(1, 4) >= 81 && +folder.slice(1, 4) <= 177) || /^FRIEND-\d{2}-/.test(folder);

for (const folder of folders.filter(isSelected)) {
  const record = await buildRecord(folder);
  for (const file of await readdir(path.join(root, 'research/experiments', folder, 'code'))) {
    if (!file.endsWith('.mjs')) continue;
    const source = 'research/experiments/' + folder + '/code/' + file;
    const text = await read(source);
    if (!/export function explainMove\(/.test(text)) continue;
    const study = folder.match(/^(E\d{3}|FRIEND-\d{2})/)[0];
    if (!['E081', 'E082', 'E140'].includes(study) && (!record || record.stage !== 'code-ready')) throw Error('Missing ready implementation record: ' + source);
    if (record?.inputHashes[source] && record.inputHashes[source] !== sha(text)) throw Error('Stale implementation source: ' + source);
    entries.push({
      study, file: source,
      flags: [...new Set([...text.matchAll(/\b(?:input|i)\.(\w+Tags)/g)].map(m => m[1]))],
      budgets: [...new Set([...text.matchAll(/\b(?:input|i)\.(max\w+Nodes)/g)].map(m => m[1]))],
      role: study === 'E140' ? 'prerequisite' : 'detector',
      researchStatus: ['E081', 'E082'].includes(study) ? 'accepted' : study === 'E140' ? 'support' : 'provisional',
      claims: record?.claims || [],
    });
  }
}
entries.sort((a, b) => a.study.localeCompare(b.study));

const supplemental = {
  E189: 'bounded-decision-support/code/support.mjs',
  E199: 'board-question-evidence/code/questions.mjs',
  E200: 'recorded-move-changes/code/changes.mjs',
  E201: 'check-capture-threat-question/code/question.mjs',
  E202: 'opponent-threat-perspectives/code/opponent.mjs',
  E206: 'king-vulnerability-question/code/kings.mjs',
  E209: 'hypothetical-resources-position-demands/code/hypothetical.mjs',
  E237: 'rule-deadline-conversion/code/deadline.mjs',
};
const importPattern = /(?:from\s*|import\s*\(\s*|import\s*)['"]([^'"]+)['"]/g;
async function visit(file) {
  if (sources.has(file) || file === 'lib/chess.js') return;
  if (!file.startsWith('research/experiments/')) throw Error('Unsupported dependency ' + file);
  const text = await read(file);
  sources.set(file, text);
  for (const match of text.matchAll(importPattern)) {
    const specifier = match[1];
    if (specifier.startsWith('node:')) {
      if (!['node:assert/strict', 'node:util'].includes(specifier)) throw Error('Unavailable browser dependency ' + file + ' ' + specifier);
    } else await visit(path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier)));
  }
}
for (const entry of entries) await visit(entry.file);
for (const [study, file] of Object.entries(supplemental)) await visit('research/experiments/' + study + '-' + file);

const old = JSON.parse(await read('lib/concepts/provenance.json'));
const staged = new Set(entries.map(entry => entry.file));
const records = {};
await mkdir(path.join(root, destination), {recursive: true});
for (const [file, original] of sources) {
  let promoted = original.replace(/((?:from\s*|import\s*\(\s*|import\s*)['"])([^'"]+)(['"])/g, (_, prefix, specifier, quote) => {
    if (['node:assert/strict', 'node:util'].includes(specifier)) return prefix + '../assert.js' + quote;
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier));
    return prefix + (target === 'lib/chess.js' ? '../../chess.js' : './' + promotedName(target)) + quote;
  });
  if (staged.has(file)) {
    if (!/explainMove as parent/.test(promoted)) throw Error('Missing staged parent ' + file);
    promoted = "import {stagedParent} from '../stage.js';\n" + promoted.replace(/explainMove as parent/, 'explainMove as originalParent')
      + '\nconst parent = input => stagedParent(originalParent, input);\n';
  }
  promoted = promoted.replace(/\n+$/, '\n');
  const output = promotedName(file);
  if (old.sources[file]) {
    if (await read(destination + '/' + output) !== promoted) throw Error('Would alter existing accepted module ' + file);
  } else await writeFile(path.join(root, destination, output), promoted);
  records[file] = {file: output, sha256: sha(original), promotedSha256: sha(promoted), staged: staged.has(file)};
}

const trackerPath = 'research/experiments/E082-rook-ending-facts/evidence/concept-status.md';
const tracker = await read(trackerPath);
const verified = [...tracker.matchAll(/^- \[x\] (C\d{4}) \*\*([^*]+)\*\* — (.*)$/gm)].map(([, occurrence, name, scope]) => ({occurrence, name, scope}));
const supplementalScopes = [];
for (const [study, file] of Object.entries(supplemental)) {
  const folder = study + '-' + file.split('/')[0];
  const record = await buildRecord(folder);
  if (!record || record.stage !== 'code-ready') throw Error('Missing ready inspector record: ' + folder);
  supplementalScopes.push({study, researchStatus: 'provisional', claims: record.claims});
}

function disposition(study) {
  if (study === 'E140') return 'support';
  if (entries.some(entry => entry.study === study) || supplemental[study]) return 'integrated';
  if (+study.slice(1) >= 221 && +study.slice(1) <= 229) return 'support';
  return 'unavailable';
}
function reason(study) {
  if (['E176','E178','E180'].includes(study)) return 'Canonical scope projector onto existing E143/E174/E156 evidence; requires re-admission (including Node hash bindings) and adds no independent detector. Existing narrow source observations remain available.';
  if (['E181','E183'].includes(study)) return 'Historical forcing/initiative comparison requires a declared prior alternative and complete prior proof tree; history alone does not establish the counterfactual.';
  if (['E184','E185','E186','E187','E188'].includes(study)) return 'Requires a declared legal alternative, follow-up, pawn goal or artificial context-relocation comparison plus full certified policies; played history does not supply that intent.';
  if (+study.slice(1)>=190 && +study.slice(1)<=198) return 'Requires a declared liquidation/target/defender/comparison goal and its exact complete policy panel; no strategic objective is inferred from the played move.';
  if (study==='E203') return 'Requires selected-color complete all-unit coverage for a declared tracked-pawn capture objective, with a covering comparator; no general best/worst-piece ranking is supported.';
  if (study==='E204') return 'Requires explicit queen-exchange alternative and verified five-unit E177 policy panel; no broad initiative or beneficial-exchange claim follows from a capture.';
  if (study==='E205') return 'Requires artificial pawn-relocation/minor-replacement comparisons and a declared conversion goal; unchanged texture alone establishes no beneficiary.';
  if (study==='E207') return 'Requires a declared noncapture alternative and complete material-to-mate transformation policy; nominal material alone supplies no transformation proof.';
  if (study==='E208') return 'Requires complete admitted defensive graph for a declared goal; ordinary engine lines do not certify strongest defense.';
  if (['E210','E216','E218','E219'].includes(study)) return 'Requires a supplied sustainable finite-state policy/conversion proof or a declared minor-outpost objective panel; no such certificate exists for arbitrary reviewed games.';
  if (+study.slice(1)>=211 && +study.slice(1)<=220) return 'Requires private admitted exact-source tablebase/rook-defense/exchange/equality tokens; research fixture observations cannot generalize to arbitrary local positions.';
  if (study === 'E140') return 'Input-contract prerequisite only, coverageCredit:false. No tablebase outcome detector or coverage credit.';
  if (study === 'E138') return 'Bounded engine-panel adapter requires a verified supplied panel. Existing Stockfish scores are not that certificate interface.';
  if (study === 'E141') return 'Synthetic contract projection only; real WDL/DTZ requires admitted local tablebase files, full subtable closure and a probe. No arbitrary-game tablebase result is available.';
  if (study === 'E120') return 'Registered move-order detector needs an explicit planned orderFollowup UCI; played-move review does not supply or invent one.';
  if (entries.some(entry => entry.study === study)) return 'Selected move/history detector; missing per-position prerequisites and exhausted searches abstain.';
  if (supplemental[study]) return 'Selected position/history inspector; only directly supported answers exposed.';
  if (disposition(study) === 'support') return 'Separate reference, reported context or study-session support; not a played-move detector.';
  if (study === 'E260') return 'Original-occurrence census is metadata accounting, not a detector.';
  if (['E253', 'E257'].includes(study)) return 'Strategic/practical prerequisites are documented; no ready detector with independently supported outcomes.';
  if (+study.slice(1) >= 244) return 'Requires private admitted saved-policy/tablebase/contrast token; unavailable for arbitrary local games.';
  if (+study.slice(1) >= 231) return 'Requires explicit comparison, reported choice, goal or source evidence absent from played-move input.';
  return 'Requires declared comparison/goal, complete certified candidate panels, or scope projection onto prior proofs; no such evidence supplied by extension.';
}
const inventory = [];
for (const folder of folders.filter(folder => /^E\d{3}-/.test(folder) && +folder.slice(1, 4) >= 83 && +folder.slice(1, 4) <= 269)) {
  const study = folder.slice(0, 4), record = await buildRecord(folder);
  inventory.push({study, disposition: disposition(study), reason: reason(study), claims: record?.claims || []});
}
// Bind the production adaptations as well as frozen research source. Regenerating
// after legacy promotion restores the integration profile deterministically.
const profile = (await read('lib/concepts/profile.js')).replace(/export const CONCEPT_VERSION = [^;]+;/, 'export const CONCEPT_VERSION = "E177-P003-v1";');
await writeFile(path.join(root, 'lib/concepts/profile.js'), profile);
const runtime = {};
for (const file of ['lib/concepts/analyze.js','lib/concepts/assert.js','lib/concepts/profile.js','lib/concepts/runtime.js','lib/concepts/stage.js','lib/concepts/controls.js','lib/concepts/catalog.js','lib/concepts/registry.js','lib/concepts/fast-consequences.js','lib/concepts/worker.js','lib/concepts/session.js']) runtime[file] = sha(await read(file));
const provenance = {schema: 'concept-integration-v1', decision: 'P003',
  researchAcceptance: 'Unchanged E082; provisional scopes are implementation availability only.',
  trackerPath, trackerSha256: sha(tracker), verified, sources: records, runtime, entries, supplementalScopes, inventory};
await writeFile(path.join(root, 'lib/concepts/integration-provenance.json'), JSON.stringify(provenance, null, 2) + '\n');
await writeFile(path.join(root, 'lib/concepts/integration-profile.js'), '// Generated source/profile identity; safe to load on the UI thread.\nexport const INTEGRATION_FINGERPRINT = '
  + JSON.stringify(sha(JSON.stringify({records, runtime, entries, verified, profile: 'P003-staged-4000-panels-v1'}))) + ';\n');
await writeFile(path.join(root, 'lib/concepts/entries.js'), '// Generated by scripts/promote-concept-integration.mjs.\n'
  + entries.map((entry, i) => `import {explainMove as detector${i}} from './detectors/${promotedName(entry.file)}';`).join('\n')
  + '\nexport const DETECTORS = [\n' + entries.map((entry, i) => `  {...${JSON.stringify({...entry, file: promotedName(entry.file)})}, run: detector${i}}`).join(',\n') + '\n];\n');
console.log(`Integrated ${entries.filter(entry => entry.role === 'detector').length} detectors plus one prerequisite stage and ${Object.keys(supplemental).length} supplemental inspectors; ${sources.size} source modules. Accepted tracker unchanged: ${verified.length}.`);
