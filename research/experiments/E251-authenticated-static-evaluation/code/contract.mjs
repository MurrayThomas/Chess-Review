import {Chess} from '../../../../lib/chess.js';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {actual} from '../../E210-sustainable-threat-policy/code/rules.mjs';
export function validate(input,options={}){
 plain([input,options]);const obj=(v,keys)=>{if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).some(k=>!keys.includes(k)))throw Error('Invalid static fields');};
 obj(input,['fen','history']);obj(options,['enabled','player','maxRecords']);if(typeof input.fen!=='string')throw Error('Full FEN required');
 if(options.enabled!==undefined&&typeof options.enabled!=='boolean'||options.player!==undefined&&!['w','b'].includes(options.player))throw Error('Invalid static options');
 const maxRecords=options.maxRecords??4;if(!Number.isSafeInteger(maxRecords)||maxRecords<0||maxRecords>4)throw Error('Invalid static budget');
 if(input.history!==undefined){obj(input.history,['fen','moves']);if(input.history.fen!==new Chess().fen()||!Array.isArray(input.history.moves))throw Error('Full standard-start history required');}
 const a=actual(input);if(!a)new Chess(input.fen);return{c:a?.c??new Chess(input.fen),maxRecords,hasHistory:!!a};
}
export const unavailable=c=>c.isCheckmate()||c.isStalemate()||c.isInsufficientMaterial()||c.isGameOver()?'terminal':c.isCheck()?'in-check':null;
