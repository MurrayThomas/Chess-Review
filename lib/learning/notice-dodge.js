// Keep the escape game inside the dialog, with a generous exclusion zone around
// the real dismiss button. Score a spread of destinations so it never just jitters.
export function escapePosition({width,height,buttonWidth,buttonHeight,current,pointer,safe,random=Math.random}) {
  const maxX=Math.max(0,width-buttonWidth),maxY=Math.max(0,height-buttonHeight);
  let best=null;
  for(let row=0;row<=4;row++)for(let col=0;col<=6;col++) {
    const x=maxX*col/6,y=maxY*row/4;
    if(x<safe.right+40&&x+buttonWidth>safe.left-40&&y<safe.bottom+40&&y+buttonHeight>safe.top-40)continue;
    const distance=Math.hypot(x+buttonWidth/2-pointer.x,y+buttonHeight/2-pointer.y);
    const travel=Math.hypot(x-current.x,y-current.y);
    const score=distance+Math.min(travel,160)*.55+random()*28;
    if(!best||score>best.score)best={x,y,score};
  }
  return best;
}

export function evasiveNoticeButton({arena,button,safeButton,view}) {
  let frame=null,timer=null,animation=null,lastEscape=-Infinity,disposed=false;
  const reduced=()=>view.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const escape=event=>{
    if(disposed||button.disabled||frame!=null)return;
    const safe=safeButton.getBoundingClientRect();
    if(event.clientX>=safe.left-20&&event.clientX<=safe.right+20&&event.clientY>=safe.top-20&&event.clientY<=safe.bottom+20)return;
    const rect=button.getBoundingClientRect();
    const dx=Math.max(rect.left-event.clientX,0,event.clientX-rect.right);
    const dy=Math.max(rect.top-event.clientY,0,event.clientY-rect.bottom);
    if(Math.hypot(dx,dy)>64)return;
    const remaining=110-(view.performance.now()-lastEscape);
    if(timer!=null)view.clearTimeout(timer);timer=null;
    if(remaining>0){timer=view.setTimeout(()=>{timer=null;escape(event);},remaining);return;}
    // One frame of reaction time makes a fast, accurate catch possible. Keyboard
    // activation also works normally; focus never makes a control run away.
    const pointer={x:event.clientX,y:event.clientY};
    frame=view.requestAnimationFrame(()=>{
      frame=null;if(disposed||button.disabled)return;
      const bounds=arena.getBoundingClientRect(),from=button.getBoundingClientRect(),safe=safeButton.getBoundingClientRect();
      // The review can apply CSS zoom. Geometry is measured on screen, whereas
      // left/top and animation translations use the arena’s unscaled CSS pixels.
      const scaleX=arena.offsetWidth?bounds.width/arena.offsetWidth:1,scaleY=arena.offsetHeight?bounds.height/arena.offsetHeight:1;
      const target=escapePosition({width:bounds.width,height:bounds.height,buttonWidth:from.width,buttonHeight:from.height,
        current:{x:from.left-bounds.left,y:from.top-bounds.top},pointer:{x:pointer.x-bounds.left,y:pointer.y-bounds.top},
        safe:{left:safe.left-bounds.left,right:safe.right-bounds.left,top:safe.top-bounds.top,bottom:safe.bottom-bounds.top}});
      if(!target)return;
      animation?.cancel();
      button.style.left=target.x/scaleX+'px';button.style.top=target.y/scaleY+'px';button.style.right='auto';button.style.bottom='auto';
      button.dataset.dodges=String(Number(button.dataset.dodges||0)+1);
      lastEscape=view.performance.now();
      if(!reduced()&&button.animate) {
        const dx=(from.left-bounds.left-target.x)/scaleX,dy=(from.top-bounds.top-target.y)/scaleY;
        animation=button.animate([{transform:`translate(${dx}px,${dy}px) rotate(${dx>0?-5:5}deg)`},{transform:'translate(0,0) rotate(0deg)'}],
          {duration:135,easing:'cubic-bezier(.16,.8,.24,1)'});
      }
    });
  };
  const reset=()=>{
    if(frame!=null)view.cancelAnimationFrame(frame);frame=null;animation?.cancel();
    if(timer!=null)view.clearTimeout(timer);timer=null;
    button.style.left='';button.style.top='';button.style.right='';button.style.bottom='';
  };
  arena.addEventListener('pointermove',escape);
  button.addEventListener('pointerenter',escape);button.addEventListener('pointerdown',escape);
  view.addEventListener('resize',reset);
  return ()=>{
    disposed=true;reset();arena.removeEventListener('pointermove',escape);
    button.removeEventListener('pointerenter',escape);button.removeEventListener('pointerdown',escape);
    view.removeEventListener('resize',reset);
  };
}
