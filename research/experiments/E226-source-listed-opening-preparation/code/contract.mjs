import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {validate as engineContract} from '../../E223-engine-diagnostic-support/code/contract.mjs';
export const occurrenceIds=['C0150','C0151','C0152','C0153','C0154','C0157','C0158','C0833','C0834','C1021','C1032'];
export const labels=['Opening theory','Main line','Sideline','Novelty','Preparation','Opening repertoire','Repertoire depth','Opening preparation','Opponent preparation','Opening book','Computer-assisted preparation'];
const object=(v,keys,required=keys)=>{if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).some(k=>!keys.includes(k))||required.some(k=>!Object.hasOwn(v,k)))throw Error('Invalid opening support fields');};
const text=v=>{if(typeof v!=='string'||!v.trim()||v.length>2000)throw Error('Invalid opening support text');};
const array=(v,max)=>{if(!Array.isArray(v)||v.length>max||Object.keys(v).length!==v.length||Object.keys(v).some((k,i)=>k!==String(i)))throw Error('Invalid dense bounded array');};
const moves=(v,min=0)=>{array(v,64);if(v.length<min)throw Error('Missing listed moves');for(const m of v)if(typeof m!=='string'||!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(m))throw Error('Invalid UCI move');};
export function validate(input,options){
 plain([input,options]);object(input,['source','eventId','book','query','repertoire','preparations'],['source','eventId','book','query']);text(input.source);text(input.eventId);
 object(input.book,['id','version','rootFen','lines']);for(const k of ['id','version','rootFen'])text(input.book[k]);array(input.book.lines,64);const ids=new Set();
 for(const r of input.book.lines){object(r,['id','moves','role','source','eventId']);for(const k of ['id','source','eventId'])text(r[k]);if(ids.has(r.id)||!['main','side','unspecified'].includes(r.role))throw Error('Invalid or duplicate book line');ids.add(r.id);moves(r.moves,1);}
 object(input.query,['rootFen','moves']);text(input.query.rootFen);moves(input.query.moves);
 const refs=v=>{array(v,64);if(new Set(v).size!==v.length)throw Error('Duplicate line reference');for(const id of v)if(typeof id!=='string'||!ids.has(id))throw Error('Unknown book line reference');};
 if(input.repertoire!==undefined){object(input.repertoire,['owner','source','eventId','lineIds']);for(const k of ['owner','source','eventId'])text(input.repertoire[k]);refs(input.repertoire.lineIds);}
 if(input.preparations!==undefined){array(input.preparations,32);const reports=new Set();for(const p of input.preparations){object(p,['id','kind','owner','source','eventId','bookLineIds','note','opponent','engine'],['id','kind','owner','source','eventId','bookLineIds','note']);for(const k of ['id','owner','source','eventId','note'])text(p[k]);if(reports.has(p.id)||!['opening','opponent','computer'].includes(p.kind))throw Error('Invalid or duplicate preparation');reports.add(p.id);refs(p.bookLineIds);if(p.kind==='opponent')text(p.opponent);else if(Object.hasOwn(p,'opponent'))throw Error('Opponent only belongs to opponent preparation');if(p.engine!==undefined)engineContract(p.engine,{});}}
 object(options,['enabled','maxRecords','maxPlies'],[]);if(options.enabled!==undefined&&typeof options.enabled!=='boolean')throw Error('Invalid enable option');const maxRecords=options.maxRecords??256,maxPlies=options.maxPlies??1024;
 for(const [n,max]of [[maxRecords,256],[maxPlies,4096]])if(!Number.isSafeInteger(n)||n<0||n>max)throw Error('Invalid opening support budget');
 // Explicit null is not an omitted option.
 for(const k of ['maxRecords','maxPlies'])if(Object.hasOwn(options,k)&&options[k]===null)throw Error('Invalid null budget');return{maxRecords,maxPlies};
}
