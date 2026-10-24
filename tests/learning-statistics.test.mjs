import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeProgress, recordPuzzle} from '../lib/learning/progress.js';
import {puzzleStatistics} from '../lib/learning/statistics.js';
import {THEME_NAMES} from '../lib/learning/content.js';

const puzzles=[{id:'a',themes:['fork','pin','fork']},{id:'b',themes:['mateIn1']},{id:'c',themes:['sacrifice']}];
test('statistics count clean attempts separately from mistakes, help and skips, including repeats',()=>{
  const progress=normalizeProgress(null);
  recordPuzzle(progress,'a',{completed:true});
  recordPuzzle(progress,'a',{completed:true,mistakes:4});
  recordPuzzle(progress,'a',{completed:true,assisted:true});
  recordPuzzle(progress,'a',{completed:false,skipped:true});
  recordPuzzle(progress,'a',{completed:true});
  for(let i=0;i<3;i++)recordPuzzle(progress,'b',{completed:true});
  recordPuzzle(progress,'c',{completed:true});
  recordPuzzle(progress,'no-longer-in-library',{completed:true});
  const stats=puzzleStatistics(progress,puzzles);
  assert.equal(stats.attempts,9);assert.equal(stats.clean,6);assert.equal(stats.needsWork,3);
  assert.equal(stats.rate,6/9);
  const fork=stats.types.find(type=>type.theme==='fork');
  assert.deepEqual(fork,{theme:'fork',name:'Forks',attempts:5,clean:2,needsWork:3,rate:.4});
  assert.equal(stats.types.find(type=>type.theme==='pin').attempts,5,'multi-theme puzzles count once per type');
  assert.equal(stats.weakest.theme,'fork');assert.equal(stats.strongest.theme,'mateIn1');
  assert.deepEqual(stats.types.filter(type=>type.rate!==null).map(type=>type.theme),['mateIn1','sacrifice','fork','pin']);
  assert.equal(stats.types.at(-1).rate,null);
});

test('statistics have honest empty and small-sample states and do not invent opposing patterns for ties',()=>{
  const progress=normalizeProgress(null),empty=puzzleStatistics(progress,puzzles);
  assert.equal(empty.rate,null);assert.equal(empty.types.length,Object.keys(THEME_NAMES).length);
  assert.equal(empty.weakest,null);assert.equal(empty.strongest,null);
  recordPuzzle(progress,'a',{completed:false,skipped:true});
  recordPuzzle(progress,'b',{completed:true});
  let stats=puzzleStatistics(progress,puzzles);
  assert.equal(stats.weakest,null);assert.equal(stats.strongest,null);
  for(let i=0;i<2;i++)recordPuzzle(progress,'a',{completed:false,skipped:true});
  stats=puzzleStatistics(progress,puzzles);
  assert.equal(stats.weakest.theme,'fork');assert.equal(stats.strongest,null);
  for(let i=0;i<3;i++)recordPuzzle(progress,'a',{completed:true});
  for(let i=0;i<2;i++)recordPuzzle(progress,'b',{completed:false,skipped:true});
  recordPuzzle(progress,'b',{completed:true});
  stats=puzzleStatistics(progress,puzzles);
  assert.equal(stats.weakest.rate,.5);assert.equal(stats.strongest,null);
});
