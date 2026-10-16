import {readFile} from 'node:fs/promises';
import {parse} from 'acorn';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {Chess} from '../../../../lib/chess.js';
import {expectedPoints,SF19_OUTCOME} from '../../../../lib/public-scoring.js';
export async function currentClassifier(){
  const source=await readFile('analysis.js','utf8'),calibration=JSON.parse(await readFile('data/calibration.json','utf8'));
  const names=['scoreToCp','winPct','moverWin','annotationOutcome','annotationPoints','annotationPair','decisionScore','decisionPawns','decisionMate',
    'exchangeGain','couldBeSaved','isSacrifice','brilliantEligible','onlyGoodReply','_isCheckmate','getStandardRating','classifyMove','_forcedAt'];
  const ast=parse(source,{ecmaVersion:'latest',sourceType:'module'}),chunks=[];
  for(const name of names){const node=ast.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name===name);assert.ok(node,name);chunks.push(source.slice(node.start,node.end));}
  for(const name of ['SAC_VAL','BRILLIANT_POLICY']){const n=ast.body.find(n=>n.type==='VariableDeclaration'&&n.declarations.some(d=>d.id.name===name));assert.ok(n,name);chunks.push(source.slice(n.start,n.end));}
  // _opp is an exact production helper too; all selected declarations are taken from the AST.
  const opp=ast.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='_opp');chunks.push(source.slice(opp.start,opp.end));
  const api=vm.runInNewContext(chunks.join('\n')+'\n;({'+names.join(',')+',BRILLIANT_POLICY})',{Chess,expectedPoints,SF19_OUTCOME,CALIB:calibration,S:null});
  return {api,calibration,extractedNames:[...names,'_opp','SAC_VAL','BRILLIANT_POLICY']};
}
export function replayLabel(api,c,root,played,after,engine,{history=true}={}){
  const chess=new Chess(c.before),move=chess.move({from:c.uci.slice(0,2),to:c.uci.slice(2,4)});
  const pos={...move,fen:c.after,...(history&&c.visiblePrior?{prior:c.visiblePrior}:{})};
  const state={positions:[{fen:c.before},pos],bests:[{...root,playedScore:played.score,calibration:{build:engine===19?'sf19lite':'sf18'}},after],
    evals:[],annotationEvidence:[],_forcedCache:[],settings:{enginePath:engine===19?'sf19lite':'sf18',clsClearAdv:2,clsMistakeLoss:1,clsMissTol:.5}};
  state.annotationEvidence[1]=api.annotationPair(1,state);
  const best=state.annotationEvidence[1].best,actual=state.annotationEvidence[1].played;
  const loss=(api.scoreToCp(best)-api.scoreToCp(actual))/100;
  const drop=Math.max(0,api.annotationPoints(best,1,state)-api.annotationPoints(actual,1,state));
  const standard=api.getStandardRating(drop),sacrifice=api.isSacrifice(pos);
  const category=api.classifyMove(1,'b',root.bestmove===c.uci,false,[null,sacrifice],[null,standard],[null,loss],[null,drop],state);
  return {category,sacrifice,standard,lossPawns:loss,expectedPointDrop:drop,bestMoverScore:best,playedMoverScore:actual,
    brilliantEligibility:api.brilliantEligible(1,'b',[null,standard],[null,drop],state),legalChoices:new Chess(c.before).moves(),historyIncluded:history&&!!c.visiblePrior};
}
