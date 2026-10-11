const integer=(s,signed=false)=>{if(typeof s!=='string'||!(signed?/^-?(0|[1-9][0-9]*)$/:/^(0|[1-9][0-9]*)$/).test(s)||!Number.isSafeInteger(+s))throw Error('Invalid diagnostic integer');return +s===0?0:+s;};
export function parseInfo(raw){
 const words=raw.trim().split(/\s+/);if(words.shift()!=='info')return{status:'unsupported',fields:null};
 const fields={};const numeric=['depth','seldepth','nodes','nps','time','hashfull','tbhits','multipv'];
 for(let i=0;i<words.length;){const k=words[i++];if(Object.hasOwn(fields,k))throw Error('Duplicate diagnostic field');
  if(numeric.includes(k)){fields[k]=integer(words[i++]);if(k==='hashfull'&&fields[k]>1000||k==='multipv'&&fields[k]<1)throw Error('Invalid diagnostic range');}
  else if(k==='score'){const unit=words[i++];if(!['cp','mate'].includes(unit))throw Error('Invalid score unit');fields.score={unit,value:integer(words[i++],true),bound:'exact'};}
  else if(k==='lowerbound'||k==='upperbound'){if(!fields.score||fields.score.bound!=='exact')throw Error('Invalid score bound');fields.score.bound=k==='lowerbound'?'lower':'upper';}
  else if(k==='wdl'){fields.wdl=[integer(words[i++]),integer(words[i++]),integer(words[i++])];if(fields.wdl.reduce((a,b)=>a+b,0)!==1000||fields.wdl.some(n=>n>1000))throw Error('Invalid reported WDL');}
  else if(k==='pv'){fields.pv=words.slice(i);if(!fields.pv.length||fields.pv.length>64||fields.pv.some(m=>!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(m)))throw Error('Invalid reported PV');break;}
  else return{status:k==='string'?'opaque-string':'unsupported',fields:null};
 }
 return{status:'parsed',fields};
}
