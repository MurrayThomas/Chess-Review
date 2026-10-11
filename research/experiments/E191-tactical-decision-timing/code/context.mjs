import {context as defenseContext} from '../../E169-passive-defense-counterplay/code/context.mjs';
import {context as structureContext} from '../../E168-forced-pawn-weakness/code/context.mjs';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
export function controls(source,input,options={}){
 plain(input);plain(options);if(!['defense','structure'].includes(source)||!input||typeof input!=='object'||Array.isArray(input)||!options||typeof options!=='object'||Array.isArray(options)||Object.keys(options).some(k=>!['enabled','ownPlies','enemyPlies','maxNodes'].includes(k)))throw Error('Invalid timing controls');
 const enabled=options.enabled===undefined?false:options.enabled,A=options.ownPlies===undefined?2:options.ownPlies,D=options.enemyPlies===undefined?3:options.enemyPlies,limit=options.maxNodes===undefined?50000:options.maxNodes;
 if(typeof enabled!=='boolean'||!Number.isSafeInteger(A)||A<0||A>3||!Number.isSafeInteger(D)||D<0||D>3||!Number.isSafeInteger(limit)||limit<0||limit>50000||source==='structure'&&options.enemyPlies!==undefined)throw Error('Invalid timing controls');return{enabled,A,D,limit};
}
export function prepare(source,input,A,D){
 if(typeof input.fen!=='string'||typeof input.move!=='string'||!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(input.move))throw Error('Require FEN and actual UCI');if(input.alternative!==undefined&&(typeof input.alternative!=='string'||!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(input.alternative)))throw Error('Require alternative UCI');if(source==='structure'&&input.pawn!==undefined&&(typeof input.pawn!=='string'||!/^[a-h][1-8]$/.test(input.pawn)))throw Error('Require pawn square');
 const mapped=source==='defense'?{fen:input.fen,move:input.move,history:input.history,defenseAlternative:input.alternative}:{fen:input.fen,move:input.move,history:input.history,weaknessQuiet:input.alternative,weaknessPawn:input.pawn};const context=source==='defense'?defenseContext(mapped,A,D):structureContext(mapped,A);return{...context,mapped};
}
