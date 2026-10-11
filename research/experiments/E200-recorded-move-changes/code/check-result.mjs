import assert from 'node:assert/strict';
import {Chess} from '../../../../lib/chess.js';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';

// Independent square-map bookkeeping and coordinate/ray geometry. Shared
// chess.js legal-move and rule semantics are an explicit remaining dependency.
function frame(c,bySquare,archive){
  const units=[...archive.values()].map(u=>({...u})).sort((a,b)=>a.id.localeCompare(b.id));
  const inventory=units.filter(u=>u.alive),counts={};
  for(const color of ['w','b']){counts[color]={};for(const type of ['p','n','b','r','q','k'])counts[color][type]=inventory.filter(p=>p.color===color&&p.type===type).length;}
  const values={p:1,n:3,b:3,r:5,q:9,k:0},total=color=>inventory.filter(p=>p.color===color).reduce((s,p)=>s+values[p.type],0);
  const attacks=[];
  for(const color of ['w','b'])for(let rank=1;rank<=8;rank++)for(let file=0;file<8;file++){
    const target='abcdefgh'[file]+rank,from=[];
    for(const p of inventory.filter(p=>p.color===color)){
      const x=p.square.charCodeAt(0)-97,y=+p.square[1],dx=file-x,dy=rank-y,ax=Math.abs(dx),ay=Math.abs(dy);
      let hits=p.type==='p'?ay===1&&ax===1&&dy===(color==='w'?1:-1):p.type==='n'?ax*ay===2:p.type==='k'?Math.max(ax,ay)===1:false;
      if(['b','r','q'].includes(p.type)&&(dx||dy)){
        const diagonal=ax===ay,straight=dx===0||dy===0;
        hits=p.type==='b'?diagonal:p.type==='r'?straight:diagonal||straight;
        if(hits){const sx=Math.sign(dx),sy=Math.sign(dy);for(let n=1;n<Math.max(ax,ay);n++)if(bySquare.has('abcdefgh'[x+n*sx]+(y+n*sy)))hits=false;}
      }
      if(hits)from.push(p.id);
    }
    attacks.push({color,target,from:from.sort()});
  }
  const f=c.fen().split(' '),moves=c.moves({verbose:true}).sort((a,b)=>(a.from+a.to+(a.promotion||'')).localeCompare(b.from+b.to+(b.promotion||''))),code=m=>m.from+m.to+(m.promotion||'');
  assert.deepEqual(inventory.map(p=>[p.square,p.type,p.color]).sort(),c.board().flat().filter(Boolean).map(p=>[p.square,p.type,p.color]).sort());
  return {fen:c.fen(),units,inventory,material:{counts,nominal:{w:total('w'),b:total('b'),whiteMinusBlack:total('w')-total('b')}},
    fields:{placement:f[0],turn:f[1],castling:f[2],enPassant:f[3],halfmove:+f[4],fullmove:+f[5]},
    rules:{check:c.isCheck(),checkmate:c.isCheckmate(),stalemate:c.isStalemate(),insufficientMaterial:c.isInsufficientMaterial(),fiftyMoveClaim:c.isDrawByFiftyMoves(),threefoldClaim:c.isThreefoldRepetition(),libraryGameOver:c.isGameOver()},
    legal:{actor:f[1],moves:moves.map(code),checks:moves.filter(m=>/[+#]/.test(m.san)).map(code),captures:moves.filter(m=>m.captured).map(code)},attacks};
}
export function checkResult(input,result){
  plain(input);plain(result);assert.equal(result.schema,'coach-last-recorded-change-E200');
  const limit=input.maxChangeNodes===undefined?10000:input.maxChangeNodes;assert.equal(result.limit,limit);
  if(!['answered','unavailable','disabled','exhausted'].includes(result.status))throw Error('Unknown status');
  const length=input.history?.moves?.length;
  if(input.enabled===false){assert.deepEqual(result,{schema:result.schema,status:'disabled',limit,nodes:0,answer:null});return true;}
  if(input.history===undefined){assert.deepEqual(result,{schema:result.schema,status:'unavailable',limit,nodes:0,answer:null});return true;}
  if(limit<(length?2*length+260:1)){assert.equal(result.status,'exhausted');assert.equal(result.nodes,limit);assert.equal(result.answer,null);return true;}
  if(!length){assert.equal(result.status,'unavailable');assert.equal(result.nodes,1);assert.equal(result.answer,null);return true;}
  assert.equal(result.status,'answered');assert.equal(result.nodes,2*length+260);
  const c=new Chess(input.history.fen),start=c.fen(),bySquare=new Map(),archive=new Map();
  for(const row of c.board())for(const p of row)if(p){const u={id:p.color+p.type+p.square,color:p.color,originalType:p.type,type:p.type,square:p.square,alive:true};archive.set(u.id,u);bySquare.set(p.square,u);}
  let before,last;
  for(let i=0;i<length;i++){
    assert.equal(c.isGameOver(),false);if(i===length-1)before=frame(c,bySquare,archive);
    const code=input.history.moves[i],m=c.move(code),u=bySquare.get(m.from);assert.ok(u);
    bySquare.delete(m.from);const square=m.flags.includes('e')?m.to[0]+m.from[1]:m.to,v=bySquare.get(square);
    if(v){assert.notEqual(v.color,u.color);v.alive=false;bySquare.delete(square);}
    u.square=m.to;u.type=m.promotion||u.type;bySquare.set(m.to,u);
    let castlingRook=null;
    if(/[kq]/.test(m.flags)){
      const from=(m.flags.includes('k')?'h':'a')+m.from[1],to=(m.flags.includes('k')?'f':'d')+m.from[1],r=bySquare.get(from);assert.equal(r.type,'r');
      bySquare.delete(from);r.square=to;bySquare.set(to,r);castlingRook={id:r.id,from,to};
    }
    last={uci:code,san:m.san,color:m.color,unit:u.id,from:m.from,to:m.to,piece:m.piece,promotion:m.promotion||null,captured:v?{id:v.id,type:v.type,square}:null,castlingRook};
  }
  assert.equal(c.fen(),new Chess(input.fen).fen());const after=frame(c,bySquare,archive),a=result.answer;
  assert.equal(a.id,'C1060');assert.deepEqual(a.history,{fen:start,moves:input.history.moves});assert.deepEqual(a.last,last);assert.deepEqual(a.before,before);assert.deepEqual(a.after,after);
  const changes=[];
  for(const u of after.units){const prior=before.units.find(v=>v.id===u.id);if(JSON.stringify(u)!==JSON.stringify(prior))changes.push({id:u.id,before:prior,after:u});}
  assert.deepEqual(a.unitChanges,changes);
  const edges=[];
  for(const p of before.attacks){const next=after.attacks.find(q=>q.color===p.color&&q.target===p.target),added=next.from.filter(id=>!p.from.includes(id)),removed=p.from.filter(id=>!next.from.includes(id));if(added.length||removed.length)edges.push({color:p.color,target:p.target,added,removed});}
  assert.deepEqual(a.attackChanges,edges);
  assert.deepEqual(a.boundaries,{frame:'last-recorded-move',geometry:'pinned attacks included; no legal recapture or favorable-change inference',repetition:'supplied starting position and recorded continuation only',legalOptions:'each frame has its actual side to move; not a same-player comparison',evaluation:'strategic consequences and usefulness unavailable'});
  assert.deepEqual(Object.keys(a).sort(),['id','history','last','before','after','unitChanges','attackChanges','boundaries'].sort());
  assert.deepEqual(Object.keys(result).sort(),['schema','status','limit','nodes','answer'].sort());return true;
}
