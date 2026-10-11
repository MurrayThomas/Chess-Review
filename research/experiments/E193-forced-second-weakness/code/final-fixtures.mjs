import {fixtures as hypotheses} from './fixtures.mjs';
import {corrected} from './corrected-fixtures.mjs';
export {claimControl} from './fixtures.mjs';
export const unavailableHypotheses=corrected;
export const fixtures=hypotheses.map(f=>f.id.startsWith('second-weakness-')?{...f,id:'failed-root-vulnerability-'+f.id,expected:['C0913','C0915']}:f);
