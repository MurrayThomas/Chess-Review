import assert from 'node:assert/strict';
import {access,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {openResearchData} from '../../../data-policy.mjs';
import {boardFen,reflect,flip} from '../../FRIEND-shared/lib.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {collectPanel} from '../../E174-comparative-piece-improvement/code/panel.mjs';
import {inspectMinorOutpost} from './outpost.mjs';
import {checkMinorOutpost} from './check-result.mjs';
const dir='research/experiments/E219-minor-ending-outpost',guard=await openResearchData(['D001'],{purpose:'test'}),revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),pieces={b1:'K',b2:'N',b3:'P',a4:'P',g6:'P',f8:'k',h8:'b',a5:'p',g7:'p'};
await mkdir(dir+'/evidence',{recursive:true});try{await access(dir+'/evidence/collection-started.json');throw Error('Refusing to restart pilot');}catch(e){if(e.code!=='ENOENT')throw e;}
const inputHashes=await bindings([dir+'/plan.md',dir+'/code/pilot.mjs']);await writeFile(dir+'/evidence/collection-started.json',JSON.stringify({revision,inputHashes,receipt:guard.receipt},null,2)+'\n',{flag:'wx'});
const make=(id,extra={})=>{const fen=boardFen({...pieces,...extra});return{id,fen,move:'b2c4',history:{fen,moves:[]},target:'a5',alternative:'b2d1'};},first=make('minor-outpost'),reflected=reflect(first);reflected.target=flip(first.target);reflected.alternative='b7d8';
const cases=[first,reflected,make('no-support',{b3:undefined}),make('future-pawn-challenge',{d6:'p'}),make('active-bishop-refutation',{g7:undefined})],decisions=[];let failure=null;
try{for(const [index,f]of cases.entries()){
 const {id,...input}=f,mapped={fen:input.fen,move:input.move,history:input.history,improvementTarget:input.target,improvementAlternative:input.alternative},options={enabled:true,maxNodes:5000},start=performance.now();let panel=null,result=null,error=null;
 try{panel=collectPanel(mapped,4992);}catch(e){error=e.message;}
 // Persist the actual collected panel before classifier/checker/gate assertions.
 await writeFile(dir+'/evidence/'+id+'-raw.json',JSON.stringify({revision,inputHashes,receipt:guard.receipt,id,input,options,panel,error},null,2)+'\n',{flag:'wx'});
 if(!error)try{result=inspectMinorOutpost(input,options,panel);checkMinorOutpost(input,options,panel,result);}catch(e){error=e.message;}
 const seconds=(performance.now()-start)/1000,decision={id,seconds,error,status:result?.status,nodes:result?.nodes,improved:result?.witness?.improved,outpost:result?.witness?.outpost};decisions.push(decision);await writeFile(dir+'/evidence/'+id+'-result.json',JSON.stringify({result,...decision},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(decision));assert.equal(error,null);assert.ok(seconds<=3,'Registered cost limit');assert.ok(result.nodes<=5000);if(index<2)assert.equal(result.available,true,'Registered minor-ending positive failed');
 }}catch(e){failure=e.message;}
await writeFile(dir+'/evidence/decisions.json',JSON.stringify({revision,inputHashes,decisions,failure,passes:!failure},null,2)+'\n',{flag:'wx'});if(failure)console.log(JSON.stringify({stopped:true,failure}));
