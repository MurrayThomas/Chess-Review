import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {saved,authenticateArchive} from './saved.mjs';
import {dir} from './exports.mjs';
test('fixed archive authenticated full replay and independent returned objects',async()=>{
 const a=await saved();assert.equal(a.rows.length,8);assert.equal(a.rows.reduce((n,r)=>n+r.bundle.requiredProbes,0),130);const bytes=await readFile(dir+'/evidence/panels.json.gz'),bad=Buffer.from(bytes);bad[0]^=1;assert.throws(()=>authenticateArchive(bad),/Changed retained/);
 const pristine=authenticateArchive(bytes),before=pristine.rows[0].bundle.panel.root.wdl;a.rows[0].bundle.panel.root.wdl=99;assert.equal(pristine.rows[0].bundle.panel.root.wdl,before);assert.ok(a.rows.every(r=>r.view.outcomeScope.includes('no arbitrary-clock')));
});
