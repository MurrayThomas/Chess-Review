import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {context} from '../../E211-rook-tablebase-admission/code/context.mjs';
import {authenticateArchive,archiveSha256} from '../../E211-rook-tablebase-admission/code/saved.mjs';
import {checkRookPanel} from '../../E211-rook-tablebase-admission/code/check-panel.mjs';
const tokens=new WeakMap(),archivePath='research/experiments/E211-rook-tablebase-admission/evidence/panels.json.gz',position=fen=>fen.split(' ').slice(0,4).join(' ');
export async function openSavedTablebaseSupport(options={}){
 plain(options);if(!options||typeof options!=='object'||Array.isArray(options)||Object.keys(options).some(k=>k!=='enabled')||options.enabled!==undefined&&typeof options.enabled!=='boolean')throw Error('Invalid saved tablebase admission options');if(!options.enabled)return{status:'disabled',token:null,source:null};
 const ctx=await context(),archive=authenticateArchive(await readFile(archivePath));assert.deepEqual(archive.datasetReceipt,ctx.data.receipt.gameGuardReceipt);assert.deepEqual(archive.tablebaseReceipt,ctx.data.receipt);assert.deepEqual(archive.probeSource,ctx.probeSource);assert.deepEqual(archive.sourceHashes,await bindings(Object.keys(archive.sourceHashes)));
 const token=Object.freeze({});tokens.set(token,{ctx,archive,memo:new Map()});return{status:'admitted-saved-source',token,source:readSource(token)};
}
function session(token){if(!token||!tokens.has(token))throw Error('Unadmitted saved tablebase capability');return tokens.get(token);}
export function readSource(token){const {ctx}=session(token);return structuredClone({dataset:'T002',archivePath,archiveSha256,tablebaseReceipt:ctx.data.receipt,probeSource:ctx.probeSource,legacySuccessfulStderrRetained:false,freshExecution:false,independentRetrogradeVerification:false});}
export function hasPanel(token,fen){return session(token).archive.rows.some(r=>position(r.fixture.input.fen)===position(fen));}
export function readPanel(token,fen){const s=session(token),row=s.archive.rows.find(r=>position(r.fixture.input.fen)===position(fen));if(!row)return null;
 if(!s.memo.has(row.fixture.id)){assert.deepEqual(checkRookPanel(row.fixture.input,row.fixture.options,row.bundle,s.ctx),row.view);s.memo.set(row.fixture.id,{id:row.fixture.id,input:row.fixture.input,view:row.view,panel:row.bundle.panel});}
 return structuredClone(s.memo.get(row.fixture.id));
}
