import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {openResearchRookTablebaseSources} from '../../../tablebase-rook-data-policy.mjs';
import {openResearchTablebases} from '../../../tablebase-data-policy.mjs';
import {sha256} from '../../../data-policy.mjs';
import {dataDir} from './exports.mjs';
const a=await openResearchRookTablebaseSources(),old=await openResearchTablebases({purpose:'reuse'}),oldManifest=JSON.parse(await readFile('research/datasets/T001-syzygy-kqk/manifest.json','utf8'));await mkdir(dataDir+'/files',{recursive:true});let prior;try{prior=JSON.parse(await readFile(dataDir+'/manifest.json','utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}const files=[],start=performance.now();
for(const e of a.exports){let data,record;
 try{data=await readFile(dataDir+'/files/'+e.name);assert.equal(data.length,e.bytes);assert.equal(sha256(data),e.sha256);record=prior?.files.find(f=>f.name===e.name);assert.ok(record,'Existing bytes require retained origin');assert.equal(record.sourceRegistrySha256,a.receipt.registrySha256);}catch(error){if(error.code!=='ENOENT')throw error;
  if(e.name==='KQvK.rtbw'){const f=oldManifest.files.find(f=>f.name===e.name);assert.equal(f.sha256,e.sha256);data=await readFile(f.path);record={retrievedAt:f.retrievedAt,finalUrl:f.finalUrl,reusedFrom:f.path,reusedManifestSha256:old.receipt.manifestSha256};}
  else{const response=await fetch(e.url,{redirect:'error',signal:AbortSignal.timeout(15000)});assert.equal(response.status,200);assert.equal(response.url,e.url);assert.equal(Number(response.headers.get('content-length')),e.bytes);const chunks=[];let length=0;for await(const part of response.body){length+=part.length;assert.ok(length<=e.bytes);chunks.push(part);}data=Buffer.concat(chunks);record={retrievedAt:new Date().toISOString(),finalUrl:response.url};}
  assert.equal(data.length,e.bytes);assert.equal(sha256(data),e.sha256);assert.equal(data.subarray(0,4).toString('hex'),'71e8235d');assert.equal(data.length%64,16);await writeFile(dataDir+'/files/'+e.name,data);
 }
 files.push({...record,name:e.name,path:dataDir+'/files/'+e.name,url:e.url,bytes:e.bytes,sha256:e.sha256,sourceRegistrySha256:a.receipt.registrySha256});await writeFile(dataDir+'/manifest.json',JSON.stringify({schema:'syzygy-rook-wdl-manifest-v1',dataset:'T002',originFormat:'syzygy-krpvkr-wdl-v1',status:files.length===a.exports.length?'complete':'acquiring',material:'KRPvKR',capturePromotionClosure:'complete20-WDL-plus-KK-mechanical',sourceReceipt:a.receipt,files},null,2)+'\n');
 console.log(JSON.stringify({file:e.name,bytes:e.bytes,complete:files.length,total:a.exports.length}));
}
console.log(JSON.stringify({dataset:'T002',files:files.length,bytes:files.reduce((n,f)=>n+f.bytes,0),seconds:(performance.now()-start)/1000}));
