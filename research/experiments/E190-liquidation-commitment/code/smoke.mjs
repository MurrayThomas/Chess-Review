import assert from 'node:assert/strict';
import {fixtures} from './fixtures.mjs';
import {saved} from './saved.mjs';
import {inspectLiquidation} from './liquidation.mjs';
import {checkResult} from './check-result.mjs';
const a=await saved();for(const f of [fixtures[0],fixtures[2],fixtures[3]]){const p=a.find(f.input).panel,r=inspectLiquidation(f.input,f.options,p);checkResult(f.input,f.options,p,r);assert.deepEqual(Object.keys(r.claims).filter(k=>r.claims[k]),f.expected);console.log(JSON.stringify({id:f.id,claims:r.claims,nodes:r.nodes,goal:r.witness.goal,permanentQueenFree:r.witness.permanentQueenFree}));}
