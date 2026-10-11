import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {engineConfig} from '../../../../tools/calibration/engine.mjs';
import {openResearchData,sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {fixtures} from './fixtures.mjs';
import {validate,unavailable} from './contract.mjs';
const dir='research/experiments/E251-authenticated-static-evaluation',caps=new WeakMap();
export function snapshot(token){const row=caps.get(token);if(!row)throw Error('Authenticated static capability required');return structuredClone(row);}
export async function verifyArchive(a,receipt){
 assert.equal(a.schema,'E251-static-process-v1');assert.equal(a.error,null);assert.ok(a.seconds<=15);assert.deepEqual(a.receipt,receipt);assert.deepEqual(a.config,await engineConfig('engine/stockfish-19-lite-single.js',{kind:'static-eval',value:4}));assert.deepEqual(a.inputHashes,await bindings(Object.keys(a.inputHashes)));assert.match(a.revision,/^[a-f0-9]{40}$/);assert.ok(a.exit&&a.exit.code!==undefined&&a.exit.signal!==undefined);assert.equal(a.rows.length,6);
 assert.match(a.startup.identity,/^Stockfish 19\b/);assert.deepEqual(a.startup.uci,a.frames[0].lines);assert.deepEqual(a.frames[0].commands,['uci']);assert.equal(a.frames[0].lines.at(-1),'uciok');
 const options=Object.entries(a.config.options).filter(([name])=>name!=='Threads'||a.startup.uci.some(l=>l.startsWith('option name Threads '))).map(([k,v])=>'setoption name '+k+' value '+v);assert.deepEqual(a.frames[1].commands,[...options,'isready']);assert.equal(a.frames[1].lines.at(-1),'readyok');
 let index=2;for(const [i,f]of fixtures.entries()){const r=a.rows[i],{c}=validate(f.input),skip=unavailable(c);assert.deepEqual(r.input,f.input);assert.equal(r.id,f.id);assert.equal(r.status,skip??'observed');if(skip){assert.equal(r.frame,null);assert.equal(r.seconds,0);continue;}assert.ok(r.seconds<=5);assert.deepEqual(a.frames[index].commands,['ucinewgame','setoption name Clear Hash','isready']);assert.equal(a.frames[index++].lines.at(-1),'readyok');assert.equal(r.frame,index);assert.deepEqual(a.frames[index].commands,['position startpos'+(f.input.history.moves.length?' moves '+f.input.history.moves.join(' '):''),'eval','isready']);assert.equal(a.frames[index++].lines.at(-1),'readyok');}
 assert.equal(a.frames.length,index);assert.deepEqual(a.stdout.replaceAll('\r\n','\n').split('\n').slice(0,-1),a.frames.flatMap(f=>f.lines));assert.ok(Buffer.byteLength(a.stdout)<=1048576);assert.equal(typeof a.stderr,'string');return true;
}
export async function admitSaved(){const guard=await openResearchData(['D001'],{purpose:'test'}),lock=JSON.parse(await readFile(dir+'/code/archive-lock.json','utf8')),bytes=await readFile(lock.file);assert.equal(lock.file,dir+'/evidence/collection.json.gz');assert.equal(sha256(bytes),lock.sha256);const a=JSON.parse(gunzipSync(bytes));await verifyArchive(a,guard.receipt);return a.rows.map(r=>{const token={};caps.set(token,{...r,lines:r.frame===null?[]:a.frames[r.frame].lines,source:{revision:a.revision,archiveSha256:lock.sha256,loaderSha256:a.config.loaderSha256,wasmSha256:a.config.wasmSha256,network:a.config.network}});return{id:r.id,input:structuredClone(r.input),token};});}
