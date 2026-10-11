import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {validate as risk} from '../../E238-declared-worst-case-risk/code/contract.mjs';
import {validate as policy} from '../../E235-two-result-policy/code/contract.mjs';
const obj=x=>x&&typeof x==='object'&&!Array.isArray(x);
export const completionPolicy=(input,history)=>({...input.policy,history});
export function validate(input,options){plain([input,options]);if(!obj(input)||Object.keys(input).sort().join(',')!==['id','source','policy',...(input?.model===undefined?[]:['model']),...(input?.completions===undefined?[]:['completions'])].sort().join(','))throw Error('Invalid uncertainty input');risk({id:input.id,source:input.source,actual:input.policy,reference:input.policy,...(input.model===undefined?{}:{model:input.model})},{});if(input.completions!==undefined){if(!Array.isArray(input.completions)||input.completions.length!==2)throw Error('Two history completions required');for(const h of input.completions)policy(completionPolicy(input,h),{});}
 if(!obj(options)||Object.keys(options).some(k=>!['enabled','maxWork'].includes(k)))throw Error('Invalid controls');const enabled=options.enabled===undefined?false:options.enabled,maxWork=options.maxWork===undefined?100000:options.maxWork;if(typeof enabled!=='boolean'||!Number.isSafeInteger(maxWork)||maxWork<0||maxWork>100000)throw Error('Invalid limits');return{enabled,maxWork};}
export const empty=o=>({schema:'E239-history-risk-uncertainty',status:'disabled',reason:null,work:0,limits:{maxWork:o.maxWork},claims:{C0802:false},context:null});
