import {readFile,readdir} from 'node:fs/promises';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
export const dir='research/experiments/E199-board-question-evidence';
export async function fullBindings(){const parent='research/experiments/E198-functional-multiple-fronts/build.json',p=JSON.parse(await readFile(parent,'utf8'));return bindings([parent,'research/DATA_POLICY.md',...Object.keys(p.inputHashes),...(await readdir(dir)).filter(f=>f.endsWith('.md')&&f!=='RESULT.md').map(f=>dir+'/'+f),...(await readdir(dir+'/code')).filter(f=>f.endsWith('.mjs')).map(f=>dir+'/code/'+f)]);}
