import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {retained} from '../../E214-named-rook-defense-phases/code/retained.mjs';
import {checkObservedRookPanel} from '../../E211-rook-tablebase-admission/code/check-execution.mjs';
import {collectAdmission as parentCollect,readAdmission as parentRead} from '../../E212-rook-side-defense/code/admission.mjs';
const dir='research/experiments/E215-rook-defense-resource-contrasts',tokens=new WeakMap();
export const artifactHashes={'philidor-barrier-reflection':'736ed4eb8dc69dde367f22b7e2ea7acd4feddf69cb73e69d106849e81df59fb0','philidor-retreat-reflection':'674ab1817e43083362f5070177c01eeb2e5e161d6549817c0b230a11e508733a','vancura-check-at-pawn-reflection':'deb6828d3f61f088f467fdcfef26b259053be51c0e621ff4043f187e01e32d9c','vancura-check-at-pawn':'42a480759e73b0628305d5d5ef617e12eb36c61ad570829139f6f070684cee0c','vancura-check-before-pressure-reflection':'d4c40a4334053a1a108530ef220673a38c93e4f010d53fbb98645903721772d3'};
function seal(value){const token=Object.freeze({});tokens.set(token,structuredClone(value));return token;}
export function readAdmission(token){if(!tokens.has(token))throw Error('Unadmitted named rook observation');return structuredClone(tokens.get(token));}
export async function admitSaved(){
 const prior=await retained(),rows=prior.rows.map(r=>({id:'E214-'+r.id,phase:r.id==='vancura-pressure'?'vancura-check-before-pressure':r.id,token:seal({input:r.input,view:r.view,source:{artifact:'research/experiments/E214-named-rook-defense-phases/evidence/'+r.id+'.json',exposure:'previously exposed development',ruleModel:r.view.outcomeScope}})}));
 for(const [id,hash]of Object.entries(artifactHashes)){const bytes=await readFile(dir+'/evidence/'+id+'.json');assert.equal(sha256(bytes),hash);const r=JSON.parse(bytes);assert.deepEqual(r.inputHashes,await bindings(Object.keys(r.inputHashes)));const view=checkObservedRookPanel(r.input,r.options,r.bundle,prior.ctx);rows.push({id,phase:r.phase,token:seal({input:r.input,view,source:{artifact:dir+'/evidence/'+id+'.json',sha256:hash,ruleModel:view.outcomeScope}})});}return rows;
}
export async function collectAdmission(input,options={maxProbes:128}){const r=await parentCollect(input,options);return{token:r.token?seal(parentRead(r.token)):null,bundle:r.bundle};}
