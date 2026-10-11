import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {collectObservedRookPanel} from './collect-observed.mjs';
import {checkObservedRookPanel} from './check-execution.mjs';
import {context,python} from './context.mjs';
import {dir} from './exports.mjs';
const ctx=await context(),archive=JSON.parse(gunzipSync(await readFile(dir+'/evidence/panels.json.gz'))),base=archive.rows[0];
test('genuine observed process metadata WDL equality forgery rejection and short budget',async()=>{
 const bundle=await collectObservedRookPanel(base.fixture.input,base.fixture.options,python);await writeFile(dir+'/evidence/observed-process-panel.json',JSON.stringify({fixture:base.fixture,bundle},null,2)+'\n');const view=checkObservedRookPanel(base.fixture.input,base.fixture.options,bundle,ctx);assert.deepEqual(bundle.panel,base.bundle.panel);assert.equal(view.successfulStderrRetained,true);assert.equal(bundle.execution.exitCode,0);assert.equal(bundle.rawStderr,'');
 for(const change of [b=>b.execution.exitCode=1,b=>b.execution.signal='SIGTERM',b=>b.execution.error='failed',b=>b.panel.positionProbes--]){const bad=structuredClone(bundle);change(bad);if(bad.panel)bad.rawStdout=JSON.stringify(bad.panel);assert.throws(()=>checkObservedRookPanel(base.fixture.input,base.fixture.options,bad,ctx));}
 const options={maxProbes:0},short=await collectObservedRookPanel(base.fixture.input,options,python);checkObservedRookPanel(base.fixture.input,options,short,ctx);assert.equal(short.execution,null);assert.equal(short.panel,null);
});
