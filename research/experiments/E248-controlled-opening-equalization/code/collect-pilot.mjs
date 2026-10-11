import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {gzipSync,gunzipSync} from 'node:zlib';
import {execFileSync,spawnSync} from 'node:child_process';
import {openResearchData,sha256} from '../../../data-policy.mjs';
import {Engine} from '../../../../tools/calibration/engine.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {collectPanel} from '../../E138-bounded-engine-panels/code/collect.mjs';
import {explainMove} from '../../E138-bounded-engine-panels/code/engine-panel.mjs';
import {checkPanel} from '../../E138-bounded-engine-panels/code/check-panel.mjs';
import {savedObservations} from '../../E147-opening-pressure-estimates/code/saved-observations.mjs';
import {cases,engineFixture} from './fixtures.mjs';
const dir='research/experiments/E248-controlled-opening-equalization',guard=await openResearchData(['D001'],{purpose:'test'}),receipt=guard.receipt,revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim();
const out=dir+'/evidence/v2';
const values=r=>{const v=r.enginePanelAnalysis.view;return{actor:v.actor,top:v.panels.map(p=>p.top),actualActor:v.panels.map(p=>p.actual.score),alternativeActor:v.panels.map(p=>p.rows.find(r=>r.move==='a7a6')?.score??null),searches:v.searches};};
if(process.argv[2]==='--child'){
 const index=Number(process.argv[3]);assert(Number.isSafeInteger(index)&&index>=0&&index<2);const x=cases()[index],fixture=engineFixture(x.input),begin=performance.now(),deadline=begin+25000,originalUntil=Engine.prototype.until;
 // Preserve the maintained collector's partial ledger on engine timeout.
 // Outer parent has a separate30second subprocess fallback. No chess budget,
 // engine option or observation interpretation is changed.
 Engine.prototype.until=function(predicate,timeout=60000){return originalUntil.call(this,predicate,Math.min(timeout,Math.max(1,deadline-performance.now())));};
 let bundle,result=null,error=null;try{bundle=await collectPanel(fixture);assert.equal(bundle.status,'complete',bundle.error);const full=explainMove({...fixture,enginePanel:bundle});result={after:full.after,enginePanelAnalysis:full.enginePanelAnalysis,events:full.events.filter(e=>e.evidence?.experiment==='E138')};checkPanel(fixture,bundle,result);}catch(e){error=e.stack;}finally{Engine.prototype.until=originalUntil;}
 const seconds=(performance.now()-begin)/1000;await writeFile(out+'/'+x.id+'.json.gz',gzipSync(JSON.stringify({...x,fixture,bundle:bundle??null,result,seconds,error,receipt,revision})+'\n'),{flag:'wx'});console.log(JSON.stringify({id:x.id,seconds,error,values:result?values(result):null}));assert.equal(error,null);
}else{
 await mkdir(out,{recursive:true});const inputHashes=await bindings([dir+'/plan.md',dir+'/amendment-2026-10-11.md',dir+'/code/collect-pilot.mjs','tools/calibration/engine-host.cjs','engine/stockfish-19-lite-single.js','engine/stockfish-19-lite-single.wasm','research/concepts/catalog.json','research/AGENTS.md','research/concepts/BUILD-FIRST.md','research/concepts/ACTIVE-QUEUE.md','research/DATA_POLICY.md']);await writeFile(out+'/started.json',JSON.stringify({revision,inputHashes,receipt},null,2)+'\n',{flag:'wx'});
 const old=await savedObservations(),borrowed=[];for(const row of old.engines.filter(r=>r.key.history.moves.length===0||r.key.history.moves.join(',')==='e2e4'||r.key.move==='f8c5')){const fixture=engineFixture(row.key),full=explainMove({...fixture,enginePanel:row.bundle}),result={after:full.after,enginePanelAnalysis:full.enginePanelAnalysis,events:full.events.filter(e=>e.evidence?.experiment==='E138')};checkPanel(fixture,row.bundle,result);borrowed.push({key:row.key,bundleSha256:sha256(JSON.stringify(row.bundle)),values:values(result)});}assert.equal(borrowed.length,3);await writeFile(out+'/borrowed.json',JSON.stringify({source:'E147',observationsSha256:sha256(await readFile('research/experiments/E147-opening-pressure-estimates/evidence/observations.json.gz')),sourceAuditSha256:sha256(await readFile('research/experiments/E147-opening-pressure-estimates/evidence/source-audit.json')),borrowed},null,2)+'\n',{flag:'wx'});
 const panels=[];let error=null;const begin=performance.now();try{for(const [index,x]of cases().entries()){const t=performance.now(),r=spawnSync(process.execPath,[dir+'/code/collect-pilot.mjs','--child',String(index)],{encoding:'utf8',windowsHide:true,timeout:30000}),seconds=(performance.now()-t)/1000,processRecord={id:x.id,seconds,exitCode:r.status,signal:r.signal,processError:r.error?.message??null,stdout:r.stdout,stderr:r.stderr};await writeFile(out+'/'+x.id+'-process.json',JSON.stringify(processRecord,null,2)+'\n',{flag:'wx'});console.log(r.stdout);console.error(r.stderr);assert.equal(r.status,0);const row=JSON.parse(gunzipSync(await readFile(out+'/'+x.id+'.json.gz')));panels.push({id:x.id,seconds,searches:row.bundle.searchCount,requestedNodes:row.bundle.ledger.reduce((n,r)=>n+r.budget.value,0),observedNodes:row.bundle.ledger.reduce((n,r)=>n+(r.result?.nodes??0),0),values:values(row.result)});if(index===0)assert(seconds<=10,'First panel smoke exceeds ten seconds');}}catch(e){error=e.stack;}const seconds=(performance.now()-begin)/1000;await writeFile(out+'/collection.json',JSON.stringify({revision,inputHashes,receipt,panels,seconds,error,newPanels:panels.length,requestedNodes:panels.reduce((n,r)=>n+r.requestedNodes,0),observedNodes:panels.reduce((n,r)=>n+r.observedNodes,0)},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({panels,seconds,error}));assert.equal(error,null);
}
