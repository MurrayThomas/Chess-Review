import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.chrome ||= {};
const {findGameById}=await import('../chesscom.js');
const {setCachedMonth}=await import('../gamecache.js');
function setup(){
  const data={};chrome.storage={local:{async get(key){return {[key]:structuredClone(data[key])};},async set(values){Object.assign(data,structuredClone(values));},async remove(keys){for(const key of keys)delete data[key];}}};
  const now=new Date(),prefix='https://api.chess.com/pub/player/player/games/',current=prefix+now.getUTCFullYear()+'/'+String(now.getUTCMonth()+1).padStart(2,'0'),p=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()-1,1)),previous=prefix+p.getUTCFullYear()+'/'+String(p.getUTCMonth()+1).padStart(2,'0');
  return {data,current,previous,game:{url:'https://www.chess.com/game/live/12345678',pgn:'1. e4 e5'}};
}
test('cached previous-month game is available with no network requests',async t=>{
  const {previous,game}=setup();await setCachedMonth(previous,[game]);t.mock.method(globalThis,'fetch',async()=>{throw Error('Unexpected network');});
  assert.deepEqual(await findGameById('player','12345678'),game);
});
test('a failed current month cannot hide a successful previous-month lookup',async t=>{
  const {current,previous,game}=setup(),requests=[];t.mock.method(globalThis,'fetch',async url=>{requests.push(url);if(url===current)throw Error('Offline current archive');assert.equal(url,previous);return {ok:true,json:async()=>({games:[game]})};});
  assert.deepEqual(await findGameById('player','12345678'),game);assert.deepEqual(requests,[current,previous]);
});
test('incomplete network search reports its cause instead of a confirmed absence',async t=>{
  const {current}=setup();t.mock.method(globalThis,'fetch',async url=>{if(url===current)throw Error('Offline archive');return {ok:true,json:async()=>({games:[],archives:[]})};});
  await assert.rejects(findGameById('player','12345678'),/Offline archive/);
});
