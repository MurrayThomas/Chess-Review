import {readHistoricalPanel} from '../../E270-combined-validation/code/historical-producer.mjs';
import {assertSourceEpochs} from '../../E270-combined-validation/code/source-epochs.mjs';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {context} from '../../E211-rook-tablebase-admission/code/context.mjs';
import {checkObservedRookPanel} from '../../E211-rook-tablebase-admission/code/check-execution.mjs';
const dir='research/experiments/E217-defensive-positional-exchange',tokens=new WeakMap();
export const artifactHashes=Object.freeze({
 'exchange-h5h7-accepted':'b32bf9d71895ec4cadee337fb086847f7514682a2b8fee7c66b189cb92d98d19',
 'exchange-h8h7-accepted':'3fc12772e252ad4fe50b78ad4add1ad12ba9c5a1022abdd5930f744c9b84cf4c',
 'exchange-h5h7-quiet':'85e5cc02631bd8b015964480b1ffba6cbe0845303bf7a48a2369abea020af9b7',
 'exchange-h8h7-quiet':'44266bca2e36b40f6d98d9d4bb30ed646c2eea05973e24f3d7ee624e2540adfc',
 'exchange-black-h1h2-accepted':'7cd0531d2d632e02bce8587b848afd7cc9443abd0ac7c5c43c3130408c241909',
 'exchange-black-h4h2-accepted':'9f443b8f4bc1efd9d410b85dd2cf49db5dfdace2bf4cf66baadf815283c3c23f',
 'exchange-black-h1h2-quiet':'62981317cda22f528774bae07bc45eee93ddf3f259f4293a96220bcaa288ce8a',
 'exchange-black-h4h2-quiet':'4892244e3c033f81e0c1e89c373fc2264638bc368bcd51c0342ad1c18725676a',
});
export function readAdmission(token){if(!tokens.has(token))throw Error('Unadmitted defensive exchange observations');return structuredClone(tokens.get(token));}
export async function admitSaved(){
 const ctx=await context(),groups=new Map();
 for(const [id,hash]of Object.entries(artifactHashes)){
  const file=dir+'/evidence/'+id+'.json',bytes=await readFile(file);assert.equal(sha256(bytes),hash,'Changed saved observation');const r=JSON.parse(bytes);
  await assertSourceEpochs(r.inputHashes);assert.ok(r.seconds<=3);
  const view=(await readHistoricalPanel('E217/'+id)).view,family=id.startsWith('exchange-black-')?'exchange-black':'exchange';
  if(!groups.has(family))groups.set(family,[]);groups.get(family).push({id,input:r.input,view,source:{artifact:file,sha256:hash,ruleModel:view.outcomeScope}});
 }
 return [...groups].map(([id,observations])=>{
  const h=observations[0].input.history,input={fen:h.fen,history:{fen:h.fen,moves:[]},move:h.moves[0],quietMove:observations.find(r=>r.id.endsWith('-quiet')).input.history.moves[2]};
  const token=Object.freeze({});tokens.set(token,structuredClone({input,observations}));return{id,input,token};
 });
}
