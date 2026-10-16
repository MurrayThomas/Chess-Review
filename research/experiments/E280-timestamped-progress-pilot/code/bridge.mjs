import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';
import path from 'node:path';
import {Engine} from '../../../../engine/uci.js';
import {Producer} from '../../E279-coherent-multipv-emission/code/producer.mjs';
export async function connect(file,config){
  const previous=globalThis.Worker;
  class Bridge{
    constructor(){this.commands=[];this.boot=[];this.active=null;this.expectedExit=false;
      this.child=spawn(process.execPath,['tools/calibration/engine-host.cjs',path.resolve(file)],{windowsHide:true,stdio:['pipe','pipe','pipe']});
      createInterface({input:this.child.stdout}).on('line',text=>{
        const q=this.active,arrivalPerf=performance.now(),arrivalWall=Date.now();let index=null;
        if(q?.goAt!=null){index=q.raw.length;q.raw.push({text,arrivalPerf,arrivalWall});}else this.boot.push(text);
        try{
          this.onmessage?.({data:text});
          if(index!=null){const frame=q.producer.observe(text,index),decisionWall=Date.now();
            if(frame&&(!q.lastPWall||decisionWall-q.lastPWall>=120)){q.lastPWall=decisionWall;const event={sourceIndex:index,arrivalPerf,callbackPerf:performance.now(),decisionWall,snapshot:frame.root,epochStart:frame.epochStart};
              event.grades=q.grade?.('PC',frame.root)||[];event.finishedPerf=performance.now();q.PC.push(event);}
            q.raw[index].handledPerf=performance.now();
          }
        }catch(error){if(q)q.observerError={message:error.message,stack:error.stack};this.onerror?.({message:error.message});}
      });
      this.child.stderr.on('data',data=>{this.stderr=(this.stderr||'')+data;});
      this.child.stdin.on('error',error=>{if(!this.expectedExit)this.onerror?.({message:error.message});});
      this.child.on('error',e=>this.onerror?.({message:e.message}));this.child.on('exit',code=>{if(!this.expectedExit)this.onerror?.({message:'Engine subprocess exited '+code+': '+(this.stderr||'')});});
    }
    postMessage(command){this.commands.push({command,at:performance.now(),wall:Date.now()});if(command.startsWith('go ')&&this.active)this.active.goAt=performance.now();this.child.stdin.write(command+'\n');}
    terminate(){this.expectedExit=true;this.child.kill();}
  }
  globalThis.Worker=Bridge;let engine;
  try{engine=new Engine(file);}finally{globalThis.Worker=previous;}
  await engine._ready;const identity=engine.worker.boot.find(t=>t.startsWith('id name '))?.slice(8);
  if(!new RegExp('^Stockfish '+config.majorVersion+'\\b').test(identity||'')){engine.terminate();throw Error('Unexpected engine identity '+identity);}
  const options={...config.options};if(!engine.worker.boot.some(t=>t.startsWith('option name Threads ')))delete options.Threads;
  await engine.setOptions(options);
  async function query(spec,grade=null){
    const trace={spec,grade:null,raw:[],B:[],PC:[],commandsStart:engine.worker.commands.length,startedPerf:performance.now(),startedWall:Date.now(),goAt:null,lastPWall:null,observerError:null};
    trace.producer=new Producer({id:spec.id,query:{fen:spec.fen,multipv:spec.multipv}},true);trace.grade=grade;engine.worker.active=trace;
    const timer=setTimeout(()=>engine.terminate(),120000);let result,error;
    try{
      result=await engine.analyse(spec.fen,16,spec.multipv,null,snapshot=>{
        const i=trace.raw.length-1,event={sourceIndex:i,arrivalPerf:trace.raw[i]?.arrivalPerf,callbackPerf:performance.now(),decisionWall:engine.current?.progressAt,snapshot:structuredClone(snapshot)};
        try{event.grades={B:grade?.('B',snapshot)||[],BC:grade?.('BC',snapshot)||[]};}catch(error){trace.observerError={message:error.message,stack:error.stack};event.gradeError=trace.observerError;}
        event.finishedPerf=performance.now();trace.B.push(event);
      },{budget:spec.budget,cold:true,requireExact:!!spec.requireExact,searchMove:spec.searchMove||null});
      if(trace.observerError)throw Error(trace.observerError.message);
    }catch(e){error={message:e.message,stack:e.stack,scoringMove:e.scoringMove||null};}
    finally{clearTimeout(timer);engine.worker.active=null;}
    const output={spec,identity,startedPerf:trace.startedPerf,startedWall:trace.startedWall,goAt:trace.goAt,finishedPerf:performance.now(),raw:trace.raw,B:trace.B,PC:trace.PC,
      commands:engine.worker.commands.slice(trace.commandsStart),result:result||null,error:error||null,observerError:trace.observerError,producerFrames:trace.producer.frames};
    return output;
  }
  return {engine,identity,boot:engine.worker.boot,query,close:()=>engine.terminate()};
}
