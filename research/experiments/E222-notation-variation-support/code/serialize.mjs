const escaped=s=>s.replaceAll('\\','\\\\').replaceAll('"','\\"');
const comment=s=>s.includes('}')?';'+s+'\n':'{'+s+'}';
export function serialize(doc){
 function line(l){const tokens=l.comments.map(comment);for(const m of l.moves){tokens.push(m.number+(m.side==='w'?'.':'...'),m.san);for(const a of m.annotations){if(a.type==='variation')tokens.push('(',...line(a.line),')');else tokens.push(a.type==='nag'?'$'+a.value:comment(a.value));}}return tokens;}
 const tokens=[...line(doc.line),doc.result];let body='',column=0;
 for(const t of tokens){const separator=!body||body.endsWith('\n')?'':column+1+t.length>80?'\n':' ';body+=separator+t;column=body.slice(body.lastIndexOf('\n')+1).length;}
 return doc.tags.map(t=>'['+t.name+' "'+escaped(t.value)+'"]').join('\n')+'\n\n'+body+'\n';
}
