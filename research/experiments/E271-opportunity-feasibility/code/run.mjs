import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {openResearchData,sha256} from '../../../data-policy.mjs';
import {engineConfig} from '../../../../tools/calibration/engine.mjs';
import {audit} from './audit.mjs';
const args=process.argv.slice(2), smoke=args.includes('--smoke'), rest=args.filter(a=>a!=='--smoke');
if(rest.length!==2||rest[0]!=='--out') throw Error('Use [--smoke] --out research/runs/E271/unique-run');
const root=fileURLToPath(new URL('../../../../',import.meta.url)), out=path.resolve(root,rest[1]);
if(!out.startsWith(path.join(root,'research','runs','E271')+path.sep)) throw Error('Output outside E271 runs');
const started=performance.now(), access=await openResearchData(['D001','D002'],{purpose:'inspect'});
const dataset=await access.readJson('research/datasets/D002-fresh-prefix/games.json.gz');
const evidence=await access.readJson('research/experiments/E008-human-quality-curves/evidence/sf19-observations.json.gz');
const config=await engineConfig(path.join(root,'engine/stockfish-19-lite-single.js'),{kind:'nodes',value:20000});
if(JSON.stringify(config)!==JSON.stringify(evidence.engineConfig)||sha256(JSON.stringify(config))!==evidence.configHash||!evidence.complete||evidence.smoke) throw Error('Wrong cached protocol');
let games=dataset.filter(g=>['train','validation'].includes(g.split));
if(games.length!==600) throw Error('Changed development cohort');
if(smoke) games=games.filter(g=>g.split==='train').slice(0,2);
const result=audit(games,evidence);
const files=['research/experiments/E271-opportunity-feasibility/code/run.mjs','research/experiments/E271-opportunity-feasibility/code/audit.mjs',
  'research/experiments/E008-human-quality-curves/code/queries.mjs','lib/chess.js','tools/calibration/engine.mjs'];
const codeSha256=Object.fromEntries(await Promise.all(files.map(async f=>[f,sha256(await readFile(path.join(root,f)))])));
const bytes=JSON.stringify(result,null,2)+'\n';
const run={schema:'research-run-v1',experiment:'E271',date:'2026-10-15',sourceRevision:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',windowsHide:true}).trim(),
  command:'node research/experiments/E271-opportunity-feasibility/code/run.mjs '+args.join(' '),smoke,seed:null,
  codeSha256,dataEligibility:access.receipt,environment:{node:process.version,platform:process.platform,arch:process.arch},
  evaluationRole:result.role,outputSha256:sha256(bytes),elapsedMs:performance.now()-started};
await mkdir(out,{recursive:true});
await writeFile(path.join(out,'results.json'),bytes,{flag:'wx'});
await writeFile(path.join(out,'run.json'),JSON.stringify(run,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({smoke,games:result.games,passed:result.passed,completeVectors:result.completeVectors,gates:result.gates,queries:result.queries,cost:result.cost,elapsedMs:run.elapsedMs}));
