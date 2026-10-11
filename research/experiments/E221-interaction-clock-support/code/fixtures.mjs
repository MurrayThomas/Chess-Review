import {Chess} from '../../../../lib/chess.js';
import {boardFen} from '../../FRIEND-shared/lib.mjs';
export const initial=new Chess().fen(),mate=boardFen({f6:'K',g7:'Q',h8:'k'},'b');
const source=eventId=>({source:'authored-synthetic',eventId});
export const phase=(allotmentMs,mode='none',bonusMs=0,moves=null)=>({moves,allotmentMs,mode,bonusMs});
export const control=(w,b=w)=>({...source('control'),w:structuredClone(w),b:structuredClone(b)});
export const turn=(player,moveNumber,beforeMs,elapsedMs,afterMs,extra={})=>({...source(player+moveNumber),player,moveNumber,beforeMs,afterMs,elapsedMs,adjustmentMs:0,snapshot:'after-press',...extra});
const options={enabled:true},make=(id,input,extra={})=>({id,input,options:{...options,...extra}});
export const cases=[
 make('no-input',{}),
 make('ordinary',{timeControl:control([phase(300000)]),turns:[turn('w',1,300000,10000,290000),turn('b',1,300000,6000,294000),turn('w',2,290000,1000,289000)]}),
 make('fischer',{timeControl:control([phase(180000,'fischer',2000)]),turns:[turn('w',1,180000,500,181500),turn('b',1,180000,5000,177000)]},{timeTroubleThresholdMs:180000}),
 make('delay',{timeControl:control([phase(300000,'delay',5000)]),turns:[turn('w',1,300000,2000,300000),turn('b',1,300000,7000,298000),turn('w',2,300000,5000,300000)]}),
 make('stage-boundary',{timeControl:control([phase(5400000,'fischer',30000,40),phase(1800000,'fischer',30000)]),turns:[turn('w',40,100000,5000,1925000),turn('b',40,100000,10000,1920000),turn('w',41,1925000,15000,1940000)]}),
 make('adjustments',{timeControl:control([phase(10000)]),turns:[turn('w',1,10000,1000,11000,{adjustmentMs:2000}),turn('b',1,10000,1000,7000,{adjustmentMs:-2000})]}),
 make('inconsistent',{timeControl:control([phase(300000)]),turns:[turn('w',1,300000,10000,289000)]}),
 make('no-control',{turns:[turn('w',1,300000,10000,290000)]}),
 make('unknown-snapshot',{timeControl:control([phase(300000)]),turns:[turn('w',1,300000,10000,290000,{snapshot:'unknown'})]}),
 make('flag-ambiguity',{timeControl:control([phase(100)]),turns:[turn('w',1,100,101,0)]}),
 ...[600000,600001,3599999,3600000].map(n=>make('speed-'+n,{timeControl:control([phase(n)])})),
 make('effective-boundary',{timeControl:control([phase(300000,'fischer',5000)])}),
 make('asymmetric',{timeControl:control([phase(600000)],[phase(600001)])}),
 make('declared-bullet',{timeControl:control([phase(60000)]),event:{...source('event'),category:'bullet'}}),
 make('declared-classical',{timeControl:control([phase(7200000,'fischer',30000)]),event:{...source('event'),category:'classical'}}),
 make('category-conflict',{timeControl:control([phase(600000)]),event:{...source('event'),category:'rapid'}}),
 make('declared-armageddon',{timeControl:control([phase(300000)],[phase(240000)]),event:{...source('event'),category:'blitz',armageddon:{drawOdds:'b'}}}),
 make('mate-metadata',{fen:mate,termination:{...source('end'),reason:'checkmate',result:'1-0'}}),
 make('mate-without-metadata',{fen:mate}),
 make('resignation',{fen:initial,termination:{...source('end'),reason:'resignation',resigningSide:'b',result:'1-0'}}),
 make('resignation-draw',{termination:{...source('end'),reason:'resignation',resigningSide:'w',result:'1/2-1/2'}}),
 make('termination-conflict',{fen:initial,termination:{...source('end'),reason:'checkmate',result:'1-0'}}),
 make('termination-no-board',{termination:{...source('end'),reason:'checkmate',result:'1-0'}}),
 make('touch-events',{fen:initial,touch:[{...source('touch-move'),actor:'w',square:'e2',purpose:'move'},{...source('adjust'),actor:'w',square:'b1',purpose:'adjust'},{...source('unknown'),actor:'w',square:'b1',purpose:'unknown'},{...source('wrong-actor'),actor:'b',square:'e7',purpose:'move'},{...source('empty'),actor:'w',square:'e4',purpose:'move'}]}),
 make('black-touch',{fen:initial.replace(' w ',' b '),touch:[{...source('touch'),actor:'b',square:'e7',purpose:'move'}]}),
 make('ep-victim-touch',{fen:boardFen({e1:'K',e8:'k',e5:'P',d5:'p'}).replace(' - - 0 1',' - d6 0 3'),touch:[{...source('touch'),actor:'w',square:'d5',purpose:'capture'}]}),
 make('touch-no-position',{touch:[{...source('touch'),actor:'w',square:'e2',purpose:'move'}]}),
 make('explicit-self-report',{selfReport:{...source('report'),clockAwareness:false,opponentThinking:true}}),
];
