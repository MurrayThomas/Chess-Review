import {legalPosition} from '../../E020-coach-concepts/code/concepts.mjs';
import {inspectTablebaseSupport} from '../../E228-saved-tablebase-support/code/support.mjs';
import {validate,occurrenceIds} from './contract.mjs';
export {occurrenceIds};
export {openSavedTablebaseSupport} from '../../E228-saved-tablebase-support/code/admission.mjs';
export function inspectEndgameAssessment(input,options={},token=null){
 const limits=validate(input,options),out={schema:'E230-declared-endgame-assessment',coverageCredit:false,qualityClaim:false,limits,status:'disabled',reason:null,context:null,witness:null};if(!options.enabled)return out;
 const a=input.assessment,fen=legalPosition(input.query.query.fen).fen();if(a.fen!==fen)throw Error('Assessment frame differs from exact canonical query FEN');if(limits.maxRecords===0){out.status='budget-unavailable';out.reason='combined-record-budget';return out;}
 const tablebase=inspectTablebaseSupport(input.query,{enabled:true,player:a.player,maxRecords:Math.min(256,limits.maxRecords-1),maxHistoryPlies:limits.maxHistoryPlies},token);if(tablebase.status==='budget-unavailable'){out.status='budget-unavailable';out.reason='tablebase-or-history-budget';return out;}
 out.context={assessment:structuredClone(a),tablebase,queryValidated:!!tablebase.view,assessmentAuthentication:'caller-report-only',actualGameAssessmentAvailable:false,usage:{records:1+(tablebase.view?.usage.records??0),historyPlies:tablebase.view?.usage.historyPlies??0},freshProbes:0};
 if(tablebase.status!=='support-observations'){out.status='unavailable';out.reason=tablebase.status;return out;}
 if(a.model!=='WDL50-zero-counter'){out.status='unavailable';out.reason='actual-game-outcome-not-established';return out;}
 const v=tablebase.view,o=v.observation,observed=o.root.forPlayer;if(a.category===observed.category){out.status='agreement';out.reason='reported-category-matches-admitted-model';return out;}
 out.status='contradiction';out.reason='declared-category-differs';out.witness={id:'C0877',kind:'declared-endgame-assessment-contradiction',assessmentId:a.id,assessmentSource:a.source,assessmentEventId:a.eventId,queryFen:fen,sourceFen:o.sourceRootFen,player:a.player,declared:{model:a.model,category:a.category},observed:structuredClone(observed),sourceReference:{dataset:v.admittedSource.dataset,archivePath:v.admittedSource.archivePath,archiveSha256:v.admittedSource.archiveSha256,panelId:o.sourcePanelId},assessmentAuthentication:'caller-report-only',mentalStateClaim:false,causalMoveClaim:false,actualGameOutcomeClaim:false,qualityClaim:false,explanation:`The supplied ${a.category} assessment conflicts with the saved WDL50 ${observed.category}; actual-game adjudication remains unavailable.`};return out;
}
