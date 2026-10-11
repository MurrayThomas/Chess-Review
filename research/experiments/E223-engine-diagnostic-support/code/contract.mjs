import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
export const occurrenceIds=Array.from({length:10},(_,i)=>'C'+(1011+i));
const object=(x,keys,required=keys)=>{if(!x||Array.isArray(x)||typeof x!=='object'||Object.keys(x).some(k=>!keys.includes(k))||required.some(k=>!Object.hasOwn(x,k)))throw Error('Invalid engine support fields');};
const text=(s,limit=200)=>{if(typeof s!=='string'||!s.length||s.length>limit)throw Error('Invalid report text');};
export function validate(input,options){
 plain([input,options]);object(input,['fen','history','source','eventId','engine','multiPV','scorePerspective','wdlModel','frames'],['fen','source','eventId','engine','multiPV','scorePerspective','frames']);object(options,['enabled','player','maxRecords','maxPvPlies'],[]);
 text(input.fen,200);text(input.source);text(input.eventId);object(input.engine,['name','version']);text(input.engine.name);text(input.engine.version);
 if(!Number.isSafeInteger(input.multiPV)||input.multiPV<1||input.multiPV>32||input.scorePerspective!=='root-side-to-move')throw Error('Invalid declared score configuration');
 if(input.wdlModel!==undefined)text(input.wdlModel);
 if(input.history!==undefined){object(input.history,['fen','moves']);text(input.history.fen,200);if(!Array.isArray(input.history.moves)||input.history.moves.length>1000||input.history.moves.some(m=>typeof m!=='string'||!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(m)))throw Error('Invalid history');}
 if(!Array.isArray(input.frames)||input.frames.length>16)throw Error('Invalid frames');let records=0;const ids=new Set();for(const f of input.frames){object(f,['id','lines']);text(f.id);if(ids.has(f.id)||!Array.isArray(f.lines)||f.lines.length>32)throw Error('Duplicate or invalid frame');ids.add(f.id);records+=f.lines.length;for(const s of f.lines){text(s,4096);if(/[\r\n\x00]/.test(s))throw Error('Expected single raw line');}}if(records>128)throw Error('Too many raw records');
 if(options.enabled!==undefined&&typeof options.enabled!=='boolean'||options.player!==undefined&&!['w','b'].includes(options.player))throw Error('Invalid engine support option');
 const maxRecords=options.maxRecords===undefined?128:options.maxRecords,maxPvPlies=options.maxPvPlies===undefined?4096:options.maxPvPlies;for(const [n,max]of [[maxRecords,128],[maxPvPlies,4096]])if(!Number.isSafeInteger(n)||n<0||n>max)throw Error('Invalid engine support budget');return{maxRecords,maxPvPlies};
}
