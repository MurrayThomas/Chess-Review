import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {sha256,openResearchData} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
const parent='research/experiments/E177-queen-exchange-ending';
export const key=i=>JSON.stringify([i.fen,i.history,i.move,i.alternative,2]);
export async function saved(){const data=await openResearchData(['D001'],{purpose:'test'}),hashes={},rows=[],closure=await bindings([parent+'/code/panel.mjs',parent+'/code/context.mjs']);for(const name of ['observations','prefix-control']){const file=parent+'/evidence/'+name+'.json.gz',bytes=await readFile(file),raw=JSON.parse(gunzipSync(bytes));hashes[file]=sha256(bytes);assert.deepEqual(raw.datasetReceipt,data.receipt);assert.deepEqual(raw.sourceHashes,closure);const list=raw.rows??[{input:raw.input,result:raw.result}];for(const [index,r]of list.entries()){const p=r.panel??r.result?.endingPreparationAnalysis?.witness?.panel;assert.ok(p);rows.push({key:key({fen:r.input.fen,history:r.input.history,move:r.input.move,alternative:r.input.endingAlternative}),panel:p,ref:{file,index,kind:name}});}}
 return{receipt:data.receipt,hashes,find:i=>{const r=rows.find(r=>r.key===key(i));assert.ok(r,'No exact queen-exchange panel');return r;}};}
