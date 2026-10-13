import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {CONCEPT_GROUPS} from '../lib/concepts/controls.js';
import {DETECTORS} from '../lib/concepts/entries.js';
import {CONCEPT_LABELS} from '../lib/concepts/registry.js';
const detectorFiles=new Set(DETECTORS.map(d=>d.file));
const rules=new Set('capture check checkmate stalemate castling en-passant promotion double-check discovered-check'.split(' '));
const items=new Map();
for(const file of readdirSync('lib/concepts/detectors').filter(f=>f.endsWith('.mjs')&&!f.includes('witness')&&!f.includes('assert'))){
const text=readFileSync('lib/concepts/detectors/'+file,'utf8'),study=file.match(/^(E\d+|FRIEND-\d+)/)?.[1];
if(!detectorFiles.has(file)&&!(Number(study?.slice(1))>=20&&Number(study?.slice(1))<=80))continue;
const staged=CONCEPT_GROUPS.find(g=>g.studies.includes(study));
const flags=CONCEPT_GROUPS.flatMap(g=>g.flags).filter(flag=>text.includes(flag));
const group=staged||CONCEPT_GROUPS.find(g=>g.flags.some(f=>flags.includes(f)))||CONCEPT_GROUPS.find(g=>g.id===(file.startsWith('E035')?'history':'features'));
const ids = new Set([...text.matchAll(/(?:\b(?:add|event)\(\s*|\bid\s*:\s*|\bcase\s*)['"]([a-z][a-z0-9]+(?:-[a-z0-9]+)*)['"]/g)].map(match=>match[1]));
for(const id of Object.keys(CONCEPT_LABELS))if(text.includes("'"+id+"'")||text.includes('"'+id+'"'))ids.add(id);
const dynamic={E083:['queenside-attack-contact','kingside-attack-contact','central-attack-contact','dark-square-contact','light-square-contact','queenside-pawn-expansion','kingside-pawn-expansion','central-pawn-expansion'],E090:['recorded-open-game','recorded-semi-open-game','recorded-closed-game','recorded-semi-closed-game']};
for(const id of dynamic[study]||[])ids.add(id);
for(const id of ids){if(rules.has(id))continue;
const legacyOwners={E026:'tactics',E029:'tactics',E030:'tactics',E031:'tactics',E032:'history',E033:'tactics',E035:'history',E036:'endgames',E038:'endgames',E039:'endgames',E040:'tactics',E041:'tactics',E042:'tactics'};
const legacyGroup=!staged&&!flags.length?(legacyOwners[study]||(id.includes('pawn')||id.includes('passer')||id.includes('tension')?'pawns':/fork|skewer|sacrifice|profitable|hanging|gain|trap/.test(id)?'tactics':file.startsWith('E035')?'history':group.id)):group.id;
const item=items.get(id)||{id,name:CONCEPT_LABELS[id]||id.replaceAll('-',' ').replace(/^./,c=>c.toUpperCase()),group:legacyGroup,cost:CONCEPT_GROUPS.find(g=>g.id===legacyGroup).cost,studies:[],flags:[]};
if(staged&&!item.studies.includes(study))item.studies.push(study);
for(const flag of flags)if(!item.flags.includes(flag))item.flags.push(flag);
items.set(id,item);
}}
for(const [id,name] of [['next-knight-fork','Next knight jump: fork pattern'],['unplayed-knight-fork','Available knight fork not played'],['immediate-capture-gain','Captured material through immediate replies'],['immediate-capture-loss','Offered material through immediate replies'],['immediate-pawn-offer','Unprotected pawn offer without immediate recapture'],['opening-pawn-preparation','Opening pawn preparation'],['development-exchange-contact','Development versus an equal exchange']])items.set(id,{id,name,group:id.startsWith('opening')||id.startsWith('development')?'features':'immediate',cost:id.includes('capture')?'Moderate':'Fast',studies:['P006'],flags:[]});
for(const [study,ids] of Object.entries({E199:['undefended-unit-observation','supported-knight-square','conditional-central-pawn-contacts'],E200:['recorded-move-changes'],E201:['current-checks-captures','current-mate-in-one'],E209:['hypothetical-opponent-mate'],E237:['one-ply-conversion-deadline'],E189:['bounded-mating-decisions'],E202:['current-bounded-mating-resource','conditional-reply-mating-risks'],E206:['bounded-king-vulnerability']})){
 const group=CONCEPT_GROUPS.find(g=>g.studies.includes(study));
 for(const id of ids)if(!items.has(id))items.set(id,{id,name:CONCEPT_LABELS[id]||id.replaceAll('-',' ').replace(/^./,c=>c.toUpperCase()),group:group.id,cost:group.cost,studies:[study],flags:[]});
}
const runtime=readFileSync('lib/concepts/runtime.js','utf8');
for(const match of runtime.matchAll(/add\(\s*['"]([a-z][a-z0-9-]+)['"],[^;]*?['"](E\d+)['"],/g)){
 const [,id,study]=match,group=CONCEPT_GROUPS.find(g=>g.studies.includes(study));
 if(group&&!items.has(id))items.set(id,{id,name:CONCEPT_LABELS[id]||id.replaceAll('-',' ').replace(/^./,c=>c.toUpperCase()),group:group.id,cost:group.cost,studies:[study],flags:[]});
}
for(const item of items.values()){
 // Basic development and draw facts belong to the core checks even when the
 // optional historical route/response-tempo proof group is switched off.
 if(['minor-development','minor-development-complete','development-check'].includes(item.id)){item.group='features';item.cost='Fast';}
 if(['repetition-claim','fifty-move-claim','draw-position'].includes(item.id)||(item.group==='features'&&/mate|stalemate/.test(item.id))){item.group='immediate';item.cost='Moderate';}
}
const catalog=[...items.values()].sort((a,b)=>CONCEPT_GROUPS.findIndex(g=>g.id===a.group)-CONCEPT_GROUPS.findIndex(g=>g.id===b.group)||a.name.localeCompare(b.name));
const output = '// Runtime finding controls. Generated from literal emitted events and scope labels.\n// Shared scans may remain necessary for other enabled findings; these are not acceptance claims.\nexport const CONCEPT_ITEMS = '+'[\n'+catalog.map(item=>'  '+JSON.stringify(item)).join(',\n')+'\n]'+';\n';
if(process.argv.includes('--check')){
 if(readFileSync('lib/concepts/catalog.js','utf8').replaceAll('\r\n','\n')!==output)throw Error('Concept controls are stale; run node scripts/build-concept-controls.mjs');
}else writeFileSync('lib/concepts/catalog.js',output);
console.log(catalog.length+' routed finding controls '+(process.argv.includes('--check')?'verified':'generated'));
