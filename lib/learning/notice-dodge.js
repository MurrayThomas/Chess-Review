// Keep the escape game close to the dialog, with a generous exclusion zone around
// the real dismiss button. Choose varied destinations instead of alternating corners.
export function escapePosition({width,height,minX=0,minY=0,buttonWidth,buttonHeight,current,pointer,safe,recent=[],random=Math.random}) {
  const maxX=Math.max(0,width-buttonWidth),maxY=Math.max(0,height-buttonHeight);
  const candidates=[];
  const consider=(x,y)=>{
    if(x<safe.right+40&&x+buttonWidth>safe.left-40&&y<safe.bottom+40&&y+buttonHeight>safe.top-40)return;
    const distance=Math.hypot(x+buttonWidth/2-pointer.x,y+buttonHeight/2-pointer.y);
    const clearance=Math.hypot(Math.max(x-pointer.x,0,pointer.x-x-buttonWidth),Math.max(y-pointer.y,0,pointer.y-y-buttonHeight));
    const travel=Math.hypot(x-current.x,y-current.y);
    candidates.push({x,y,clearance,travel,score:distance+Math.min(travel,160)*.55});
  };
  for(let i=0;i<64;i++)consider(minX+(maxX-minX)*random(),minY+(maxY-minY)*random());
  // Include the edges as a fallback when a narrow viewport leaves little room.
  for(let row=0;row<=4;row++)for(let col=0;col<=6;col++)consider(minX+(maxX-minX)*col/6,minY+(maxY-minY)*row/4);
  const escapes=candidates.filter(p=>p.clearance>=64&&p.travel>=60);
  if(escapes.length) {
    const fresh=escapes.filter(p=>recent.every(previous=>Math.hypot(p.x-previous.x,p.y-previous.y)>=48));
    const choices=fresh.length?fresh:escapes;
    return choices[Math.floor(random()*choices.length)];
  }
  return candidates.reduce((best,p)=>!best||p.score>best.score?p:best,null);
}

export function escapeTiming(attempts) {
  return {reaction:Math.min(240,attempts*18),duration:Math.min(615,135+attempts*30),rest:Math.min(900,110+attempts*65)};
}

export function evasiveNoticeButton({arena,button,safeButton,view,card=arena,eventSurface=arena}) {
  let frame=null,timer=null,animation=null,lastEscape=-Infinity,disposed=false;
  const recent=[];
  const reduced=()=>view.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const escape=event=>{
    if(disposed||button.disabled||frame!=null)return;
    const safe=safeButton.getBoundingClientRect();
    const cancelPending=()=>{if(timer!=null)view.clearTimeout(timer);timer=null;};
    if(event.clientX>=safe.left-20&&event.clientX<=safe.right+20&&event.clientY>=safe.top-20&&event.clientY<=safe.bottom+20){cancelPending();return;}
    const rect=button.getBoundingClientRect();
    const dx=Math.max(rect.left-event.clientX,0,event.clientX-rect.right);
    const dy=Math.max(rect.top-event.clientY,0,event.clientY-rect.bottom);
    if(Math.hypot(dx,dy)>64){cancelPending();return;}
    if(timer!=null)return;
    const timing=escapeTiming(Number(button.dataset.dodges||0));
    const remaining=Math.max(timing.reaction,timing.rest-(view.performance.now()-lastEscape));
    // Reaction time and recovery grow with every escape so a persistent player
    // can catch it. Keyboard activation never makes a focused control run away.
    const pointer={x:event.clientX,y:event.clientY};
    const schedule=()=>{timer=null;frame=view.requestAnimationFrame(()=>{
      frame=null;if(disposed||button.disabled)return;
      const bounds=arena.getBoundingClientRect(),from=button.getBoundingClientRect(),safe=safeButton.getBoundingClientRect();
      // The review can apply CSS zoom. Geometry is measured on screen, whereas
      // left/top and animation translations use the arena’s unscaled CSS pixels.
      const scaleX=arena.offsetWidth?bounds.width/arena.offsetWidth:1,scaleY=arena.offsetHeight?bounds.height/arena.offsetHeight:1;
      const box=card.getBoundingClientRect();
      // Only a small halo below/alongside the actions, never the whole screen or
      // the paragraph. Clamp to the viewport on narrow displays.
      const halo=card===arena?0:72;
      const minX=halo?Math.max(16,box.left-halo)-bounds.left:0;
      const minY=halo?-12:0;
      const width=halo?Math.min(view.innerWidth-16,box.right+halo)-bounds.left:bounds.width;
      const height=halo?Math.min(view.innerHeight-16,box.bottom+halo)-bounds.top:bounds.height;
      const target=escapePosition({width,height,minX,minY,buttonWidth:from.width,buttonHeight:from.height,
        current:{x:from.left-bounds.left,y:from.top-bounds.top},pointer:{x:pointer.x-bounds.left,y:pointer.y-bounds.top},
        safe:{left:safe.left-bounds.left,right:safe.right-bounds.left,top:safe.top-bounds.top,bottom:safe.bottom-bounds.top},recent});
      if(!target)return;
      recent.push({x:from.left-bounds.left,y:from.top-bounds.top});
      if(recent.length>4)recent.shift();
      animation?.cancel();
      button.style.left=target.x/scaleX+'px';button.style.top=target.y/scaleY+'px';button.style.right='auto';button.style.bottom='auto';
      button.dataset.dodges=String(Number(button.dataset.dodges||0)+1);
      lastEscape=view.performance.now();
      if(!reduced()&&button.animate) {
        const dx=(from.left-bounds.left-target.x)/scaleX,dy=(from.top-bounds.top-target.y)/scaleY;
        animation=button.animate([{transform:`translate(${dx}px,${dy}px) rotate(${dx>0?-5:5}deg)`},{transform:'translate(0,0) rotate(0deg)'}],
          {duration:timing.duration,easing:'cubic-bezier(.16,.8,.24,1)'});
      }
    });};
    if(remaining>0)timer=view.setTimeout(schedule,remaining);else schedule();
  };
  const reset=()=>{
    recent.length=0;
    if(frame!=null)view.cancelAnimationFrame(frame);frame=null;animation?.cancel();
    if(timer!=null)view.clearTimeout(timer);timer=null;
    button.style.left='';button.style.top='';button.style.right='';button.style.bottom='';
  };
  eventSurface.addEventListener('pointermove',escape);
  button.addEventListener('pointerenter',escape);button.addEventListener('pointerdown',escape);
  view.addEventListener('resize',reset);
  return ()=>{
    disposed=true;reset();eventSurface.removeEventListener('pointermove',escape);
    button.removeEventListener('pointerenter',escape);button.removeEventListener('pointerdown',escape);
    view.removeEventListener('resize',reset);
  };
}
