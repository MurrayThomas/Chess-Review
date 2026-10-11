import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
import {openResearchData} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {legalPosition} from '../../E020-coach-concepts/code/concepts.mjs';
import {evaluateMinorContext} from '../../E186-minor-context-comparisons/code/minors.mjs';
import {checkMinorContext} from '../../E186-minor-context-comparisons/code/check-result.mjs';
import {tracedConversionQuery} from '../../E184-king-route-conversion/code/trace-policy.mjs';
import {verifyPolicy} from '../../E186-minor-context-comparisons/code/verify-policy.mjs';
import {cases} from './fixtures.mjs';
const dir='research/experiments/E246-central-pawn-obstruction',guard=await openResearchData(['D001'],{purpose:'test'});await mkdir(dir+'/evidence',{recursive:true});const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),inputHashes=await bindings([dir+'/plan.md',dir+'/code/collect-pilot.mjs','research/concepts/catalog.json','research/AGENTS.md','research/concepts/BUILD-FIRST.md','research/concepts/ACTIVE-QUEUE.md','research/DATA_POLICY.md']),parent=JSON.parse(await readFile('research/experiments/E186-minor-context-comparisons/build.json','utf8'));for(const [f,h]of Object.entries(inputHashes))if(parent.inputHashes[f])assert.equal(h,parent.inputHashes[f]);
const receipt=guard.receipt;await writeFile(dir+'/evidence/started.json',JSON.stringify({revision,inputHashes,receipt},null,2)+'\n',{flag:'wx'});const rows=[];let error=null;const t=performance.now();
try{for(const x of cases()){const start=performance.now(),source=evaluateMinorContext(x.input,x.options);checkMinorContext(x.input,x.options,source);const seconds=(performance.now()-start)/1000,row={...x,source,sourceSeconds:seconds,extras:null};rows.push(row);if(rows.length===1)assert(seconds<=1,'First source smoke exceeds one second');assert(source.witness,'Complete source witness required');
 if(x.main){row.extras={};let nodes=source.nodes;for(const [factor,relocation]of Object.entries(x.factors)){row.extras[factor]={};for(const type of ['knight','bishop']){const frame=legalPosition(source.witness.frameFens[type==='knight'?'actual':'replaced']),p=frame.get(relocation.from);assert.equal(p.type,'p');assert.equal(frame.get(relocation.to),undefined);frame.remove(relocation.from);frame.put(p,relocation.to);const c=legalPosition(frame.fen()),begin=nodes,q=tracedConversionQuery(c,source.witness.actor,x.options.pawn,2,{tick(n=1){nodes+=n;if(nodes>50000)throw Error('Factor group exceeds cap');}},source.witness.before),audit=verifyPolicy(q,c);assert.equal(nodes-begin,audit.cost);row.extras[factor][type]={relocation,fen:c.fen(),query:q,audit};}}}
 console.log(JSON.stringify({id:x.id,sourceSeconds:seconds,nodes:source.nodes,values:Object.fromEntries(Object.entries(source.witness.queries).map(([k,q])=>[k,q.win])),extraValues:row.extras&&Object.fromEntries(Object.entries(row.extras).map(([k,v])=>[k,Object.fromEntries(Object.entries(v).map(([t,r])=>[t,r.query.win]))]))}));
}}catch(e){error=e.stack;}
const seconds=(performance.now()-t)/1000;await writeFile(dir+'/evidence/'+(error?'collection-failure':'panels')+'.json.gz',gzipSync(JSON.stringify({revision,inputHashes,receipt,rows,seconds,error})+'\n'),{flag:'wx'});console.log(JSON.stringify({rows:rows.length,seconds,error}));assert.equal(error,null);
