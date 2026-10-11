import assert from 'node:assert/strict';
import {access,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {Chess} from '../../../../lib/chess.js';
import {boardFen,reflect} from '../../FRIEND-shared/lib.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {collectObservedRookPanel} from '../../E211-rook-tablebase-admission/code/collect-observed.mjs';
import {checkObservedRookPanel} from '../../E211-rook-tablebase-admission/code/check-execution.mjs';
import {context,python} from '../../E211-rook-tablebase-admission/code/context.mjs';
const dir='research/experiments/E217-defensive-positional-exchange',options={maxProbes:128};
const uci=m=>m.from+m.to+(m.promotion||'');
const value={p:1,n:3,b:3,r:5,q:9,k:0};
const balance=(c,actor)=>c.board().flat().filter(Boolean).reduce((s,p)=>s+(p.color===actor?1:-1)*value[p.type],0);
const fixture={id:'exchange',fen:boardFen({f7:'K',c1:'B',g7:'R',h8:'k',h5:'r',h7:'b'}),move:'g7h7'};
const ctx=await context();await mkdir(dir+'/evidence',{recursive:true});
try{await access(dir+'/evidence/collection-started.json');throw Error('Refusing to restart registered pilot');}catch(e){if(e.code!=='ENOENT')throw e;}
const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim();
const inputHashes=await bindings([dir+'/plan.md',dir+'/code/pilot.mjs']);
await writeFile(dir+'/evidence/collection-started.json',JSON.stringify({revision,inputHashes},null,2)+'\n',{flag:'wx'});
const decisions=[];let failure=null;
async function observe(id,input,actor,phase,bishop,baseline){
 const begin=performance.now(),bundle=await collectObservedRookPanel(input,options,python),seconds=(performance.now()-begin)/1000;
 await writeFile(dir+'/evidence/'+id+'.json',JSON.stringify({revision,inputHashes,id,input,options,bundle,seconds},null,2)+'\n',{flag:'wx'});
 const view=checkObservedRookPanel(input,options,bundle,ctx),c=new Chess(input.fen);
 const outcome=view.root.wdl===0,nonterminal=!c.isGameOver(),deficit=balance(c,actor)-baseline===-2;
 // Quiet panel root is the opponent's turn; each successor WDL is the original actor's perspective.
 const rows=phase==='quiet'?view.rows.every(r=>{const d=new Chess(r.fen);return d.get(bishop)?.type==='b'&&d.get(bishop)?.color===actor&&d.board().flat().filter(p=>p?.type==='r'&&p.color!==actor).length===1&&balance(d,actor)-baseline===-2&&r.wdl>=0;}):!c.moves({verbose:true}).some(m=>m.captured==='r');
 const decision={id,phase,seconds,probes:bundle.requiredProbes,rootWdl:view.root.wdl,outcome,nonterminal,deficit,rows,costPass:seconds<=3};
 decision.passes=outcome&&nonterminal&&deficit&&rows&&decision.costPass;decisions.push(decision);
 await writeFile(dir+'/evidence/'+id+'-decision.json',JSON.stringify(decision,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(decision));assert.ok(decision.passes,'Registered '+id+' gate failed');
}
try{
 for(const f of [fixture,reflect(fixture)]){
  const actor=new Chess(f.fen).turn(),bishop=actor==='w'?'c1':'c8',quiet=actor==='w'?'f7e8':'f2e1',c=new Chess(f.fen),baseline=balance(c,actor);
  const offer=c.move(f.move);assert.equal(offer.captured,'b');assert.ok(c.isCheck());
  const replies=c.moves({verbose:true}).sort((a,b)=>uci(a).localeCompare(uci(b)));assert.ok(replies.length>0&&replies.length<=2,'Acceptance domain budget');
  const accepted=[];
  for(const reply of replies){assert.equal(reply.to,offer.to);assert.equal(reply.captured,'r');const d=new Chess(c.fen());d.move(uci(reply));assert.equal(balance(d,actor)-baseline,-2);assert.equal(d.board().flat().filter(Boolean).length,4);const input={fen:d.fen(),history:{fen:f.fen,moves:[f.move,uci(reply)]}};accepted.push({reply:uci(reply),input});}
  for(const a of accepted)await observe(f.id+'-'+a.reply+'-accepted',a.input,actor,'accepted',bishop,baseline);
  for(const a of accepted){const d=new Chess(a.input.fen),m=d.move(quiet);assert.ok(!m.captured&&!d.isCheck()&&!d.isGameOver());assert.equal(d.get(bishop)?.type,'b');await observe(f.id+'-'+a.reply+'-quiet',{fen:d.fen(),history:{fen:f.fen,moves:[...a.input.history.moves,quiet]}},actor,'quiet',bishop,baseline);}
 }
}catch(e){failure=e.message;console.log(JSON.stringify({stopped:true,failure}));}
await writeFile(dir+'/evidence/decisions.json',JSON.stringify({revision,inputHashes,decisions,failure,passes:!failure},null,2)+'\n',{flag:'wx'});
