import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {parse} from 'acorn';
import vm from 'node:vm';
import {Chess} from '../../../../lib/chess.js';
import {app,loadGame} from '../../../../tests/helpers/app.mjs';
import {prefix,hash,loadCases} from './cases.mjs';
const out=process.argv[2];assert.ok(out?.startsWith('research/runs/E276/'));await mkdir(out,{recursive:true});
await writeFile(out+'/claim.json',JSON.stringify({startedUtc:new Date().toISOString(),processId:process.pid})+'\n',{flag:'wx'});
try{
  const access=await loadCases(),bytes=await readFile(prefix+'evidence/results.json'),receipt=JSON.parse(await readFile(prefix+'evidence/report-run.json'));assert.equal(hash(bytes),receipt.outputHash);
  for(const [p,h] of Object.entries(receipt.sources))assert.equal(hash(await readFile(p)),h,p);
  const report=JSON.parse(bytes),integration=[];
  for(const c of access.input.cases)for(const engine of [18,19]){
    const row=report.rows.find(r=>r.case===c.id&&r.engine===engine&&r.budget.kind==='nodes'&&r.budget.value===2000000),cleanup=[];
    const a=app({after:f=>cleanup.push(f)});
    try{
      const fen=c.visiblePrior||c.before,moves=c.visiblePrior?'13. h3 Qg3':'19... Ke8';
      const S=loadGame(a,'[SetUp "1"]\n[FEN "'+fen+'"]\n\n'+moves),i=S.total;
      a.context.__realCalibration=JSON.parse(await readFile('data/calibration.json'));a.run('CALIB = __realCalibration');
      S.settings.enginePath=engine===19?'sf19lite':'sf18';
      S.bests[i-1]={...row.root,playedScore:row.played.score,calibration:{build:S.settings.enginePath}};
      S.bests[i]=row.after;
      a.call('computeDerived');
      assert.equal(S.classif[i],row.current.category);assert.equal(S._sacCache[i],row.current.sacrifice);
      integration.push({case:c.id,engine,category:S.classif[i],sacrifice:S._sacCache[i],sameAsExtracted:true});
    }finally{for(const close of cleanup)close();}
  }
  const historicalRevision=execFileSync('git',['rev-parse','52be78c^'],{encoding:'utf8',windowsHide:true}).trim();
  const historicalSource=execFileSync('git',['show',historicalRevision+':analysis.js'],{encoding:'utf8',windowsHide:true});
  const names=['_opp','getAttackersDefenders','couldBeSaved','isSacrifice','scoreToCp','_evalPawnsWhite','_evalPawns','_isMateEval','_mateFor','_isCheckmate','classifyMove','_forcedAt'];
  const ast=parse(historicalSource,{ecmaVersion:'latest',sourceType:'module'}),chunks=names.map(name=>{const n=ast.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name===name);assert.ok(n,name);return historicalSource.slice(n.start,n.end);});
  const old=vm.runInNewContext(chunks.join('\n')+'\n;({isSacrifice,classifyMove})',{Chess,S:null,CALIB:{clsWp:{mistake:10}}});
  const c=access.input.cases[1],board=new Chess(c.before),m=board.move('Ke8'),sacrifice=old.isSacrifice(m);
  const state={positions:Array.from({length:5},()=>({fen:c.before,color:'w'})),evals:Array.from({length:5},()=>({cp:593})),_forcedCache:[],settings:{clsClearAdv:2,clsMistakeLoss:1,clsMissTol:.5}};
  state.positions[4]={...m,fen:m.after};
  const control=old.classifyMove(4,'b',true,false,[false,false,false,false,sacrifice],['excellent','excellent','excellent','excellent','excellent'],[0,0,0,0,0],[0,0,0,0,0],state);
  const triggered=old.classifyMove(4,'b',true,false,[false,false,false,false,sacrifice],['excellent','excellent','excellent','inacc','excellent'],[0,0,0,1,0],[0,0,0,6,0],state);
  assert.equal(sacrifice,true);assert.equal(control,'best');assert.equal(triggered,'brilliant');
  const files=[prefix+'code/integration.mjs','tests/helpers/app.mjs','lib/calibrated-review.js','lib/calibrated-search.js','package-lock.json'];
  const result={schema:'E276-integration-historical-mechanism-v1',passed:true,completedUtc:new Date().toISOString(),inputSha256:hash(bytes),caseEligibility:access.receipt,
    sources:Object.fromEntries(await Promise.all(files.map(async p=>[p,hash(await readFile(p))]))),integration,
    historical:{revision:historicalRevision,analysisGitBlob:execFileSync('git',['rev-parse',historicalRevision+':analysis.js'],{encoding:'utf8',windowsHide:true}).trim(),sourceSha256:hash(historicalSource),names,sacrifice,syntheticWhiteCp:593,withoutPriorError:control,withSyntheticPriorInaccuracy:triggered,
      limitation:'Exact historical functions on the reported legal board with explicitly synthetic preceding-label context; not reconstruction of the unknown original application revision, cache or full game.'},
    productionChanges:false};
  await writeFile(out+'/integration.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({passed:true,integration,historical:result.historical}));
}catch(error){await writeFile(out+'/failure.json',JSON.stringify({message:error.message,stack:error.stack,completedUtc:new Date().toISOString()},null,2)+'\n',{flag:'wx'});throw error;}
