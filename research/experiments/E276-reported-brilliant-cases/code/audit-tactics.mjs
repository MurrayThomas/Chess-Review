import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {Chess} from '../../../../lib/chess.js';
import {prefix,hash,loadCases} from './cases.mjs';
const out=process.argv[2];assert.ok(out?.startsWith('research/runs/E276/'));await mkdir(out,{recursive:true});
await writeFile(out+'/claim.json',JSON.stringify({startedUtc:new Date().toISOString(),processId:process.pid})+'\n',{flag:'wx'});
try{
  const access=await loadCases(),bytes=await readFile(prefix+'evidence/tactics.json.gz'),run=JSON.parse(await readFile(prefix+'evidence/tactics-run.json'));assert.equal(hash(bytes),run.outputHash);
  const data=JSON.parse(gunzipSync(bytes));assert.equal(data.complete,true);assert.equal(data.observations.length,12);
  for(const [p,h] of Object.entries(data.sources))assert.equal(hash(await readFile(p)),h,p);
  const c=access.input.cases[0],h=new Chess();h.loadPgn(c.inferredPgn);const originalMoves=h.history({verbose:true}).map(m=>m.lan);
  const branchBoard=new Chess(c.after);branchBoard.move('hxg4');const accepted=branchBoard.fen();branchBoard.move('Nxg4');const recaptured=branchBoard.fen();
  const direct=new Chess(c.after);direct.move('Qxg4');
  let lines=0,moves=0;const rows=[];
  for(const row of data.observations){let fen;
    if(row.query.history){const board=new Chess();for(const move of row.query.history)board.move({from:move.slice(0,2),to:move.slice(2,4),promotion:move[4]});fen=board.fen();
      const after=row.query.name.endsWith('after');assert.equal(fen,after?c.after:c.before);assert.deepEqual(row.query.history,after?originalMoves:originalMoves.slice(0,-1));
    }else{fen=row.query.fen;assert.equal(fen,row.query.name==='after-hxg4'?accepted:row.query.name==='immediate-Qxg4'?direct.fen():recaptured);}
    const raw=row.raw||[row.rawInfo,row.finalSearchInfo].filter(Boolean);
    let matching=null;
    for(const text of raw){if(!text.includes(' pv '))continue;const pv=text.slice(text.indexOf(' pv ')+4).trim().split(/\s+/),board=new Chess(fen);
      for(const move of pv){board.move({from:move.slice(0,2),to:move.slice(2,4),promotion:move[4]});moves++;}lines++;
      const rank=/\bmultipv (\d+)/.exec(text),depth=Number(/\bdepth (\d+)/.exec(text)?.[1]);
      if((!rank||rank[1]==='1')&&depth===row.depth&&pv[0]===row.bestmove&&!/\b(?:lowerbound|upperbound)\b/.test(text))matching=text;
    }
    assert.ok(matching);const s=/\bscore (cp|mate) (-?\d+)/.exec(matching);assert.equal(row.score[s[1]],Number(s[2]));
    rows.push({engine:row.query.engine,name:row.query.name,rootTurn:new Chess(fen).turn(),score:row.score,bestmove:row.bestmove,pv:row.pv,transcript:row.raw?'all returned UCI lines':'maintained harness selected exact and final info only'});
  }
  const mate=new Chess(access.input.cases[1].before);for(const step of data.mateProof){assert.equal(mate.fen(),step.before);assert.deepEqual(mate.moves(),step.legal);mate.move(step.san);assert.equal(mate.fen(),step.after);}assert.equal(mate.isCheckmate(),true);
  const result={schema:'E276-tactical-audit-v1',passed:true,completedUtc:new Date().toISOString(),codeSha256:hash(await readFile(prefix+'code/audit-tactics.mjs')),inputSha256:hash(bytes),caseEligibility:access.receipt,
    observations:rows.length,legalPvLines:lines,legalPvMoves:moves,rows,mateProof:{afterQxe6LegalReplies:data.mateProof[2].legal,finalCheckmate:true},limitations:'Same engines and selected complaints; inferred history remains unverified; no human agreement or population claim.'};
  await writeFile(out+'/verification.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({passed:true,observations:rows.length,legalPvLines:lines,legalPvMoves:moves,mateProof:result.mateProof}));
}catch(error){await writeFile(out+'/failure.json',JSON.stringify({message:error.message,stack:error.stack},null,2)+'\n',{flag:'wx'});throw error;}
