// Source-reviewed priority bands relative to E085's 30/154/185/187/188.
// Parent event truth and its internal winning-comment order remain conditional.
const group=s=>new Set(s.split(' '));
const over188=group('allows-mate smothered-mate back-rank-mate king-rook-mate king-queen-mate king-bishops-mate bishop-knight-mate queen-rook-mate arabian-mate anastasia-mate boden-mate epaulette-mate dovetail-mate swallow-tail-mate opera-mate morphy-mate ladder-mate double-check-mate discovered-mate underpromotion-mate promotion-mate pawn-supported-mate intermediate-mate damiano-mate lolli-mate hook-mate greco-mate blackburne-mate kill-box-mate legal-mate corner-mate box-mate illegal-input');
const atLeast154=group('checkmate stalemate insufficient-material fifty-move-threshold allows-fork hanging-piece relative-pin cross-pin certified-removal defensive-pawn-move eliminating-attacker active-defense luft mate-in-one forced-mate clearance-sacrifice exchange-sacrifice mating-sacrifice intermediate-check intermediate-capture draw-position repetition-claim fifty-move-claim trapped-piece safe-promotion-tactic promotion-route rule-of-square conditional-stalemate king-promotion-support quiet-mating-net unique-mate-defense defensive-counterattack mating-decoy coordinate-sacrifice mating-combination mating-square-clearance interference-combination desperado-capture cross-check blocking-combination attraction-combination decoy-combination intermediate-sacrifice pawn-race reserve-pawn-tempo waiting-move pawn-shield-defense');
const low=group('bishop-pawn-color capture material-balance nominal-balance material-imbalance piece-movement material-inventory legal-input board-coordinates pawn-skeleton paired-bishop-armies rook-minor-armies passed-count-imbalance flank-count-imbalance connected-passer-proof open-pawn-file-proof open-rank-proof outside-chain-proof behind-chain-proof slider-battery-proof');
export function parentBand(event){
 if(event.evidence?.experiment==='E084'||event.evidence?.experiment==='E083')return 40;
 if(event.id==='underpromotion-avoids-stalemate')return event.evidence.actualMate?200:180;
 if(event.id.startsWith('mate-pair-')||over188.has(event.id))return 200;
 if(event.id==='missed-mate')return 188;
 if(atLeast154.has(event.id))return 180;
 return low.has(event.id)?20:60;
}
export function ownPriority(event){return {'missed-immediate-mate-review':188,'retained-mate-threat':187,'immediate-mate-blunder-check':185,'prevented-immediate-mate':154}[event.id]??30;}
export function selectedE085Comment(parent,extra){
 if(!extra.length)return parent.comment;
 const best=extra.map((e,i)=>({e,i})).sort((a,b)=>ownPriority(b.e)-ownPriority(a.e)||a.i-b.i)[0].e;
 return parent.events.some(e=>parentBand(e)>=ownPriority(best))?parent.comment:best.text;
}
