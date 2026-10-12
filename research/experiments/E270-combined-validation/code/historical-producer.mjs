// Only fixed archive ownership admits historical producers; live checks remain strict.
import assert from 'node:assert/strict';
import {isDeepStrictEqual} from 'node:util';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
import {openResearchData,sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {context} from '../../E211-rook-tablebase-admission/code/context.mjs';
import {checkObservedRookPanel} from '../../E211-rook-tablebase-admission/code/check-execution.mjs';
import {checkRookPanel} from '../../E211-rook-tablebase-admission/code/check-panel.mjs';
import {assertSourceEpochs} from './source-epochs.mjs';
const dir='research/experiments/E270-combined-validation',manifestSha256='753b59548afd89e3a245eeda241cbe2cd17fa6b3ce01070bf862c0c6741605f3',proofSha256='8c675efe8219a4db3bea13182d77bac4d7a0f7fe308aec9a11b075c2b7bb39cf';
let admitted;
const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
export function verifyPanelConcordance(old,current,ctx){
 const legacy=old.bundle.schema==='E211-admitted-rook-panel-v1';
 const historical=(legacy?checkRookPanel:checkObservedRookPanel)(old.input,old.options,old.bundle,{data:ctx.data,probeSource:old.bundle.probeSource}),currentView=checkObservedRookPanel(old.input,old.options,current,ctx),view=structuredClone(currentView),a=structuredClone(old.bundle.panel),b=structuredClone(current.panel);
 if(legacy){delete view.execution;delete view.successfulStderrRetained;}
 delete a.metadata.python;delete b.metadata.python;
 assert(isDeepStrictEqual(a,b),'Panel concordance mismatch');assert(isDeepStrictEqual(historical,view),'View concordance mismatch');return historical;
}
async function load(){
 await openResearchData(['D001'],{purpose:'test'});const ctx=await context(),manifestRaw=await readFile(dir+'/code/complete-repair-manifest.json');assert.equal(sha256(manifestRaw),manifestSha256);const manifest=JSON.parse(manifestRaw),raw=await readFile(dir+'/evidence/complete-producer-repair/observations.json.gz');assert.equal(sha256(raw),proofSha256,'Changed concordance archive');const proof=JSON.parse(gunzipSync(raw));assert.equal(proof.error,null);assert.equal(proof.rows.length,48);assert(proof.seconds<=180);
 // Collection used the then-frozen seven-source verifier. Authenticate its exact
 // Git bytes, while all other collection dependencies must still match now.
 const current=await bindings(Object.keys(proof.inputHashes)),epochFiles=[dir+'/code/source-epochs.mjs',dir+'/code/source-epochs.json'];
 for(const [file,expected]of Object.entries(proof.inputHashes))if(epochFiles.includes(file)){const original=execFileSync('git',['show','583fbbf5b8055bfb654ed2c31e59736faf5918aa:'+file],{encoding:'utf8',windowsHide:true});assert.equal(sha256(original.replaceAll('\r\n','\n')),expected,'Changed collection verifier epoch');}else assert.equal(current[file],expected,'Changed concordance source: '+file);
 assert.deepEqual(Object.keys(current).sort(),Object.keys(proof.inputHashes).sort());assert.deepEqual(proof.currentProducer,ctx.probeSource,'Current producer changed since concordance');
 const records=new Map(),lock=await readFile('research/experiments/E141-admitted-kqk-tablebases/vendor/dependency.json','utf8');
 for(const a of manifest.artifacts){const bytes=await readFile(a.file);assert.equal(sha256(bytes),a.sha256);const parsed=JSON.parse(a.codec==='json'?bytes:gunzipSync(bytes)),old=a.codec==='baseline'?(()=>{const r=parsed.rows.find(r=>r.fixture.id===a.fixtureId);assert(r);return{input:r.fixture.input,options:r.fixture.options,bundle:r.bundle,inputHashes:parsed.sourceHashes};})():parsed,match=proof.rows.find(r=>r.id===a.id);assert(match);assert.equal(match.file,a.file);assert.equal(match.sha256,a.sha256);assert.deepEqual(match.input,old.input);assert.deepEqual(match.options,old.options);await assertSourceEpochs(old.inputHashes);assert.equal(old.bundle.probeSource.programSha256,ctx.probeSource.programSha256);assert.deepEqual(old.bundle.probeSource.modules,ctx.probeSource.modules);assert([sha256(lock),sha256(lock.replaceAll('\n','\r\n'))].includes(old.bundle.probeSource.vendorLockSha256));
 const view=verifyPanelConcordance(old,match.bundle,ctx);assert.deepEqual(view,match.historicalView);assert.deepEqual(view,match.view);assert.equal(match.nonPythonPanelEquality,true);assert.equal(match.viewEquality,true);assert(!records.has(a.id));records.set(a.id,freeze({record:old,view,originalProducer:old.bundle.probeSource,currentProducer:match.bundle.probeSource,concordanceArchiveSha256:proofSha256,legacy:a.schema==='V1'}));}
 assert.equal(records.size,48);return {records,currentProducer:ctx.probeSource};
}
export async function readHistoricalPanel(id){assert.equal(typeof id,'string');assert(arguments.length===1,'No historical panel overrides');if(!admitted)admitted=await load();const r=admitted.records.get(id);assert(r,'Unknown fixed historical panel');const ctx=await context();assert.deepEqual(ctx.probeSource,admitted.currentProducer,'Current producer changed after admission');return structuredClone(r);}
