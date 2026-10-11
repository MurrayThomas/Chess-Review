import {Chess} from '../../../../lib/chess.js';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {inspectLiquidation} from '../../E190-liquidation-commitment/code/liquidation.mjs';
import {derive} from '../../E177-queen-exchange-ending/code/derive.mjs';
const all=['C1068','C1073','C1078'];
const criteria={C1068:'finite-H2-rook-ending-conversion-versus-alternative',C1073:'live-checking-forced-mate-policy',C1078:'removal-of-profitable-immediate-capture-policy-before-certified-mate'};
export function inspectExchangeQuestions(input,options={},panel){
  plain(input);plain(options);
  if(!input||typeof input!=='object'||Array.isArray(input)||!options||typeof options!=='object'||Array.isArray(options)||Object.keys(options).some(k=>!['enabled','player','ids','maxNodes'].includes(k)))throw Error('Invalid exchange-question interface');
  const enabled=options.enabled===undefined?false:options.enabled,player=options.player,ids=options.ids===undefined?all:options.ids,limit=options.maxNodes===undefined?50000:options.maxNodes;
  if(typeof enabled!=='boolean'||player!==undefined&&!['w','b'].includes(player)||enabled&&player===undefined||!Array.isArray(ids)||!ids.length||new Set(ids).size!==ids.length||ids.some(id=>!all.includes(id))||!Number.isSafeInteger(limit)||limit<0||limit>50000)throw Error('Invalid exchange-question controls');
  let nodes=0;const done=(status,source=null,witness=null,answers=ids.map(id=>({id,available:false,side:null,relation:null,frame:null,criterion:criteria[id]})))=>({schema:'E204-exchange-question-evidence',status,limit,nodes,player:player??null,ids:[...ids],answers,source,witness}),exhaust=()=>{nodes=limit+1;return done('exhausted');};
  if(!enabled)return done('disabled');if(!limit)return exhaust();nodes=1;
  const source=inspectLiquidation(input,{enabled:true,plies:2,maxNodes:limit-1},panel);if(source.status==='exhausted')return exhaust();nodes+=source.nodes;
  if(!source.witness)return done(source.status,structuredClone(source));
  try{
    const d=derive(panel,limit-nodes);nodes+=d.work;const tick=()=>{if(++nodes>limit)throw Error('exchange-question-budget');};
    const c=new Chess(input.history.fen);for(const move of input.history.moves)c.move(move);c.move(input.move);
    const steps=[],live=!c.isGameOver(),checked=c.isCheck(),actor=panel.actor,tree=panel.variants[0].query.tree;
    function walk(t){
      tick();if(c.isCheckmate())return t.kind==='mate'&&t.win&&c.turn()!==actor;
      if(c.isDraw())return false;
      if(c.turn()===actor){if(t.kind!=='choice')return false;const fromFen=c.fen(),color=c.turn();tick();c.move(t.move);steps.push({role:'actor',color,move:t.move,fromFen,afterFen:c.fen(),checkAfter:c.isCheck()});try{return c.isCheck()&&walk(t.child);}finally{c.undo();}}
      if(!c.isCheck()||t.kind!=='all'||!t.branches.length)return false;
      for(const b of t.branches){const fromFen=c.fen(),color=c.turn();tick();c.move(b.move);steps.push({role:'defender',color,move:b.move,fromFen,afterFen:c.fen(),checkAfter:c.isCheck()});let valid;try{valid=walk(b.child);}finally{c.undo();}if(!valid)return false;}return true;
    }
    const checkingPolicy=live&&checked&&tree.win?walk(tree):false;tick();
    const flags={C1068:source.claims.C0808&&d.ending,C1073:checkingPolicy,C1078:d.prevented};
    const witness={actor,frame:panel.variants[0].state.fen,benefit:{criterion:criteria.C1068,continuationPlies:2,actualMate:panel.variants[0].query.tree.win,alternativeMate:panel.variants[1].query.tree.win,satisfied:flags.C1068},initiative:{live,checked,checkingPolicy,steps},counterplay:{satisfied:d.prevented,actualProfitable:d.summaries[0].captures.filter(q=>q.success),alternativeProfitable:d.summaries[1].captures.filter(q=>q.success)},derivation:structuredClone(d)};
    const answers=ids.map(id=>({id,available:!!flags[id],side:flags[id]?actor:null,relation:flags[id]?(actor===player?'own':'opponent'):null,frame:witness.frame,criterion:criteria[id]}));
    return done(answers.some(a=>a.available)?'proven':'compared',structuredClone(source),witness,answers);
  }catch(e){if(!['ending-preparation-budget','exchange-question-budget'].includes(e.message))throw e;return exhaust();}
}
