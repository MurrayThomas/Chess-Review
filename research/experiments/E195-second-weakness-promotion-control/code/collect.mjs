import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
import {sha256} from '../../../data-policy.mjs';
import {context} from '../../E168-forced-pawn-weakness/code/context.mjs';
import {collectPanel} from '../../E168-forced-pawn-weakness/code/panel.mjs';
import {key} from '../../E191-tactical-decision-timing/code/saved.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {parents} from './parent-saved.mjs';
import {inspectSecondWeakness,checkResult} from './second.mjs';
import {fresh} from './fixtures.mjs';
const dir='research/experiments/E195-second-weakness-promotion-control',file=dir+'/evidence/observations.json.gz',a=await parents(),cb=await readFile(dir+'/evidence/context-checks.json'),contexts=JSON.parse(cb);assert.equal(contexts.passed,true);assert.equal(contexts.rows.length,6);assert.deepEqual(contexts.datasetReceipt,a.receipt);assert.deepEqual(contexts.sourceHashes,await bindings([dir+'/code/context-smoke.mjs']));try{await readFile(file);throw Error('Raw exists: reuse instead of recollection');}catch(e){if(e.code!=='ENOENT')throw e;}
const sourceHashes=await bindings([dir+'/code/collect.mjs']),revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),rows=[];for(const f of fresh){const H=f.options.plies??2,k=key('structure',f.input,{ownPlies:H});let savedPanel;try{savedPanel=a.find(f.input,H);}catch(e){if(!e.message.includes('No exact saved timing source panel'))throw e;}const ctx=context({fen:f.input.fen,move:f.input.move,history:f.input.history,weaknessQuiet:f.input.alternative,weaknessPawn:f.input.pawn},H);assert.equal(ctx.status,'ready');const panel=savedPanel?.panel??collectPanel(ctx,50000);rows.push({id:f.id,input:f.input,options:f.options,key:k,panel,fresh:!savedPanel,reuseMatches:savedPanel?1:0,ref:savedPanel?.ref});await writeFile(file,gzipSync(JSON.stringify({schema:'E195-panels-v1',revision,node:process.version,argv:process.argv,datasetReceipt:a.receipt,sourceHashes,parentArchives:a.hashes,contextChecksSha256:sha256(cb),rows})+'\n'));const result=inspectSecondWeakness(f.input,f.options,panel);checkResult(f.input,f.options,panel,result);assert.deepEqual(Object.keys(result.claims).filter(k=>result.claims[k]),f.expected);console.log(JSON.stringify({id:f.id,sourceNodes:panel.nodes,claims:result.claims,firstRoot:result.witness?.first?.profitable,firstAfter:result.witness?.roles.map(r=>r.first?.profitable)}));}
