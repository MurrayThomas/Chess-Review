import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {gzipSync,gunzipSync} from 'node:zlib';
import {spawnSync} from 'node:child_process';
import {openResearchData} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {fixtures} from '../../E156-piece-objective-effectiveness/code/fixtures.mjs';
import {collectPanel} from '../../E156-piece-objective-effectiveness/code/panel.mjs';
import {verifyPanel} from '../../E156-piece-objective-effectiveness/code/verify-panel.mjs';
const dir='research/experiments/E203-objective-piece-question-profiles',data=await openResearchData(['D001'],{purpose:'test'}),sourceHashes=await bindings([dir+'/code/collect-claim.mjs',dir+'/plan.md',dir+'/AMENDMENT-2026-10-11.md']),file=dir+'/evidence/claim-control.json.gz';
try{const old=JSON.parse(gunzipSync(await readFile(file)));assert.deepEqual(old.sourceHashes,sourceHashes);assert.deepEqual(old.receipt,data.receipt);assert.ok(old.panel.claimContexts.length);console.log(JSON.stringify({reused:true,nodes:old.panel.nodes}));}
catch(e){if(e.code!=='ENOENT')throw e;const f=fixtures[0],fields=f.fen.split(' ');fields[4]='98';const fen=fields.join(' '),input={fen,history:{fen,moves:[]},move:f.move,objectiveTarget:f.objectiveTarget,objectiveUnits:f.objectiveUnits},start=performance.now(),panel=collectPanel(input,500);verifyPanel(input,panel);
  await writeFile(file,gzipSync(JSON.stringify({revision:spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).stdout.trim(),receipt:data.receipt,sourceHashes,input,panel,freshPanels:1,freshMateQueries:0,seconds:(performance.now()-start)/1000})+'\n'));
  assert.ok(panel.claimContexts.length,'Claim hypothesis refuted; stop with retained panel');console.log(JSON.stringify({nodes:panel.nodes,claimContexts:panel.claimContexts.length}));
}
