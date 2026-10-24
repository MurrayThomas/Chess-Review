// Compare review UI cost with analysis already complete. Uses only local fixtures,
// a disposable Chrome profile and mocked extension storage; no user profile/data.
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {spawn,execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {Chess} from '../lib/chess.js';

const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const baseline=process.argv.slice(2).find(arg=>!arg.startsWith('--')) || 'e00ee436';
const profileOnly=process.argv.includes('--profile-only');
await fs.mkdir(path.join(root,'scratch'),{recursive:true});
const out=await fs.mkdtemp(path.join(root,'scratch','responsiveness-'));
const before=execFileSync('git',['show',baseline+':analysis.js'],{cwd:root,encoding:'utf8',windowsHide:true,maxBuffer:5e6});
const after=await fs.readFile(path.join(root,'analysis.js'),'utf8');
const css=await fs.readFile(path.join(root,'styles.css'));
const corpus=await fs.readFile(path.join(root,'tools/calibration/public/dataset.json.gz'));
const game=JSON.parse(gunzipSync(corpus)).find(g=>g.id==='UWiKRSdj');
const chess=new Chess();for(const u of game.moves)chess.move({from:u.slice(0,2),to:u.slice(2,4),promotion:u[4]});
const pgn=chess.pgn(),hash=s=>createHash('sha256').update(s).digest('hex');
const profiled=['paintBoard','renderEvalBar','renderPlayers','renderControls','renderReview','renderMoves','renderGraph','renderEngineCurrent','renderEngine','fitEnginePanel','highlightCurrentMove','renderBestArrow','renderSelection'];
const profiling='\nexport function auditProfile(){const times={};'+profiled.map(name=>`{const previous=${name};${name}=function(...args){const start=performance.now();try{return previous(...args);}finally{const row=times.${name}||={calls:0,ms:0};row.calls++;row.ms+=performance.now()-start;}};}`).join('')+'return times;}\n';
const exports='\nexport {S,UI,buildPositions,computeDerived,buildUI,renderAll,renderGraph,renderPlayers,renderLibrary,renderEngine,go,loadBook,loadCalibration};\n'+profiling;
const server=http.createServer(async(req,res)=>{try{
  const url=new URL(req.url,'http://local'),name=decodeURIComponent(url.pathname.slice(1));
  const types={'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2'};
  res.setHeader('Content-Type',types[path.extname(name)] || 'application/octet-stream');
  if(name==='audit.html'){res.end('<!doctype html><html data-theme="dark" data-density="compact"><link rel="stylesheet" href="/styles.css"><div id="root"></div><div id="error" hidden></div></html>');return;}
  if(name==='styles.css'){res.end(css);return;}
  if(name==='browser-compat.js'){res.end(`const values={};export const browserAPI={runtime:{getURL:p=>'/'+p},storage:{local:{async get(k){return {[k]:values[k]}},async set(v){Object.assign(values,v)},async remove(){}}}};`);return;}
  if(name==='audit-analysis.js'){const source=url.searchParams.get('policy')==='baseline'?before:after;res.end(source.slice(0,source.indexOf('(async function main()'))+exports);return;}
  const target=path.resolve(root,name);if(!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  res.end(await fs.readFile(target));
}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const profile=await fs.mkdtemp(path.join(out,'profile-'));
const chrome=spawn(process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',[
  '--headless=new','--no-first-run','--no-default-browser-check','--disable-background-networking','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let ws;
const results={baseline,hashes:{before:hash(before),after:hash(after),corpus:hash(corpus)},game:game.id,plies:game.moves.length,trials:[],exceptions:[]};
try{
  let info;for(let i=0;i<100;i++){try{info=await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8');break;}catch{await sleep(100);}}
  if(!info)throw Error('Chrome did not start');const [port,route]=info.trim().split(/\r?\n/);
  ws=new WebSocket(`ws://127.0.0.1:${port}${route}`);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
  let sequence=0;const pending=new Map();
  ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')results.exceptions.push(m.params.exceptionDetails);
    if(pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}};
  const call=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const id=++sequence,timer=setTimeout(()=>{pending.delete(id);reject(Error(method+' timed out'));},30000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params,sessionId}));});
  const evaluate=async(sessionId,expression)=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  const invoke=async(sessionId,fn,...values)=>{const {result}=await call('Runtime.evaluate',{expression:'globalThis'},sessionId);try{
    const r=await call('Runtime.callFunctionOn',{objectId:result.objectId,functionDeclaration:fn.toString(),arguments:values.map(value=>({value})),awaitPromise:true,returnByValue:true},sessionId);
    if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;
  }finally{await call('Runtime.releaseObject',{objectId:result.objectId},sessionId);}};
  results.browser=await call('Browser.getVersion');
  for(const throttle of profileOnly?[4]:[1,4])for(let trial=0;trial<(profileOnly?1:3);trial++)for(const policy of profileOnly?['current']:trial%2?['current','baseline']:['baseline','current']){
    const {targetId}=await call('Target.createTarget',{url:origin+'/audit.html'}),{sessionId}=await call('Target.attachToTarget',{targetId,flatten:true});
    await call('Runtime.enable',{},sessionId);await call('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false},sessionId);
    await call('Emulation.setCPUThrottlingRate',{rate:throttle},sessionId);
    for(let i=0;i<100;i++){if(await evaluate(sessionId,'!!document.querySelector("#root")'))break;await sleep(50);}
    await evaluate(sessionId,`(async()=>{window.m=await import('/audit-analysis.js?policy=${policy}');await m.loadCalibration();await m.loadBook();})()`);
    await invoke(sessionId,function(pgn){const S=m.S;S.pgn=pgn;S.positions=m.buildPositions(pgn);S.total=S.positions.length-1;S.players={w:{name:'White'},b:{name:'Black'}};
      S.evals=S.positions.map(()=>({cp:0}));S.bests=S.positions.map((p,i)=>({score:{cp:0},bestmove:S.positions[i+1]?S.positions[i+1].from+S.positions[i+1].to:'a1a1',lines:[{score:{cp:0},pv:'',depth:16,multipv:1,bound:'exact'}]}));
      S._sacCache=Array(S.total+1).fill(false);S._forcedCache=Array(S.total+1).fill(false);S.searchPreviews=Array(S.total+1).fill(null);
      Object.assign(S.settings,{coach:'',sound:false,moveAnim:false,showThreat:false,engineLines:1});S.analyzing=false;S.progress=S.total;
      window.workerStarts=0;window.Worker=class{constructor(){workerStarts++;throw Error('Engine work is excluded from UI timing');}};
      m.computeDerived();m.buildUI();m.renderAll();
      S.library=Array.from({length:300},(_,i)=>({id:'fixture-'+i,opName:'Opponent '+i,myAcc:80,result:'win',savedAt:i,type:'blitz',pgn,meta:{}}));m.renderLibrary();
    },pgn);
    const measured=await evaluate(sessionId,`(()=>{const median=a=>a.sort((a,b)=>a-b)[Math.floor(a.length/2)];
      const measure=(fn,count)=>{for(let i=0;i<count;i++)fn(i);const batches=[];for(let b=0;b<5;b++){const t=performance.now();for(let i=0;i<count;i++)fn(i);batches.push(performance.now()-t);}return median(batches);};
      const graph=m.UI.graph.querySelector('svg'),player=m.UI.playerTop.firstElementChild,card=m.UI.libList.firstElementChild;
      const graph100Ms=measure(()=>m.renderGraph(),100),players100Ms=measure(()=>m.renderPlayers(),100),library10Ms=measure(()=>m.renderLibrary(),10);
      const nav30Ms=measure(i=>m.go(i%20+1),30);return {graph100Ms,players100Ms,library10Ms,nav30Ms,
        graphRetained:graph===m.UI.graph.querySelector('svg'),playerRetained:player===m.UI.playerTop.firstElementChild,cardRetained:card===m.UI.libList.firstElementChild,workerStarts};})()`);
    assert.equal(measured.workerStarts,0);if(policy==='current')assert.ok(measured.graphRetained&&measured.playerRetained&&measured.cardRetained);
    // Native arrow-key input still drives the retained graph and board.
    const idx=await evaluate(sessionId,'m.S.idx');await call('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight'},sessionId);
    await call('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight'},sessionId);assert.equal(await evaluate(sessionId,'m.S.idx'),idx+1);
    const profile=profileOnly?await evaluate(sessionId,'(()=>{const times=m.auditProfile();for(let i=0;i<30;i++)m.go(i%20+1);return times;})()'):null;
    results.trials.push({throttle,trial,policy,...measured,...(profile?{profile}:{})});await call('Target.closeTarget',{targetId});
  }
  assert.equal(results.exceptions.length,0);await fs.writeFile(path.join(out,'results.json'),JSON.stringify(results,null,2)+'\n');
  const median=a=>a.sort((a,b)=>a-b)[Math.floor(a.length/2)];const summary=[];
  for(const throttle of [1,4])for(const policy of ['baseline','current']){const rows=results.trials.filter(r=>r.throttle===throttle&&r.policy===policy);if(rows.length)summary.push({throttle,policy,...Object.fromEntries(['nav30Ms','graph100Ms','players100Ms','library10Ms'].map(k=>[k,median(rows.map(r=>r[k]))]))});}
  console.log(JSON.stringify({out,summary,...(profileOnly?{profile:results.trials[0].profile}:{}),exceptions:results.exceptions.length},null,2));
}finally{ws?.close();chrome.kill();server.closeAllConnections();server.close();}
