import {fixtures as old} from '../../E190-liquidation-commitment/code/fixtures.mjs';
export const fresh=[old[0],old[5],old[10]].map(f=>({id:f.id,input:f.input}));
export const fixtures=old.map((f,n)=>({...f,withDelay:[0,5,10].includes(n),expected:f.id.startsWith('immediate-')||f.id.startsWith('visited-')?[]:[0,5,10].includes(n)?['C0917','C1081']:['C0917']}));
fixtures.push(...[0,5,10].map(n=>({...fixtures[n],id:'missing-delay-'+fixtures[n].id,withDelay:false,expected:['C0917']})));
