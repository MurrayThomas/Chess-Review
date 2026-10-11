import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
export const occurrenceIds=[...Array.from({length:4},(_,i)=>'C'+String(119+i).padStart(4,'0')),...Array.from({length:8},(_,i)=>'C'+(789+i)).map(x=>x.replace('C7','C07')),'C0832',...Array.from({length:12},(_,i)=>'C'+(835+i)).map(x=>x.replace('C8','C08')),'C0870','C0873','C0874','C0875','C0876'];
export const fields=(x,keys,required=keys)=>{if(!x||typeof x!=='object'||Array.isArray(x)||Object.keys(x).some(k=>!keys.includes(k))||required.some(k=>!Object.hasOwn(x,k)))throw Error('Invalid study fields');};
export const text=(s,max=200,empty=false)=>{if(typeof s!=='string'||!empty&&!s.length||s.length>max)throw Error('Invalid study text');};
export const move=s=>{if(typeof s!=='string'||!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(s))throw Error('Invalid study UCI');};
const moves=(a,max=64,min=0)=>{if(!Array.isArray(a)||a.length<min||a.length>max)throw Error('Invalid study moves');for(const m of a)move(m);};
const report=x=>{text(x.source);text(x.eventId);};
export function validate(input,options){
 plain([input,options]);fields(input,['source','eventId','tasks']);report(input);fields(options,['enabled','maxTasks','maxEvents','maxPlies'],[]);if(options.enabled!==undefined&&typeof options.enabled!=='boolean')throw Error('Invalid enabled');
 const limits={maxTasks:options.maxTasks===undefined?32:options.maxTasks,maxEvents:options.maxEvents===undefined?128:options.maxEvents,maxPlies:options.maxPlies===undefined?512:options.maxPlies};for(const [k,max]of [['maxTasks',32],['maxEvents',128],['maxPlies',4096]])if(!Number.isSafeInteger(limits[k])||limits[k]<0||limits[k]>max)throw Error('Invalid study limit');
 if(!Array.isArray(input.tasks)||input.tasks.length>32)throw Error('Invalid tasks');const ids=new Set();for(const t of input.tasks){fields(t,['id','kind','prompt','fen','prefix','learningGoals','question','expectedMoves','expectedLines','key','notation','engine'],['id','kind','prompt','fen','prefix','learningGoals']);text(t.id);text(t.prompt,2000);text(t.fen);moves(t.prefix);if(ids.has(t.id))throw Error('Duplicate task');ids.add(t.id);if(!['board-state','choose-move','line','reflection'].includes(t.kind)||!Array.isArray(t.learningGoals)||!t.learningGoals.length||t.learningGoals.length>30||new Set(t.learningGoals).size!==t.learningGoals.length||t.learningGoals.some(id=>!occurrenceIds.includes(id)))throw Error('Invalid learning goals/kind');
  if(t.kind==='board-state'){fields(t.question,['type','square','move'],['type']);if(t.question.type==='piece-at'){if(typeof t.question.square!=='string'||!/^[a-h][1-8]$/.test(t.question.square)||t.question.move!==undefined)throw Error('Invalid piece question');}else if(t.question.type==='legal-move'){move(t.question.move);if(t.question.square!==undefined)throw Error('Unexpected square');}else if(t.question.type!=='side-to-move'||t.question.square!==undefined||t.question.move!==undefined)throw Error('Invalid board question');}else if(t.question!==undefined)throw Error('Unexpected question');
  if(t.kind==='choose-move')moves(t.expectedMoves,16,1);else if(t.expectedMoves!==undefined)throw Error('Unexpected move key');
  if(t.kind==='line'){if(!Array.isArray(t.expectedLines)||!t.expectedLines.length||t.expectedLines.length>16)throw Error('Invalid line keys');for(const a of t.expectedLines)moves(a,64,1);}else if(t.expectedLines!==undefined)throw Error('Unexpected line key');
  if(['choose-move','line'].includes(t.kind)){fields(t.key,['source','eventId']);report(t.key);}else if(t.key!==undefined)throw Error('Unexpected key source');
 }
 return limits;
}
export function validateEvent(event){plain(event);if(event?.type==='submit'){fields(event,['id','type','taskId','answer']);text(event.taskId);}else if(event?.type==='reveal'){fields(event,['id','type','taskId']);text(event.taskId);}else if(event?.type==='self-report'){fields(event,['id','type','goalId','source','eventId','value']);report(event);if(!occurrenceIds.includes(event.goalId)||typeof event.value!=='boolean'&&typeof event.value!=='string')throw Error('Invalid self report');if(typeof event.value==='string')text(event.value,4000,true);}else throw Error('Invalid event type');text(event.id);}
export function validateAnswer(task,answer){
 if(task.kind==='reflection')text(answer,4000,true);
 else if(task.kind==='choose-move')move(answer);
 else if(task.kind==='line')moves(answer,64,1);
 else if(task.question.type==='legal-move'){if(typeof answer!=='boolean')throw Error('Expected boolean answer');}
 else if(task.question.type==='side-to-move'){if(!['w','b'].includes(answer))throw Error('Expected side answer');}
 else if(answer!==null&&(typeof answer!=='string'||!/^[wb][PNBRQK]$/.test(answer)))throw Error('Expected piece code or null');
}
