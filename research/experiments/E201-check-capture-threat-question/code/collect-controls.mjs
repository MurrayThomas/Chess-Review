import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {gzipSync,gunzipSync} from 'node:zlib';
import {spawnSync} from 'node:child_process';
import {openResearchData,sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {collectPanel} from '../../E143-forcing-tempo-initiative/code/panel.mjs';
import {verifyPanel} from '../../E143-forcing-tempo-initiative/code/check-witness.mjs';
const dir='research/experiments/E201-check-capture-threat-question',data=await openResearchData(['D001'],{purpose:'test'}),sourceHashes=await bindings([dir+'/code/collect-controls.mjs',dir+'/plan.md',dir+'/AMENDMENT-2026-10-11.md']),file=dir+'/evidence/quiet-controls.json.gz';
try{const saved=JSON.parse(gunzipSync(await readFile(file)));assert.deepEqual(saved.sourceHashes,sourceHashes);assert.deepEqual(saved.receipt,data.receipt);console.log(JSON.stringify({reused:true,panels:saved.rows.length,nodes:saved.rows.map(r=>r.panel.nodes)}));}
catch(e){if(e.code!=='ENOENT')throw e;const rows=[],revision=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).stdout.trim(),start=performance.now();
  for(const [fen,move]of [['7k/8/6K1/8/8/8/8/R7 w - - 0 1','a1a7'],['r7/8/8/8/8/6k1/8/7K b - - 0 1','a8a2']]){
    const input={fen,history:{fen,moves:[]},move},panel=collectPanel(input,2,4000);verifyPanel({...input,forcingTempoPlies:2},panel);
    const row=panel.rows.find(r=>r.move===move);rows.push({input,panel,nominatedQuietResource:row.actor.tree.win&&!row.check&&!row.capture&&!row.mate});
    await writeFile(file,gzipSync(JSON.stringify({revision,sourceHashes,receipt:data.receipt,rows,seconds:(performance.now()-start)/1000,freshPanels:rows.length,freshQueries:rows.reduce((n,r)=>n+2*r.panel.rows.length,0)})+'\n'));
    console.log(JSON.stringify({move,quietResource:rows.at(-1).nominatedQuietResource,nodes:panel.nodes,rows:panel.rows.length}));
    assert.equal(rows.at(-1).nominatedQuietResource,true,'Quiet-threat hypothesis refuted; retained panel, stop');
  }
}
