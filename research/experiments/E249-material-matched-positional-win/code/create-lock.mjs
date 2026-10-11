import {readFile,writeFile} from 'node:fs/promises';
import {openResearchData,sha256} from '../../../data-policy.mjs';
const dir='research/experiments/E249-material-matched-positional-win';await openResearchData(['D001'],{purpose:'test'});const evidenceHashes={};for(const file of ['started.json','h2-win.json.gz','collection-failure.json'])evidenceHashes[file]=sha256(await readFile(dir+'/evidence/'+file));await writeFile(dir+'/code/archive-lock.json',JSON.stringify({schema:'E249-stopped-archive-v1',evidenceHashes},null,2)+'\n',{flag:'wx'});
