import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {sha256,openResearchData} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {savedPanels} from '../../E145-critical-mating-decisions/code/saved-panels.mjs';
export const parentArchive='research/experiments/E145-critical-mating-decisions/evidence/observations.json.gz',focusArchive='research/experiments/E187-queen-exposure-tempo/evidence/focus.json.gz';
export async function saved(){
 const data=await openResearchData(['D001'],{purpose:'test'}),archive=await savedPanels(),hashes={[parentArchive]:sha256(await readFile(parentArchive))};for(const [p,h]of Object.entries(await bindings(['research/experiments/E143-forcing-tempo-initiative/code/panel.mjs'])))assert.equal(archive.sourceHashes[p],h,'Missing exact collector dependency '+p);for(const r of archive.borrowed)hashes[r.sourceObservation]=r.sourceObservationSha256;
 const fb=await readFile(focusArchive),focus=JSON.parse(gunzipSync(fb));hashes[focusArchive]=sha256(fb);assert.equal(focus.receipt.registrySha256,data.receipt.registrySha256);for(const [p,h]of Object.entries(focus.sourceHashes))assert.equal(sha256((await readFile(p,'utf8')).replaceAll('\r\n','\n')),h,'Changed focus source '+p);
 return{receipt:data.receipt,hashes,focus,find(input,H){const key={fen:input.fen,history:input.history,plies:H},index=archive.panels.findIndex(r=>JSON.stringify(r.key)===JSON.stringify(key));assert.ok(index>=0,'No exact archived root/history/H');return{panel:archive.panels[index].panel,ref:{file:parentArchive,index}};}};
}
