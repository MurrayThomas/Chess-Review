import {Chess} from '../../../../lib/chess.js';
export function rejection(i,state){
  const root=state.bests[i-1],position=state.positions[i];
  if(root&&Object.hasOwn(root,'playedScore'))return null;
  const played=position.from+position.to+(position.promotion||'');
  const actual=root?.lines?.find(line=>(line.pv||'').split(' ')[0]===played);
  if(!actual)return null;
  const top=root.lines.find(line=>line.multipv===1)||root.lines[0];
  if(!top||top.bound!=='exact'||actual.bound!=='exact')return 'used-bound-not-exact';
  if(!Number.isInteger(top.depth)||top.depth<=0||actual.depth!==top.depth)return 'used-depth-not-current';
  const first=(top.pv||'').split(' ')[0];
  if(top.multipv!==1||!root.bestmove||first!==root.bestmove)return 'top-identity-mismatch';
  if(!Number.isInteger(actual.multipv)||(played===first?actual.multipv!==1:actual.multipv<2))return 'used-rank-invalid';
  try{const legal=new Chess(state.positions[i-1].fen).moves({verbose:true}).map(m=>m.lan);
    if(!legal.includes(first)||!legal.includes(played))return 'used-move-illegal';
  }catch{return 'used-board-invalid';}
  return null;
}
export function install(a,arm){
  const baseline=a.run('annotationPair'),events=[];
  if(arm!=='B')a.replace('annotationPair',(i,state)=>{
    const root=state.bests[i-1],reason=arm==='U'&&!(root&&Object.hasOwn(root,'playedScore'))?'all-unpaired':arm==='C'?rejection(i,state):null;
    if(reason){events.push({ply:i,reason});return null;}return baseline(i,state);
  });
  return events;
}
