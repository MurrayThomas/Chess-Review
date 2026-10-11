import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
export {prepare} from '../../E189-bounded-decision-support/code/context.mjs';
export function controls(input,options={}){
 plain([input,options]);if(!input||typeof input!=='object'||Array.isArray(input)||!options||typeof options!=='object'||Array.isArray(options)||Object.keys(options).some(k=>!['enabled','plies','maxNodes','view','goal'].includes(k)))throw Error('Invalid outcome controls');
 const enabled=options.enabled===undefined?false:options.enabled,H=options.plies===undefined?1:options.plies,limit=options.maxNodes===undefined?50000:options.maxNodes,v=options.view,g=options.goal;
 if(typeof enabled!=='boolean'||!Number.isSafeInteger(H)||H<0||H>2||!Number.isSafeInteger(limit)||limit<0||limit>50000)throw Error('Invalid outcome controls');
 if(v!==undefined&&(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).sort().join(',')!=='frame,perspective'||v.frame!=='after-actual'||!['w','b'].includes(v.perspective)))throw Error('Require explicit after-actual perspective');
 if(g!==undefined&&(!g||typeof g!=='object'||Array.isArray(g)||Object.keys(g).sort().join(',')!=='actor,fen,frame,outcome,source'||g.frame!=='before-actual'||typeof g.fen!=='string'||!['w','b'].includes(g.actor)||g.outcome!=='win'||g.source!=='declared-coaching-input'))throw Error('Require explicit declared win goal');return{enabled,H,limit,view:v,goal:g};
}
