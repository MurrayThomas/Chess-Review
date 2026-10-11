import assert from 'node:assert/strict';
import {Chess} from '../../../../lib/chess.js';
import {readFen} from '../../FRIEND-shared/lib.mjs';
import {readAdmission} from './admission.mjs';
// No candidate classifier or geometry imports. Reconstruct occupied squares,
// checking rays and exact defender-perspective outcomes from admitted rows.
export function checkLongSideResult(input,token,result){
 const a=readAdmission(token);assert.deepEqual(input,a.input);const view=a.view,c=new Chess(input.fen),{board,turn}=readFen(input.fen),items=Object.entries(board),pawn=items.find(([,p])=>p.toLowerCase()==='p');
 assert.ok(pawn);const defender=pawn[1]==='P'?'b':'w',kingLetter=defender==='b'?'k':'K',rookLetter=defender==='b'?'r':'R',attackerKing=items.find(([,p])=>p===(defender==='b'?'K':'k'))[0],king=items.find(([,p])=>p===kingLetter)[0],rook=items.find(([,p])=>p===rookLetter)[0],pf='abcdefgh'.indexOf(pawn[0][0]),sign=pf<3.5?1:-1;
 const wing=s=>Math.sign('abcdefgh'.indexOf(s[0])-pf)*sign,geometry={defender,pawn:pawn[0],king,attackerKing,rook,longSign:sign,kingOnShortSide:wing(king)===-1,rookOnLongSide:wing(rook)===1,rookCheckingDistance:Math.abs(rook.charCodeAt(0)-attackerKing.charCodeAt(0))-1,rookSharesKingRank:rook[1]===attackerKing[1]},resources=[],alternatives=[];
 for(const row of view.rows){const m=c.moves({verbose:true}).find(m=>m.from+m.to+(m.promotion||'')===row.move);assert.ok(m);assert.equal(row.rootActorWdl,row.wdl===0?0:-row.wdl);if(m.piece!=='r'||m.from!==rook)continue;
  const after=new Chess(row.fen),rb=readFen(row.fen).board;let clear=true;if(m.to[1]===attackerKing[1]){const first=Math.min(m.to.charCodeAt(0),attackerKing.charCodeAt(0))+1,last=Math.max(m.to.charCodeAt(0),attackerKing.charCodeAt(0));for(let f=first;f<last;f++)if(rb[String.fromCharCode(f)+m.to[1]])clear=false;}else clear=false;
  if(wing(king)===-1&&wing(m.to)===1&&clear&&Math.abs(m.to.charCodeAt(0)-attackerKing.charCodeAt(0))>=4&&after.isCheck()&&row.wdl===0)resources.push(row);
  if(!after.isCheck()&&row.wdl===2)alternatives.push(row);
 }
 const available=items.length===5&&turn===defender&&view.root.wdl===0&&resources.length>0&&alternatives.length>0;
 assert.deepEqual(result,{schema:'E212-long-side-resource',id:'C0666',available,status:available?'observed-resource':'no-qualifying-contrast',defender:turn,resources:available?resources:[],losingAlternatives:available?alternatives:[],geometry,source:a.source,outcomeScope:view.outcomeScope});return true;
}
