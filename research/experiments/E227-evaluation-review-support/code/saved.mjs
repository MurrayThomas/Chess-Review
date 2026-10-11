import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {bindings,digest} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
export async function checkSavedPilot(pilot){
 assert.equal(pilot.revision,'6cccb26ffcc520c016156af31d5fc0e02f690be2');
 const current=await bindings(Object.keys(pilot.inputHashes)),allowed='research/experiments/E227-evaluation-review-support/code/support.test.mjs';
 for(const [name,hash]of Object.entries(pilot.inputHashes)){if(name===allowed){const frozen=execFileSync('git',['show',pilot.revision+':'+name],{encoding:'utf8',windowsHide:true});assert.equal(digest(frozen.replaceAll('\r\n','\n')),hash);}else assert.equal(current[name],hash,'Changed original pilot source: '+name);}
 return true;
}
