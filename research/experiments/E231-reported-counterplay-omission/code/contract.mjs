import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {legalPosition} from '../../E020-coach-concepts/code/concepts.mjs';
const exact=(x,keys)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).sort().join(',')===keys.split(',').sort().join(',');
const move=x=>typeof x==='string'&&/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(x);
export function validate(input,options){
 plain([input,options]);
 if(!exact(input,'decision,alternative,report')||!exact(input.report,'id,source,eventId,fen,actor,resource,disposition')||!input.decision||Array.isArray(input.decision)||Object.keys(input.decision).some(k=>!['fen','move','history'].includes(k))||typeof input.decision.fen!=='string'||!move(input.decision.move)||!move(input.alternative)||input.alternative===input.decision.move)throw Error('Invalid decision contract');
 const r=input.report;if(!['id','source','eventId','fen'].every(k=>typeof r[k]==='string'&&r[k].trim().length>0&&r[k].length<=2048)||!['w','b'].includes(r.actor)||!move(r.resource)||!['excluded','considered','unknown'].includes(r.disposition))throw Error('Invalid report');
 if(input.decision.history!==undefined&&(!exact(input.decision.history,'fen,moves')||typeof input.decision.history.fen!=='string'||!Array.isArray(input.decision.history.moves)||input.decision.history.moves.length>1000||!input.decision.history.moves.every(move)))throw Error('Invalid history');
 if(!options||typeof options!=='object'||Array.isArray(options)||Object.keys(options).some(k=>!['enabled','plies','maxNodes'].includes(k)))throw Error('Invalid options');
 const enabled=options.enabled??false,H=options.plies??1,L=options.maxNodes??100002;
 if(typeof enabled!=='boolean'||!Number.isSafeInteger(H)||H<0||H>2||!Number.isSafeInteger(L)||L<0||L>100002||Object.values(options).includes(null))throw Error('Invalid limits');return{enabled,H,L};
}
export function frame(input){const c=legalPosition(input.decision.fen),actor=c.turn(),uci=m=>m.from+m.to+(m.promotion||'');if(!c.moves({verbose:true}).some(m=>uci(m)===input.alternative))throw Error('Illegal alternative');c.move(input.decision.move);if(input.report.actor!==actor||input.report.fen!==c.fen())throw Error('Report frame/player mismatch');return c.moves({verbose:true}).some(m=>uci(m)===input.report.resource);}
export const empty=o=>({schema:'E231-reported-counterplay-omission',qualityClaim:false,mentalStateClaim:false,limits:{plies:o.H,maxNodes:o.L},nodes:0,status:'disabled',reason:null,contexts:null,witness:null});
