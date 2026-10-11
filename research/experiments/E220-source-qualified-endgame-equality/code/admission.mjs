import assert from 'node:assert/strict';
import {admitSaved as exchangeSaved,readAdmission as exchangeRead} from '../../E217-defensive-positional-exchange/code/admission.mjs';
import {saved as rookSaved} from '../../E211-rook-tablebase-admission/code/saved.mjs';
const tokens=new WeakMap();
function seal(value){const token=Object.freeze({});tokens.set(token,structuredClone(value));return token;}
export function readAdmission(token){if(!tokens.has(token))throw Error('Unadmitted equality observations');return structuredClone(tokens.get(token));}
export async function admitSaved(){
 const rows=[];for(const group of await exchangeSaved()){
  const admitted=exchangeRead(group.token);for(const root of admitted.observations.filter(r=>r.id.endsWith('-accepted'))){const next=admitted.observations.find(r=>r.id===root.id.replace(/-accepted$/,'-quiet'));assert.ok(next);const input={...root.input,move:next.input.history.moves.at(-1)};rows.push({id:root.id,role:'equality-pair',input,token:seal({input,root,next})});}
 }
 const old=await rookSaved();for(const r of old.rows.filter(r=>['rook-pawn-root','rook-pawn-root-black'].includes(r.fixture.id))){const input={...r.fixture.input,move:r.view.rows[0].move},root={id:r.fixture.id,input:r.fixture.input,view:r.view,source:{artifact:'research/experiments/E211-rook-tablebase-admission/evidence/panels.json.gz',sha256:old.archiveSha256,ruleModel:r.view.outcomeScope,legacySuccessStderrUnavailable:true}};rows.push({id:r.fixture.id,role:'nonzero-control',input,token:seal({input,root,next:null})});}return rows;
}
