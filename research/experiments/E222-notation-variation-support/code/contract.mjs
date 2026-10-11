import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
export class Exhausted extends Error {}
export const occurrenceIds=Array.from({length:22},(_,i)=>'C'+String(985+i).padStart(4,'0'));
export const results=['1-0','0-1','1/2-1/2','*'];
export const suffixNag={'!':1,'?':2,'!!':3,'??':4,'!?':5,'?!':6};
export function validate(input,options){
 plain([input,options]);
 for(const [x,keys]of [[input,['pgn','source','eventId']],[options,['enabled','maxMoves','maxDepth','maxChars']]])if(!x||Array.isArray(x)||typeof x!=='object'||Object.keys(x).some(k=>!keys.includes(k)))throw Error('Invalid notation fields');
 if(typeof input.pgn!=='string'||input.pgn.length>65536||/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(input.pgn))throw Error('Invalid bounded PGN text');
 for(const k of ['source','eventId'])if(typeof input[k]!=='string'||!input[k].length||input[k].length>200)throw Error('Missing reported provenance');
 if(options.enabled!==undefined&&typeof options.enabled!=='boolean')throw Error('Invalid enabled');
 const limits={maxMoves:options.maxMoves===undefined?256:options.maxMoves,maxDepth:options.maxDepth===undefined?8:options.maxDepth,maxChars:options.maxChars===undefined?65536:options.maxChars};
 for(const [k,top]of [['maxMoves',256],['maxDepth',8],['maxChars',65536]])if(!Number.isSafeInteger(limits[k])||limits[k]<0||limits[k]>top)throw Error('Invalid notation budget');
 return limits;
}
