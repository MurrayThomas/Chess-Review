// Morph in place 2: one intact board, one learning surface, and space for Settings.
export function centeredLearningLayout({width, height, top = 60, settingsWidth = 286, settingsOpen = false}) {
  const edge = width < 760 ? 16 : 24, gap = width < 1100 ? 24 : 32;
  const clearance = settingsWidth + 48;
  const gutter = Math.min(clearance, Math.max(edge, (width - 900) / 2));
  const right = settingsOpen && width >= 760 ? clearance : gutter;
  const left = settingsOpen && width >= 760 ? Math.min(gutter, Math.max(edge, width - right - 900)) : gutter;
  const available = Math.max(0, width - left - right);
  const contentWidth = Math.min(1440, available), x = left + (available - contentWidth) / 2;
  const stacked = contentWidth < 700;
  const y = Math.max(24, Math.min(52, (height - top) * .055));
  const boardSize = Math.max(1, stacked ? Math.min(contentWidth, 520) : Math.min(680, Math.max(280, height - top - y - 108), (contentWidth - gap) * .46));
  const boardX = stacked ? x + (contentWidth - boardSize) / 2 : x;
  const panelX = stacked ? x : x + boardSize + gap;
  const panelY = stacked ? y + boardSize + 84 : y;
  return {boardX, boardY:y, boardSize, panelX, panelY,
    panelWidth:stacked ? contentWidth : contentWidth - boardSize - gap,
    panelHeight:Math.max(240, height - top - y - 24), stacked, clearance};
}

// Keep the review's measured square size; rearrange the study surface around it.
export function newWayLearningLayout({width, height, top = 60, settingsWidth = 286, settingsOpen = false}) {
  const edge=width<760?20:48, right=settingsOpen&&width>=760?settingsWidth+24:edge;
  const available=Math.max(1,width-edge-right), content=Math.min(1380,available), gap=width<1100?36:80;
  const x=edge+(available-content)/2, stacked=content<760;
  const boardSize=Math.max(1,stacked?Math.min(content,520):Math.min(640,Math.max(280,height-top-260),(content-gap)*.49));
  return {boardX:stacked?x+(content-boardSize)/2:x,boardY:156,boardSize,
    panelX:stacked?x:x+boardSize+gap,panelY:stacked?156+boardSize+150:116,
    panelWidth:stacked?content:content-boardSize-gap,panelHeight:Math.max(240,height-top-140),stacked};
}

export function fullSizeLearningLayout({width, height, boardSize, top = 60, settingsWidth = 286, settingsOpen = false}) {
  const edge = width < 760 ? 16 : 24, gap = width < 1100 ? 24 : 32;
  const right = settingsOpen && width >= 760 ? settingsWidth + 48 : edge;
  const available = Math.max(1, width - edge - right);
  const size = Math.min(boardSize || 560, width - edge * 2);
  const stacked = available < size + gap + 360;
  const panelWidth = stacked ? available : Math.min(720, available - size - gap);
  const contentWidth = stacked ? Math.max(size, panelWidth) : size + gap + panelWidth;
  const x = Math.max(edge, edge + (available - contentWidth) / 2), y = 28;
  return {boardX:stacked ? Math.max(edge,edge+(available-size)/2) : x, boardY:y, boardSize:size, panelX:stacked ? edge : x + size + gap,
    panelY:stacked ? y + size + 76 : y, panelWidth,
    panelHeight:Math.max(240, height - top - y - 24), stacked};
}

