import {validate,Exhausted,occurrenceIds} from './contract.mjs';
import {parse} from './parse.mjs';
import {serialize} from './serialize.mjs';
import {notationReferences} from './reference.mjs';
export {occurrenceIds};
export function inspectNotationSupport(input,options={}){
 const limits=validate(input,options),out={schema:'E222-notation-support',coverageCredit:false,qualityClaim:false,limits,status:'disabled',document:null,pgn:null,references:[],routes:[]};
 if(!options.enabled)return out;
 try{const doc=parse(input.pgn,limits);out.status='support-observations';out.document={source:input.source,eventId:input.eventId,...doc};out.pgn=serialize(doc);out.references=notationReferences();out.routes=out.references.map(r=>({id:r.id,status:r.scope==='reference-only'?'reference-only':'support-contract',evidencePath:r.scope==='reference-only'?'references':'document',qualityClaim:false}));return out;}
 catch(e){if(!(e instanceof Exhausted))throw e;out.status='budget-unavailable';return out;}
}
