// Reserve Settings on desktop before it opens so the learning scene stays still.
export function fullSizeLearningLayout({width, height, board, boardSize, top = 60, settingsWidth = 286}) {
  const edge = width < 760 ? 16 : 24, gap = width < 1100 ? 24 : 32;
  const right = width >= 760 ? settingsWidth + 48 : edge;
  const available = Math.max(1, width - edge - right);
  const original = board?.width || boardSize || 560;
  const boardY = Math.max(24, Math.min(board?.y - top || 28, 88));
  const size = Math.max(1, Math.min(original * 1.1, available, Math.max(240, height - top - boardY - 64)));
  const stacked = available < size + gap + 340;
  const panelWidth = stacked ? available : Math.min(720, available - size - gap);
  return {boardX:edge, boardY, boardSize:size, panelX:stacked ? edge : edge + size + gap,
    panelY:stacked ? boardY + size + 76 : 28, panelWidth,
    panelHeight:Math.max(240, height - top - 52), stacked};
}

// One uniform scale and a straight path: no lift, arc or overshoot.
export function boardExpansionFrames(from, to) {
  return [
    {transform:`translate(${from.x-to.x}px, ${from.y-to.y}px) scale(${from.width/to.width})`},
    {transform:'translate(0px, 0px) scale(1)'},
  ];
}

function canAnimate(view, reduced) {
  return !reduced && !view.matchMedia?.('(prefers-reduced-motion: reduce)').matches && !!view.Element.prototype.animate;
}

function finishMotion(view, animations, {layer, signal, cleanup = () => {}} = {}) {
  const media = view.matchMedia?.('(prefers-reduced-motion: reduce)');
  let stop, timer, disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true; animations.forEach(a => a.cancel()); layer?.remove(); cleanup();
    view.clearTimeout(timer); view.removeEventListener('resize', stop);
    media?.removeEventListener('change', stop); signal?.removeEventListener('abort', stop);
  };
  // An interrupted animation must release its transforms synchronously, before
  // a settings reflow measures and animates the same real board again.
  const interrupted = new Promise(resolve => {stop = () => {dispose(); resolve();};});
  view.addEventListener('resize', stop, {once:true});
  media?.addEventListener('change', stop, {once:true});
  signal?.addEventListener('abort', stop, {once:true});
  timer = view.setTimeout(stop, 1600);
  if (signal?.aborted) stop();
  return Promise.race([Promise.allSettled(animations.map(a => a.finished)), interrupted]).finally(dispose);
}

const easing = 'cubic-bezier(.28, .06, .18, 1)';

export function centeredMorph(document, sources, targets, {board, fromBoard, reduced = false, exiting = false, signal} = {}) {
  const view = document.defaultView;
  if (!canAnimate(view, reduced)) return Promise.resolve();
  const toBoard = board?.getBoundingClientRect();
  if (!fromBoard?.width || !toBoard?.width) return Promise.resolve();
  const duration = exiting ? 720 : 1150, animations = [];
  const layer = document.createElement('div');
  layer.className = 'learn-scene-layer' + (exiting ? ' learning-embedded' : '');
  layer.dataset.presentation = 'morph3'; layer.inert = true; layer.setAttribute('aria-hidden', 'true');
  const fragment = document.createDocumentFragment();
  for (const {node, rect, snapshot, style} of sources) {
    const ghost = document.createElement('div'), content = snapshot.cloneNode(true);
    content.removeAttribute('id'); content.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
    ghost.className = 'learn-scene-ghost';
    Object.assign(ghost.style, {left:rect.x+'px', top:rect.y+'px', width:rect.width+'px', height:rect.height+'px'});
    Object.assign(content.style, {position:'relative', left:'0', top:'0', margin:'0', width:rect.width+'px', height:rect.height+'px', maxHeight:'none', visibility:'visible', fontSize:style.fontSize, fontFamily:style.fontFamily, boxSizing:'border-box'});
    ghost.append(content); fragment.append(ghost);
    // The snapshot is the sole outgoing text owner. On return the live review
    // is already restored, so explicitly hide it until its entrance starts.
    animations.push(ghost.animate( [{opacity:1, transform:'translateY(0)', clipPath:'inset(0 0 0 0)'},
         {opacity:0, transform:'translateY(-8px)', clipPath:'inset(0 0 12% 0)'}],
      {duration:160, easing, fill:'both'}));
    // Scroll is not copied by cloneNode; preserve the outgoing study position.
    ghost._scroll = {content, top:node.scrollTop};
  }
  layer.append(fragment); document.body.append(layer);
  for (const ghost of layer.children) {ghost._scroll.content.scrollTop = ghost._scroll.top; delete ghost._scroll;}
  const anchor = board.closest('.mod') || board;
  const origin = board.style.transformOrigin;
  anchor.classList.add('learn-swoop-anchor');
  board.style.transformOrigin = '0 0';
  animations.push(board.animate(boardExpansionFrames(fromBoard, toBoard), {duration, easing, fill:'both'}));
  for (const [index, node] of [...targets].entries()) {
    animations.push(node.animate( [{opacity:0, transform:`translateY(${exiting ? 8 : 14}px)`, clipPath:'inset(0 0 8% 0 round 12px)'},
         {opacity:1, transform:'translateY(0)', clipPath:'inset(0 0 0 0 round 12px)'}],
      {duration:exiting ? 340 : 440,
       delay:170 + Math.min(index*24,48), easing:'cubic-bezier(.16, 1, .3, 1)', fill:'both'}));
  }
  return finishMotion(view, animations, {layer, signal, cleanup:() => {
    anchor.classList.remove('learn-swoop-anchor'); board.style.transformOrigin = origin;
  }});
}