// Sample a gentle quadratic arc. Uniform scaling keeps every square and piece
// together, with no rotation, perspective distortion, or independent tile motion.
export function boardSwoopFrames(from, to) {
  const dx = from.x - to.x, dy = from.y - to.y;
  const lift = Math.min(28, Math.hypot(dx, dy) * .075);
  const controlY = Math.min(from.y, to.y) - to.y - lift;
  const scale = from.width / to.width;
  return Array.from({length:33}, (_, i) => {
    const t = i / 32, u = 1 - t;
    const x = u*u*dx + 2*u*t*dx*.45;
    const y = u*u*dy + 2*u*t*controlY;
    return {offset:t, transform:`translate(${x}px, ${y}px) scale(${1 + (scale - 1)*u})`};
  });
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

export function centeredMorph(document, sources, targets, {board, fromBoard, reduced = false, exiting = false, signal, variant = 'morph2'} = {}) {
  const view = document.defaultView;
  if (!canAnimate(view, reduced)) return Promise.resolve();
  const toBoard = board.getBoundingClientRect();
  if (!fromBoard?.width || !toBoard.width) return Promise.resolve();
  const refined = variant === 'morph3';
  const duration = refined ? (exiting ? 520 : 680) : exiting ? 800 : 1040, animations = [];
  const layer = document.createElement('div');
  layer.className = 'learn-scene-layer' + (exiting ? ' learning-embedded' : '');
  layer.dataset.presentation = variant; layer.inert = true; layer.setAttribute('aria-hidden', 'true');
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
    animations.push(ghost.animate(refined
      ? [{opacity:1, transform:'translateY(0)', clipPath:'inset(0 0 0 0)'},
         {opacity:0, transform:'translateY(-8px)', clipPath:'inset(0 0 12% 0)'}]
      : [{opacity:1, transform:'translateX(0)'}, {opacity:0, transform:`translateX(${exiting ? 20 : -18}px)`}],
      {duration:refined ? 160 : exiting ? 360 : 340, easing, fill:'both'}));
    // Scroll is not copied by cloneNode; preserve the outgoing study position.
    ghost._scroll = {content, top:node.scrollTop};
  }
  layer.append(fragment); document.body.append(layer);
  for (const ghost of layer.children) {ghost._scroll.content.scrollTop = ghost._scroll.top; delete ghost._scroll;}
  const anchor = board.closest('.mod') || board;
  anchor.classList.add('learn-swoop-anchor');
  const origin = board.style.transformOrigin; board.style.transformOrigin = '0 0';
  animations.push(board.animate(boardSwoopFrames(fromBoard, toBoard), {duration, easing, fill:'both'}));
  for (const [index, node] of [...targets].entries()) {
    const caption = !exiting && node.classList.contains('learn-dock-info');
    animations.push(node.animate(refined
      ? [{opacity:0, transform:`translateY(${exiting ? 8 : 14}px)`, clipPath:'inset(0 0 8% 0 round 12px)'},
         {opacity:1, transform:'translateY(0)', clipPath:'inset(0 0 0 0 round 12px)'}]
      : [{opacity:0, transform:`translateX(${exiting ? -14 : 26}px)`}, {opacity:1, transform:'translateX(0)'}],
      {duration:refined ? (exiting ? 340 : 440) : exiting || caption ? 480 : 720,
       delay:refined ? 170 + Math.min(index*24,48) : exiting ? 100 : caption ? 520 : 180 + Math.min(index*40, 80), easing:refined ? 'cubic-bezier(.16, 1, .3, 1)' : easing, fill:'both'}));
  }
  return finishMotion(view, animations, {layer, signal, cleanup:() => {anchor.classList.remove('learn-swoop-anchor'); board.style.transformOrigin = origin;}});
}

export function reflowCentered(document, board, fromBoard, shell, fromShell, {reduced = false, signal} = {}) {
  const view = document.defaultView;
  if (!canAnimate(view, reduced)) return Promise.resolve();
  const toBoard = board.getBoundingClientRect(), toShell = shell.getBoundingClientRect();
  if (!fromBoard.width || !toBoard.width || !toShell.width) return Promise.resolve();
  const origin = board.style.transformOrigin; board.style.transformOrigin = '0 0';
  const animations = [board.animate(boardSwoopFrames(fromBoard, toBoard), {duration:520, easing, fill:'both'}),
    shell.animate([{transform:`translate(${fromShell.x-toShell.x}px, ${fromShell.y-toShell.y}px)`}, {transform:'translate(0, 0)'}], {duration:520, easing, fill:'both'})];
  return finishMotion(view, animations, {signal, cleanup:() => {board.style.transformOrigin = origin;}});
}
