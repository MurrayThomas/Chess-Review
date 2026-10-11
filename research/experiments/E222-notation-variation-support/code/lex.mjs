// Tokens retain annotation/comment content. Escape lines are deliberately omitted.
export function lex(pgn){
 const text=pgn.replaceAll('\r\n','\n').replaceAll('\r','\n'),tokens=[];let i=0;
 while(i<text.length){
  const ch=text[i];if(/\s/.test(ch)){i++;continue;}
  if(ch==='%'&&(i===0||text[i-1]==='\n')){while(i<text.length&&text[i]!=='\n')i++;continue;}
  if(ch==='{'){const j=text.indexOf('}',i+1);if(j<0)throw Error('Unclosed comment');tokens.push({type:'comment',value:text.slice(i+1,j)});i=j+1;continue;}
  if(ch===';'){let j=text.indexOf('\n',i);if(j<0)j=text.length;tokens.push({type:'comment',value:text.slice(i+1,j)});i=j;continue;}
  if(ch==='['){
   const match=/^\[([A-Za-z0-9_]+)\s+"((?:[^"\\\n]|\\["\\])*)"\s*\]/.exec(text.slice(i));
   if(!match)throw Error('Malformed tag pair');tokens.push({type:'tag',name:match[1],value:match[2].replace(/\\(["\\])/g,'$1')});i+=match[0].length;continue;
  }
  if(ch==='('||ch===')'){tokens.push({type:ch});i++;continue;}
  const rest=text.slice(i),end=/^(1\/2-1\/2|1-0|0-1|\*)/.exec(rest);
  if(end){tokens.push({type:'result',value:end[1]});i+=end[0].length;continue;}
  const nag=/^\$([0-9]+)/.exec(rest);if(nag){const value=+nag[1];if(value>255)throw Error('Invalid NAG');tokens.push({type:'nag',value});i+=nag[0].length;continue;}
  const number=/^([1-9][0-9]*)(\.{1,3})/.exec(rest);if(number){if(![1,3].includes(number[2].length)||!Number.isSafeInteger(+number[1]))throw Error('Invalid move number');tokens.push({type:'number',value:+number[1],side:number[2].length===1?'w':'b'});i+=number[0].length;continue;}
  const symbol=/^[A-Za-z0-9+#=!?-]+/.exec(rest);if(!symbol)throw Error('Unsupported PGN token at '+i);tokens.push({type:'move',value:symbol[0]});i+=symbol[0].length;
 }
 return tokens;
}
