import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Chess} from '../../../../lib/chess.js';
import {sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {artifactHashes} from '../../E213-short-side-king-choice/code/admission.mjs';
import {checkObservedRookPanel} from '../../E211-rook-tablebase-admission/code/check-execution.mjs';
export async function parents(ctx){const out=[];for(const id of ['h2','reflection']){const path='research/experiments/E213-short-side-king-choice/evidence/'+id+'.json',bytes=await readFile(path);assert.equal(sha256(bytes),artifactHashes[id]);const raw=JSON.parse(bytes);assert.deepEqual(raw.inputHashes,await bindings(Object.keys(raw.inputHashes)));const view=checkObservedRookPanel(raw.input,raw.options,raw.bundle,ctx),roles={};for(const [role,move]of Object.entries(id==='h2'?{win:'f8e8',draw:'f8g8'}:{win:'f1e1',draw:'f1g1'})){const c=new Chess(raw.input.fen);c.move(move);const row=view.rows.find(r=>r.move===move);assert(row);assert.equal(c.fen(),row.fen);roles[role]={input:{fen:c.fen(),history:{fen:raw.input.history.fen,moves:[...raw.input.history.moves,move]},move:id==='h2'?'h2h6':'h7h3'},kingMove:move,rootWdl:row.wdl};}out.push({id,root:raw.input,rootView:view,roles,source:{path,sha256:artifactHashes[id]},inputHashes:raw.inputHashes});}return out;}
export function after(input){const c=new Chess(input.fen);c.move(input.move);return{fen:c.fen(),history:{fen:input.history.fen,moves:[...input.history.moves,input.move]}};}
