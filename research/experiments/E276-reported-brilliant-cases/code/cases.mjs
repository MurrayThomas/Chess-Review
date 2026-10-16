import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {Chess} from '../../../../lib/chess.js';
export const prefix='research/experiments/E276-reported-brilliant-cases/';
export const hash=b=>createHash('sha256').update(b).digest('hex');
export async function loadCases(){
  const bytes=await readFile(prefix+'evidence/cases.json'),input=JSON.parse(bytes);
  assert.equal(input.schema,'E276-user-reported-cases-v1');
  assert.equal(input.authorization.date,'2026-10-16');
  assert.equal(input.authorization.publicDatasetEligible,false);
  assert.equal(input.images.length,2);assert.deepEqual(input.cases.map(c=>c.id),['A','B']);
  const images=[];
  for(const image of input.images){assert.ok(image.file.startsWith(prefix+'evidence/case-')&&!image.file.includes('..'));
    const b=await readFile(image.file);assert.equal(hash(b),image.sha256);assert.equal(b.length,image.bytes);images.push({file:image.file,sha256:image.sha256});}
  for(const c of input.cases){assert.ok(images.some(i=>i.file===c.image));
    const chess=new Chess(c.before);assert.equal(chess.turn(),'b');
    const move=chess.move({from:c.uci.slice(0,2),to:c.uci.slice(2,4)});assert.equal(move.after,c.after);
    if(c.visiblePrior){const prior=new Chess(c.visiblePrior);prior.move({from:c.visiblePrecedingMove.slice(0,2),to:c.visiblePrecedingMove.slice(2,4)});assert.equal(prior.fen(),c.before);}
    if(c.inferredPgn){const whole=new Chess();whole.loadPgn(c.inferredPgn);assert.equal(whole.fen(),c.after);}
  }
  return {input,receipt:{schema:'E276-specific-user-authorization-v1',caseFile:prefix+'evidence/cases.json',caseSha256:hash(bytes),images,
    authorizedUse:'User-directed diagnosis of exactly two supplied images; not public-data-v1 admission, population validation or training permission.',cases:2}};
}
