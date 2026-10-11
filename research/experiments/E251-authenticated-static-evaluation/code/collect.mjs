import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
import {Engine,engineConfig} from '../../../../tools/calibration/engine.mjs';
import {openResearchData,sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {fixtures} from './fixtures.mjs';
import {validate,unavailable} from './contract.mjs';
export const dir='research/experiments/E251-authenticated-static-evaluation',engineFile='engine/stockfish-19-lite-single.js';
export const seeds=[dir+'/plan.md',...['fixtures','contract','collect','admission','static','check-result','static.test','run-focused','record-build'].map(n=>dir+'/code/'+n+'.mjs'),'tools/calibration/engine-host.cjs',engineFile,engineFile.replace('.js','.wasm')];
class TraceEngine extends Engine{
 constructor(file){super(file);this.commands=[];this.frames=[];this.stdout='';this.child.stdout.on('data',b=>{this.stdout+=b.toString();if(Buffer.byteLength(this.stdout)>1048576){this.failure=Error('Trace byte cap');this.close();}});}
 send(s){this.commands.push(s);return super.send(s);}
 async until(p,timeout=5000){const lines=await super.until(p,Math.min(timeout,5000));this.frames.push({commands:this.commands.splice(0),lines});return lines;}
}
const guard=await openResearchData(['D001'],{purpose:'test'}),inputHashes=await bindings(seeds),revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),out=dir+'/evidence';await mkdir(out,{recursive:true});await writeFile(out+'/started.json',JSON.stringify({revision,inputHashes,receipt:guard.receipt},null,2)+'\n',{flag:'wx'});
const start=performance.now(),config=await engineConfig(engineFile,{kind:'static-eval',value:4});let e,exitPromise;const archive={schema:'E251-static-process-v1',revision,inputHashes,receipt:guard.receipt,config,rows:[],startup:null,frames:[],stdout:'',stderr:'',exit:null,error:null};
try{e=new TraceEngine(engineFile);exitPromise=new Promise(resolve=>e.child.once('exit',(code,signal)=>resolve({code,signal})));archive.startup=await e.init(config);for(const f of fixtures){const {c}=validate(f.input),skip=unavailable(c),r={...f,status:skip??'observed',frame:null,seconds:0};archive.rows.push(r);if(skip)continue;const t=performance.now();e.send('ucinewgame');e.send('setoption name Clear Hash');e.send('isready');await e.until(l=>l==='readyok');e.send('position startpos'+(f.input.history.moves.length?' moves '+f.input.history.moves.join(' '):''));e.send('eval');e.send('isready');r.frame=e.frames.length;await e.until(l=>l==='readyok');r.seconds=(performance.now()-t)/1000;assert.ok(r.seconds<=5,'Five-second representative cap');assert.ok(performance.now()-start<=15000,'Fifteen-second collection cap');}}
catch(error){archive.error=error.message;}finally{if(e){e.close();archive.exit=await exitPromise;archive.frames=e.frames;archive.stdout=e.stdout;archive.stderr=e.stderr??'';}archive.seconds=(performance.now()-start)/1000;}
const bytes=gzipSync(Buffer.from(JSON.stringify(archive)+'\n'),{level:9});await writeFile(out+'/collection.json.gz',bytes,{flag:'wx'});await writeFile(dir+'/code/archive-lock.json',JSON.stringify({file:out+'/collection.json.gz',sha256:sha256(bytes)},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({revision,error:archive.error,rows:archive.rows.length,evals:archive.rows.filter(r=>r.status==='observed').length,seconds:archive.seconds,bytes:bytes.length}));assert.equal(archive.error,null);assert.ok(archive.seconds<=15);
