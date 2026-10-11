import {isDeepStrictEqual} from 'node:util';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {lastMoveChanges} from '../../E200-recorded-move-changes/code/changes.mjs';
import {verifyPanel} from '../../E156-piece-objective-effectiveness/code/verify-panel.mjs';
const admissions=[],all=['C1063','C1064','C1065'],live=s=>Object.values(s.flags).every(v=>v===false);
export function inspectPieceQuestions(current,options={},source){
  plain([current,options,source]);
  if(!current||typeof current!=='object'||Array.isArray(current)||!options||typeof options!=='object'||Array.isArray(options)||Object.keys(options).some(k=>!['enabled','player','ids','maxNodes'].includes(k)))throw Error('Invalid piece-question interface');
  const enabled=options.enabled===undefined?false:options.enabled,player=options.player,ids=options.ids===undefined?all:options.ids,limit=options.maxNodes===undefined?50000:options.maxNodes;
  if(typeof enabled!=='boolean'||player!==undefined&&!['w','b'].includes(player)||enabled&&player===undefined||!Array.isArray(ids)||!ids.length||new Set(ids).size!==ids.length||ids.some(id=>!all.includes(id))||!Number.isSafeInteger(limit)||limit<0||limit>50000)throw Error('Invalid piece-question controls');
  let nodes=0;const done=(status,witness=null,answers=ids.map(id=>({id,available:false,reason:status,units:[]})))=>({schema:'E203-objective-piece-questions',status,limit,nodes,player:player??null,ids:[...ids],answers,witness});
  const exhausted=()=>{nodes=limit+1;return done('exhausted');};
  if(!enabled)return done('disabled');if(!limit)return exhausted();nodes=1;
  if(current.history===undefined)return done('history-prerequisite');
  if(!current.history||typeof current.fen!=='string'||typeof current.history.fen!=='string'||!Array.isArray(current.history.moves)||current.history.moves.length>1000)throw Error('Require current legal history interface');
  if(!current.history.moves.length)return done('recorded-move-prerequisite');
  if(source===undefined)return done('source-prerequisite');
  if(!source||!source.input||!source.panel||!source.input.history)throw Error('Require original source input and panel');
  const i=source.input,p=source.panel,expectedHistory={fen:i.history.fen,moves:[...i.history.moves,i.move]};
  if(!isDeepStrictEqual(current.history,expectedHistory))throw Error('Current history must be exact source prefix plus actual move');
  const identity=lastMoveChanges({fen:current.fen,history:current.history,maxChangeNodes:limit-1});if(identity.status==='exhausted')return exhausted();if(identity.status!=='answered')throw Error('Require exact recorded current identity ledger');nodes+=identity.nodes;
  if(!Number.isSafeInteger(p.nodes)||p.nodes<0||p.nodes>50000)throw Error('Invalid source cost');if(nodes+p.nodes>limit)return exhausted();
  const key=[i,p];let admitted=admissions.find(a=>isDeepStrictEqual(a.key,key));if(!admitted){const q=verifyPanel(i,p);admitted={key:structuredClone(key),nodes:q.nodes};admissions.push(admitted);}nodes+=admitted.nodes;
  const v=p.variants[0];if(current.fen!==v.state.fen||identity.answer.before.fen!==p.before||identity.answer.after.fen!==v.state.fen||identity.answer.last.uci!==i.move||identity.answer.last.color!==p.actor)throw Error('Source current frame differs');
  if(p.claimContexts.length)return done('claim-rule-prerequisite');if(v.checking)return done('nonquiet-objective-prerequisite');if(!live(v.state))return done('not-live');
  const tick=()=>{if(++nodes>limit)throw Error('piece-question-budget');},units=identity.answer.after.inventory.filter(u=>u.color===p.actor&&'nbrq'.includes(u.type)).sort((a,b)=>a.id.localeCompare(b.id));
  try{
    const profiles=units.map(u=>{
      tick();const branches=v.branches.map(b=>{
        tick();const successes=[];
        for(const a of b.attempts){tick();if(a.from!==u.square||a.piece!==u.type)continue;let gain=a.state.balance-p.baseline,ok=live(a.state)&&a.counters.length>0&&gain>=1;
          for(const counter of a.counters){tick();gain=Math.min(gain,counter.state.balance-p.baseline);if(!live(counter.state)||counter.state.balance-p.baseline<1)ok=false;}
          if(ok)successes.push({capture:a.move,target:b.targets[a.target],minimumGain:gain});
        }
        return {reply:b.move,live:live(b.state),successes};
      });
      const refutations=branches.filter(b=>!b.live||!b.successes.length).map(b=>b.reply);
      return {id:u.id,color:u.color,originalType:u.originalType,type:u.type,square:u.square,covers:branches.length>0&&!refutations.length,branches,refutations};
    });tick();
    const covering=profiles.filter(u=>u.covers).map(u=>u.id),failing=profiles.filter(u=>!u.covers).map(u=>u.id),separates=covering.length>0&&failing.length>0;
    const target=identity.answer.after.inventory.find(u=>u.square===i.objectiveTarget&&u.color!==p.actor);
    const witness={frame:{fen:v.state.fen,actorToMove:identity.answer.after.fields.turn,unitColor:p.actor,player},objective:{kind:'all-defense-profitable-tracked-pawn-capture',target:{id:target.id,square:target.square,type:target.type},minimumGain:1,baseline:p.baseline},profiles,ranking:{criterion:'all-defense-objective-coverage',covering,failing,separates},source:structuredClone(source),identity};
    const answers=ids.map(id=>{const correctSide=id==='C1063'||(id==='C1064'?player===p.actor:player!==p.actor),available=correctSide&&separates,chosen=id==='C1065'?covering:failing;
      return {id,available,reason:!correctSide?'other-side-profile':!separates?'no-objective-separation':'declared-objective-only',units:available?chosen.map(id=>{const u=profiles.find(p=>p.id===id);return {id:u.id,square:u.square,type:u.type};}):[]};});
    return done(answers.some(a=>a.available)?'proven':'compared',witness,answers);
  }catch(e){if(e.message!=='piece-question-budget')throw e;return exhausted();}
}
