import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {legalPosition} from '../../E020-coach-concepts/code/concepts.mjs';
import {context} from '../../E174-comparative-piece-improvement/code/context.mjs';
import {verifyPanel} from '../../E174-comparative-piece-improvement/code/verify-panel.mjs';
import {derive} from '../../E174-comparative-piece-improvement/code/derive.mjs';
const fields=(v,keys)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).every(k=>keys.includes(k));
export function inspectMinorOutpost(input,options={},panel){
 plain([input,options,panel]);if(!fields(input,['fen','move','history','target','alternative'])||typeof input.fen!=='string'||!['move','alternative'].every(k=>typeof input[k]==='string'&&/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(input[k]))||typeof input.target!=='string'||!/^[a-h][1-8]$/.test(input.target)||!fields(options,['enabled','maxNodes'])||options.enabled!==undefined&&typeof options.enabled!=='boolean')throw Error('Invalid minor-outpost interface');
 if(input.history!==undefined&&(!fields(input.history,['fen','moves'])||Object.keys(input.history).length!==2||typeof input.history.fen!=='string'||!Array.isArray(input.history.moves)))throw Error('Invalid history');
 const limit=options.maxNodes===undefined?5000:options.maxNodes;if(!Number.isSafeInteger(limit)||limit<0||limit>5000)throw Error('Invalid maxNodes');let nodes=0;
 const done=(status,witness=null)=>({schema:'E219-minor-ending-outpost',id:'C0717',available:status==='proven',status,limit,nodes,qualityClaim:false,witness}),exhaust=()=>{nodes=limit+1;return done('exhausted');};if(!options.enabled)return done('disabled');
 const mapped={fen:input.fen,move:input.move,history:input.history,improvementTarget:input.target,improvementAlternative:input.alternative},ctx=context(mapped);nodes=ctx.work+2;if(nodes>limit)return exhaust();if(ctx.status!=='ready')return done(ctx.status);
 const c=legalPosition(input.fen),actor=c.turn(),enemy=actor==='w'?'b':'w',units=c.board().flat().filter(Boolean),own=units.filter(p=>p.color===actor&&!['k','p'].includes(p.type)),opponent=units.filter(p=>p.color===enemy&&!['k','p'].includes(p.type));
 if(own.length!==1||own[0].type!=='n'||opponent.length!==1||opponent[0].type!=='b'||input.move.slice(0,2)!==own[0].square)return done('minor-ending-prerequisite');
 if(panel===undefined)return done('panel-prerequisite');if(!panel||!Number.isSafeInteger(panel.nodes)||panel.nodes<0)throw Error('Invalid complete panel');if(panel.nodes+nodes+3>limit)return exhaust();nodes+=verifyPanel(mapped,panel).nodes;
 const w=derive(mapped,panel,limit-nodes);nodes+=w.work;
 return done(w.outpost?'proven':w.claim?'claim-rule-prerequisite':'compared',{before:w.before,after:w.after,actor,ending:{actorKnight:own[0].square,enemyBishop:opponent[0].square},target:input.target,move:input.move,alternative:input.alternative,summaries:w.summaries,improved:w.improved,outpost:w.outpost,panel:structuredClone(panel)});
}
