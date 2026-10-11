import {readdir} from 'node:fs/promises';
import {fullBindings as parentBindings} from '../../E194-retained-second-weakness/code/source.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
export const dir='research/experiments/E195-second-weakness-promotion-control';
export async function fullBindings(){return bindings([...Object.keys(await parentBindings()),...(await readdir(dir)).filter(f=>f.endsWith('.md')&&f!=='RESULT.md').map(f=>dir+'/'+f),...(await readdir(dir+'/code')).filter(f=>f.endsWith('.mjs')).map(f=>dir+'/code/'+f)]);}
