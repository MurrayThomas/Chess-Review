import {actual} from '../../E210-sustainable-threat-policy/code/rules.mjs';
import {uci} from '../../E020-coach-concepts/code/concepts.mjs';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
export function prepare(input){
 plain(input);const exact=(x,keys)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).sort().join(',')===[...keys].sort().join(',');
 if(!exact(input,['fen','history','attack','preparation'])||typeof input.fen!=='string'||!exact(input.history,['fen','moves'])||!Array.isArray(input.history.moves)||input.history.moves.length>1000||[input.attack,input.preparation].some(m=>typeof m!=='string'||!/^[a-h][1-8][a-h][1-8]$/.test(m)))throw Error('Invalid adaptive input');
 const {c}=actual(input),actor=c.turn(),attacker=input.attack.slice(0,2),target=input.attack.slice(2),preparer=input.preparation.slice(0,2),legal=c.moves({verbose:true}),attack=legal.find(m=>uci(m)===input.attack),prep=legal.find(m=>uci(m)===input.preparation);
 if(c.get(attacker)?.type!=='q'||c.get(attacker)?.color!==actor||c.get(target)?.type!=='b'||c.get(target)?.color===actor||!attack?.captured||attack.promotion||!prep||prep.captured||prep.promotion||preparer===attacker||c.get(preparer)?.type==='k')throw Error('Require original queen/bishop attack and distinct quiet preparer');
 c.move(attack);const check=c.isCheck();c.undo();if(!check)throw Error('Original attack must check');c.move(prep);const terminal=c.isCheckmate()||c.isStalemate()||c.isInsufficientMaterial()||+c.fen().split(' ')[4]>=150;c.undo();if(terminal)throw Error('Preparation must remain live');
 return{c,actor,attacker,target,preparer};
}
export function query(input){
 const start=performance.now(),{c,actor,attacker,target,preparer}=prepare(input),journal=[];let ticks=0,attemptedPath=[],direct=null;
 const tick=()=>{ticks++;if(ticks>6144||performance.now()-start>5000)throw Error('Adaptive hard cost cap');};
 const terminal=()=>c.isCheckmate()?'mate':c.isStalemate()?'stalemate':c.isInsufficientMaterial()?'dead-material':+c.fen().split(' ')[4]>=150?'automatic-clock':null;
 const frame=()=>{tick();return{fen:c.fen(),check:c.isCheck(),terminal:terminal()};};
 const roles={attacker:{square:attacker,...c.get(attacker)},target:{square:target,...c.get(target)},preparer:{square:preparer,...c.get(preparer)}};
 try{
  c.move(input.attack);try{const after=frame(),moves=c.moves({verbose:true}).map(uci).sort(),replies=[];if(!after.terminal)for(const move of moves){c.move(move);try{replies.push({move,frame:frame()});}finally{c.undo();}}direct={after,moves:after.terminal?[]:moves,replies,enemyMatingReplies:replies.filter(r=>r.frame.terminal==='mate'&&r.frame.fen.split(' ')[1]===actor).map(r=>r.move)};}finally{c.undo();}
  function solve(a,t,attacked,left,path,first=false){attemptedPath=path;tick();const n={fen:c.fen(),attacker:a,target:t,attacked,left,path,win:false};journal.push(n);
   const end=terminal();if(end){n.kind=end;n.win=end==='mate'&&c.turn()!==actor&&attacked&&!!a&&c.get(a)?.type==='q'&&c.get(a)?.color===actor;return n;}
   if(!a){n.kind='attacker-lost';return n;}if(t===null&&!attacked){n.kind='target-lost';return n;}
   const legal=c.moves({verbose:true}),inventory=legal.map(uci).sort();let claim=+c.fen().split(' ')[4]>=100||c.isThreefoldRepetition();if(!claim)for(const m of legal){c.move(m);claim=c.isThreefoldRepetition()||+c.fen().split(' ')[4]>=100;c.undo();if(claim)break;}if(claim){n.kind='claim-sensitive';return n;}if(!left){n.kind='limit';return n;}
   const own=c.turn()===actor,ordered=[...legal].sort((x,y)=>own?Number(!!y.captured)-Number(!!x.captured)||uci(x).localeCompare(uci(y)):uci(x).localeCompare(uci(y))),lastTarget=own&&left===1&&!attacked,choices=first?ordered.filter(m=>uci(m)===input.preparation):lastTarget?ordered.filter(m=>m.from===a&&m.to===t&&m.captured):ordered;
   n.moves=inventory;n.branches=[];if(lastTarget)n.candidates=choices.map(uci);
   for(const m of choices){let nextA=m.color===actor&&m.from===a?m.to:m.color!==actor&&m.captured&&m.to===a?null:a,nextT=m.color!==actor&&m.from===t?m.to:m.color===actor&&m.captured&&m.to===t?null:t;c.move(m);const nextAttack=attacked||m.color===actor&&m.from===a&&m.to===t&&!!m.captured&&c.isCheck(),b={move:uci(m),child:null};n.branches.push(b);try{b.child=solve(nextA,nextT,nextAttack,left-1,[...path,b.move]);}finally{c.undo();}
    if(first){n.kind='preparation';n.win=b.child.win;return n;}if(b.child.win===own){n.kind=lastTarget?'final-target':own?'choice':'counterchoice';n.win=own;return n;}
   }
   n.kind=lastTarget?'final-target':own?'all-fail':'all';n.win=!own;return n;
  }
  const tree=solve(attacker,target,false,5,[],true);return{schema:'E258-adaptive-query-v1',input:structuredClone(input),actor,roles,plies:5,ticks,seconds:(performance.now()-start)/1000,direct,win:tree.win,tree};
 }catch(e){e.partial={schema:'E258-incomplete-query-v1',input:structuredClone(input),actor,roles,plies:5,ticks,seconds:(performance.now()-start)/1000,direct,attemptedPath,journal:journal.map(n=>({...n,branches:n.branches?.map(b=>({move:b.move,childPath:b.child?.path??null}))})),status:'cost-or-execution-unavailable',error:e.message};throw e;}
}
