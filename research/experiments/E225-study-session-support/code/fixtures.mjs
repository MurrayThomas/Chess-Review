import {Chess} from '../../../../lib/chess.js';
export const start=new Chess().fen(),key={source:'authored-target',eventId:'synthetic-answer-key'};
export const task=(kind,id,changes={})=>({id,kind,prompt:'Authored synthetic exercise '+id,fen:start,prefix:[],learningGoals:['C0842'],...changes});
export const input=tasks=>({source:'authored-E225',eventId:'synthetic-development',tasks});
export const submit=(taskId,answer,id='submit-'+taskId)=>({id,type:'submit',taskId,answer});
export const reveal=(taskId,id='reveal-'+taskId)=>({id,type:'reveal',taskId});
export const reports={notation:{pgn:'{Authored review material} 1. d4 d5 (1... Nf6) *',source:'authored-notation',eventId:'review'},engine:{fen:start,source:'authored-diagnostics',eventId:'review',engine:{name:'Synthetic diagnostic source',version:'fixture'},multiPV:1,scorePerspective:'root-side-to-move',frames:[{id:'report',lines:['info depth 4 multipv 1 score cp 19 pv d2d4 d7d5']}]}};
export const full=input([
 task('board-state','board',{prefix:['d2d4','d7d5'],question:{type:'piece-at',square:'d4'},learningGoals:['C0119','C0120']}),
 task('choose-move','choose',{prefix:['d2d4','d7d5'],expectedMoves:['g1f3','c2c4'],key,learningGoals:['C0121','C0122','C0793','C0796','C0840','C0841','C0844','C0846']}),
 task('line','line',{expectedLines:[['d2d4','d7d5','g1f3'],['g1f3','g8f6']],key,learningGoals:['C0789','C0842','C0843','C0845']}),
 task('reflection','reflection',{...reports,learningGoals:['C0790','C0791','C0792','C0794','C0795','C0835','C0836','C0837','C0838','C0839']})
]);
const black=new Chess();black.move('d4');
const pair=(t,answer)=>({input:input([t]),events:[submit(t.id,answer),reveal(t.id)]});
export const cases=[
 {id:'full',input:full,events:[submit('board','wP'),reveal('board'),submit('choose','c2c4'),reveal('choose'),submit('line',['g1f3','g8f6']),reveal('line'),submit('reflection','My recorded comparison, not a mental-state inference.'),reveal('reflection'),{id:'self',type:'self-report',goalId:'C0870',source:'authored-response',eventId:'self',value:false}]},
 {id:'wrong-board',...pair(task('board-state','wrong',{question:{type:'piece-at',square:'d4'}}),'wP')},
 {id:'empty-square',...pair(task('board-state','empty-square',{question:{type:'piece-at',square:'d4'}}),null)},
 {id:'black-turn',...pair(task('board-state','black',{fen:black.fen(),question:{type:'side-to-move'}}),'b')},
 {id:'legal-move',...pair(task('board-state','legal',{question:{type:'legal-move',move:'d2d4'}}),true)},
 {id:'automatic-terminal',...pair(task('board-state','terminal',{fen:'4k3/8/8/8/8/8/8/4K3 w - - 0 1',question:{type:'legal-move',move:'e1f2'}}),false)},
 {id:'wrong-legal-move',...pair(task('choose-move','different',{expectedMoves:['d2d4'],key}),'c2c4')},
 {id:'illegal-move',...pair(task('choose-move','illegal',{expectedMoves:['d2d4'],key}),'d2d5')},
 {id:'illegal-line',...pair(task('line','illegal-line',{expectedLines:[['d2d4','d7d5']],key}),['d2d4','d7d5','d4d6'])},
 {id:'promotion',...pair(task('line','promotion',{fen:'7k/P7/8/8/8/8/8/4K3 w - - 0 1',expectedLines:[['a7a8n']],key}),['a7a8n'])},
 {id:'ep',...pair(task('choose-move','ep',{fen:'4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 2',expectedMoves:['e5d6'],key}),'e5d6')},
 {id:'ungraded',...pair(task('reflection','ungraded',{learningGoals:['C0832','C0873','C0874','C0875','C0876']}),'')},
 {id:'empty',input:input([]),events:[]}
].map(c=>({...c,options:{enabled:true}}));
