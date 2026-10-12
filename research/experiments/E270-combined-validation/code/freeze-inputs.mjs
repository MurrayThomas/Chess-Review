// Source/configuration metadata only; no game or tablebase reads.
import {readdir,access} from 'node:fs/promises';
export const directory='research/experiments/E270-combined-validation';
export async function configurationInputs(){
 const amendments=(await readdir(directory)).filter(n=>/^AMENDMENT-.*\.md$/.test(n)).sort().map(n=>directory+'/'+n);
 const files=[directory+'/plan.md',...amendments,'.gitattributes',directory+'/.gitattributes',directory+'/code/repair-manifest.json',directory+'/code/complete-repair-manifest.json',directory+'/code/source-epochs.json'];
 for(const file of files)await access(file);return files;
}
export const proofInput={file:directory+'/evidence/complete-producer-repair/observations.json.gz',sha256:'8c675efe8219a4db3bea13182d77bac4d7a0f7fe308aec9a11b075c2b7bb39cf'};
