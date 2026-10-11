import assert from 'node:assert/strict';
import {Chess} from '../../../../lib/chess.js';
import {readFen} from '../../FRIEND-shared/lib.mjs';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {readAdmission} from './admission.mjs';
// Independent file-wing and same-original-king reconstruction, no classifier or
// geometry imports. Outcomes are authenticated observations, not recomputed WDL.
export function checkShortSideResult(input,token,result){
 plain([input,result]);const a=readAdmission(token);assert.deepEqual(input,a.input);const view=a.view,c=new Chess(input.fen),{board,turn}=readFen(input.fen),items=Object.entries(board),pawn=items.find(([,p])=>p.toLowerCase()==='p');assert.ok(pawn);
 const defender=pawn[1]==='P'?'b':'w',king=items.find(([,p])=>p===(defender==='b'?'k':'K'))[0],attackerKing=items.find(([,p])=>p===(defender==='b'?'K':'k'))[0],rook=items.find(([,p])=>p===(defender==='b'?'r':'R'))[0],pf='abcdefgh'.indexOf(pawn[0][0]),longSign=pf<3.5?1:-1;
 const wing=s=>Math.sign('abcdefgh'.indexOf(s[0])-pf)*longSign,geometry={defender,pawn:pawn[0],king,attackerKing,rook,longSign,kingOnShortSide:wing(king)===-1,rookOnLongSide:wing(rook)===1,rookCheckingDistance:Math.abs(rook.charCodeAt(0)-attackerKing.charCodeAt(0))-1,rookSharesKingRank:rook[1]===attackerKing[1]},resources=[],alternatives=[];
 const legal=c.moves({verbose:true});assert.equal(view.rows.length,legal.length);
 for(const row of view.rows){const m=legal.find(m=>m.from+m.to+(m.promotion||'')===row.move);assert.ok(m);assert.equal(row.rootActorWdl,row.wdl===0?0:-row.wdl);if(m.piece!=='k'||m.from!==king)continue;
  if(wing(m.to)===-1&&row.wdl===0)resources.push(row);if(wing(m.to)===1&&row.wdl===2)alternatives.push(row);
 }
 const available=items.length===5&&turn===defender&&geometry.rookOnLongSide&&view.root.wdl===0&&resources.length>0&&alternatives.length>0;
 assert.deepEqual(result,{schema:'E213-short-side-king-resource',id:'C0667',available,status:available?'observed-resource':'no-qualifying-contrast',defender:turn,resources:available?resources:[],losingAlternatives:available?alternatives:[],geometry,source:a.source,outcomeScope:view.outcomeScope});return true;
}
