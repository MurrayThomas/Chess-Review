import {readHistoricalPanel} from '../../E270-combined-validation/code/historical-producer.mjs';
import {assertSourceEpochs} from '../../E270-combined-validation/code/source-epochs.mjs';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {context} from './context.mjs';
import {checkRookPanel} from './check-panel.mjs';
import {dir} from './exports.mjs';
export const archiveSha256='56046087a078f6710abccc8a92759a2093fe775729af20d74ae6a5d7b71169d1';
export function authenticateArchive(bytes){assert.equal(sha256(bytes),archiveSha256,'Changed retained rook observation archive');return JSON.parse(gunzipSync(bytes));}
export async function saved(){
 const ctx=await context(),archive=authenticateArchive(await readFile(dir+'/evidence/panels.json.gz'));
 assert.deepEqual(archive.datasetReceipt,ctx.data.receipt.gameGuardReceipt);assert.deepEqual(archive.tablebaseReceipt,ctx.data.receipt);await assertSourceEpochs(archive.sourceHashes);
 for(const r of archive.rows)assert.deepEqual((await readHistoricalPanel('E211/'+r.fixture.id)).view,r.view);
 const historicalCtx={data:ctx.data,probeSource:archive.probeSource};
 for(const r of archive.rows)assert.deepEqual(checkRookPanel(r.fixture.input,r.fixture.options,r.bundle,historicalCtx),r.view);
 return{rows:archive.rows,datasetReceipt:archive.datasetReceipt,tablebaseReceipt:archive.tablebaseReceipt,probeSource:archive.probeSource,sourceHashes:archive.sourceHashes,archiveSha256};
}
