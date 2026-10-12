import {readHistoricalPanel} from '../../E270-combined-validation/code/historical-producer.mjs';
import {assertSourceEpochs} from '../../E270-combined-validation/code/source-epochs.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,mkdtemp} from 'node:fs/promises';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {openResearchRookTablebaseSession,openResearchRookTablebaseSource,openResearchRookTablebases,validateRookTablebaseRegistry} from '../../../tablebase-rook-data-policy.mjs';
import {collectRookPanel} from './collect.mjs';
import {checkRookPanel} from './check-panel.mjs';
import {context,python} from './context.mjs';
import {dir,registryPath,dataDir} from './exports.mjs';
import {authenticateArchive} from './saved.mjs';
const currentCtx=await context(),saved=authenticateArchive(await readFile(dir+'/evidence/panels.json.gz')),copy=x=>structuredClone(x),base=saved.rows[0],registry=JSON.parse(await readFile(registryPath,'utf8')),ctx={data:currentCtx.data,probeSource:saved.probeSource};
assert.deepEqual(saved.tablebaseReceipt,ctx.data.receipt);await assertSourceEpochs(saved.sourceHashes);for(const row of saved.rows)assert.deepEqual((await readHistoricalPanel('E211/'+row.fixture.id)).view,row.view);
for(const r of saved.rows)test('admitted complete WDL panel '+r.id,()=>{
 assert.deepEqual(checkRookPanel(r.fixture.input,r.fixture.options,r.bundle,ctx),r.view);assert.equal(r.view.rows.length,r.bundle.requiredProbes-1);assert.equal(r.view.zeroCounterRoot,true);assert.equal(Object.keys(r.bundle.tablebaseReceipt.files).length,20);assert.ok(r.view.rows.every(row=>row.rootActorWdl===(row.wdl===0?0:-row.wdl)));
 if(r.id.startsWith('promotion-domain'))assert.equal(r.view.rows.filter(row=>/^[a-h][1-8][a-h][18][qrbn]$/.test(row.move)).length,4);if(r.id.startsWith('capture-domain'))assert.ok(r.view.rows.some(row=>row.zeroing&&row.san.includes('x')));if(r.id.startsWith('mechanical-kings'))assert.equal(r.view.root.wdl,0);
});
test('one fresh exact-cap equality and short zero preflight omit partial observations',async()=>{
 const required=base.bundle.requiredProbes,options={maxProbes:required},fresh=await collectRookPanel(base.fixture.input,options,python);checkRookPanel(base.fixture.input,options,fresh,currentCtx);assert.deepEqual(fresh.probeSource,currentCtx.probeSource);const actual=copy(fresh),original={...copy(base.bundle),maxProbes:required};for(const b of [actual,original]){delete b.probeSource;delete b.rawStdout;delete b.panel.metadata.python;}assert.deepEqual(actual,original);
 for(const maxProbes of [required-1,0]){const options={maxProbes},q=await collectRookPanel(base.fixture.input,options,python);checkRookPanel(base.fixture.input,options,q,currentCtx);assert.equal(q.status,'preflight-budget-unavailable');assert.equal(q.panel,null);assert.equal(q.tablebaseReceipt,null);}
});
test('registry requires exact namespace grant purposes dependency closure exports and origins',()=>{
 validateRookTablebaseRegistry(registry,'test');for(const change of [r=>r.dataset='T001',r=>r.originFormat='syzygy-kqk-v1',r=>r.source.public=false,r=>r.source.grant='CC0',r=>r.source.allowedPurposes=[],r=>r.source.exports.pop(),r=>r.source.exports[0]=copy(r.source.exports[1]),r=>r.source.exports[0].url+='?different',r=>r.source.exports[0].bytes++,r=>r.source.exports[0].sha256='bad']){const r=copy(registry);change(r);assert.throws(()=>validateRookTablebaseRegistry(r,'test'));}assert.throws(()=>validateRookTablebaseRegistry(registry,'train'));
});
test('unregistered URL refuses and caller receipt mutation cannot change private session',async()=>{
 await assert.rejects(()=>openResearchRookTablebaseSource('https://tablebase.lichess.ovh/tables/standard/3-4-5-wdl/KQvK.rtbz'),/unregistered exact export/);const session=await openResearchRookTablebaseSession();session.receipt.registrySha256='forged';const admitted=await session.readTables();assert.equal(admitted.receipt.registrySha256,ctx.data.receipt.registrySha256);
});
test('guarded metadata fixtures reject incomplete manifest counterfeit bytes and missing files',async()=>{
 // Minimal metadata/file fixtures, not a Git checkout or copied game dataset.
 const parent=path.resolve('research/runs/E211');await mkdir(parent,{recursive:true});const root=await mkdtemp(path.join(parent,'reject-'));assert.ok(root.startsWith(parent+path.sep));const permission=JSON.parse(await readFile(registry.source.permissionEvidence.path,'utf8'));
 for(const file of [registryPath,'research/TABLEBASE_ROOK_DATA_POLICY.md',registry.source.permissionEvidence.path,registry.source.checksumEvidence.path,permission.snapshot.path]){await mkdir(path.dirname(path.join(root,file)),{recursive:true});await writeFile(path.join(root,file),await readFile(file));}
 const m=JSON.parse(await readFile(dataDir+'/manifest.json','utf8')),manifest=path.join(root,dataDir,'manifest.json');await mkdir(path.dirname(manifest),{recursive:true});const incomplete=copy(m);incomplete.files.pop();await writeFile(manifest,JSON.stringify(incomplete));await assert.rejects(()=>openResearchRookTablebases({root}),/incomplete\/unsupported manifest/);
 await writeFile(manifest,JSON.stringify(m));const file=path.join(root,dataDir,'files/KBvK.rtbw');await mkdir(path.dirname(file),{recursive:true});await writeFile(file,Buffer.alloc(80));await assert.rejects(()=>openResearchRookTablebases({root}),/table hash\/size\/header differs/);await writeFile(file,await readFile(dataDir+'/files/KBvK.rtbw'));await assert.rejects(()=>openResearchRookTablebases({root}),/ENOENT/);
});
test('collector strict cap getter material rights and history endpoint refuse',async()=>{
 for(const options of [{maxProbes:-1},{maxProbes:null},{unknown:true}])await assert.rejects(()=>collectRookPanel(base.fixture.input,options,python));let called=false;const options={};Object.defineProperty(options,'maxProbes',{enumerable:true,get(){called=true;return128;}});await assert.rejects(()=>collectRookPanel(base.fixture.input,options,python),/ordinary/);assert.equal(called,false);
 const bad=copy(base.fixture.input);bad.history.moves=['a8a6'];await assert.rejects(()=>collectRookPanel(bad,{},python),/final FEN/);
 for(const fen of ['4k3/8/8/8/8/8/8/3QK2Q w - - 0 1','4k2r/8/8/8/8/8/8/4K2R w Kk - 0 1'])await assert.rejects(()=>collectRookPanel({fen,history:{fen,moves:[]}}, {},python),/Unsupported T002/);
});
test('independent panel rejects domain frame perspective flags budget source and raw-output forgeries',()=>{
 const valid=base.bundle;for(const change of [b=>b.requiredProbes--,b=>b.tablebaseReceipt.files['KRPvKR.rtbw'].sha256='a'.repeat(64),b=>b.probeSource.programSha256='b'.repeat(64),b=>b.panel.root.fen=base.fixture.input.history.fen.replace(' 0 1',' 1 1'),b=>b.panel.rows.pop(),b=>b.panel.rows[0].wdl=3,b=>b.panel.rows[0].flags.checkmate=!b.panel.rows[0].flags.checkmate,b=>b.panel.rows[0].san='fiction',b=>b.panel.rows[0].zeroing=!b.panel.rows[0].zeroing,b=>b.panel.positionProbes--,b=>b.panel.metadata.tables['KRvKR.rtbw']='c'.repeat(64),b=>b.panel.ruleModel='actual-clock exact',b=>b.panel.material='KQvK']){const q=copy(valid);change(q);if(q.panel)q.rawStdout=JSON.stringify(q.panel);assert.throws(()=>checkRookPanel(base.fixture.input,base.fixture.options,q,ctx));}
 const q=copy(valid);q.rawStdout+='garbage';assert.throws(()=>checkRookPanel(base.fixture.input,base.fixture.options,q,ctx));const view=checkRookPanel(base.fixture.input,base.fixture.options,copy(valid),ctx);view.rows.pop();assert.equal(valid.panel.rows.length,valid.requiredProbes-1);
});
