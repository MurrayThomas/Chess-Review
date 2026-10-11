import assert from 'node:assert/strict';
import {fixtures} from './fixtures.mjs';
import {saved} from './saved.mjs';
import {inspectTiming} from './timing.mjs';
import {checkResult} from './check-result.mjs';
const a=await saved();for(const n of [0,4,8,10,12]){const f=fixtures[n],p=a.find(f.source,f.input,f.options).panel,r=inspectTiming(f.source,f.input,f.options,p);checkResult(f.source,f.input,f.options,p,r);assert.deepEqual(Object.keys(r.claims).filter(k=>r.claims[k]),f.expected);console.log(JSON.stringify({id:f.id,claims:r.claims,nodes:r.nodes}));}
