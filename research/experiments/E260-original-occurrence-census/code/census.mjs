import assert from 'node:assert/strict';
export function originalRows(text){
 let category=null;const rows=[];
 for(const line of text.replaceAll('\r\n','\n').split('\n')){
  if(/^\d+\. /.test(line))category=line.trim();
  if(line.startsWith('- ')){assert(category,'Original category missing');const text=line.slice(2).trim();rows.push({id:'C'+String(rows.length+1).padStart(4,'0'),category,text});}
 }return rows;
}
export function sourcePath(name){
 assert(typeof name==='string'&&name.length&&!/^[A-Za-z]:|^\//.test(name)&&!name.includes('\\')&&!name.split('/').some(x=>!x||x==='.'||x==='..'),'Unsafe source path');
 assert(!/^(research\/(runs|datasets)\/|tools\/calibration\/public\/)|\/evidence\//.test(name),'Non-source path');return name;
}
export function fingerprintDiff(expected,actual){
 for(const [name,hash]of Object.entries(expected)){sourcePath(name);assert(/^[a-f0-9]{64}$/.test(hash),'Malformed source hash');}
 return [...new Set([...Object.keys(expected),...Object.keys(actual)])].sort().flatMap(path=>expected[path]===actual[path]?[]:[{path,reason:!(path in expected)?'unrecorded-import':!(path in actual)?'missing':'changed'}]);
}
export function census({original,catalog,tracker,builds,supports,prerequisites}){
 const canonical=new Map();for(const row of tracker){assert(!canonical.has(row.id),'Duplicate tracker ID');canonical.set(row.id,row);}
 const indexed=new Map();for(const rec of catalog.records)for(const o of rec.occurrences){assert(!indexed.has(o.id),'Duplicate catalog ID');indexed.set(o.id,{...o,group:rec.id,phase:rec.proposedWork?.phase??null,rank:rec.proposedWork?.rank??null});}
 const originalIds=new Set(original.map(o=>o.id));assert.equal(originalIds.size,original.length,'Duplicate original ID');
 assert.equal(indexed.size,original.length,'Catalog occurrence loss');assert.equal(canonical.size,original.length,'Tracker occurrence loss');
 const supportById=new Map();for(const s of supports){
  assert.equal(s.schema,'coach-prerequisite-v1');assert.equal(s.coverageCredit,false,'Support cannot grant detector credit');
  assert(typeof s.implemented==='string'&&s.implemented.trim());assert(s.focusedChecks?.length&&s.deferredChecks?.length);assert(s.stage?.trim());
  const ids=s.supportedOccurrences.map(o=>o.id);assert.equal(new Set(ids).size,ids.length,'Duplicate support ID');assert.deepEqual([...ids].sort(),[...s.futureClaims].sort(),'Support claims mismatch');
  for(const o of s.supportedOccurrences){assert(originalIds.has(o.id),'Unknown support ID');assert(!supportById.has(o.id),'Support overlap');assert(o.scope?.trim()&&o.disposition?.trim());supportById.set(o.id,{experiment:s.experiment,stage:s.stage,scope:o.scope,disposition:o.disposition,name:o.name,category:o.category,sourceIssues:s.sourceIssues});}
 }
 const rows=original.map(o=>{
  const c=indexed.get(o.id),t=canonical.get(o.id);assert(c&&t,'Missing original ID');assert.equal(c.text,o.text,'Original wording changed');assert.equal(c.category,o.category,'Original category changed');assert.equal(c.name,t.name,'Tracker name changed');
  const candidates=builds.flatMap(b=>b.claims.filter(x=>x.id===o.id).map(x=>({experiment:b.experiment,stage:b.stage,scope:x.scope,changedInputs:b.changedInputs,focusedChecks:b.focusedChecks,deferredChecks:b.deferredChecks})));
  const support=supportById.get(o.id)??null,ready=candidates.some(x=>x.stage==='code-ready');
  if(support){assert.equal(support.name,c.name);assert.equal(support.category,c.category);assert(t.status!=='verified'&&!ready,'Support overlaps detector partition');}
  const disposition=t.status==='verified'?'accepted':ready?'provisional':support?'support':'prerequisite';
  const prerequisite=disposition==='prerequisite'?prerequisites[o.id]:null;
  if(disposition==='prerequisite'){assert.equal(c.phase,5,'Unexpected unbuilt nonstrategic occurrence');assert(prerequisite?.requirement&&prerequisite?.nextObservation&&prerequisite?.references?.length,'Unmapped prerequisite');}
  return {...o,name:c.name,group:c.group,phase:c.phase,rank:c.rank,acceptedScope:t.scope,acceptedStatus:t.status,disposition,candidates,support,prerequisite};
 });
 for(const id of Object.keys(prerequisites))assert(rows.some(r=>r.id===id&&r.disposition==='prerequisite'),'Extraneous prerequisite');
 const counts=Object.fromEntries(['accepted','provisional','support','prerequisite'].map(k=>[k,rows.filter(r=>r.disposition===k).length]));
 return {schema:'E260-occurrence-census-v1',wholeDefinitionCompletion:'not established by metadata',counts,rows};
}

