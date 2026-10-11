import {Chess} from '../../../../lib/chess.js';
export function cases(){return [['a3-e5','a2a3','e7e5'],['h3-d5','h2h3','d7d5']].map(([id,white,move])=>{const c=new Chess();c.move(white);return{id,input:{fen:c.fen(),history:{fen:new Chess().fen(),moves:[white]},move},alternative:'a7a6'};});}
export const engineFixture=input=>({...input,enginePanelTags:true,maxEnginePanelSearches:256,scanReplies:false});
