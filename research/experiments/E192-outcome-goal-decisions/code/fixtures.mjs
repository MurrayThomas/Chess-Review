import {fixtures as old} from '../../E189-bounded-decision-support/code/fixtures.mjs';
import {fixtures as previous} from '../../E145-critical-mating-decisions/code/fixtures.mjs';
import {Chess} from '../../../../lib/chess.js';
export const fixtures=[];
for(let color=0;color<2;color++){
 const actor=color?'b':'w',enemy=color?'w':'b',win=old[color*6],goal={frame:'before-actual',fen:new Chess(win.input.fen).fen(),actor,outcome:'win',source:'declared-coaching-input'},base={enabled:true,view:{frame:'after-actual',perspective:actor},goal};
 const make=(id,input,options,expected)=>fixtures.push({id:id+'-'+color,input,options,expected});
 make('safe-declared-win',win.input,base,['C0823','C0828','C0984']);make('losing-actual',old[color*6+1].input,base,['C0979','C0984']);make('unresolved-check',old[color*6+2].input,base,['C0984']);make('opposite-view',win.input,{...base,view:{frame:'after-actual',perspective:enemy}},['C0823','C0828','C0979','C0984']);make('H0-no-loss-alternative',win.input,{...base,plies:0},[]);
 const neutral=old[color*6+4].input;make('no-enemy-mate',neutral,{...base,goal:{...goal,fen:new Chess(neutral.fen).fen()}},[]);
 const earlier=old[color*6+5].input;make('earlier-losing-root',earlier,{...base,goal:{...goal,fen:new Chess(earlier.fen).fen()}},['C0979']);make('missing-goal',win.input,{enabled:true,view:base.view},['C0823','C0984']);make('missing-view',win.input,{enabled:true,goal},['C0823','C0828','C0984']);
 const prefix=previous[2+color],input={fen:prefix.fen,move:prefix.move,history:prefix.history};make('genuine-two-move-prefix',input,{...base,goal:{...goal,fen:new Chess(input.fen).fen()}},['C0823','C0828','C0984']);
}
