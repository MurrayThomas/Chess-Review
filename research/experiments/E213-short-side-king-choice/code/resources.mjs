import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {legalPosition} from '../../E020-coach-concepts/code/concepts.mjs';
import {validateHistory} from '../../E024-transitions/code/transitions.mjs';
import {pilotContrast} from '../../E212-rook-side-defense/code/geometry.mjs';
import {readAdmission} from './admission.mjs';
const fields=(x,keys)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).every(k=>keys.includes(k));
export function inspectShortSideKingChoice(input,options={},token){
 plain([input,options]);if(!fields(input,['fen','history'])||typeof input.fen!=='string'||!fields(options,['enabled'])||options.enabled!==undefined&&typeof options.enabled!=='boolean')throw Error('Invalid short-side resource interface');
 if(input.history!==undefined&&(!fields(input.history,['fen','moves'])||Object.keys(input.history).length!==2||typeof input.history.fen!=='string'||!Array.isArray(input.history.moves)))throw Error('Invalid short-side history');
 const base={schema:'E213-short-side-king-resource',id:'C0667',available:false,status:'disabled',defender:null,resources:[],losingAlternatives:[],geometry:null,source:null,outcomeScope:null};if(!options.enabled)return base;
 const h=validateHistory(input),c=legalPosition(input.fen);if(!h||h.moves.length||h.start!==c.fen()||Number(c.fen().split(' ')[4])!==0)return{...base,status:'zero-counter-empty-history-prerequisite'};
 if(c.fen().split(' ')[2]!=='-'||c.fen().split(' ')[3]!=='-')return{...base,status:'rights-or-ep-prerequisite'};
 if(token===undefined)return{...base,status:'observation-prerequisite'};
 const a=readAdmission(token);if(a.input.fen!==input.fen||a.input.history?.fen!==input.history.fen||a.input.history?.moves.length!==0)throw Error('Observation frame/history differs');
 const view=a.view;if(view.status!=='observed'||!view.zeroCounterRoot)throw Error('Invalid admitted frame');const contrast=pilotContrast(view,'short'),available=contrast.passes&&contrast.geometry.rookOnLongSide;
 return{...base,status:available?'observed-resource':'no-qualifying-contrast',available,defender:view.actor,resources:available?view.rows.filter(r=>contrast.resources.includes(r.move)):[],losingAlternatives:available?view.rows.filter(r=>contrast.alternatives.includes(r.move)):[],geometry:contrast.geometry??null,source:a.source,outcomeScope:view.outcomeScope};
}
