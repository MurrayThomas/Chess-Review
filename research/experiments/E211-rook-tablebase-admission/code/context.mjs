import {readFile} from 'node:fs/promises';
import {openResearchRookTablebases} from '../../../tablebase-rook-data-policy.mjs';
import {sha256} from '../../../data-policy.mjs';
import {dir} from './exports.mjs';
export const python='C:/Users/thoma/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
export async function context(executable=python){
 const data=await openResearchRookTablebases({purpose:'test'}),program=dir+'/code/probe.py',vendor='research/experiments/E141-admitted-kqk-tablebases/vendor',lock=JSON.parse(await readFile(vendor+'/dependency.json','utf8'));
 for(const [file,expected]of Object.entries(lock.files))if(sha256(await readFile(vendor+'/'+file))!==expected)throw Error('Changed vendored probe module');
 return{data,probeSource:{program,programSha256:sha256(await readFile(program)),vendorLockSha256:sha256(await readFile(vendor+'/dependency.json')),modules:lock.files,executable,executableSha256:sha256(await readFile(executable)),argv:[program]}};
}
