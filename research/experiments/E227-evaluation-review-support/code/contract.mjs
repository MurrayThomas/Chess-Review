import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {validate as engineContract} from '../../E223-engine-diagnostic-support/code/contract.mjs';
export const occurrenceIds=['C0847','C0848','C0849','C1007','C1008','C1009','C1010','C1024','C1025','C1026','C1027','C1028','C1029','C1030','C1031'];
export const labels=['Blunder','Mistake','Inaccuracy','Mating evaluation','Centipawn evaluation','Engine evaluation','Depth','Mate search','Engine tactical analysis','Engine positional evaluation','Human versus engine move','Top engine move','Evaluation swing','Blunder according to engine','Accuracy'];
export const categories=['brilliant','great','book','best','excellent','good','inacc','mistake','miss','blunder'];
const object=(x,keys,required=keys)=>{if(!x||typeof x!=='object'||Array.isArray(x)||Object.keys(x).some(k=>!keys.includes(k))||required.some(k=>!Object.hasOwn(x,k)))throw Error('Invalid evaluation review fields');};
const text=s=>{if(typeof s!=='string'||!s.trim()||s.length>2000)throw Error('Invalid review text');};
const move=s=>{if(typeof s!=='string'||!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(s))throw Error('Invalid review UCI move');};
export function validate(input,options){
 plain([input,options]);object(input,['source','eventId','reports']);text(input.source);text(input.eventId);
 if(!Array.isArray(input.reports)||input.reports.length>16||Object.keys(input.reports).length!==input.reports.length||Object.keys(input.reports).some((k,i)=>k!==String(i)))throw Error('Invalid dense review reports');const ids=new Set();
 for(const r of input.reports){object(r,['id','diagnostics','configuration','playedMove','human','selection','category','analysis'],['id','diagnostics','configuration']);text(r.id);if(ids.has(r.id))throw Error('Duplicate review report');ids.add(r.id);engineContract(r.diagnostics,{});object(r.configuration,['id','source','eventId']);for(const s of Object.values(r.configuration))text(s);
  if(r.playedMove!==undefined)move(r.playedMove);
  if(r.human!==undefined){object(r.human,['move','source','eventId']);move(r.human.move);text(r.human.source);text(r.human.eventId);}
  if(r.selection!==undefined){object(r.selection,['frameId','rank']);text(r.selection.frameId);if(!r.diagnostics.frames.some(f=>f.id===r.selection.frameId)||!Number.isSafeInteger(r.selection.rank)||r.selection.rank<1||r.selection.rank>r.diagnostics.multiPV)throw Error('Invalid frame/rank selection');}
  if(r.category!==undefined){object(r.category,['value','source','eventId','policyVersion']);if(!categories.includes(r.category.value))throw Error('Unknown existing category');for(const k of ['source','eventId','policyVersion'])text(r.category[k]);}
  if(r.analysis!==undefined){object(r.analysis,['kind','source','eventId','text']);if(!['mate-search','tactical','positional'].includes(r.analysis.kind))throw Error('Invalid analysis report kind');for(const k of ['source','eventId','text'])text(r.analysis[k]);}
 }
 object(options,['enabled','maxRecords','maxPvPlies','accuracyModel'],[]);if(options.enabled!==undefined&&typeof options.enabled!=='boolean'||options.accuracyModel!==undefined&&!['none','sf19-display'].includes(options.accuracyModel))throw Error('Invalid review option');
 const limits={maxRecords:options.maxRecords===undefined?256:options.maxRecords,maxPvPlies:options.maxPvPlies===undefined?1024:options.maxPvPlies,accuracyModel:options.accuracyModel??'none'};for(const [n,max]of [[limits.maxRecords,256],[limits.maxPvPlies,4096]])if(!Number.isSafeInteger(n)||n<0||n>max)throw Error('Invalid review budget');return limits;
}
