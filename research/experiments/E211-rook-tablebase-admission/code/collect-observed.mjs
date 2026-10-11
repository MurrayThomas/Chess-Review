import {spawnSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {sha256} from '../../../data-policy.mjs';
import {openResearchRookTablebaseSession} from '../../../tablebase-rook-data-policy.mjs';
import {legalPosition} from '../../E020-coach-concepts/code/concepts.mjs';
import {validateHistory} from '../../E024-transitions/code/transitions.mjs';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {exports,dir} from './exports.mjs';
import {material} from './collect.mjs';
const fields=(x,keys)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).every(k=>keys.includes(k));
export async function collectObservedRookPanel(input,options={},python){
 const session=await openResearchRookTablebaseSession({purpose:'test'}),game={receipt:session.receipt.gameGuardReceipt};plain([input,options]);if(!fields(input,['fen','history'])||typeof input.fen!=='string'||!fields(options,['maxProbes']))throw Error('Invalid rook panel interface');const max=options.maxProbes===undefined?128:options.maxProbes;if(!Number.isSafeInteger(max)||max<0||max>256)throw Error('maxProbes must be integer0..256');
 if(input.history!==undefined&&(!fields(input.history,['fen','moves'])||Object.keys(input.history).length!==2))throw Error('Invalid history fields');const h=validateHistory(input),c=legalPosition(h?.start||input.fen);for(const m of h?.moves||[])c.move(m);const [w,b]=material(c),names=exports.map(e=>e.material);if(!(names.includes(w+'v'+b)||names.includes(b+'v'+w)||w==='K'&&b==='K')||c.fen().split(' ')[2]!=='-'||c.fen().split(' ')[3]!=='-')throw Error('Unsupported T002 material/rights/EP');
 const required=1+c.moves().length,bundle={schema:'E211-observed-rook-panel-v2',status:'pending',maxProbes:max,requiredProbes:required,gameGuardReceipt:game.receipt,tablebaseReceipt:null,probeSource:null,rawStdout:null,rawStderr:null,panel:null,error:null,execution:null};if(required>max){bundle.status='preflight-budget-unavailable';return bundle;}
 const data=await session.readTables();bundle.tablebaseReceipt=data.receipt;const vendor='research/experiments/E141-admitted-kqk-tablebases/vendor',lock=JSON.parse(await readFile(vendor+'/dependency.json','utf8'));for(const [file,hash]of Object.entries(lock.files))if(sha256(await readFile(vendor+'/'+file))!==hash)throw Error('Changed probe dependency '+file);
 const program=dir+'/code/probe.py',executableSha256=sha256(await readFile(python));bundle.probeSource={program,programSha256:sha256(await readFile(program)),vendorLockSha256:sha256(await readFile(vendor+'/dependency.json')),modules:lock.files,executable:python,executableSha256,argv:[program]};
 try{const r=spawnSync(python,[program],{input:JSON.stringify({input:{fen:c.fen(),...(h?{history:{fen:h.start,moves:h.moves}}:{})},directory:data.directory,files:data.receipt.files}),encoding:'utf8',timeout:15000,maxBuffer:2*1024*1024,windowsHide:true,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});bundle.rawStdout=r.stdout??'';bundle.rawStderr=r.stderr??'';bundle.execution={exitCode:r.status,signal:r.signal,error:r.error?.message??null,timeoutMs:15000};if(r.status!==0||r.signal||r.error)throw Error(r.error?.message||'Probe process failed: '+r.status);const panel=JSON.parse(bundle.rawStdout);if(panel.positionProbes!==required||panel.positionProbes>max||panel.metadata.python.sha256!==executableSha256)throw Error('Probe ledger/runtime differs');bundle.panel=panel;bundle.status='complete';}
 catch(e){bundle.status='collection-error';bundle.error=e.message;bundle.panel=null;}
 return bundle;
}
