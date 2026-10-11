import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {sha256} from '../../../data-policy.mjs';
export async function auditTestRepair(revision){assert.match(revision,/^[a-f0-9]{40}$/);const path='research/experiments/E250-active-king-positional-contrast/code/positional.test.mjs',old=execFileSync('git',['show',revision+':'+path],{encoding:'utf8',windowsHide:true}).replace(/\r\n/g,'\n'),now=(await readFile(path,'utf8')).replace(/\r\n/g,'\n'),a='with ONLY front rook block drawing',b='with ONLY seventh-rank rook defense drawing',c="x.id==='h2'?'a8f8':'a1f1'",d="x.id==='h2'?'a8a7':'a1a2'";assert.equal(old.split(a).length,2);assert.equal(old.split(c).length,2);assert.equal(old.replace(a,b).replace(c,d),now);return{revision,path,oldSha256:sha256(old),currentSha256:sha256(now),changedCheck:'matched same-material control stays drawn',otherSevenCheckBodiesUnchanged:true};}
