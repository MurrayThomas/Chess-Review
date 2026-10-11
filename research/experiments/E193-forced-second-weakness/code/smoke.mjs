import assert from 'node:assert/strict';
import {fixtures,claimControl} from './final-fixtures.mjs';
import {saved} from './final-saved.mjs';
import {inspectWeaknessCreation} from './weakness.mjs';
import {checkResult} from './check-result.mjs';
const a=await saved();for(const f of [fixtures[0],fixtures[2],fixtures[4],fixtures[6],fixtures[8],claimControl]){const p=a.find(f.input,f.options.plies??2).panel,r=inspectWeaknessCreation(f.input,f.options,p);checkResult(f.input,f.options,p,r);assert.deepEqual(Object.keys(r.claims).filter(k=>r.claims[k]),f.expected);if(f===claimControl)assert.equal(r.status,'claim-rule-prerequisite');console.log(JSON.stringify({id:f.id,claims:r.claims,nodes:r.nodes,first:r.witness?.first?.profitable,roles:r.witness?.roles.length}));}
