import {legalPosition,uci} from '../../E020-coach-concepts/code/concepts.mjs';
import {outcome,key} from '../../E210-sustainable-threat-policy/code/rules.mjs';
import {inspectNotationSupport} from '../../E222-notation-variation-support/code/support.mjs';
import {inspectEngineDiagnosticSupport} from '../../E223-engine-diagnostic-support/code/support.mjs';
import {validate,validateEvent,validateAnswer,occurrenceIds} from './contract.mjs';
export {occurrenceIds};
const sessions=new WeakMap(),clone=x=>structuredClone(x);
const labels=['Visualization','Board vision','Tactical vision','Pattern recognition','Calculation','Evaluation','Comparison','Planning','Pattern recognition','Intuition','Positional judgment','Tactical awareness','Psychological pressure','Post-game analysis','Self-analysis','Engine analysis','Game annotation','Error classification','Pattern training','Tactical training','Calculation training','Endgame training','Opening study','Model games','Guess-the-move training','Overconfidence','Tunnel vision','Hope chess','Stopping calculation too early','Failing to calculate the opponent\'s best defense'];
function replay(fen,moves){const c=legalPosition(fen),counts=new Map([[key(c),1]]);for(const code of moves){if(outcome(c,counts,null))throw Error('Automatic terminal continuation');const m=c.moves({verbose:true}).find(m=>uci(m)===code);if(!m)throw Error('Illegal study line');c.move({from:m.from,to:m.to,promotion:m.promotion});counts.set(key(c),(counts.get(key(c))??0)+1);}return c;}
function expected(task,c){const q=task.question;if(q.type==='side-to-move')return c.turn();if(q.type==='legal-move'){const h=c.history({verbose:true}),positions=[h[0]?.before??c.fen(),...h.map(m=>m.after)],n=positions.filter(f=>f.split(' ').slice(0,4).join(' ')===key(c)).length;if(outcome(c,new Map([[key(c),n]]),null))return false;return c.moves({verbose:true}).some(m=>uci(m)===q.move);}const p=c.get(q.square);return p?p.color+p.type.toUpperCase():null;}
function feedback(task,answer){
 if(task.kind==='reflection')return{meaning:'ungraded-self-report',expected:null,agreement:null,legal:null,keySource:null,qualityClaim:false,learningClaim:false};
 if(task.kind==='board-state'){const value=expected(task,replay(task.fen,task.prefix));return{meaning:'local-board-fact',expected:value,agreement:answer===value,legal:null,keySource:null,qualityClaim:false,learningClaim:false};}
 const moves=task.kind==='choose-move'?[answer]:answer;let legal=true;try{replay(task.fen,[...task.prefix,...moves]);}catch{legal=false;}
 const target=task.kind==='choose-move'?task.expectedMoves:task.expectedLines,agreement=legal&&(task.kind==='choose-move'?target.includes(answer):target.some(a=>JSON.stringify(a)===JSON.stringify(answer)));
 return{meaning:legal?'reported-target-agreement':'illegal-answer',expected:clone(target),agreement,legal,keySource:clone(task.key),qualityClaim:false,learningClaim:false};
}
function project(s){
 const tasks=s.input.tasks.map(t=>{const a=s.answers.get(t.id),revealed=s.revealed.has(t.id);return{id:t.id,kind:t.kind,prompt:t.prompt,fen:t.fen,prefix:clone(t.prefix),learningGoals:clone(t.learningGoals),question:t.question?clone(t.question):null,state:revealed?'revealed':a?'committed':'awaiting-answer',answer:a?clone(a.answer):null,feedback:revealed?clone(a.feedback):null,context:revealed?clone(s.contexts.get(t.id)):null};});
 const goals=new Set(s.input.tasks.flatMap(t=>t.learningGoals)),reported=new Set(s.selfReports.map(r=>r.goalId)),allRevealed=tasks.every(t=>t.state==='revealed');return{schema:'E225-study-session',coverageCredit:false,qualityClaim:false,learningClaim:false,source:s.input.source,eventId:s.input.eventId,limits:clone(s.limits),state:allRevealed?'all-revealed':'open',eventsUsed:s.events.length,pliesUsed:allRevealed?s.plies:null,submittedPlies:s.submittedPlies,tasks,selfReports:clone(s.selfReports),references:occurrenceIds.map((id,i)=>({id,label:labels[i],scope:'learning-objective-only',qualityClaim:false,learningClaim:false})),routes:occurrenceIds.map(id=>({id,status:goals.has(id)?'exercise-goal':reported.has(id)?'reported-self-report':'reference-only',evidencePath:goals.has(id)?'tasks':reported.has(id)?'selfReports':'references',qualityClaim:false,learningClaim:false}))};
}
export function createStudySession(input,options={}){
 const limits=validate(input,options);if(!options.enabled)return{status:'disabled',token:null,view:null};if(input.tasks.length>limits.maxTasks)return{status:'budget-unavailable',token:null,view:null};
 const own=clone(input),contexts=new Map();let plies=own.tasks.reduce((n,t)=>n+t.prefix.length+(t.expectedMoves?.length??0)+(t.expectedLines?.reduce((n,a)=>n+a.length,0)??0),0);if(plies>limits.maxPlies)return{status:'budget-unavailable',token:null,view:null};
 for(const t of own.tasks){const c=replay(t.fen,t.prefix);if(t.expectedMoves)for(const m of t.expectedMoves)replay(t.fen,[...t.prefix,m]);if(t.expectedLines)for(const a of t.expectedLines)replay(t.fen,[...t.prefix,...a]);if(t.question)expected(t,c);let notation=null,engine=null;
  if(t.notation!==undefined){notation=inspectNotationSupport(t.notation,{enabled:true,maxMoves:Math.min(256,limits.maxPlies-plies)});if(notation.status!=='support-observations')return{status:'budget-unavailable',token:null,view:null};plies+=notation.document.usedMoves;}
  if(t.engine!==undefined){engine=inspectEngineDiagnosticSupport(t.engine,{enabled:true,maxPvPlies:limits.maxPlies-plies});if(engine.status!=='support-observations')return{status:'budget-unavailable',token:null,view:null};plies+=engine.view.pvPlies;}
  contexts.set(t.id,{notation,engine});
 }
 const s={input:own,limits,contexts,plies,submittedPlies:0,answers:new Map(),revealed:new Set(),selfReports:[],events:[]},token=Object.freeze({});sessions.set(token,s);return{status:'ready',token,view:project(s)};
}
const session=token=>{const s=sessions.get(token);if(!s)throw Error('Unknown private study capability');return s;};
export const readStudySession=token=>project(session(token));
export function applyStudyEvent(token,event){
 const s=session(token);validateEvent(event);if(s.events.some(e=>e.id===event.id))throw Error('Duplicate study event');const task=event.taskId===undefined?null:s.input.tasks.find(t=>t.id===event.taskId);if(event.type!=='self-report'&&!task)throw Error('Unknown task');
 if(event.type==='submit'){if(s.answers.has(task.id))throw Error('Answer already committed');validateAnswer(task,event.answer);}if(event.type==='reveal'&&(!s.answers.has(task.id)||s.revealed.has(task.id)))throw Error('Reveal requires one committed unrevealed answer');
 const cost=event.type==='submit'?(task.kind==='choose-move'?1:task.kind==='line'?event.answer.length:0):0;if(s.events.length>=s.limits.maxEvents||s.plies+cost>s.limits.maxPlies)return{status:'budget-unavailable',view:null};
 const own=clone(event);if(event.type==='submit')s.answers.set(task.id,{answer:own.answer,feedback:feedback(task,own.answer)});else if(event.type==='reveal')s.revealed.add(task.id);else s.selfReports.push({goalId:own.goalId,source:own.source,eventId:own.eventId,value:own.value,meaning:'reported-not-observed',qualityClaim:false,learningClaim:false});s.plies+=cost;s.submittedPlies+=cost;s.events.push(own);return{status:'applied',view:project(s)};
}
