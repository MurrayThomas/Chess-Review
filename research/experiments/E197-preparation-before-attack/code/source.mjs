import {readFile,readdir} from 'node:fs/promises';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
export const dir='research/experiments/E197-preparation-before-attack';
export async function fullBindings(){const parent='research/experiments/E196-phase-change-simplification-window/build.json',p=JSON.parse(await readFile(parent,'utf8'));return bindings([parent,...Object.keys(p.inputHashes),...(await readdir(dir)).filter(f=>f.endsWith('.md')&&f!=='RESULT.md').map(f=>dir+'/'+f),...(await readdir(dir+'/code')).filter(f=>f.endsWith('.mjs')).map(f=>dir+'/code/'+f)]);}
