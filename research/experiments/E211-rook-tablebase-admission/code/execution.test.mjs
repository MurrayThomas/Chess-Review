import {readHistoricalPanel} from '../../E270-combined-validation/code/historical-producer.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {collectObservedRookPanel} from './collect-observed.mjs';
import {checkObservedRookPanel} from './check-execution.mjs';
import {context,python} from './context.mjs';
import {dir} from './exports.mjs';
import {authenticateArchive} from './saved.mjs';
const ctx=await context(),archive=authenticateArchive(await readFile(dir+'/evidence/panels.json.gz')),base=archive.rows[0];
test('genuine observed process metadata WDL equality forgery rejection and short budget',async()=>{
 const bundle=await collectObservedRookPanel(base.fixture.input,base.fixture.options,python);await writeFile(dir+'/evidence/observed-process-panel.json',JSON.stringify({fixture:base.fixture,bundle},null,2)+'\n');const view=checkObservedRookPanel(base.fixture.input,base.fixture.options,bundle,ctx);const admitted=await readHistoricalPanel('E211/'+base.fixture.id);assert.deepEqual(admitted.record.bundle,base.bundle);assert.deepEqual(bundle.probeSource,ctx.probeSource);assert.notEqual(bundle.probeSource.executableSha256,admitted.originalProducer.executableSha256);const actual=structuredClone(bundle.panel),original=structuredClone(base.bundle.panel);delete actual.metadata.python;delete original.metadata.python;assert.deepEqual(actual,original);assert.equal(view.successfulStderrRetained,true);assert.equal(bundle.execution.exitCode,0);assert.equal(bundle.rawStderr,'');
 for(const change of [b=>b.execution.exitCode=1,b=>b.execution.signal='SIGTERM',b=>b.execution.error='failed',b=>b.panel.positionProbes--]){const bad=structuredClone(bundle);change(bad);if(bad.panel)bad.rawStdout=JSON.stringify(bad.panel);assert.throws(()=>checkObservedRookPanel(base.fixture.input,base.fixture.options,bad,ctx));}
 const options={maxProbes:0},short=await collectObservedRookPanel(base.fixture.input,options,python);checkObservedRookPanel(base.fixture.input,options,short,ctx);assert.equal(short.execution,null);assert.equal(short.panel,null);
});
