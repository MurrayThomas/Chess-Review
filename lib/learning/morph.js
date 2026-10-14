// Animate measured panel surfaces; the board is never part of the transition.
export function capturePanels(nodes) {
  return [...nodes].map(node => {
    const style = node.ownerDocument.defaultView.getComputedStyle(node);
    return {node, rect:node.getBoundingClientRect(), snapshot:node.cloneNode(true), style:{fontSize:style.fontSize, fontFamily:style.fontFamily, padding:style.padding}};
  })
    .filter(({rect}) => rect.width > 1 && rect.height > 1);
}

export function morphPanels(document, sources, targets, {reduced = false} = {}) {
  const view = document.defaultView;
  if (reduced || view?.matchMedia?.('(prefers-reduced-motion: reduce)').matches || !view?.Element.prototype.animate) return Promise.resolve();
  const destinations = capturePanels(targets);
  if (!sources.length || !destinations.length) return Promise.resolve();
  const layer = document.createElement('div');
  layer.className = 'learn-morph-layer'; layer.inert = true; layer.setAttribute('aria-hidden', 'true');
  const board = document.querySelector('.board')?.getBoundingClientRect();
  if (board) {
    const {innerWidth:w, innerHeight:h} = view, {x,y,right,bottom} = board;
    // Panels can pass behind the anchor, but never paint over its squares.
    layer.style.clipPath = `path(evenodd, "M0 0H${w}V${h}H0Z M${x-1} ${y-1}H${right+1}V${bottom+1}H${x-1}Z")`;
  }
  document.body.append(layer);
  const animations = [], easing = 'cubic-bezier(.22, 1, .36, 1)';
  const duration = 760;
  // Small, staggered lifts preserve the relationship between old and new panels.
  sources.forEach(({rect:a, snapshot, style}, index) => {
    const b = destinations[index % destinations.length].rect, ghost = document.createElement('div'), content = snapshot.cloneNode(true);
    content.removeAttribute('id');
    content.querySelectorAll('[id]').forEach(child => child.removeAttribute('id'));
    ghost.className = 'learn-morph-surface';
    Object.assign(ghost.style, {position:'absolute', margin:'0', left:a.x+'px', top:a.y+'px', width:a.width+'px', height:a.height+'px', borderRadius:'14px', background:'var(--panel)', border:'1px solid var(--line)', overflow:'hidden'});
    Object.assign(content.style, {position:'relative', margin:'0', left:'0', top:'0', width:a.width+'px', height:a.height+'px', minHeight:'0', visibility:'visible', fontSize:style.fontSize, fontFamily:style.fontFamily, padding:style.padding, boxSizing:'border-box'});
    ghost.append(content);
    layer.append(ghost);
    const dx = b.x-a.x, dy = b.y-a.y;
    const transform = `translate(${dx}px, ${dy}px)`;
    animations.push(ghost.animate([
      {transform:'translate(0, 0)', opacity:1, width:a.width+'px', height:a.height+'px', borderRadius:'14px'},
      {transform:`translate(${dx*.18}px, ${dy*.18-8}px)`, opacity:.9, offset:.24},
      {transform, opacity:.35, width:b.width+'px', height:b.height+'px', offset:.76, borderRadius:'16px'},
      {transform, opacity:0, width:b.width+'px', height:b.height+'px', borderRadius:'16px'},
    ], {duration, delay:Math.min(index*24, 144), easing, fill:'both'}));
    animations.push(content.animate([{opacity:1},{opacity:0,offset:.3},{opacity:0}], {duration, delay:Math.min(index*24,144), easing, fill:'both'}));
  });
  destinations.forEach(({node, rect:b}, index) => {
    const a = sources[index % sources.length].rect;
    const dx = Math.max(-100, Math.min(100, (a.x-b.x)*.12)), dy = Math.max(-60, Math.min(60, (a.y-b.y)*.12));
    animations.push(node.animate([
      {opacity:0, transform:`translate(${dx}px, ${dy+12}px) scale(.94)`},
      {opacity:0, transform:`translate(${dx*.4}px, ${dy*.4+6}px) scale(.97)`, offset:.36},
      {opacity:1, transform:'translate(0, 0) scale(1)'},
    ], {duration, delay:100+Math.min(index*30, 150), easing, fill:'both'}));
  });
  let finish;
  const interrupted = new Promise(resolve => {finish = resolve;});
  const stop = () => finish();
  const media = view.matchMedia?.('(prefers-reduced-motion: reduce)');
  view.addEventListener('resize', stop, {once:true});
  media?.addEventListener('change', stop, {once:true});
  return Promise.race([Promise.allSettled(animations.map(animation => animation.finished)), interrupted])
    .finally(() => {
      animations.forEach(animation => animation.cancel()); layer.remove();
      view.removeEventListener('resize', stop); media?.removeEventListener('change', stop);
    });
}
