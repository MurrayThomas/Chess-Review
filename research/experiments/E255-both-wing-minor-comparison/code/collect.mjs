import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
import {openResearchData,sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {fixtures} from './fixtures.mjs';
import {query} from './query.mjs';
import {checkProof} from './check-proof.mjs';
const dir='research/experiments/E255-both-wing-minor-comparison',out=dir+'/evidence',guard=await openResearchData(['D001'],{purpose:'test'}),revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),inputHashes=await bindings([dir+'/plan.md',...['fixtures','query','check-proof','collect'].map(n=>dir+'/code/'+n+'.mjs')]);await mkdir(out,{recursive:true});await writeFile(out+'/started.json',JSON.stringify({revision,inputHashes,receipt:guard.receipt,environment:{node:process.version,execPath:process.execPath,platform:process.platform,arch:process.arch}},null,2)+'\n',{flag:'wx'});
const start=performance.now(),report={schema:'E255-joint-collection-v1',revision,inputHashes,receipt:guard.receipt,rows:[],error:null,ticks:0,seconds:0};try{for(const f of fixtures){const q=query(f.input),audit=checkProof(q);report.rows.push({...f,query:q,audit});report.ticks+=q.ticks;assert.ok(report.ticks<=32768);assert.ok(performance.now()-start<=20000,'Total collection cap');if(report.rows.length===1)assert.equal(q.win,true,'First positive smoke must pass');await writeFile(out+'/partial.json.gz',gzipSync(Buffer.from(JSON.stringify(report)+'\n'),{level:9}));}}catch(e){report.error=e.message;}report.seconds=(performance.now()-start)/1000;const bytes=gzipSync(Buffer.from(JSON.stringify(report)+'\n'),{level:9});await writeFile(out+'/collection.json.gz',bytes,{flag:'wx'});await writeFile(dir+'/code/archive-lock.json',JSON.stringify({file:out+'/collection.json.gz',sha256:sha256(bytes)},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({rows:report.rows.length,positives:report.rows.filter(r=>r.query.win).length,ticks:report.ticks,seconds:report.seconds,bytes:bytes.length,error:report.error,roles:report.rows.map(r=>({id:r.id,win:r.query.win,ticks:r.query.ticks,seconds:r.query.seconds}))}));assert.equal(report.error,null);assert.ok(bytes.length<=524288);assert.equal(report.rows.length,8);

