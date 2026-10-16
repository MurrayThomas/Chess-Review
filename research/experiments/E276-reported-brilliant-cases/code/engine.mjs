import assert from 'node:assert/strict';
import {Engine} from '../../../../tools/calibration/engine.mjs';
export function parseLine(raw){
  const score=/\bscore (cp|mate) (-?\d+)/.exec(raw),pv=raw.split(' pv ')[1];if(!score||!pv)return null;
  const n=key=>Number(new RegExp('\\b'+key+' (\\d+)').exec(raw)?.[1]);
  const w=/\bwdl (\d+) (\d+) (\d+)/.exec(raw);
  return {score:{[score[1]]:Number(score[2]),...(w?{wdl:w.slice(1).map(Number)}:{})},pv,
    depth:n('depth'),multipv:/\bmultipv /.test(raw)?n('multipv'):1,nodes:n('nodes'),
    bound:/\blowerbound\b/.test(raw)?'lowerbound':/\bupperbound\b/.test(raw)?'upperbound':'exact',raw};
}
export class FenEngine extends Engine{
  async query(q){
    this.send('setoption name MultiPV value '+q.multipv);this.send('ucinewgame');this.send('setoption name Clear Hash');
    this.send('isready');await this.until(l=>l==='readyok');
    this.send('position fen '+q.fen);const started=performance.now();
    this.send('go '+q.budget.kind+' '+q.budget.value+(q.restricted?' searchmoves '+q.restricted:''));
    const raw=await this.until(l=>l.startsWith('bestmove '),120000),bestmove=raw.findLast(l=>l.startsWith('bestmove ')).split(' ')[1];
    if(q.restricted)assert.equal(bestmove,q.restricted);
    const parsed=raw.map(parseLine).filter(Boolean),top=parsed.findLast(l=>l.multipv===1&&l.bound==='exact'&&l.pv.split(' ')[0]===bestmove);
    if(!top){assert.ok(!q.restricted,'Restricted search has no exact matching score');
      const recovered=await this.query({...q,multipv:1,restricted:bestmove});
      return {...recovered,query:q,originalRaw:raw,exactRecovery:true,requestCount:1+recovered.requestCount,elapsedMs:performance.now()-started};}
    const lines=[];for(let rank=1;rank<=q.multipv;rank++){const line=parsed.findLast(l=>l.depth===top.depth&&l.multipv===rank);if(line)lines.push(line);}
    return {query:q,bestmove,score:top.score,depth:top.depth,nodes:top.nodes,pv:top.pv,lines,raw,elapsedMs:performance.now()-started,requestCount:1};
  }
}
