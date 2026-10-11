import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
const obj=x=>x&&typeof x==='object'&&!Array.isArray(x);
const exact=(x,keys)=>obj(x)&&Object.keys(x).sort().join(',')===[...keys].sort().join(',');
const move=x=>typeof x==='string'&&/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(x);
export function validate(input,options,policy=false){
 plain([input,options]);const keys=['id','source','fen',...(policy?['move','followup']:['attack','preparation']),...(input?.history===undefined?[]:['history'])];
 if(!exact(input,keys)||!['id','source','fen'].every(k=>typeof input[k]==='string'&&input[k].trim()&&input[k].length<=2048)||!(policy?move(input.move)&&move(input.followup):move(input.attack)&&move(input.preparation)))throw Error('Invalid comparison input');
 if(input.history!==undefined&&(!exact(input.history,['fen','moves'])||typeof input.history.fen!=='string'||!Array.isArray(input.history.moves)||input.history.moves.length>1000||!input.history.moves.every(move)))throw Error('Invalid history');
 if(!obj(options)||Object.keys(options).some(k=>!['enabled','maxWork','maxReplies'].includes(k)))throw Error('Invalid controls');
 const enabled=options.enabled===undefined?false:options.enabled,maxWork=options.maxWork===undefined?20000:options.maxWork,maxReplies=options.maxReplies===undefined?256:options.maxReplies;
 if(typeof enabled!=='boolean'||!Number.isSafeInteger(maxWork)||maxWork<0||maxWork>20000||!Number.isSafeInteger(maxReplies)||maxReplies<0||maxReplies>256)throw Error('Invalid limits');
 return{enabled,maxWork,maxReplies};
}
export const empty=(o,policy=false)=>({schema:policy?'E243-fixed-policy':'E243-attack-preparation',status:'disabled',reason:null,work:0,limits:{maxWork:o.maxWork,maxReplies:o.maxReplies},context:null,qualityClaim:false,mentalStateClaim:false,readinessCredit:false});
