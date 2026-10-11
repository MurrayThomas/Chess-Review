import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
import {saved as inherited,key} from '../../E191-tactical-decision-timing/code/saved.mjs';
import {context} from '../../E168-forced-pawn-weakness/code/context.mjs';
import {collectPanel} from '../../E168-forced-pawn-weakness/code/panel.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {fresh,claimControl} from './fixtures.mjs';
const dir='research/experiments/E193-forced-second-weakness',file=dir+'/evidence/fresh.json.gz',a=await inherited();try{await readFile(file);throw Error('Raw exists: reuse instead of recollection');}catch(e){if(e.code!=='ENOENT')throw e;}
const rows=[],sourceHashes=await bindings([dir+'/code/collect.mjs']),revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim();await mkdir(dir+'/evidence',{recursive:true});
for(const f of [...fresh,claimControl]){const H=f.options.plies??2,k=key('structure',f.input,{ownPlies:H});assert.equal(a.rows.filter(r=>r.source==='structure'&&r.key===k).length,0,'Reuse exact archived panel');const i={fen:f.input.fen,move:f.input.move,history:f.input.history,weaknessQuiet:f.input.alternative,weaknessPawn:f.input.pawn},ctx=context(i,H);assert.equal(ctx.status,'ready');const panel=collectPanel(ctx,50000);rows.push({id:f.id,input:f.input,options:f.options,key:k,panel,reuseMatches:0});await writeFile(file,gzipSync(JSON.stringify({schema:'E193-fresh-v1',revision,node:process.version,argv:process.argv,datasetReceipt:a.receipt,sourceHashes,parentArchives:a.hashes,rows})+'\n'));console.log(JSON.stringify({id:f.id,nodes:panel.nodes}));}
