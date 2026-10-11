import {admitSaved,readAdmission} from '../../E212-rook-side-defense/code/admission.mjs';
import {Chess} from '../../../../lib/chess.js';
export const on={enabled:true};
export async function cases(){
 const rows=[];for(const s of await admitSaved()){
  if(s.id==='short-pilot')continue;const a=readAdmission(s.token),c=new Chess(a.input.fen),moves=c.moves({verbose:true});
  if(['long-pilot','long-reflection'].includes(s.id)){
   const actual=s.id==='long-pilot'?'a8a5':'a1a4';rows.push({id:s.id+'-drawing-check',input:{...a.input,move:actual},token:s.token,expected:true});
   for(const m of moves.filter(m=>m.piece==='r'&&!/[+#]/.test(m.san))){const move=m.from+m.to+(m.promotion??'');rows.push({id:s.id+'-quiet-'+move,input:{...a.input,move},token:s.token,expected:false});}
  }else rows.push({id:s.id+'-losing-control',input:{...a.input,move:a.view.rows[0].move},token:s.token,expected:false});
 }return rows;
}
