import assert from 'node:assert/strict';
import {saved} from '../../E193-forced-second-weakness/code/final-saved.mjs';
import {failure} from '../../E194-retained-second-weakness/code/failure-saved.mjs';
import {key} from '../../E191-tactical-decision-timing/code/saved.mjs';
export async function parents(){const a=await saved(),b=await failure();assert.deepEqual(a.receipt,b.receipt);return{receipt:a.receipt,hashes:{...a.hashes,...b.hashes},find(input,H){return key('structure',input,{ownPlies:H})===b.row.key?{panel:b.row.panel,ref:{file:'research/experiments/E194-retained-second-weakness/evidence/observations.json.gz',index:0}}:a.find(input,H);}};}
