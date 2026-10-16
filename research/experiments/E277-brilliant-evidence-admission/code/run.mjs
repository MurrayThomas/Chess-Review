import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {parse} from 'acorn';
import {prefix,scenarios,colors,builds,paths,fixture} from './spec.mjs';
import {runRow,evaluate} from './matrix.mjs';
import {parserWitness,cacheAudit} from './routes.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const [mode,output]=process.argv.slice(2);assert.ok(['freeze','evaluate'].includes(mode));const out=path.resolve(output||'');assert.ok(out.startsWith(path.resolve('research/runs/E277')+path.sep));
await mkdir(out,{recursive:true});await writeFile(path.join(out,'claim.json'),JSON.stringify({mode,startedUtc:new Date().toISOString(),processId:process.pid})+'\n',{flag:'wx'});
const started=performance.now(),sourceRevision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim();let sourceHashes;
try{
  const files=[...['spec.mjs','candidate.mjs','matrix.mjs','routes.mjs','run.mjs'].map(n=>prefix+'code/'+n),'analysis.js','engine/uci.js','browser-compat.js','tests/helpers/app.mjs','data/calibration.json','lib/chess.js','lib/public-scoring.js','lib/calibrated-review.js','lib/calibrated-search.js','package-lock.json','node_modules/acorn/dist/acorn.mjs'];
  sourceHashes=Object.fromEntries(await Promise.all(files.map(async p=>[p,hash(await readFile(p))])));
  const calibration=JSON.parse(await readFile('data/calibration.json'));
  const input=JSON.parse(JSON.stringify({schema:'E277-authored-contract-inputs-v1',scenarios,colors,builds,paths,fixtures:colors.map(color=>fixture(color)),target:'Synthetic source-admission contract only; no real games, searches, training, independent human labels or population validity.'}));
  const receipt={schema:'E277-run-v1',mode,sourceRevision,sourceHashes,command:process.argv.slice(1),startedUtc:new Date().toISOString(),environment:{node:process.version,platform:process.platform,arch:process.arch},dataUse:input.target};
  async function write(name,value,gz=false){const plain=Buffer.from(JSON.stringify(value,null,gz?0:2)+'\n'),bytes=gz?gzipSync(plain):plain;await writeFile(path.join(out,name),bytes,{flag:'wx'});return hash(bytes);}
  if(mode==='freeze'){
    const source=await readFile('analysis.js','utf8'),ast=parse(source,{ecmaVersion:'latest',sourceType:'module'});
    const names=['annotationPair','brilliantEligible','classifyLine','classifyVariationMoves','computeDerived','canRestoreAnalysis','completeAnalysis','analysisSettingsKey'];
    const declarations=names.map(name=>{const n=ast.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name===name);assert.ok(n,name);return {name,sha256:hash(source.slice(n.start,n.end)),source:source.slice(n.start,n.end)};});
    const outputs={'inputs.json':await write('inputs.json',input),'declarations.json.gz':await write('declarations.json.gz',{parentAnalysisSha256:sourceHashes['analysis.js'],declarations},true)};
    await write('freeze.json',{...receipt,outputs,assessmentRows:0});console.log(JSON.stringify({frozen:true,scenarios:scenarios.length,rows:scenarios.length*colors.length*builds.length*paths.length}));
  }else{
    const frozen=JSON.parse(await readFile(prefix+'evidence/freeze.json'));assert.deepEqual(sourceHashes,frozen.sourceHashes);
    const bytes=await readFile(prefix+'evidence/inputs.json');assert.equal(hash(bytes),frozen.outputs['inputs.json']);assert.deepEqual(JSON.parse(bytes),input);
    const pilotStart=performance.now(),pilot=[];
    for(const [id,color,build,path] of [['valid-exact','w','nnue','raw'],['valid-exact','w','sf19lite','overlay'],['used-upperbound','b','nnue','variation'],['used-stale-depth','w','sf19lite','raw']]){
      const scenario=scenarios.find(s=>s.id===id);pilot.push({id,color,build,path,arms:Object.fromEntries(['B','C','U'].map(arm=>[arm,runRow(scenario,color,build,path,arm,calibration)]))});}
    const pilotMs=performance.now()-pilotStart;assert.ok(pilotMs<=30000,'Pilot time cap');console.log(JSON.stringify({pilotRows:4,pilotMs}));
    const assessmentStart=performance.now(),rows=[];
    for(const scenario of scenarios)for(const color of colors)for(const build of builds)for(const path of paths){
      rows.push({...scenario,color,build,path,arms:Object.fromEntries(['B','C','U'].map(arm=>[arm,runRow(scenario,color,build,path,arm,calibration)]))});
      assert.ok(performance.now()-assessmentStart<=180000,'Matrix time cap');
    }
    const matrix=evaluate(rows),witnesses=[];
    for(const color of colors)for(const build of builds)for(const exact of [false,true])witnesses.push(await parserWitness(color,build,exact,calibration));
    const cache=colors.flatMap(color=>builds.flatMap(build=>cacheAudit(color,build,calibration)));
    const parserPassed=witnesses.every(w=>w.rows.every(r=>w.requireExact?!r.root.lines.some(l=>l.multipv===2)&&r.arms.B.category!=='brilliant':r.root.lines.some(l=>l.multipv===2&&l.bound==='upperbound')&&r.arms.B.category==='brilliant'&&r.arms.C.category===null));
    const result={schema:'E277-contract-result-v1',...matrix,gates:{matrix:matrix.passed,parser:parserPassed,cache:cache.every(c=>c.passed)},passed:matrix.passed&&parserPassed&&cache.every(c=>c.passed),rows,witnesses,cache,scope:input.target};
    const outputs={'results.json.gz':await write('results.json.gz',result,true)};
    await write('run.json',{...receipt,outputs,pilotMs,pilotRows:4,matrixRows:rows.length,parserFrames:witnesses.reduce((n,w)=>n+w.rows.length,0),cacheRows:cache.length,elapsedMs:performance.now()-started,engineSearches:0});
    console.log(JSON.stringify({passed:result.passed,totals:result.totals,gates:result.gates,parserFrames:16,cacheRows:cache.length}));
  }
}catch(error){await writeFile(path.join(out,'failure.json'),JSON.stringify({sourceRevision,sourceHashes,mode,message:error.message,stack:error.stack,elapsedMs:performance.now()-started},null,2)+'\n',{flag:'wx'});throw error;}
