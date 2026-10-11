import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {savedPanels} from '../../E153-second-target-defense/code/saved-panels.mjs';
import {sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
export async function saved(){const a=await savedPanels(),dir='research/experiments/E153-second-target-defense/evidence',file=dir+'/observations.json.gz',runFile=dir+'/run.json',bytes=await readFile(file),runBytes=await readFile(runFile),run=JSON.parse(runBytes);assert.equal(sha256(bytes),run.outputHashes['observations.json.gz']);assert.deepEqual(a.sourceHashes,await bindings(Object.keys(a.sourceHashes)));return{receipt:a.eligibilityReceipt,hashes:{[file]:sha256(bytes),[runFile]:sha256(runBytes)},find(input){const key={fen:input.fen,history:input.history,moves:[input.move,input.alternative].sort(),targets:input.targets},index=a.rows.findIndex(r=>JSON.stringify(r.key)===JSON.stringify(key));assert.ok(index>=0,'No exact source target panel');return{panel:a.rows[index].panel,ref:{file,index}};}};}
