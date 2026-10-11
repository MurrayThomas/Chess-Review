import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {legalPosition} from '../../E020-coach-concepts/code/concepts.mjs';
import {validateHistory} from '../../E024-transitions/code/transitions.mjs';
import {readAdmission} from './admission.mjs';
import {pilotContrast} from './geometry.mjs';
const fields=(x,keys)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).every(k=>keys.includes(k));
export function inspectLongSideDefense(input,options={},token){
 plain([input,options]);if(!fields(input,['fen','history'])||typeof input.fen!=='string'||!fields(options,['enabled'])||options.enabled!==undefined&&typeof options.enabled!=='boolean')throw Error('Invalid long-side resource interface');
 if(input.history!==undefined&&(!fields(input.history,['fen','moves'])||Object.keys(input.history).length!==2||typeof input.history.fen!=='string'||!Array.isArray(input.history.moves)))throw Error('Invalid long-side history');
 const base={schema:'E212-long-side-resource',id:'C0666',available:false,status:'disabled',defender:null,resources:[],losingAlternatives:[],geometry:null,source:null,outcomeScope:null};if(!options.enabled)return base;
 const h=validateHistory(input),c=legalPosition(input.fen);if(!h||h.moves.length||h.start!==c.fen()||Number(c.fen().split(' ')[4])!==0)return{...base,status:'zero-counter-empty-history-prerequisite'};
 if(c.fen().split(' ')[2]!=='-'||c.fen().split(' ')[3]!=='-')return{...base,status:'rights-or-ep-prerequisite'};
 if(token===undefined)return{...base,status:'observation-prerequisite'};
 const admitted=readAdmission(token);if(JSON.stringify(admitted.input)!==JSON.stringify(input)){
  // Object field order is irrelevant; FEN and actual history must still match.
  if(admitted.input.fen!==input.fen||admitted.input.history?.fen!==input.history.fen||admitted.input.history?.moves.length!==0)throw Error('Observation frame/history differs');
 }
 const view=admitted.view;if(view.status!=='observed'||!view.zeroCounterRoot)throw Error('Invalid admitted frame');
 const answer=pilotContrast(view,'long');return{...base,status:answer.passes?'observed-resource':'no-qualifying-contrast',available:answer.passes,defender:view.actor,resources:answer.passes?view.rows.filter(r=>answer.resources.includes(r.move)):[],losingAlternatives:answer.passes?view.rows.filter(r=>answer.alternatives.includes(r.move)):[],geometry:answer.geometry??null,source:admitted.source,outcomeScope:view.outcomeScope};
}
