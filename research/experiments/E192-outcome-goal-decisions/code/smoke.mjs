import assert from 'node:assert/strict';
import {fixtures} from './fixtures.mjs';
import {saved} from './saved.mjs';
import {inspectOutcomeDecisions} from './outcomes.mjs';
import {checkResult} from './check-result.mjs';
const a=await saved();for(const n of [0,1,2,4,9]){const f=fixtures[n],p=a.find(f.input,f.options.plies??1).panel,r=inspectOutcomeDecisions(f.input,f.options,p);checkResult(f.input,f.options,p,r);assert.deepEqual(Object.keys(r.claims).filter(k=>r.claims[k]),f.expected);console.log(JSON.stringify({id:f.id,claims:r.claims,nodes:r.nodes,policyNodes:r.witness.policy?.nodes??0}));}
