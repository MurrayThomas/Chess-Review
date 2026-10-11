import {readFile,realpath} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {openResearchData,sha256} from './data-policy.mjs';
import {exports,registryPath,dataDir} from './experiments/E211-rook-tablebase-admission/code/exports.mjs';
const repo=fileURLToPath(new URL('../',import.meta.url)),policyPath='research/TABLEBASE_ROOK_DATA_POLICY.md',permissionUrl='https://raw.githubusercontent.com/syzygy1/tb/0bb8aeee525f364bb750f96df312a1a7c9b54398/README.md',checksumUrl='https://tablebase.lichess.ovh/tables/standard/sha256',grant='Syzygy-generator-redistribution-permission',permissionText='All tablebase files generated using this generator may be freely redistributed.';
const fail=message=>{throw Error('Rook tablebase data prohibited: '+message);},hash=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x),purposes=['collect','inspect','test','analyze','reuse','examples'];
async function bytes(root,name){if(typeof name!=='string'||name.includes('\\')||name.includes(':')||name.startsWith('/')||name.split('/').some(p=>!p||p==='.'||p==='..'))fail('unsafe path');const base=await realpath(root),target=await realpath(path.join(base,name)),relative=path.relative(base,target);if(relative.startsWith('..')||path.isAbsolute(relative))fail('path escapes root');return readFile(target);}
export function validateRookTablebaseRegistry(r,purpose){
 if(!purposes.includes(purpose)||r?.schema!=='tablebase-rook-approved-sources-v1'||r.policyVersion!=='tablebase-rook-data-v1'||r.dataset!=='T002'||r.originFormat!=='syzygy-krpvkr-wdl-v1'||r.manifest!==dataDir+'/manifest.json')fail('registry/format/purpose');
 const s=r.source;if(s?.id!=='syzygy-generated-rook-wdl'||s.status!=='approved'||s.public!==true||s.freeToUse!==true||s.grant!==grant||!s.allowedPurposes?.includes(purpose)||!/^\d{4}-\d{2}-\d{2}$/.test(s.verifiedOn)||!hash(s.permissionEvidence?.sha256)||!hash(s.checksumEvidence?.sha256))fail('source permission');
 if(!Array.isArray(s.exports)||s.exports.length!==exports.length)fail('incomplete dependency exports');
 const seen=new Set();for(const e of s.exports){const expected=exports.find(f=>f.name===e.name);if(!expected||seen.has(e.name)||e.material!==expected.material||e.url!==expected.url||e.bytes!==expected.bytes||!hash(e.sha256))fail('unapproved exact export');seen.add(e.name);}
}
async function admission(root,purpose){
 const game=await openResearchData(['D001'],{purpose:'test'}),raw=await bytes(root,registryPath),r=JSON.parse(raw);validateRookTablebaseRegistry(r,purpose);const s=r.source,permissionBytes=await bytes(root,s.permissionEvidence.path),checksumBytes=await bytes(root,s.checksumEvidence.path);
 if(sha256(permissionBytes)!==s.permissionEvidence.sha256||sha256(checksumBytes)!==s.checksumEvidence.sha256)fail('changed permission/checksum metadata');const p=JSON.parse(permissionBytes),index=JSON.parse(checksumBytes);
 if(p.url!==permissionUrl||p.grant!==grant||p.text!==permissionText||!hash(p.snapshot?.sha256)||index.url!==checksumUrl||Object.keys(index.entries||{}).length!==exports.length)fail('unbound publisher origin');const snapshot=await bytes(root,p.snapshot.path);if(sha256(snapshot)!==p.snapshot.sha256||!snapshot.toString('utf8').includes(permissionText))fail('publisher permission differs');
 for(const e of s.exports)if(index.entries[e.name]!==e.sha256)fail('publisher checksum differs');
 return{r,receipt:{schema:'tablebase-rook-data-eligibility-v1',dataset:'T002',policyVersion:r.policyVersion,originFormat:r.originFormat,purpose,registrySha256:sha256(raw),policySha256:sha256(await bytes(root,policyPath)),validatorSha256:sha256(await readFile(fileURLToPath(import.meta.url))),permissionSha256:s.permissionEvidence.sha256,permissionSnapshotSha256:p.snapshot.sha256,publisherChecksumSha256:s.checksumEvidence.sha256,gameGuardReceipt:game.receipt}};
}
export async function openResearchRookTablebaseSources({root=repo}={}){const a=await admission(root,'collect');return{exports:structuredClone(a.r.source.exports),receipt:a.receipt};}
export async function openResearchRookTablebaseSource(url,{root=repo}={}){const a=await openResearchRookTablebaseSources({root}),e=a.exports.find(e=>e.url===url);if(!e)fail('unregistered exact export');return{...e,receipt:a.receipt};}
export async function openResearchRookTablebases({root=repo,purpose='test'}={}){
 const a=await admission(root,purpose),raw=await bytes(root,a.r.manifest),m=JSON.parse(raw);if(m.schema!=='syzygy-rook-wdl-manifest-v1'||m.dataset!=='T002'||m.originFormat!=='syzygy-krpvkr-wdl-v1'||m.status!=='complete'||m.material!=='KRPvKR'||m.capturePromotionClosure!=='complete20-WDL-plus-KK-mechanical'||!Array.isArray(m.files)||m.files.length!==exports.length)fail('incomplete/unsupported manifest');
 const files={};for(const e of a.r.source.exports){const f=m.files.find(f=>f.name===e.name);if(!f||f.path!==dataDir+'/files/'+e.name||f.url!==e.url||f.finalUrl!==e.url||f.bytes!==e.bytes||f.sha256!==e.sha256||!f.retrievedAt||f.sourceRegistrySha256!==a.receipt.registrySha256)fail('acquisition origin differs');const data=await bytes(root,f.path);if(data.length!==e.bytes||sha256(data)!==e.sha256||data.subarray(0,4).toString('hex')!=='71e8235d'||data.length%64!==16)fail('table hash/size/header differs');files[e.name]={path:f.path,bytes:f.bytes,sha256:f.sha256};}
 return{directory:await realpath(path.join(root,dataDir,'files')),receipt:{...a.receipt,manifestSha256:sha256(raw),files}};
}
