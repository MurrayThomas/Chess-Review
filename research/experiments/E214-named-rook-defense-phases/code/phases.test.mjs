import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Chess} from '../../../../lib/chess.js';
import {readFen} from '../../FRIEND-shared/lib.mjs';
import {retained,decodeRetained} from './retained.mjs';
import {phaseContrast} from './geometry.mjs';
const dir='research/experiments/E214-named-rook-defense-phases',{rows}=await retained(),by=id=>rows.find(r=>r.id===id);
test('Philidor waiting barrier covers all three king-entry squares with drawing same-rook alternatives',()=>{
 const r=by('philidor-barrier'),q=phaseContrast(r.input,r.view,r.phase);assert.equal(q.passes,true);assert.deepEqual(q.resources,['a6b6','a6g6']);assert.deepEqual(q.alternatives,['a6a7','a6a8']);assert.equal(r.view.root.wdl,0);
 for(const move of q.resources){const row=r.view.rows.find(r=>r.move===move),{board}=readFen(row.fen),origin=move.slice(2,4);assert.equal(board[origin],'r');assert.equal(row.wdl,0);for(const target of ['c6','d6','e6']){assert.equal(target[1],origin[1]);for(let f=Math.min(target.charCodeAt(0),origin.charCodeAt(0))+1;f<Math.max(target.charCodeAt(0),origin.charCodeAt(0));f++)assert.equal(board[String.fromCharCode(f)+'6'],undefined);}}
});
test('actual Philidor pawn-advance history retained with drawing retreat but absent registered nonhanging sixth-rank loss',()=>{
 const r=by('philidor-retreat'),c=new Chess(r.input.history.fen);assert.deepEqual(r.input.history.moves,['a6b6','e5e6']);for(const move of r.input.history.moves)c.move(move);assert.equal(c.fen(),r.input.fen);assert.equal(c.get('e6').type,'p');assert.equal(c.fen().split(' ')[4],'0');const q=phaseContrast(r.input,r.view,r.phase);assert.equal(q.passes,false);assert.equal(q.geometry.recordedAdvance,true);assert.deepEqual(q.resources,['b6b1']);assert.deepEqual(q.alternatives,[]);
 for(const row of r.view.rows){const before=new Chess(r.input.fen),m=before.move(row.move);if(m.piece==='r'&&!m.captured&&m.to[1]==='6'&&!before.isCheck()&&row.rootActorWdl===-2)assert.ok(before.moves({verbose:true}).some(reply=>reply.to===m.to&&reply.captured==='r'));}
 assert.equal(r.view.rows.find(r=>r.move==='b6b7').rootActorWdl,-2);assert.equal(r.view.rows.find(r=>r.move==='b6b8').rootActorWdl,-2);
});
test('Vancura pressure root needs immediate lateral check rather than quiet sixth-rank waiting',()=>{
 const r=by('vancura-pressure'),q=phaseContrast(r.input,r.view,r.phase);assert.equal(r.view.root.wdl,0);assert.equal(q.passes,false);assert.deepEqual(q.resources,[]);assert.deepEqual(r.view.rows.filter(r=>r.rootActorWdl===0).map(r=>r.move),['f6f5']);const row=r.view.rows.find(r=>r.move==='f6f5'),c=new Chess(row.fen),{board}=readFen(row.fen);assert.equal(c.isCheck(),true);assert.equal(board.a5,'K');assert.equal(board.f5,'r');for(const s of ['b5','c5','d5','e5'])assert.equal(board[s],undefined);assert.ok(q.alternatives.length>0);
});
test('registered family stop rules retained no reflection or unregistered continuation',async()=>{
 const d=JSON.parse(await readFile(dir+'/evidence/decisions.json','utf8'));assert.deepEqual(d.decisions.map(d=>d.id),['philidor-barrier','philidor-retreat','vancura-pressure']);assert.deepEqual(d.families,{philidor:false,vancura:false});assert.equal(d.stoppedForCost,false);assert.ok(d.decisions.every(d=>d.costPass));
});
test('complete actual process outputs and all legal successors stay within source and cost limits',()=>{
 assert.equal(rows.reduce((sum,r)=>sum+r.bundle.requiredProbes,0),54);for(const r of rows){assert.ok(r.seconds<=3);assert.equal(r.view.rows.length,new Chess(r.input.fen).moves().length);assert.equal(r.bundle.panel.positionProbes,1+r.view.rows.length);assert.deepEqual(r.bundle.execution,{exitCode:0,signal:null,error:null,timeoutMs:15000});assert.equal(r.bundle.rawStderr,'');assert.deepEqual(JSON.parse(r.bundle.rawStdout),r.bundle.panel);for(const row of r.view.rows)assert.equal(row.rootActorWdl,row.wdl===0?0:-row.wdl);}
});
test('fixed retained bytes reject alterations before trusting in-range WDL or unknown artifact identity',async()=>{
 const id='vancura-pressure',bytes=await readFile(dir+'/evidence/'+id+'.json'),r=decodeRetained(id,bytes);r.bundle.panel.root.wdl=2;r.bundle.rawStdout=JSON.stringify(r.bundle.panel);assert.throws(()=>decodeRetained(id,Buffer.from(JSON.stringify(r))));assert.throws(()=>decodeRetained('unregistered',bytes));
});
