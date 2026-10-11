import assert from 'node:assert/strict';
import {writeFile,mkdir,access} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {Chess} from '../../../../lib/chess.js';
import {openResearchData} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {boardFen,reflect} from '../../FRIEND-shared/lib.mjs';
import {turnBoard} from '../../E027-defensive-resources/code/defense.mjs';
import {drawQuery} from '../../E093-forcing-draw-resources/code/draws.mjs';
import {replayQuery,positionKey} from '../../E093-forcing-draw-resources/code/check-witness.mjs';
import {savedRoutes} from './routes-saved.mjs';
const dir='research/experiments/E216-outside-passer-fortress-setup',data=await openResearchData(['D001'],{purpose:'test'});await mkdir(dir+'/evidence',{recursive:true});try{await access(dir+'/evidence/collection-started.json');throw Error('Refusing to restart');}catch(e){if(e.code!=='ENOENT')throw e;}
const inputHashes=await bindings([dir+'/plan.md',dir+'/code/fortress-pilot.mjs']),revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim();await writeFile(dir+'/evidence/collection-started.json',JSON.stringify({revision,inputHashes,receipt:data.receipt},null,2)+'\n',{flag:'wx'});
const reused=await savedRoutes();await writeFile(dir+'/evidence/route-reuse.json',JSON.stringify({revision,parentInputHashes:reused.parentInputHashes,receipt:reused.receipt,rows:reused.rows.map(r=>({id:r.id,input:r.input,source:r.source}))},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({reusedRoutes:reused.rows.map(r=>r.id),freshPromotionQueries:0}));
const fen=boardFen({f6:'K',a6:'R',c4:'B',f5:'N',h8:'k',a1:'n',c1:'n',e1:'n',g1:'n'}),base={id:'quiet-setup',fen,move:'a6a7',history:{fen,moves:[]}},mirror=reflect(base),values={p:1,n:3,b:3,r:5,q:9,k:0};
const kings=(c,color)=>turnBoard(c,color).moves({verbose:true}).filter(m=>m.piece==='k').map(m=>m.from+m.to);
for(const f of [base,mirror]){
 const input={fen:f.fen,move:f.move,history:f.history},start=performance.now(),record={revision,inputHashes,input,receipt:data.receipt,limit:2000,plies:9,nodes:0,proof:null,replay:null,status:'pending',error:null};
 try{const c=new Chess(input.fen),actor=c.turn(),enemy=actor==='w'?'b':'w',beforeKingMoves=kings(c,enemy),deficit=c.board().flat().filter(Boolean).reduce((sum,p)=>sum+values[p.type]*(p.color===actor?1:-1),0),counts=new Map([[positionKey(c),1]]),move=c.move(input.move);counts.set(positionKey(c),(counts.get(positionKey(c))||0)+1);assert.equal(move.piece,'r');assert.equal(move.captured,undefined);assert.equal(c.isCheck(),false);assert.ok(deficit<0&&beforeKingMoves.length>0);assert.deepEqual(kings(c,enemy),[]);const replies=c.moves({verbose:true});assert.ok(replies.length>0);for(const r of replies){c.move(r);try{assert.deepEqual(kings(c,enemy),[]);}finally{c.undo();}}
  record.geometry={actor,deficit,beforeKingMoves,afterKingMoves:[],replies:replies.map(m=>m.from+m.to+(m.promotion||''))};record.proof=drawQuery(c,actor,'repetition',9,()=>{if(++record.nodes>record.limit)throw Error('fortress-budget');});record.replay=replayQuery(c,record.proof,counts);assert.equal(record.proof.tree.win,true);assert.equal(record.replay.passed,true);record.status='proven';
 }catch(e){record.status='unavailable';record.error=e.message;}
 record.seconds=(performance.now()-start)/1000;record.costPass=record.seconds<=2;await writeFile(dir+'/evidence/'+f.id+'.json',JSON.stringify(record,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({id:f.id,status:record.status,error:record.error,nodes:record.nodes,seconds:record.seconds,costPass:record.costPass,geometry:record.geometry,replay:record.replay}));if(record.status!=='proven'||!record.costPass)break;
}
