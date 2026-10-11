import {legalPosition,uci} from '../../E020-coach-concepts/code/concepts.mjs';
import {validateHistory} from '../../E024-transitions/code/transitions.mjs';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
export const contexts={C0804:'32. Decision-making concepts',C0926:'36. Deeper strategic concepts',C0808:'32. Decision-making concepts'};
export function controls(input,options={}){
 plain(input);plain(options);if(!input||typeof input!=='object'||Array.isArray(input)||!options||typeof options!=='object'||Array.isArray(options)||Object.keys(options).some(k=>!['enabled','plies','maxNodes'].includes(k)))throw Error('Invalid liquidation controls');
 const enabled=options.enabled===undefined?false:options.enabled,H=options.plies===undefined?2:options.plies,limit=options.maxNodes===undefined?50000:options.maxNodes;if(typeof enabled!=='boolean'||!Number.isSafeInteger(H)||H<0||H>2||!Number.isSafeInteger(limit)||limit<0||limit>50000)throw Error('Invalid liquidation controls');return{enabled,H,limit};
}
export function prepare(input,H){
 if(typeof input.fen!=='string'||typeof input.move!=='string'||!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(input.move))throw Error('Require FEN and actual UCI');if(input.alternative!==undefined&&(typeof input.alternative!=='string'||!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(input.alternative)))throw Error('Require alternative UCI');
 const h=validateHistory(input),c=legalPosition(h?.start||input.fen);for(const m of h?.moves||[])c.move(m);if(c.isGameOver())return{status:'not-live'};
 const moves=c.moves({verbose:true}),a=moves.find(m=>uci(m)===input.move),b=moves.find(m=>uci(m)===input.alternative);if(!a)throw Error('Actual must be legal');if(input.alternative!==undefined&&(!b||input.alternative===input.move||b.captured||b.promotion))throw Error('Require distinct legal noncapture alternative');if(!h)return{status:'history-prerequisite'};if(!b)return{status:'alternative-prerequisite'};if(H!==2)return{status:'horizon-prerequisite'};
 const actor=c.turn(),army=c.board().flat().filter(Boolean);if(army.length!==5||army.filter(p=>p.type==='q'&&p.color===actor).length!==1||army.filter(p=>p.type==='q'&&p.color!==actor).length!==1||army.filter(p=>p.type==='r'&&p.color===actor).length!==1)return{status:'material-prerequisite'};
 if(a.piece!=='q'||a.captured!=='q'||a.promotion)throw Error('Actual must exchange queens');return{status:'ready',setup:3+h.moves.length,source:{fen:input.fen,move:input.move,history:input.history,endingAlternative:input.alternative}};
}
