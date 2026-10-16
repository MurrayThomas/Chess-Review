import assert from 'node:assert/strict';
import {Chess} from '../../../../lib/chess.js';
export function descriptor(text,index){
  if(!text.startsWith('info ')||!text.includes(' score '))return null;
  const rank=Number(/\bmultipv (\S+)/.exec(text)?.[1]||1),depth=Number(/\bdepth (\S+)/.exec(text)?.[1]||0),s=/\bscore (cp|mate) (\S+)/.exec(text);
  let score=null;if(s&&/^-?\d+$/.test(s[2])&&Number.isSafeInteger(Number(s[2]))&&(s[1]!=='mate'||Number(s[2])!==0)){
    const w=/\bwdl (\d+) (\d+) (\d+)/.exec(text);score={[s[1]]:Number(s[2]),...(w?{wdl:w.slice(1).map(Number)}:{})};}
  return {multipv:rank,depth,score,pv:text.split(' pv ')[1]?.trim()||'',bound:text.includes(' lowerbound')?'lowerbound':text.includes(' upperbound')?'upperbound':'exact',sourceIndex:index};
}
export class Producer{
  constructor(stream,strict=true){
    this.stream=stream;this.strict=strict;this.legal=new Set(new Chess(stream.query.fen).moves({verbose:true}).map(m=>m.lan));this.K=Math.min(stream.query.multipv,this.legal.size);
    this.cache=new Map();this.epoch=-1;this.lastIndex=-1;this.lastDepth=-1;this.signature=null;this.frames=[];this.closed=false;
    this.stats={scored:0,rank1Groups:0,incompleteOrInvalid:0,duplicates:0,regressions:0};
  }
  observe(text,index){
    assert.ok(Number.isSafeInteger(index)&&index>this.lastIndex,'Non-monotonic source index');this.lastIndex=index;
    if(this.closed)return null;if(text.startsWith('bestmove ')){this.closed=true;return null;}
    const row=descriptor(text,index);if(!row)return null;this.stats.scored++;
    if(row.multipv===1){this.epoch=index;this.stats.rank1Groups++;if(this.strict)this.cache.clear();}
    if(!Number.isSafeInteger(row.multipv)||row.multipv<1)return null;this.cache.set(row.multipv,row);
    const members=Array.from({length:this.K},(_,i)=>this.cache.get(i+1)),top=members[0];
    if(!this.K||members.some(l=>!l||!l.score||l.bound!=='exact'||!Number.isSafeInteger(l.depth)||l.depth<4||l.depth!==top.depth)
      ||(this.strict&&members.some(l=>l.sourceIndex<this.epoch))){this.stats.incompleteOrInvalid++;return null;}
    const moves=members.map(l=>l.pv.split(' ')[0]);
    if(new Set(moves).size!==this.K||moves.some(m=>!this.legal.has(m))){this.stats.incompleteOrInvalid++;return null;}
    if(top.depth<this.lastDepth){this.stats.regressions++;return null;}
    const signature=JSON.stringify(members.map(l=>[l.multipv,l.depth,l.score,l.pv,l.bound]));if(signature===this.signature){this.stats.duplicates++;return null;}
    this.signature=signature;this.lastDepth=top.depth;
    const frame={streamId:this.stream.id,eventIndex:index,epochStart:this.epoch,K:this.K,root:{bestmove:moves[0],score:structuredClone(top.score),pv:top.pv,lines:structuredClone(members)}};
    this.frames.push(frame);return structuredClone(frame);
  }
}
