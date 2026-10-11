import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {collectRookPanel} from './collect.mjs';
import {checkRookPanel} from './check-panel.mjs';
import {fixtures} from './fixtures.mjs';
import {context,python} from './context.mjs';
import {dir} from './exports.mjs';
await mkdir(dir+'/evidence',{recursive:true});try{await readFile(dir+'/evidence/revised-admission-pilot.json');throw Error('Pilot retained; do not repeat');}catch(e){if(e.code!=='ENOENT')throw e;}
const ctx=await context(),f=fixtures[0],revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),inputHashes=await bindings([dir+'/code/pilot.mjs',dir+'/plan.md',dir+'/AMENDMENT-2026-10-11.md',dir+'/AMENDMENT-COST-2026-10-11.md']),start=performance.now();let bundle,view,error=null;
try{bundle=await collectRookPanel(f.input,f.options,python);view=checkRookPanel(f.input,f.options,bundle,ctx);assert.equal(bundle.status,'complete');assert.ok(bundle.requiredProbes<=33);}catch(e){error=e.stack;}
const seconds=(performance.now()-start)/1000,proceed=!error&&seconds<=2;await writeFile(dir+'/evidence/revised-admission-pilot.json',JSON.stringify({preregisteredRevision:revision,inputHashes,fixture:f,seconds,proceed,bundle,view,error,datasetReceipt:ctx.data.receipt.gameGuardReceipt,tablebaseReceipt:ctx.data.receipt,probeSource:ctx.probeSource},null,2)+'\n');console.log(JSON.stringify({proceed,seconds,status:bundle?.status,probes:bundle?.requiredProbes,rootWdl:bundle?.panel?.root.wdl,error}));assert.ok(proceed,'Admission pilot failed or exceeded prospective2second gate');
