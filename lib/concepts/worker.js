import {analyzeConcepts} from './analyze.js';
import {startConceptRun, runConceptStage, supplementalConcepts, conceptRunSummary, DETECTORS} from './runtime.js';
const provenance = fetch(new URL('./integration-provenance.json', import.meta.url)).then(async response => {
  if (!response.ok) throw Error('Concept scope registry unavailable');
  return response.json();
});
self.onmessage = async ({data: {key, input}}) => {
  const started = performance.now();
  let facts;
  const send = (phase, result) => self.postMessage({key, phase, result: {...result, timeMs:performance.now()-started}});
  try {
    const p = await provenance;
    facts = analyzeConcepts(input, p.verified, false);
    send('facts', facts);
    const job = startConceptRun(input, p);
    let lastPublished = 0;
    const checkpoint = phase => {
      // Batch fast stages to avoid repeatedly traversing proofs and rebuilding
      // the selected panel. Long stages still renew the existing watchdog.
      const now = performance.now();
      if (phase === 'progress' && now - lastPublished < 125) return;
      lastPublished = now;
      const summary = conceptRunSummary(job);
      for (const f of facts.findings) if (!summary.findings.some(old=>old.name===f.name&&old.text===f.text)) summary.findings.push(f);
      send(phase, summary);
    };
    checkpoint('progress');
    for (const detector of DETECTORS) {
      // Give disable/cancel/new-job messages an event-loop boundary between stages.
      await new Promise(resolve=>setTimeout(resolve,0));
      runConceptStage(job, detector);
      checkpoint('progress');
    }
    supplementalConcepts(job);
    checkpoint('complete');
  } catch (error) { send('complete', {...facts, findings:facts?.findings||[], issues:facts?.issues||[], unavailable:facts?.unavailable||[], errors:[error.message]}); }
};
