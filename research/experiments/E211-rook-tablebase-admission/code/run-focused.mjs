import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {spawnSync,execFileSync} from 'node:child_process';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {collectRookPanel} from './collect.mjs';
import {checkRookPanel} from './check-panel.mjs';
import {fixtures} from './fixtures.mjs';
import {context,python} from './context.mjs';
import {dir} from './exports.mjs';
const ctx=await context(),pilot=JSON.parse(await readFile(dir+'/evidence/revised-admission-pilot.json','utf8'));assert.equal(pilot.proceed,true);assert.deepEqual(pilot.inputHashes,await bindings(Object.keys(pilot.inputHashes)));assert.deepEqual(pilot.tablebaseReceipt,ctx.data.receipt);assert.deepEqual(pilot.probeSource,ctx.probeSource);
try{await readFile(dir+'/evidence/panels.json.gz');throw Error('Panels retained; no repeated collection');}catch(e){if(e.code!=='ENOENT')throw e;}
const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),sourceHashes=await bindings([dir+'/code/collect.mjs',dir+'/code/check-panel.mjs',dir+'/code/fixtures.mjs',dir+'/code/context.mjs',dir+'/code/probe.py','research/experiments/E141-admitted-kqk-tablebases/vendor/dependency.json','research/experiments/E141-admitted-kqk-tablebases/vendor/chess/__init__.py','research/experiments/E141-admitted-kqk-tablebases/vendor/chess/syzygy.py','research/experiments/E141-admitted-kqk-tablebases/vendor/COPYING']),rows=[],start=performance.now();
for(const f of fixtures){const reusedPilot=f.id===fixtures[0].id,bundle=reusedPilot?pilot.bundle:await collectRookPanel(f.input,f.options,python),view=checkRookPanel(f.input,f.options,bundle,ctx);rows.push({id:f.id,fixture:f,bundle,view,reusedPilot});await writeFile(dir+'/evidence/panels.json.gz',gzipSync(JSON.stringify({preregisteredRevision:revision,datasetReceipt:ctx.data.receipt.gameGuardReceipt,tablebaseReceipt:ctx.data.receipt,probeSource:ctx.probeSource,sourceHashes,rows})+'\n'));}
const collectionSeconds=(performance.now()-start)/1000,inputHashes=await bindings([dir+'/code/run-focused.mjs',dir+'/code/panels.test.mjs']),begin=performance.now(),r=spawnSync(process.execPath,['--test',dir+'/code/panels.test.mjs'],{encoding:'utf8',windowsHide:true}),seconds=(performance.now()-begin)/1000;
await writeFile(dir+'/evidence/focused-'+(r.status===0?'checks':'failure')+'.json',JSON.stringify({command:'node --test '+dir+'/code/panels.test.mjs',preregisteredRevision:revision,datasetReceipt:ctx.data.receipt.gameGuardReceipt,tablebaseReceipt:ctx.data.receipt,probeSource:ctx.probeSource,inputHashes,collectionSeconds,panels:rows.length,reusedPilotPanels:1,freshPanels:rows.length-1,positionProbes:rows.reduce((n,r)=>n+r.bundle.requiredProbes,0),seconds,exitCode:r.status,stdout:r.stdout,stderr:r.stderr},null,2)+'\n');
if(r.status!==0){const sources={};for(const f of ['collect.mjs','check-panel.mjs','context.mjs','fixtures.mjs','probe.py','panels.test.mjs','run-focused.mjs'])sources[f]=await readFile(dir+'/code/'+f,'utf8');await writeFile(dir+'/evidence/focused-failure-sources.json.gz',gzipSync(JSON.stringify(sources)+'\n'));}console.log(r.stdout);console.error(r.stderr);assert.equal(r.status,0);console.log(JSON.stringify({panels:rows.length,collectionSeconds,seconds}));
