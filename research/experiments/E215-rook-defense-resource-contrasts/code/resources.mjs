import assert from 'node:assert/strict';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {legalPosition} from '../../E020-coach-concepts/code/concepts.mjs';
import {validateHistory} from '../../E024-transitions/code/transitions.mjs';
import {readAdmission} from './admission.mjs';
import {phases,contrast,compactGeometry} from './contrast.mjs';
const fields=(x,keys)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).every(k=>keys.includes(k));
export function inspectNamedRookResource(input,options={},token){
 plain([input,options]);if(!fields(input,['fen','history'])||typeof input.fen!=='string'||!fields(options,['enabled','phase'])||options.enabled!==undefined&&typeof options.enabled!=='boolean'||options.phase!==undefined&&!phases.includes(options.phase))throw Error('Invalid named-rook interface');
 if(input.history!==undefined&&(!fields(input.history,['fen','moves'])||Object.keys(input.history).length!==2||typeof input.history.fen!=='string'||!Array.isArray(input.history.moves)))throw Error('Invalid named-rook history');
 const phase=options.phase??'philidor-barrier',base={schema:'E215-named-rook-resource',id:phase.startsWith('philidor')?'C0670':'C0671',phase,available:false,status:'disabled',defender:null,resources:[],losingAlternatives:[],geometry:null,source:null,outcomeScope:null};if(!options.enabled)return base;
 const h=validateHistory(input),c=legalPosition(input.fen);if(!h)return{...base,status:'history-prerequisite'};if(Number(c.fen().split(' ')[4])!==0)return{...base,status:'zero-counter-prerequisite'};if(phase==='philidor-retreat'?h.moves.length!==2:h.moves.length!==0)return{...base,status:'phase-history-prerequisite'};
 if(c.fen().split(' ')[2]!=='-'||c.fen().split(' ')[3]!=='-')return{...base,status:'rights-or-ep-prerequisite'};if(token===undefined)return{...base,status:'observation-prerequisite'};
 const a=readAdmission(token);assert.deepEqual(a.input,input,'Observation frame/history differs');if(a.view.status!=='observed')throw Error('Incomplete observation');const q=contrast(input,a.view,phase);
 return{...base,status:q.passes?'observed-resource':'no-qualifying-contrast',available:q.passes,defender:a.view.actor,resources:q.passes?a.view.rows.filter(r=>q.resources.includes(r.move)):[],losingAlternatives:q.passes?a.view.rows.filter(r=>q.alternatives.includes(r.move)):[],geometry:compactGeometry(q.geometry),source:a.source,outcomeScope:a.view.outcomeScope};
}
