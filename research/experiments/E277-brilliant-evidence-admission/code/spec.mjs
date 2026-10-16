import {Chess} from '../../../../lib/chess.js';
export const prefix='research/experiments/E277-brilliant-evidence-admission/';
export const scenarios=[
  ['valid-exact','retain'],['valid-rank3','retain'],['valid-no-candidate','retain'],['valid-no-lines','retain'],['valid-unused-bound','retain'],
  ['valid-paired-top','retain'],['valid-paired-other','retain'],['paired-losing','reject'],['paired-missing','reject'],
  ['used-upperbound','withhold'],['used-lowerbound','withhold'],['used-stale-depth','withhold'],['used-missing-depth','withhold'],['used-missing-rank','withhold'],
  ['top-mismatch','withhold'],['illegal-top','withhold'],['missing-bestmove','withhold'],['zero-depth','withhold'],['duplicate-rank1','withhold'],
  ['exact-losing','reject'],['used-missing-bound','withhold']
].map(([id,expectation])=>({id,expectation}));
export const colors=['w','b'],builds=['nnue','sf19lite'],paths=['raw','overlay','variation'];
export function fixture(color){
  const white=color==='w',fen=white?'7k/8/4p3/8/8/8/8/K2Q4 w - - 0 1':'k2q4/8/8/8/8/4P3/8/7K b - - 0 1';
  const chess=new Chess(fen),offer=chess.move(white?'Qd5':'Qd4');
  return {color,fen,offer,safe:white?'a1a2':'a8a7',other:white?'a1b1':'a8b8',unused:white?'d1e1':'d8e8'};
}
export function tag(calibration,build){return {version:calibration.version,build,nodes:build==='sf19lite'?20000:null,qualityVersion:calibration.quality.candidateVersion,contextVersion:calibration.context.sf19.candidateVersion};}
export function stateFor(scenario,color,build,calibration){
  const f=fixture(color),paired=scenario.id.includes('paired'),root={bestmove:f.safe,score:{cp:0},calibration:tag(calibration,build),lines:[
    {multipv:1,depth:16,bound:'exact',score:{cp:0},pv:f.safe},
    {multipv:2,depth:16,bound:'exact',score:{cp:0},pv:f.offer.lan}]};
  const actual=root.lines[1];let afterMoverCp=scenario.expectation==='withhold'?-600:0;
  switch(scenario.id){
    case 'valid-rank3':actual.multipv=3;break;
    case 'valid-no-candidate':root.lines.pop();break;
    case 'valid-no-lines':root.lines=[];break;
    case 'valid-unused-bound':root.lines.push({multipv:3,depth:8,bound:'upperbound',score:{cp:-600},pv:f.unused});break;
    case 'valid-paired-top':root.bestmove=f.offer.lan;root.lines[0].pv=f.offer.lan;root.lines.splice(1);root.playedScore={cp:0};break;
    case 'valid-paired-other':root.playedScore={cp:0};break;
    case 'paired-losing':root.playedScore={cp:-600};actual.score.cp=-600;afterMoverCp=-600;break;
    case 'paired-missing':root.playedScore=null;break;
    case 'used-upperbound':actual.bound='upperbound';break;
    case 'used-lowerbound':actual.bound='lowerbound';break;
    case 'used-stale-depth':actual.depth=8;break;
    case 'used-missing-depth':delete actual.depth;break;
    case 'used-missing-rank':delete actual.multipv;break;
    case 'top-mismatch':root.lines[0].pv=f.other;break;
    case 'illegal-top':root.bestmove=color==='w'?'a1a8':'a8a1';root.lines[0].pv=root.bestmove;break;
    case 'missing-bestmove':delete root.bestmove;break;
    case 'zero-depth':root.lines[0].depth=0;actual.depth=0;break;
    case 'duplicate-rank1':actual.multipv=1;break;
    case 'exact-losing':actual.score.cp=-600;afterMoverCp=-600;break;
    case 'used-missing-bound':delete actual.bound;break;
  }
  return {fixture:f,root,afterMoverCp,paired};
}
