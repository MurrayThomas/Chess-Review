import assert from 'node:assert/strict';
import {fixtures} from './fixtures.mjs';
import {saved} from './saved.mjs';
import {inspectDecisionSupport} from './support.mjs';
import {checkResult} from './check-result.mjs';
const a=await saved();for(const f of fixtures.slice(0,3)){const {panel}=a.find(f.input,f.options.plies??1),r=inspectDecisionSupport(f.input,f.options,panel);checkResult(f.input,f.options,panel,r);assert.deepEqual(Object.keys(r.claims).filter(k=>r.claims[k]),f.expected,f.id);console.log(JSON.stringify({id:f.id,claims:r.claims,nodes:r.nodes,shortlist:r.witness.shortlist,losing:r.witness.certifiedLosses.length,unresolved:r.witness.unresolved.length,evaluation:r.witness.evaluation?.outcome??null}));}
