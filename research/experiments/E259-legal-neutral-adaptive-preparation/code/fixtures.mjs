import {Chess} from '../../../../lib/chess.js';
import {fixtures as originals} from '../../E258-adaptive-attack-preparation/code/fixtures.mjs';
function neutral(black){const c=new Chess();c.clear();for(const [s,type,color]of [['e6','k','w'],['f7','q','w'],['f5','n','w'],['a1','n','w'],['h1','r','w'],['h5','p','w'],['h7','k','b'],['g7','b','b']])c.put({type,color:black?(color==='w'?'b':'w'):color},black?s[0]+(9-Number(s[1])):s);const f=c.fen().split(' ');f[1]=black?'b':'w';f[2]='-';f[3]='-';f[4]='0';f[5]='1';const fen=f.join(' ');return {fen,history:{fen,moves:[]},attack:black?'f2g2':'f7g7',preparation:black?'a8b6':'a1b3'};}
export const fixtures=originals.map(f=>({...structuredClone(f),input:f.role==='neutral'?neutral(f.black):structuredClone(f.input)}));
