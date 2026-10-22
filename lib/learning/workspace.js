import {Chess} from '../chess.js';
import {LESSONS, OPENINGS, CATEGORIES, DIFFICULTIES, THEME_NAMES, playUci, linePositions, positionKey} from './content.js';
import {validateExercise, validatePuzzleMove, validSquares} from './validation.js';
import {ProgressStore, progressTotals, recordPuzzle, ChallengeClock, challengeResult} from './progress.js';
import {moveEvents} from '../concepts/detectors/E022-tactics.mjs';
import {explainMove} from '../concepts/detectors/E020-concepts.mjs';
import {capturePanels} from './morph.js';
import {fullSizeLearningLayout, centeredMorph} from './centered-morph.js';
import {presentationFor} from './presentations.js';
import {canRatePuzzle, ratePuzzle, pickRatedPuzzle, normalizePuzzleRating} from './puzzle-rating.js';
import {pieceRoutes, slidePuzzlePieces} from './piece-transition.js';
import {puzzleResultBadge} from '../puzzle-badge.js';

const NAMES = {p:'pawn',n:'knight',b:'bishop',r:'rook',q:'queen',k:'king'};
export function puzzleExplanation(puzzle) {
  const c = new Chess(puzzle.fen), notes = [];
  for (let i = 0; i < puzzle.solution.length; i++) {
    const before = new Chess(c.fen());
    const m = playUci(c, puzzle.solution[i]);
    let text = `${i % 2 ? 'Opponent' : 'You'}: ${m.san}. `;
    if (m.captured) text += `The ${NAMES[m.piece]} captures the ${NAMES[m.captured]} on ${m.isEnPassant() ? m.to[0]+m.from[1] : m.to}. `;
    else text += `The ${NAMES[m.piece]} moves from ${m.from} to ${m.to}. `;
    if (m.promotion) text += `The pawn promotes to a ${NAMES[m.promotion]}. `;
    if (c.isCheckmate()) text += 'The king is in check and has no legal response: checkmate.';
    else if (c.isCheck()) text += 'Check forces the next reply to address the king threat. ';
    if (!(i % 2) && puzzle.themes.includes('fork')) {
      const targets = c.board().flat().filter(p=>p && p.color!==m.color && c.attackers(p.square,m.color).includes(m.to));
      if (targets.length >= 2) text += `This attacks ${targets.map(p=>`the ${NAMES[p.type]} on ${p.square}`).join(' and ')} at once. `;
    }
    if (!(i % 2)) {
      const facts = moveEvents(before,c,m,{maxTacticNodes:2000}).events;
      for (const event of facts.filter(e=>['discovered-attack','absolute-skewer','profitable-capture','winning-exchange','interposition','capture-checker','back-rank-mate','smothered-mate'].includes(e.id))) text += event.text + ' ';
      if (puzzle.themes.includes('pin')) {
        const pin = explainMove({fen:before.fen(),move:m.lan,scanReplies:false,maxNodes:2000}).events.find(e=>e.id==='absolute-pin');
        if(pin)text += pin.text + ' ';
      }
      if(puzzle.themes.includes('sacrifice')&&c.moves({verbose:true}).some(reply=>reply.captured&&reply.to===m.to)) text += `The ${NAMES[m.promotion||m.piece]} is offered on ${m.to}; follow the forcing continuation before judging the material trade. `;
    }
    notes.push(text.trim());
  }
  return notes;
}

export class LearningWorkspace {
  static presentationFor = presentationFor;
  constructor({document = globalThis.document, storage, makePiece, url = p=>p, settings = ()=>({}), flipped = false, onClose = ()=>{}, onPuzzleWrong = ()=>{}, onPuzzleMove = ()=>{}, onPuzzleSuccess = ()=>{}, createAnalysisEngine, book = ()=>({}), embedded = null}) {
    this.doc = document; this.store = new ProgressStore(storage, document.defaultView?.navigator?.locks);
    this.failedChanges = this.store.pending.changes;
    this.syncSaveWarning();
    this.makePiece = makePiece; this.url = url; this.settings = settings; this.flipped = flipped; this.onClose = onClose; this.book = book;
    this.embedded = embedded;
    this.onPuzzleWrong = onPuzzleWrong;
    this.onPuzzleMove = onPuzzleMove;
    this.onPuzzleSuccess = onPuzzleSuccess;
    this.createAnalysisEngine = createAnalysisEngine;
    this.presentation = presentationFor(settings());
    this.reviewFlipped = flipped;
    this.homePosition = new Chess();
    this.page = 'puzzles'; this.activity = null; this.filters = {search:'',category:'All',difficulty:'All',theme:'All',phase:'All',status:'All',family:'All',color:'Both',rating:'Near my Elo'};
    this.puzzleThemes = new Set(); this.puzzleRange = null;
    this.selected = null; this.marked = new Set(); this.feedback = null; this.busy = false; this.closed = false; this.generation = 0;
    this.run = null; this.worker = null; this.workerSeq = 0; this.workerPending = new Map();
    this.h = (tag, attrs = {}, ...children) => {
      const node = this.doc.createElement(tag);
      for (const [key, value] of Object.entries(attrs)) {
        if (value == null || value === false) continue;
        if (key === 'class') node.className = value;
        else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
        else if (key === 'disabled') node.disabled = !!value;
        else node.setAttribute(key, value);
      }
      for (const child of children.flat()) if (child != null && child !== false) node.append(child.nodeType ? child : this.doc.createTextNode(String(child)));
      return node;
    };
  }
  button(label, action, attrs = {}) {return this.h('button', {type:'button', class:'learn-button', 'data-focus':'button-'+label, onclick:action, ...attrs}, label);}
  p(text, cls = '') {return this.h('p', {class:cls}, text);}
  heading(text) {return this.h('h2', {}, text);}
  async open() {
    this.previousFocus = this.doc.activeElement;
    this.background = this.doc.querySelector('#root > .app');
    this.backgroundInert = this.background?.inert;
    this.oldOverflow = this.doc.body.style.overflow;
    this.root = this.h('section', {class:'learning-workspace'+(this.embedded?' learning-embedded':''), role:this.embedded?'region':'dialog', 'aria-modal':this.embedded?null:'true', 'aria-label':'Learn with Chess Review', 'data-presentation':this.presentation, 'data-motion':this.settings().moveAnim===false?'off':'on'});
    this.keyHandler = e => this.onKey(e); this.doc.addEventListener('keydown', this.keyHandler, true);
    if (this.embedded) {
      this.transitioning = true;
      // Keep the review intact while the offline library is read and parsed.
      // Mount and animate the complete learning surface in the same turn.
      await this.load({render:false});
      if (!this.closed && !this.closing) {
        this.mountEmbedded();
        this.render();
        this.shell.style.visibility = '';
        this.root.querySelector('[data-focus="review"]')?.focus({preventScroll:true});
        const arranging=this.arrangePuzzlePieces({fen:this.embedded.fen,flipped:this.reviewFlipped},this.displayedBoard);
        await Promise.all([arranging,this.morph = this.transitionPanels(this.reviewSurfaces, this.panelSurfaces(), {fromBoard:this.reviewBoardRect})]);
      }
      this.transitioning = false;
      if(!this.closed&&!this.closing&&this.shell)this.render();
    } else {
      if (this.background) this.background.inert = true;
      this.doc.body.style.overflow = 'hidden'; this.doc.body.append(this.root);
      await this.load();
    }
  }
  mountEmbedded() {
    const {stage, boardWrap} = this.embedded;
    this.reviewNodes = [...stage.querySelectorAll('.mod:not([data-mod="board"]) > .mod-inner'), this.doc.querySelector('#playerTop'), this.doc.querySelector('#playerBot')].filter(Boolean);
    this.reviewSurfaces = capturePanels(this.reviewNodes);
    this.boardElement = boardWrap.querySelector('.board');
    this.reviewBoardRect = this.boardElement.getBoundingClientRect();
    this.boardOriginalClass = this.boardElement.className;
    this.appliedPieceStyle = this.settings().pieceStyle;
    this.boardOriginalInert = this.boardElement.inert;
    this.boardChildren = [...this.boardElement.childNodes];
    this.boardExtras = [...boardWrap.children].filter(node => node !== this.boardElement);
    this.boardExtras.forEach(node => node.remove());
    this.placeholder = this.h('div', {class:'board-wrap learn-board-placeholder', 'aria-hidden':'true'});
    boardWrap.replaceWith(this.placeholder);
    this.dock = this.h('div', {class:'learn-board-dock'}, boardWrap);
    this.boardInfo = this.h('div', {class:'learn-dock-info'});
    this.dock.append(this.boardInfo);
    this.shell = this.h('div', {class:'learn-shell'});
    this.shell.style.visibility = 'hidden';
    this.root.append(this.dock, this.shell); stage.append(this.root);
    this.inertNodes = [...stage.querySelectorAll('.mod'), this.background?.querySelector('.library-rail')].filter(Boolean).map(node => ({node, inert:node.inert}));
    this.inertNodes.forEach(({node}) => {node.inert = true;});
    stage.classList.add('learning-active'); this.background?.classList.add('has-learning');
    this.background?.classList.add('has-learning-morph3');
    this.doc.body.append(this.root);
    this.doc.body.style.overflow = 'hidden';
    this.positionEmbedded = () => this.positionCentered();
    this.positionEmbedded();
    this.doc.defaultView.addEventListener('resize', this.positionEmbedded);
    if (this.doc.defaultView.ResizeObserver) {
      this.resizeObserver = new this.doc.defaultView.ResizeObserver(this.positionEmbedded);
      this.resizeObserver.observe(this.placeholder);
    }
  }
  panelSurfaces() {return [this.shell, this.boardInfo];}
  positionCentered() {
    const view = this.doc.defaultView, settings = this.doc.querySelector('#settings');
    const top = Math.max(0, this.doc.querySelector('.topbar')?.getBoundingClientRect().bottom || 60);
    const settingsWidth = settings?.getBoundingClientRect().width || 286;
    const layout = fullSizeLearningLayout({width:view.innerWidth, height:view.innerHeight, top, settingsWidth, board:this.reviewBoardRect});
    if(this.puzzleAnalysis){
      const inset=Math.max(0,(view.innerWidth<760?16:24)+40-layout.boardX);
      layout.boardX+=inset;layout.boardSize=Math.max(1,layout.boardSize-inset);
    }
    this.root.style.top = top+'px';
    for (const [key, value] of Object.entries({'board-x':layout.boardX, 'board-y':layout.boardY, 'board-size':layout.boardSize,
      'panel-x':layout.panelX, 'panel-y':layout.panelY, 'panel-width':layout.panelWidth, 'panel-height':layout.panelHeight})) this.root.style.setProperty('--learn-'+key, value+'px');
    this.root.classList.toggle('learn-stacked', layout.stacked);
  }
  // The settings gutter is always reserved. Opening it never reflows the scene.
  settingsLayoutChanged() {}
  refreshSettings() {
    if (!this.shell || this.closed || this.closing) return;
    this.root.dataset.motion = this.settings().moveAnim===false ? 'off' : 'on';
    if (this.settings().moveAnim===false) {this.motionController?.abort();this.cancelPieceTransition?.();}
    // Keep the saved review squares and current learning board in sync with the
    // piece picker without replacing the board or interrupting an exercise.
    const pieceStyle = this.settings().pieceStyle;
    if (this.appliedPieceStyle !== pieceStyle) {
      this.appliedPieceStyle = pieceStyle;
      for (const square of this.boardChildren) for (const img of square.querySelectorAll?.('img[data-piece]') || []) {
        const code = img.dataset.piece; img.replaceWith(this.makePiece(code[1].toLowerCase(),code[0]));
      }
      this.render();
    }
    this.positionCentered();
    this.syncPuzzleElo();
    if(this.puzzleAnalysis){
      if(this.puzzleAnalysisSettingsKey()!==this.analysisSettingsKey){this.releaseAnalysisEngine();this.analysisRequest=this.requestPuzzleAnalysis();}
      else this.render({preservePickup:true});
    }
  }
  transitionPanels(sources, targets, options = {}) {
    this.motionController?.abort(); this.motionController = new this.doc.defaultView.AbortController();
    return centeredMorph(this.doc, sources, targets, {board:this.boardElement || this.embedded?.boardWrap, reduced:this.settings().moveAnim===false, signal:this.motionController.signal, ...options});
  }
  unmountEmbedded() {
    this.doc.defaultView.removeEventListener('resize', this.positionEmbedded); this.resizeObserver?.disconnect();
    const {stage, boardWrap} = this.embedded;
    this.boardElement.className = this.boardOriginalClass;
    this.boardElement.removeAttribute('data-puzzle-board');
    this.boardElement.inert = this.boardOriginalInert || false;
    this.boardElement.removeAttribute('aria-label');
    this.boardElement.replaceChildren(...this.boardChildren);
    this.embedded.restoreBoard?.();
    boardWrap.append(...this.boardExtras); this.placeholder.replaceWith(boardWrap);
    this.inertNodes.forEach(({node, inert}) => {node.inert = inert || false;});
    stage.classList.remove('learning-active'); this.background?.classList.remove('has-learning');
    this.background?.classList.remove('has-learning-morph3');
    this.doc.body.style.overflow = this.oldOverflow;
  }
  async load({render = true} = {}) {
    this.loadError = null; this.ready = false; if (render) this.render();
    try {
      const [response] = await Promise.all([fetch(this.url('data/learning/puzzles.json')), this.store.load()]);
      if (!response.ok) throw Error('Puzzle library could not be read.');
      const data = await response.json();
      if (data.schema !== 1 || !Array.isArray(data.puzzles) || !data.puzzles.length) throw Error('Puzzle library has an unsupported format.');
      this.puzzles = data.puzzles; this.ready = true;
    } catch (error) {this.loadError = error.message;}
    if (!this.closed && render) this.render();
  }
  async save(change) {
    try {await this.store.update(change); return true;} catch {return false;}
  }
  close() {return this.closePromise ||= this.finishClose();}
  async finishClose() {
    if (this.closed || this.closing) return;
    this.closing = true;
    this.stopPuzzleAnalysis();
    // Commit the active challenge before leaving; the review can return immediately.
    if (this.run) await this.finishChallenge('Ended on return to review', false);
    if (this.failedChanges.length) await this.retrySave();
    this.cancelBoardInput?.(); this.cancelPuzzleSound(); this.cancelPuzzleReply(); this.cancelPieceTransition?.(); this.cancelRangeInput?.(); this.cancelEloAnimation(); this.closed = true; this.generation++; clearInterval(this.ticker); this.stopWorker();
    this.doc.removeEventListener('keydown', this.keyHandler, true);
    if (this.embedded && this.shell) {
      const surfaces = capturePanels(this.panelSurfaces());
      const fromBoard = this.boardElement.getBoundingClientRect();
      // Reverse from the currently painted board, even if entry is unfinished.
      this.motionController?.abort();
      await this.morph;
      // Keep the live learning shell in its original context as it fades away.
      this.unmountEmbedded();
      await this.transitionPanels(surfaces, this.reviewNodes, {fromBoard, exiting:true});
    } else if (!this.embedded) {
      if (this.background) this.background.inert = this.backgroundInert || false;
      this.doc.body.style.overflow = this.oldOverflow;
    }
    this.root.remove(); this.previousFocus?.focus(); this.onClose();
  }
  flipBoard() {
    if (this.closed || this.closing) return;
    if (this.activity) this.flipped = !this.flipped;
    else {this.homeBoardFlipped = !this.homeBoardFlipped; this.flipped = this.homeBoardFlipped ? !this.reviewFlipped : this.reviewFlipped;}
    this.render();
  }
  stopWorker() {
    this.worker?.terminate(); this.worker = null;
    for (const resolve of this.workerPending.values()) resolve({status:'inconclusive',feedback:'Validation was interrupted; no incorrect answer was recorded.'});
    this.workerPending.clear();
  }
  onKey(e) {
    if (this.closed) return;
    if(this.promotionPending) {
      if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();this.promotionPending=null;this.render();return;}
      if(e.key==='Tab') {const buttons=[...this.root.querySelectorAll('.learn-promotion button')];const index=buttons.indexOf(this.doc.activeElement);e.preventDefault();buttons[(index+(e.shiftKey?-1:1)+buttons.length)%buttons.length]?.focus();}
      if(e.key==='ArrowUp'||e.key==='ArrowDown'){const buttons=[...this.root.querySelectorAll('.promotion-options button')],index=buttons.indexOf(this.doc.activeElement);e.preventDefault();buttons[(index+(e.key==='ArrowUp'?-1:1)+buttons.length)%buttons.length]?.focus();}
      e.stopImmediatePropagation();return;
    }
    if (this.embedded) {
      const settings = this.doc.querySelector('#settings');
      if (settings && !settings.hidden && e.key==='Escape') {
        e.preventDefault(); e.stopImmediatePropagation();
        const toggle = this.doc.querySelector('[aria-label="Settings"]');
        if (toggle) {toggle.click(); toggle.focus({preventScroll:true});}
        else {settings.hidden = true; this.settingsLayoutChanged();}
        return;
      }
    }
    if (e.key === 'Escape') {e.preventDefault(); e.stopImmediatePropagation(); if (this.selected || this.marked.size) {this.selected = null; this.marked.clear(); this.render();} else this.close(); return;}
    if (e.key === 'Tab' && !this.embedded) {
      const controls = [...this.root.querySelectorAll('button:not(:disabled), input, select, a[href]')].filter(n=>n.tabIndex>=0);
      const first = controls[0], last = controls.at(-1);
      if (e.shiftKey && (this.doc.activeElement === first || !this.root.contains(this.doc.activeElement))) {e.preventDefault(); last?.focus();}
      else if (!e.shiftKey && this.doc.activeElement === last) {e.preventDefault(); first?.focus();}
    }
    // Puzzle arrows navigate analysis history, never focus or mark board squares.
    if(this.activity?.kind==='puzzle'&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key)
      &&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.target.closest?.('input,textarea,select,[contenteditable="true"],#settings')
      &&(this.root.contains(e.target)||e.target===this.doc.body)){
      e.preventDefault();e.stopImmediatePropagation();
      if(e.target.closest?.('.learn-square'))this.root.querySelector('[data-focus="review"]')?.focus({preventScroll:true});
      const a=this.puzzleAnalysis;
      if(a){
        const index={ArrowLeft:a.index-1,ArrowRight:a.index+1,Home:0,End:a.line.length}[e.key];
        if(index!=null&&index>=0&&index<=a.line.length&&index!==a.index)this.stepPuzzleAnalysis(index);
      }
      return;
    }
    // Preserve review keyboard state while learning owns focus.
    if (!this.root.contains(e.target)) {if (!this.embedded) e.stopImmediatePropagation(); return;}
    if (e.target.closest('.learn-board') && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) {
      e.preventDefault(); const nodes = [...this.root.querySelectorAll('.learn-square')], index = nodes.indexOf(e.target.closest('.learn-square'));
      const offset = {ArrowLeft:-1,ArrowRight:1,ArrowUp:-8,ArrowDown:8}[e.key]; const next = nodes[index+offset];
      if (next) {nodes.forEach(n=>n.tabIndex=-1); next.tabIndex=0; next.focus(); this.boardFocus=next.dataset.square;}
    }
  }
  async navigate(page) {
    if (this.busy || this.run || this.closing) return;
    if (page==='home') page='puzzles';
    this.generation++; this.page = page; this.activity = null; this.result=null; this.clearAnswer();
    this.filters.search = ''; this.filters.status = 'All'; await this.store.load(); if (!this.closed) {this.scrollToTop();this.render();}
  }
  scrollToTop(showBoard = false) {
    if (!this.embedded) {this.root.scrollTop = 0; return;}
    this.shell.scrollTop = 0;
    const main = this.shell.querySelector('.learn-main'); if (main) main.scrollTop = 0;
    if (this.root.classList.contains('learn-stacked')) {
      this.root.scrollTop = showBoard ? 0 : Math.max(0,parseFloat(this.root.style.getPropertyValue('--learn-panel-y'))-16);
      return;
    }
    if (this.root.classList.contains('learn-stacked') && this.doc.defaultView.scrollY > 0) {
      (showBoard ? this.dock : this.shell).scrollIntoView?.({block:'start'});
    }
  }
  render({preservePickup=false}={}) {
    const pickup=(preservePickup||this.opponentPlaying)&&this.cancelBoardInput?.active?.()?this.cancelBoardInput:null;
    if(!pickup)this.cancelBoardInput?.();
    this.cancelRangeInput?.();
    if (this.closed || !this.root) return;
    this.renderedBoard=null;
    this.root.querySelector('.learn-promotion')?.remove();
    const h = this.h, focused = this.doc.activeElement, focusKey = focused?.dataset?.focus;
    const selection = focused?.type === 'search' || focused?.type === 'text' ? [focused.selectionStart, focused.selectionEnd] : null;
    const inPuzzle=this.activity?.kind==='puzzle';
    const header = h('header', {class:'learn-header'}, h('div', {class:'learn-brand'}, h('img',{src:this.url('pieces-img/cburnett/wN.svg'),alt:''}), h('span',{},'Learn with Chess Review')),
      this.button(inPuzzle?'← Back to puzzles':'← Back to review', async()=>{
        if(!inPuzzle)return this.close();
        if(this.busy)return;
        if(this.run)await this.finishChallenge('Ended on return to puzzles',false);
        return this.navigate('puzzles');
      }, {'data-focus':'review',disabled:inPuzzle&&this.busy}));
    const destinations = [['puzzles','Puzzles'],['concepts','Concepts'],['openings','Openings']];
    const nav = h('nav',{class:'learn-nav','aria-label':'Learning destinations'}, ...destinations.map(([id,label])=>
      this.button(label,()=>this.navigate(id), {'aria-current':this.page===id?'page':null,disabled:!!this.run||this.busy,'data-focus':id})));
    const main = h('main',{class:'learn-main'});
    if (!this.ready) main.append(h('div',{class:'learn-empty',role:'status'}, this.heading(this.loadError?'Learning could not load':'Preparing your learning workspace…'), this.p(this.loadError||'Loading your saved progress and offline library.'), this.loadError && this.button('Try again',()=>this.load())));
    else {
      if (this.store.error || this.failedChanges.length) main.append(h('div',{class:'learn-storage-error',role:'alert'}, 'Your progress could not be saved or loaded. Practice is still available. ',this.button('Retry saving',async()=>{await this.retrySave(); this.render();})));
      if (this.result) main.append(this.resultView());
      else if (this.activity?.kind === 'lesson') main.append(this.lessonView());
      else if (this.activity?.kind === 'opening') main.append(this.openingView());
      else if (this.puzzleAnalysis) main.append(this.puzzleAnalysisView());
      else if (this.activity?.kind === 'puzzle') main.append(this.puzzleView());
      else if (this.page === 'concepts') main.append(this.conceptsView());
      else if (this.page === 'openings') main.append(this.openingsView());
      else main.append(this.puzzlesView());
    }
    if (this.embedded) {
      let column=main.querySelector('.learn-board-column');
      if(!column){
        this.flipped=this.homeBoardFlipped?!this.reviewFlipped:this.reviewFlipped;
        column=this.board(this.homePosition.fen(),{interactive:!this.busy&&!this.transitioning,last:this.homePosition.history({verbose:true}).at(-1)?.lan});
      }
      if (column) {
        const board = column.querySelector('.learn-board');
        this.boardElement.className = this.boardOriginalClass+' learn-board';
        this.boardElement.classList.remove('analysis');
        this.boardElement.toggleAttribute('data-puzzle-board',board.hasAttribute('data-puzzle-board'));
        this.boardElement.setAttribute('aria-label', board.getAttribute('aria-label'));
        this.boardElement.replaceChildren(...board.childNodes);
        this.boardInfo.replaceChildren(...[...column.children].filter(node=>node!==board));
        column.remove();
      }
      this.boardElement.inert = false;
      const mainScroll = this.shell.querySelector('.learn-main')?.scrollTop || 0;
      this.shell.replaceChildren(header,nav,main);
      main.scrollTop = mainScroll;
      this.root.dataset.destination = this.page;
      this.positionCentered();
    } else this.root.replaceChildren(header, nav, main);
    if(this.puzzleAnalysis)this.paintPuzzleAnalysis();
    this.displayedBoard=this.renderedBoard || (this.embedded?.fen?{fen:this.embedded.fen,flipped:this.reviewFlipped}:null);
    if(pickup)pickup.refresh(Object.fromEntries([...this.root.querySelectorAll('[data-square]')].map(n=>[n.dataset.square,n])));
    this.syncPuzzleElo();
    const target = focusKey && [...this.root.querySelectorAll('[data-focus]')].find(n=>n.dataset.focus===focusKey);
    if (target) {target.focus({preventScroll:true}); if (selection && target.setSelectionRange) target.setSelectionRange(...selection);}
    else if (!this.root.contains(this.doc.activeElement)) (this.embedded?this.root:header).querySelector('.learn-header button, button')?.focus({preventScroll:true});
    if(this.promotionPending) {
      const pending=this.promotionPending;
      const picker=h('div',{class:'learn-promotion',role:'dialog','aria-modal':'true','aria-label':'Choose promotion piece'},
        h('div',{class:'promotion-picker'},h('h3',{},'Promote to'),h('div',{class:'promotion-options'},...['q','r','b','n'].map(piece=>pending.moves.find(m=>m.promotion===piece)).filter(Boolean).map(m=>
          h('button',{type:'button','aria-label':'Promote to '+NAMES[m.promotion],title:NAMES[m.promotion],onclick:()=>{if(this.promotionPending!==pending)return;this.promotionPending=null;this.submitMove(m.lan);}},this.makePiece(m.promotion,m.color)))),this.button('Cancel',()=>{this.promotionPending=null;this.render();},{class:'promotion-cancel'})));
      this.root.append(picker);picker.querySelector('button').focus();
    }
  }
  async retrySave() {
    const pending = this.store.pending;
    if (!pending.retry) {
      pending.retry = (async()=>{
        while (pending.changes.length) {
          if (!(await this.save(pending.changes[0]))) break;
          pending.changes.shift();
        }
      })();
    }
    const retry = pending.retry;
    try {await retry; if (!pending.changes.length) await this.store.load();}
    finally {if (pending.retry === retry) pending.retry = null; this.syncSaveWarning();}
  }
  syncSaveWarning() {
    const pending = this.store.pending, view = this.doc.defaultView;
    if (pending.warning && (!pending.changes.length || pending.warning.view !== view)) {
      pending.warning.view.removeEventListener('beforeunload', pending.warning.handler); pending.warning = null;
    }
    if (pending.changes.length && !pending.warning) {
      const handler = e => {if(pending.changes.length){e.preventDefault();e.returnValue='';}};
      view.addEventListener('beforeunload',handler); pending.warning = {view,handler};
    }
  }
  async persist(change) {
    if (this.failedChanges.length) {
      this.failedChanges.push(change); await this.retrySave(); return !this.failedChanges.includes(change);
    }
    const saved = await this.save(change);
    if (!saved) {this.failedChanges.push(change); this.syncSaveWarning();}
    return saved;
  }
  resumeLabel(resume) {
    if (resume.kind==='lesson') return 'Continue ' + (LESSONS.find(l=>l.id===resume.id)?.title || 'your concept lesson');
    if (resume.kind==='opening') return 'Continue ' + (OPENINGS.find(o=>o.id===resume.id)?.title || 'your opening course');
    return 'Continue your unfinished puzzle';
  }
  resume(r) {if (r.kind==='lesson') return this.startLesson(r.id,r); else if(r.kind==='opening') return this.startOpening(r.id,r); else {const p=this.puzzles.find(p=>p.id===r.id);if(p)return this.startPuzzleSelection([p],r,{adaptive:!!r.adaptive});else return this.navigate('puzzles');}}
  card(meta, title, copy, action, label = 'Open', extra = null) {
    return this.h('article',{class:'learn-library-row'},
      this.h('div',{class:'learn-row-copy'},this.h('span',{class:'learn-eyebrow'},meta),this.h('h3',{},title),this.p(copy),extra),this.button(label,action));
  }
  search() {return this.h('input',{type:'search',placeholder:'Search the library…',value:this.filters.search,'aria-label':'Search the library','data-focus':'search',oninput:e=>{this.filters.search=e.target.value;this.render();}});}
  select(label, key, options) {
    const node = this.h('select',{'aria-label':label,'data-focus':key,onchange:e=>{this.filters[key]=e.target.value;this.render();}}, ...options.map(option=>this.h('option',{value:option},option)));
    node.value=this.filters[key];return this.h('label',{class:'learn-filter'},this.h('span',{},label),node);
  }
  matches(text) {return text.toLowerCase().includes(this.filters.search.toLowerCase());}
  empty(copy) {return this.h('div',{class:'learn-empty'},this.heading('Nothing here yet'),this.p(copy),this.button('Clear filters',()=>{for(const k of ['category','difficulty','theme','phase','status','family'])this.filters[k]='All';this.filters.search='';this.filters.rating='All ratings';this.render();}));}
  conceptsView() {
    const h = this.h, items = LESSONS.filter(l=>this.matches(l.title+' '+l.explanation+' '+l.category)
      && (this.filters.category==='All'||l.category===this.filters.category)
      && (this.filters.difficulty==='All'||DIFFICULTIES[l.level-1]===this.filters.difficulty));
    return h('div',{},this.heading('Concepts'),
      h('div',{class:'learn-filters'},this.search(),this.select('Category','category',['All',...CATEGORIES]),this.select('Level','difficulty',['All',...DIFFICULTIES])),
      ...CATEGORIES.map(category=>{const list=items.filter(l=>l.category===category);return list.length?h('section',{class:'learn-category'},h('h3',{},category),h('div',{class:'learn-library'},...list.sort((a,b)=>a.level-b.level).map(l=>this.card(DIFFICULTIES[l.level-1],l.title,l.why,()=>this.startLesson(l.id),'Learn →')))):null;}),
      !items.length&&this.empty('Try another category or search term.'));
  }
  async startLesson(id, resume = {}) {
    const lesson=LESSONS.find(l=>l.id===id);if(!lesson)return;
    if(!resume.tab&&this.filters.status==='Struggled') {
      const first=Object.entries(this.store.value.lessons[id]?.exercises||{}).find(([,e])=>e.struggled);
      if(first)resume={tab:'practise',exercise:+first[0]};
    }
    this.result=null;this.page='concepts';this.generation++;this.activity={kind:'lesson',id,tab:resume.tab||'understand',example:resume.example||0,ply:resume.ply||0,exercise:resume.exercise||0};
    this.scrollToTop(true);
    this.clearAnswer();
    await this.persist(p=>{const entry=p.lessons[id]||={status:'in progress',exercises:{}};if(entry.status!=='completed')entry.status='in progress';p.resume={...this.activity};});this.render();
  }
  async lessonTab(tab) {this.activity.tab=tab;this.clearAnswer();this.scrollToTop(true);await this.persist(p=>{p.resume={...this.activity};});this.render();}
  lessonExamples(lesson) {const contrast=lesson.exercises.find(e=>e.type==='choice');return [...lesson.examples,...(contrast?[{fen:contrast.fen,moves:[],captions:[contrast.explanation],highlights:[]}]:[])];}
  lessonView() {
    const a=this.activity,l=LESSONS.find(l=>l.id===a.id),h=this.h,record=this.store.value.lessons[l.id]||{exercises:{}};
    const tabs=h('div',{class:'learn-tabs'},...['understand','observe','practise'].map(t=>this.button(t[0].toUpperCase()+t.slice(1),()=>this.lessonTab(t),{'aria-pressed':a.tab===t?'true':'false',disabled:this.busy})));
    const head=h('div',{class:'learn-activity-head'},h('div',{class:'learn-topline'},this.button('← Lesson library',()=>this.navigate('concepts'),{disabled:this.busy}),h('span',{class:'learn-eyebrow'},l.category+' · '+DIFFICULTIES[l.level-1])),this.heading(l.title),h('div',{class:'learn-subline'},this.p(`${Object.values(record.exercises).filter(e=>e.passed).length}/${l.exercises.length} exercises passed`),tabs));
    if(a.tab==='understand')return h('div',{},head,h('div',{class:'learn-study'},this.board(l.examples[0].fen,{highlights:l.examples[0].highlights}),h('article',{class:'learn-panel learn-copy'},h('h3',{},'The idea'),this.p(l.explanation),h('h3',{},'Why it matters'),this.p(l.why),h('details',{class:'learn-notes'},h('summary',{},'Common mistakes'),h('ul',{},...l.mistakes.map(m=>h('li',{},m)))),l.prerequisites.length&&h('details',{class:'learn-notes'},h('summary',{},'Helpful first'),...l.prerequisites.map(id=>this.button(LESSONS.find(x=>x.id===id).title,()=>this.startLesson(id)))),this.button('See it on the board →',()=>this.lessonTab('observe'),{class:'learn-button primary'}))));
    if(a.tab==='observe') {
      const examples=this.lessonExamples(l),ex=examples[Math.min(a.example,examples.length-1)],c=new Chess(ex.fen),ply=Math.min(a.ply,ex.moves.length);
      for(const m of ex.moves.slice(0,ply))playUci(c,m);
      return h('div',{},head,h('div',{class:'learn-study'},this.board(c.fen(),{highlights:ex.highlights,last:ply?ex.moves[ply-1]:null}),h('article',{class:'learn-panel learn-copy'},h('h3',{},a.example<l.examples.length?'Watch the idea unfold':'A useful contrast'),this.p(ex.captions[ply]),this.moveNavigation(ply,ex.moves.length,async next=>{a.ply=next;await this.persist(p=>{p.resume={...a};});this.render();}),this.button('Next example',async()=>{a.example=(a.example+1)%examples.length;a.ply=0;await this.persist(p=>{p.resume={...a};});this.render();}),this.p(`Example ${a.example+1} of ${examples.length}`,'learn-small'),this.button('Put it into practice →',()=>this.lessonTab('practise'),{class:'learn-button primary'}))));
    }
    const ex=l.exercises[a.exercise],r=record.exercises[a.exercise];
    return h('div',{},head,h('div',{class:'learn-study'},this.board(this.exerciseFen||ex.fen,{interactive:!this.busy&&this.feedback?.status!=='correct'&&ex.type!=='choice',squareSelection:ex.type==='squares',highlights:this.revealedSquares||[],last:this.lastMove}),h('article',{class:'learn-panel learn-copy'},h('span',{class:'learn-eyebrow'},`Exercise ${a.exercise+1} of ${l.exercises.length} · ${ex.type==='squares'?'Select squares':ex.type==='choice'?'Read the position':'Play a move'}`),h('h3',{},ex.prompt),
      ex.type==='choice'?h('div',{class:'learn-options'},...ex.options.map((option,i)=>this.button(option,()=>this.submitExercise(i),{disabled:this.busy||this.feedback?.status==='correct'}))):ex.type==='squares'?h('div',{},this.p(ex.selection==='one'?'Choose one square.':'Select every matching square, then check your answer.'),this.button('Check selection',()=>this.submitExercise([...this.marked]),{disabled:!this.marked.size||this.busy||this.feedback?.status==='correct',class:'learn-button primary'})):this.moveInput(),
      this.feedbackView(),this.button('Show explanation',async()=>{this.feedback={status:'info',feedback:ex.explanation};this.revealedSquares=ex.type==='squares'?validSquares(ex):[];await this.persist(p=>{const e=p.lessons[l.id].exercises[a.exercise]||={};e.struggled=true;});this.render();},{disabled:this.busy||this.feedback?.status==='correct'}),
      this.button('Try again',()=>{this.clearAnswer();this.render();},{disabled:this.busy}),
      this.button(a.exercise+1<l.exercises.length?'Next exercise':'Revisit first exercise',async()=>{a.exercise=(a.exercise+1)%l.exercises.length;this.clearAnswer();await this.persist(p=>{p.resume={...a};});this.render();},{disabled:this.busy}),
      r?.struggled&&this.p('Saved for another visit. A clean correct answer clears this exercise from your difficult list.','learn-small'),
      record.status==='completed'&&h('div',{class:'learn-completion'},h('h3',{},'Lesson completed'),this.p('You have passed every exercise. Return any time to practise again.')))));
  }
  cancelPuzzleSound() {this.doc.defaultView.clearTimeout(this.puzzleSoundTimer);this.puzzleSoundTimer=null;}
  clearAnswer() {this.stopPuzzleAnalysis();this.cancelBoardInput?.();this.cancelPuzzleSound();this.cancelPuzzleReply();this.cancelPieceTransition?.();this.opponentPlaying=false;this.hintSquare=null;this.hintArrow=null;this.hintStep=null;this.promotionPending=null;this.boardMarks?.clear();this.boardArrows=[];this.feedback=null;this.wrongMove=null;this.puzzleResult=null;this.selected=null;this.marked.clear();this.exerciseFen=null;this.revealedSquares=null;this.lastMove=null;}
  async checkExercise(ex,answer) {
    // Bound detector work off the UI thread. Unsupported environments retain the
    // same pure validator; tests and rules-only exercises need no worker.
    if (ex.type!=='move'||!ex.objective.startsWith('event:')||typeof Worker==='undefined') return validateExercise(ex,answer);
    try {
      if(!this.worker){this.worker=new Worker(this.url('lib/learning/validation-worker.js'),{type:'module'});this.worker.onmessage=({data})=>{this.workerPending.get(data.id)?.(data.result);this.workerPending.delete(data.id);};this.worker.onerror=()=>this.stopWorker();}
      const id=++this.workerSeq;
      return await new Promise(resolve=>{const timer=setTimeout(()=>{this.workerPending.delete(id);this.stopWorker();resolve({status:'inconclusive',feedback:'Validation timed out. No incorrect answer was recorded.'});},15000);this.workerPending.set(id,r=>{clearTimeout(timer);resolve(r);});this.worker.postMessage({id,exercise:ex,answer});});
    } catch {this.stopWorker();return {status:'inconclusive',feedback:'The validator is unavailable. No incorrect answer was recorded.'};}
  }
  async submitExercise(answer) {
    if(this.busy||this.activity?.kind!=='lesson')return;
    const a=this.activity,l=LESSONS.find(l=>l.id===a.id),index=a.exercise,ex=l.exercises[index],generation=this.generation;
    this.busy=true;this.render();const r=await this.checkExercise(ex,answer);
    if(this.closed||generation!==this.generation){this.busy=false;return;}
    this.feedback=r;
    if(r.status==='correct'&&ex.type==='move'){const c=new Chess(ex.fen);playUci(c,answer);this.exerciseFen=c.fen();this.lastMove=answer;}
    if(['correct','incorrect'].includes(r.status)) await this.persist(p=>{const entry=p.lessons[l.id],e=entry.exercises[index]||={};if(r.status==='correct'){e.passed=true;e.struggled=false;}else{e.mistakes=(e.mistakes||0)+1;e.struggled=true;}entry.status=l.exercises.every((_,i)=>entry.exercises[i]?.passed)?'completed':'in progress';p.resume=entry.status==='completed'?null:{...a};});
    this.busy=false;this.render();
  }
  feedbackView() {return this.feedback?this.h('div',{class:'learn-feedback '+this.feedback.status,role:'status','aria-live':'polite'},
    this.feedback.title&&this.h('strong',{},this.feedback.title),this.h('div',{},this.feedback.feedback)):this.busy?this.p('Checking your answer…','learn-feedback'):null;}
  moveNavigation(index,total,action) {return this.h('div',{class:'learn-move-nav'},this.button('⏮',()=>action(0),{'aria-label':'First position',disabled:index===0}),this.button('←',()=>action(index-1),{'aria-label':'Previous position',disabled:index===0}),this.h('span',{},`${index} / ${total}`),this.button('→',()=>action(index+1),{'aria-label':'Next position',disabled:index===total}),this.button('⏭',()=>action(total),{'aria-label':'Last position',disabled:index===total}));}
  moveInput() {
    const input=this.h('input',{type:'text',placeholder:'Move, e.g. Nf3 or e2e4','aria-label':'Enter a chess move','data-focus':'move-input',autocomplete:'off'});
    const submit=e=>{e.preventDefault();let value=input.value.trim();if(!value)return;try{const c=new Chess(this.currentFen()),promotions=c.moves({verbose:true}).filter(m=>m.promotion&&(m.from+m.to===value||m.san.replace(/=[QRBN]/,'')===value));if(promotions.length){this.promotionPending={moves:promotions};this.render();return;}const m=/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(value)?playUci(c,value):c.move(value);this.submitMove(m.lan);}catch{this.feedback={status:'illegal',feedback:'That move is not legal here. Use algebraic notation or select a piece and destination.'};this.render();}};
    return this.h('div',{},this.p('Select a piece and destination, drag a piece, or type a move.','learn-small'),this.h('form',{class:'learn-move-input',onsubmit:submit},input,this.h('button',{type:'submit',class:'learn-button',disabled:this.busy||['correct','completed','revealed'].includes(this.feedback?.status)},'Play')));
  }
  currentFen() {
    if(this.puzzleAnalysis)return this.puzzleAnalysis.chess.fen();
    const a=this.activity;if(!a)return this.homePosition.fen();if(a.kind==='lesson')return LESSONS.find(l=>l.id===a.id).exercises[a.exercise].fen;
    if(a.kind==='puzzle'){const p=this.puzzles.find(p=>p.id===a.id),c=new Chess(p.fen);for(const m of p.solution.slice(0,a.step))playUci(c,m);return this.puzzleFen||c.fen();}
    return this.openingState.positions[a.ply];
  }
  submitMove(value) {
    if(this.busy||this.closed||this.closing||this.transitioning)return;
    if(this.puzzleAnalysis)return this.submitAnalysisMove(value);
    if(!this.activity){
      let move;try {move=playUci(this.homePosition,value);}catch {return;}
      this.selected=null;this.lastMove=move.lan;this.render();
    } else if(this.activity.kind==='lesson')this.submitExercise(value);else if(this.activity.kind==='opening')this.submitOpening(value);else this.submitPuzzle(value);
  }
  board(fen,{interactive=false,squareSelection=false,highlights=[],hint=null,last=null}={}) {
    this.renderedBoard={fen,flipped:this.flipped};
    if(this.markupFen!==fen){this.boardMarks=new Set();this.boardArrows=[];this.markupFen=fen;}
    const h=this.h,c=new Chess(fen),files=this.flipped?[...'hgfedcba']:[...'abcdefgh'],ranks=this.flipped?[1,2,3,4,5,6,7,8]:[8,7,6,5,4,3,2,1];
    const board=h('div',{class:'learn-board','aria-label':`${c.turn()==='w'?'White':'Black'} to move. Chessboard.`});
    if(this.activity?.kind==='puzzle'&&!this.puzzleAnalysis)board.dataset.puzzleBoard='';
    const position=()=>new Chess(this.currentFen()||fen);
    const playerColor=()=>this.activity?.kind==='puzzle'&&!this.puzzleAnalysis?this.puzzles.find(p=>p.id===this.activity.id).fen.split(' ')[1]:position().turn();
    const pick=sq=>{
      this.boardFocus=sq;
      if(!interactive)return;
      this.wrongMove=null;
      this.puzzleResult=null;
      if(squareSelection){if(this.marked.has(sq))this.marked.delete(sq);else{const ex=LESSONS.find(l=>l.id===this.activity.id).exercises[this.activity.exercise];if(ex.selection==='one')this.marked.clear();this.marked.add(sq);}this.render();return;}
      const c=position(),piece=c.get(sq);
      if(this.selected&&sq!==this.selected&&piece?.color!==c.turn()) {
        const promotion=(this.promotion||'q'),legal=c.moves({verbose:true}).find(m=>m.from===this.selected&&m.to===sq&&(!m.promotion||m.promotion===promotion));
        if(legal){this.selected=null;move(legal.from,legal.to);return;}
      }
      this.selected=this.selected===sq?null:piece?.color===playerColor()?sq:null;this.render();
    };
    const destinations=interactive&&!squareSelection&&this.selected?c.moves({verbose:true}).filter(m=>m.from===this.selected).map(m=>m.to):[];
    const pointerInput = !!this.embedded?.startDrag;
    const move = (from,to) => {
      if(this.busy)return;
      const c=position();
      const moves=c.moves({verbose:true}).filter(m=>m.from===from&&m.to===to);
      if(!moves.length)return;
      this.selected=null;
      if(moves.some(m=>m.promotion)) {
        this.promotionPending={moves}; this.render();
      } else this.submitMove(moves[0].lan);
    };
    const down = (e,sq) => {
      if(!pointerInput || !interactive || this.busy&&!this.opponentPlaying)return;
      e.preventDefault();
      const live=e.currentTarget.closest('.board'), view=this.doc.defaultView;
      const squares=()=>Object.fromEntries([...live.querySelectorAll('[data-square]')].map(n=>[n.dataset.square,n]));
      const squareAt=ev=>{
        const r=live.getBoundingClientRect(),x=ev.clientX-r.left,y=ev.clientY-r.top;
        if(x<0||y<0||x>=r.width||y>=r.height)return null;
        return files[Math.floor(x/r.width*8)]+ranks[Math.floor(y/r.height*8)];
      };
      const previousSelection=this.selected;
      this.cancelBoardInput?.();
      this.selected=previousSelection;
      if(e.button===2) {
        this.selected=null;Object.values(squares()).forEach(n=>n.classList.remove('selected','sel','legal','legal-cap'));
        const cleanup=()=>{view.removeEventListener('pointerup',up);view.removeEventListener('pointercancel',cleanup);view.removeEventListener('blur',cleanup);this.cancelBoardInput=null;};
        const up=ev=>{if(ev.pointerId!==e.pointerId)return;cleanup();const to=squareAt(ev);if(!to)return;
          this.boardMarks ||= new Set(); this.boardArrows ||= [];
          if(to===sq){if(this.boardMarks.has(sq))this.boardMarks.delete(sq);else this.boardMarks.add(sq);}
          else {const i=this.boardArrows.findIndex(a=>a.from===sq&&a.to===to);if(i>=0)this.boardArrows.splice(i,1);else this.boardArrows.push({from:sq,to});}
          this.render();};
        view.addEventListener('pointerup',up);view.addEventListener('pointercancel',cleanup);view.addEventListener('blur',cleanup);this.cancelBoardInput=cleanup;return;
      }
      if(e.button!==0)return;
      this.wrongMove=null;Object.values(squares()).forEach(n=>n.classList.remove('puzzle-wrong','puzzle-correct'));
      this.puzzleResult=null;live.querySelectorAll('.puzzle-result-badge').forEach(n=>{n.parentElement.classList.remove('has-badge');n.remove();});
      this.boardMarks?.clear();this.boardArrows=[];live.querySelector('.user-arrows')?.remove();
      Object.values(squares()).forEach(n=>n.classList.remove('marked'));
      if(squareSelection){pick(sq);return;}
      const c=position();
      if(!this.busy && this.selected && sq!==this.selected && c.moves({verbose:true}).some(m=>m.from===this.selected&&m.to===sq)){move(this.selected,sq);return;}
      const piece=c.get(sq);this.selected=previousSelection===sq?null:piece?.color===playerColor()?sq:null;
      const selection=()=>{
        const cells=squares(),c=position();
        Object.values(cells).forEach(n=>n.classList.remove('selected','sel','legal','legal-cap'));
        if(!this.selected)return;
        cells[this.selected]?.classList.add('sel');
        for(const m of c.moves({verbose:true}).filter(m=>m.from===this.selected))cells[m.to]?.classList.add(m.captured?'legal-cap':'legal');
      };
      selection();if(!piece)return;
      this.cancelBoardInput=this.embedded.startDrag(e,sq,{squares:squares(),fen:()=>this.currentFen(),squareAt,move,deselect:()=>{this.selected=null;selection();}});
    };
    ranks.forEach((rank,ri)=>files.forEach((file,ci)=>{
      const sq=file+rank,piece=c.get(sq),light=(file.charCodeAt(0)-97+8-rank)%2===0;
      const node=h('button',{type:'button',class:'learn-square sq '+(light?'light':'dark')+(this.selected===sq||this.marked.has(sq)?(pointerInput&&!squareSelection?' sel':' selected'):'')+(this.boardMarks?.has(sq)?' marked':'')+(highlights?.includes(sq)?' annotated':'')+(last&&(last.slice(0,2)===sq||last.slice(2,4)===sq)?' last-move':''),
        'data-square':sq,'data-focus':'square-'+sq,tabindex:sq===(this.boardFocus||files[0]+ranks[0])?'0':'-1','aria-label':sq+(piece?`, ${piece.color==='w'?'White':'Black'} ${NAMES[piece.type]}`:', empty'),
        'aria-pressed':squareSelection?(this.marked.has(sq)?'true':'false'):null,onpointerdown:e=>down(e,sq),oncontextmenu:e=>e.preventDefault(),onclick:e=>{if(pointerInput&&e.detail)return;pick(sq);},ondragover:e=>{if(interactive)e.preventDefault();},ondrop:e=>{e.preventDefault();const from=e.dataTransfer.getData('text/plain');if(!interactive||squareSelection)return;move(from,sq);}});
      if(hint===sq)node.classList.add('puzzle-hint-square');
      if(!this.puzzleAnalysis&&this.activity?.kind==='puzzle' && this.wrongMove?.includes(sq))node.classList.add('puzzle-wrong');
      if(!this.puzzleAnalysis&&this.activity?.kind==='puzzle'&&this.puzzleResult?.status==='correct'&&[this.puzzleResult.from,this.puzzleResult.square].includes(sq))node.classList.add('puzzle-correct');
      if(ri===0)node.classList.add('top-row');if(ci===7)node.classList.add('right-col');
      if(!this.puzzleAnalysis&&this.activity?.kind==='puzzle' && this.puzzleResult?.square===sq){node.classList.add('has-badge');node.append(puzzleResultBadge(this.doc,this.puzzleResult.status));}
      if(piece){const image=this.makePiece(piece.type,piece.color);image.draggable=!pointerInput&&interactive&&!squareSelection&&piece.color===playerColor();image.addEventListener('dragstart',e=>{if(pointerInput){e.preventDefault();return;}e.dataTransfer.setData('text/plain',sq);});node.append(image);}
      if(ci===0)node.append(h('span',{class:'learn-coordinate rank','aria-hidden':'true'},rank));if(ri===7)node.append(h('span',{class:'learn-coordinate file','aria-hidden':'true'},file));
      if(destinations.includes(sq)){if(pointerInput)node.classList.add(piece?'legal-cap':'legal');else node.append(h('span',{class:'learn-legal-dot','aria-hidden':'true'}));}board.append(node);
    }));
    if(this.boardArrows?.length && this.embedded?.drawArrow){const svg=this.doc.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','user-arrows');svg.setAttribute('viewBox','0 0 8 8');svg.setAttribute('aria-hidden','true');svg.append(...this.boardArrows.map(a=>this.embedded.drawArrow(a.from,a.to,this.flipped)));board.append(svg);}
    if(!this.puzzleAnalysis&&this.activity?.kind==='puzzle'&&this.hintArrow)board.append(this.puzzleHintArrow(this.hintArrow));
    return h('div',{class:'learn-board-column'},board);
  }

  puzzlesView() {
    const h=this.h, items=this.filteredPuzzles();
    const ratings=this.puzzles.map(p=>p.rating), min=Math.floor(Math.min(...ratings)/50)*50, max=Math.max(min+50,Math.ceil(Math.max(...ratings)/50)*50);
    const range=this.puzzleRange || [min,max];
    const updateRange=(index,value)=>{
      const next=[...(this.puzzleRange||range)];
      next[index]=index===0?Math.max(min,Math.min(value,next[1]-50)):Math.min(max,Math.max(value,next[0]+50));
      this.puzzleRange=next;
      this.root.querySelectorAll('.learn-dual-range input').forEach((n,i)=>{n.value=next[i];n.setAttribute('aria-valuetext',next[i]+' Elo');});
      this.root.querySelectorAll('[data-range-output]').forEach((n,i)=>{n.textContent=next[i];});
      const track=this.root.querySelector('.learn-dual-range');
      track.style.setProperty('--range-low',(next[0]-min)/(max-min)*100+'%');
      track.style.setProperty('--range-high',(next[1]-min)/(max-min)*100+'%');this.updatePuzzleSelection();
    };
    const slider=(label,index)=>h('input',{type:'range',min,max,step:50,value:range[index],'aria-label':label,'aria-valuetext':range[index]+' Elo','data-focus':'elo-'+index,
      oninput:e=>updateRange(index,Number(e.target.value))});
    const track=h('div',{class:'learn-dual-range',style:'--range-low:'+(range[0]-min)/(max-min)*100+'%;--range-high:'+(range[1]-min)/(max-min)*100+'%',
      onpointerdown:e=>{
        if(e.target.tagName==='INPUT'||e.button!==0)return;
        e.preventDefault();this.cancelRangeInput?.();
        const bounds=track.getBoundingClientRect(),view=this.doc.defaultView;
        const value=ev=>Math.round((min+(ev.clientX-bounds.left)/bounds.width*(max-min))/50)*50;
        const current=this.puzzleRange||range,index=Math.abs(value(e)-current[0])<=Math.abs(value(e)-current[1])?0:1;
        const move=ev=>{if(ev.pointerId===e.pointerId)updateRange(index,value(ev));};
        const stop=()=>{view.removeEventListener('pointermove',move);view.removeEventListener('pointerup',stop);view.removeEventListener('pointercancel',stop);this.cancelRangeInput=null;};
        this.cancelRangeInput=stop;move(e);track.querySelectorAll('input')[index].focus({preventScroll:true});
        view.addEventListener('pointermove',move);view.addEventListener('pointerup',stop);view.addEventListener('pointercancel',stop);
      }},h('div',{class:'learn-range-rail','aria-hidden':'true'}),slider('Minimum',0),slider('Maximum',1));
    return h('div',{class:'learn-puzzles'},h('section',{class:'learn-puzzle-start'},
      this.heading('Solve a puzzle'),this.puzzleRatingView(),
      this.button('Solve a puzzle',()=>this.startRatedPuzzles(),{class:'learn-button primary','data-focus':'solve-puzzle',disabled:!items.length&&!this.unfinishedPuzzle()}),
      this.ratedLibraryComplete&&this.button('Practise again',()=>this.startPuzzleSelection(items)),
      !items.length&&this.p('No puzzles match. Widen the Elo range or choose another type.','learn-small')),
      h('section',{class:'learn-puzzle-options'},h('div',{class:'learn-list-heading'},h('h3',{},'Puzzle settings'),this.button('Reset',()=>{this.puzzleRange=null;this.puzzleThemes.clear();this.render();},{class:'learn-button learn-text-button'})),
        h('fieldset',{class:'learn-elo-range'},h('legend',{},'Puzzle Elo'),h('output',{class:'learn-range-value','aria-label':'Selected Elo range'},h('span',{'data-range-output':0},range[0]),' – ',h('span',{'data-range-output':1},range[1]),' Elo'),track),
        h('fieldset',{class:'learn-theme-list'},h('legend',{},'Puzzle types'),
          h('label',{class:'learn-theme-row'},h('input',{type:'checkbox',checked:!this.puzzleThemes.size,'data-focus':'theme-all',onchange:()=>{this.puzzleThemes.clear();this.render();}}),h('span',{},'All types')),
          ...Object.entries(THEME_NAMES).map(([theme,name])=>h('label',{class:'learn-theme-row'},
            h('input',{type:'checkbox',checked:this.puzzleThemes.has(theme),'data-focus':'theme-'+theme,onchange:e=>{if(e.target.checked)this.puzzleThemes.add(theme);else this.puzzleThemes.delete(theme);this.render();}}),h('span',{},name)))),
        h('span',{class:'learn-small','data-puzzle-matches':'',role:'status'},items.length+' puzzles available')));
  }
  updatePuzzleSelection() {
    const count=this.filteredPuzzles().length;
    const button=this.root.querySelector('[data-focus="solve-puzzle"]');if(button)button.disabled=!count&&!this.unfinishedPuzzle();
    const label=this.root.querySelector('[data-puzzle-matches]');if(label)label.textContent=count+' puzzles available';
  }
  filteredPuzzles() {
    return this.puzzles.filter(p=>(!this.puzzleRange || p.rating>=this.puzzleRange[0]&&p.rating<=this.puzzleRange[1])
      && (!this.puzzleThemes.size || p.themes.some(t=>this.puzzleThemes.has(t))));
  }
  shuffle(items) {const list=[...items];for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]];}return list;}
  puzzleRatingView(puzzle = null) {
    const h=this.h,rating=normalizePuzzleRating(this.store.value.puzzleRating),result=puzzle&&this.store.value.puzzles[puzzle.id]?.ratingResult;
    const change=result&&this.activity?.rated ? result : null;
    return h('section',{class:'puzzle-elo-panel','aria-label':'Your puzzle Elo'},
      h('div',{class:'puzzle-elo-number'},h('strong',{'data-puzzle-elo':'','aria-label':rating.elo.toLocaleString()+' Elo'},Math.round(this.displayedPuzzleElo??rating.elo).toLocaleString()),h('span',{},'Elo')),
      h('span',{class:'puzzle-solved-count'},progressTotals(this.store.value).unique+' puzzles solved'),
      change&&h('strong',{class:'puzzle-elo-change '+(change.won?'gain':'loss'),role:'status'},(change.delta>0?'+':'')+change.delta+' Elo'));
  }
  cancelEloAnimation() {
    if(this.eloFrame!=null)this.doc.defaultView.cancelAnimationFrame?.(this.eloFrame);
    this.eloFrame=null;this.eloMotion=null;
    this.root?.querySelectorAll('.puzzle-elo-panel').forEach(n=>delete n.dataset.eloMotion);
  }
  syncPuzzleElo() {
    if(!this.root||this.closed)return;
    const view=this.doc.defaultView,elo=normalizePuzzleRating(this.store.value.puzzleRating).elo;
    const counters=this.root.querySelectorAll('[data-puzzle-elo]');
    if(!counters.length){this.cancelEloAnimation();this.displayedPuzzleElo=null;this.eloTarget=null;return;}
    const paint=value=>{
      this.displayedPuzzleElo=value;
      this.root.querySelectorAll('[data-puzzle-elo]').forEach(n=>{n.textContent=Math.round(value).toLocaleString();n.setAttribute('aria-label',elo.toLocaleString()+' Elo');});
      this.root.querySelectorAll('.puzzle-elo-panel').forEach(n=>{if(this.eloMotion)n.dataset.eloMotion=this.eloMotion;else delete n.dataset.eloMotion;});
    };
    if(this.displayedPuzzleElo==null||!this.puzzleMotionEnabled()||!view.requestAnimationFrame){this.cancelEloAnimation();this.eloTarget=elo;paint(elo);return;}
    if(this.eloFrame!=null&&this.eloTarget===elo){paint(this.displayedPuzzleElo);return;}
    const from=this.displayedPuzzleElo;this.cancelEloAnimation();this.eloTarget=elo;
    if(from===elo){paint(elo);return;}
    this.eloMotion=elo>from?'gain':'loss';
    const start=view.performance.now(),duration=elo>from?900:350;
    const tick=now=>{
      if(this.closed||this.closing){this.cancelEloAnimation();return;}
      const progress=this.puzzleMotionEnabled()?Math.min(1,Math.max(0,(now-start)/duration)):1;
      paint(from+(elo-from)*(1-Math.pow(1-progress,3)));
      if(progress<1)this.eloFrame=view.requestAnimationFrame(tick);
      else {this.eloFrame=null;this.eloMotion=null;paint(elo);}
    };
    paint(from);this.eloFrame=view.requestAnimationFrame(tick);
  }
  unfinishedPuzzle() {
    const resume=this.store.value.puzzleResume;
    const puzzle=resume&&this.puzzles.find(p=>p.id===resume.id);
    return puzzle&&Number.isInteger(resume.step)&&resume.step>=0&&resume.step<puzzle.solution.length&&resume.step%2===0 ? {puzzle,resume} : null;
  }
  async startRatedPuzzles() {
    if(this.busy||this.run||this.closing||this.closed||this.startingRated)return;
    this.startingRated=true;const generation=this.generation;
    try {
      await this.store.load();
      if(this.closed||this.closing||generation!==this.generation)return;
      const unfinished=this.unfinishedPuzzle();
      if(unfinished)return await this.startPuzzleSelection([unfinished.puzzle],unfinished.resume,{adaptive:!!unfinished.resume.adaptive});
      const puzzle=pickRatedPuzzle(this.filteredPuzzles(),this.store.value);
      if(!puzzle){this.ratedLibraryComplete=true;await this.navigate('puzzles');return;}
      this.ratedLibraryComplete=false;
      return await this.startPuzzleSelection([puzzle],null,{adaptive:true});
    } finally {this.startingRated=false;}
  }
  async startPuzzleSelection(items,resume=null,{adaptive=false}={}) {
    if(this.busy||this.closed||this.closing)return;
    if(!items.length){this.feedback=null;this.activity=null;this.page='puzzles';this.filters.status='Mistakes';this.render();return;}
    this.adaptivePuzzles=adaptive;this.adaptiveSeen=new Set(items.length===1?[items[0].id]:[]);
    this.result=null;this.page='puzzles';this.queue=this.shuffle(items);this.queueIndex=0;this.generation++;this.scrollToTop(true);await this.preparePuzzle(this.queue[0],resume);
  }
  async preparePuzzle(puzzle,resume=null) {
    const from=this.displayedBoard;
    this.busy=true;this.clearAnswer();this.hintSquare=null;this.puzzleFen=null;this.solutionPly=0;this.attemptRecorded=false;
    const step=Number.isInteger(resume?.step)&&resume.step>=0&&resume.step<puzzle.solution.length&&resume.step%2===0?resume.step:0;
    this.puzzleMoves=puzzle.solution.slice(0,step);
    this.activity={kind:'puzzle',id:puzzle.id,step,assisted:!!resume?.assisted,mistakes:resume?.mistakes||0,
      rated:resume?.rated ?? canRatePuzzle(this.store.value,puzzle),adaptive:!!this.adaptivePuzzles};
    this.flipped=puzzle.fen.split(' ')[1]==='b';
    const activity=this.activity,setup=this.puzzleSetup(puzzle,resume);
    const current=()=>!this.closed&&!this.closing&&this.activity===activity;
    this.puzzleFen=setup?puzzle.setup.fen:this.solutionFen(puzzle,step);
    if(setup)this.feedback={status:'info',feedback:'Opponent’s move'};
    this.render();
    const arranging=this.arrangePuzzlePieces(from,this.displayedBoard);
    const attempt={...this.activity};
    if(!this.run)await this.persist(p=>{p.resume={...attempt};p.puzzleResume={...attempt};});
    if(!current())return;
    // Persisted assistance or an old resumed mistake can never become a win.
    if(attempt.rated&&(attempt.mistakes||attempt.assisted))await this.persist(progress=>ratePuzzle(progress,puzzle,false,attempt.mistakes?'wrong':'hint'));
    await arranging;
    if(!current())return;
    if(setup){
      this.opponentPlaying=true;this.render();
      if(this.puzzleMotionEnabled()&&!await this.waitForPuzzleReply(450))return;
      if(!current())return;
      this.puzzleFen=puzzle.fen;this.lastMove=puzzle.setup.move;this.render();
      this.onPuzzleMove(setup.san);
      await this.animatePuzzleReply(puzzle.setup.move,{duration:420});
      if(!current())return;
      this.feedback=null;
    }
    this.opponentPlaying=false;this.busy=false;this.render({preservePickup:true});if(this.run){this.run.clock.ready();this.updateClock();}
  }
  puzzleSetup(puzzle,resume) {
    const record=this.store.value.puzzles[puzzle.id];
    if(resume||record?.attempts||record?.ratingResult||!puzzle.setup?.fen||!puzzle.setup?.move)return null;
    try {
      const position=new Chess(puzzle.setup.fen),move=playUci(position,puzzle.setup.move);
      return position.fen()===puzzle.fen?move:null;
    } catch {return null;}
  }
  async arrangePuzzlePieces(from,to) {
    const board=this.boardElement||this.root.querySelector('.learn-board');
    if(!from||!to||!board?.animate||!board.getBoundingClientRect().width||!this.puzzleMotionEnabled())return;
    const routes=pieceRoutes(from.fen,to.fen,{fromFlipped:from.flipped,toFlipped:to.flipped});
    const transition=slidePuzzlePieces(board,routes,this.makePiece);
    this.cancelPieceTransition=()=>transition.cancel();
    try {await transition.finished;}
    finally {this.cancelPieceTransition=null;}
  }
  puzzleView() {
    const h=this.h,a=this.activity,p=this.puzzles.find(p=>p.id===a.id),done=['completed','revealed'].includes(this.feedback?.status);
    const fen=done&&this.feedback.status==='revealed'?this.solutionFen(p,this.solutionPly):this.puzzleFen||this.solutionFen(p,a.step);
    const board=this.board(fen,{interactive:!done&&(!this.busy||this.opponentPlaying),hint:this.hintSquare,last:this.lastMove});
    const showTurn=!done&&!this.busy&&(!this.feedback||this.feedback.status==='info');
    const status=showTurn?(new Chess(fen).turn()==='w'?'White to move':'Black to move'):this.feedback?.title || (this.replyPending?'Opponent’s turn':this.feedback?.feedback||'');
    return h('div',{class:'puzzle-session'},
      h('div',{class:'puzzle-practice-heading'},this.heading(this.run?'Timed challenge':'Puzzle practice')),
      this.run&&h('div',{class:'learn-timer',role:'timer','aria-label':'Time remaining'},h('strong',{id:'learn-clock'}),this.button('Finish challenge',()=>this.finishChallenge('Ended early'),{disabled:this.busy})),
      this.puzzleRatingView(p),
      h('div',{class:'learn-study'},board),
      h('div',{class:'puzzle-practice-actions'},
        done?this.button('Next puzzle →',()=>this.nextPuzzle(),{class:'learn-button primary',disabled:this.busy}):
          [this.button('Hint',()=>this.hintPuzzle(),{class:'learn-button puzzle-hint',disabled:this.busy,'data-focus':'puzzle-hint'}),
            this.button('Skip',()=>this.skipPuzzle(),{class:'learn-button puzzle-skip',disabled:this.busy,'data-focus':'puzzle-skip'})]),
      h('div',{class:'puzzle-practice-status '+(this.feedback?.status||'')+(!showTurn&&(this.feedback?.status==='info'||this.feedback?.status==='illegal')?' puzzle-quiet-status':''),role:'status','aria-live':'polite'},status),
      this.feedback?.status==='completed'&&this.button('Analyse',()=>this.startPuzzleAnalysis(),{class:'learn-button puzzle-analyse',disabled:this.busy,'data-focus':'puzzle-analyse'}));
  }
  startPuzzleAnalysis() {
    if(this.busy||this.closed||this.closing||this.feedback?.status!=='completed'||this.puzzleAnalysis)return;
    const puzzle=this.puzzles.find(p=>p.id===this.activity.id);
    this.cancelBoardInput?.();this.selected=null;this.promotionPending=null;this.boardMarks?.clear();this.boardArrows=[];
    this.run?.clock.pause();
    this.puzzleAnalysis={initialFen:puzzle.fen,chess:new Chess(puzzle.fen),line:[...this.puzzleMoves],index:0,score:null,best:null};
    this.scrollToTop(true);this.analysisRequest=this.requestPuzzleAnalysis();
  }
  releaseAnalysisEngine() {
    this.analysisToken=(this.analysisToken||0)+1;
    this.analysisEngine?.terminate();this.analysisEngine=null;this.analysisEnginePromise=null;
  }
  stopPuzzleAnalysis() {
    this.releaseAnalysisEngine();this.puzzleAnalysis=null;
    this.analysisBar?.remove();this.analysisBar=null;
  }
  returnToCompletedPuzzle() {
    this.cancelBoardInput?.();this.selected=null;this.promotionPending=null;this.boardMarks?.clear();this.boardArrows=[];
    this.stopPuzzleAnalysis();this.render();this.run?.clock.ready();this.updateClock();
  }
  puzzleAnalysisSettingsKey() {
    const s=this.settings();return JSON.stringify([s.enginePath,s.engineDepth,s.engineHash,s.engineSkill]);
  }
  async getAnalysisEngine() {
    if(this.analysisEngine&&!this.analysisEngine.dead)return this.analysisEngine;
    if(!this.analysisEnginePromise){
      const pending=Promise.resolve().then(()=>{
        if(!this.createAnalysisEngine)throw Error('Stockfish is unavailable.');
        return this.createAnalysisEngine();
      }).then(engine=>{
        if(this.analysisEnginePromise!==pending){engine.terminate();throw Error('Analysis cancelled');}
        this.analysisEngine=engine;return engine;
      });
      this.analysisEnginePromise=pending;
    }
    const pending=this.analysisEnginePromise;
    try{return await pending;}finally{if(this.analysisEnginePromise===pending)this.analysisEnginePromise=null;}
  }
  async requestPuzzleAnalysis() {
    const a=this.puzzleAnalysis;if(!a)return;
    const token=this.analysisToken=(this.analysisToken||0)+1,fen=a.chess.fen();
    const valid=()=>!this.closed&&!this.closing&&this.puzzleAnalysis===a&&token===this.analysisToken&&a.chess.fen()===fen;
    this.analysisSettingsKey=this.puzzleAnalysisSettingsKey();
    this.analysisEngine?.cancelPending();this.analysisEngine?.stop();
    a.best=null;a.score=null;a.error=null;a.pending=true;
    const terminal=a.chess.isCheckmate()?{mate:a.chess.turn()==='w'?-1:1}:a.chess.isDraw()?{cp:0}:null;
    if(terminal){a.score=terminal;a.pending=false;this.render({preservePickup:true});return;}
    this.render({preservePickup:true});
    const apply=result=>{
      if(!valid())return;
      const score=result?.score;
      if(!score||!(Number.isFinite(score.cp)||Number.isFinite(score.mate)))return false;
      const sign=fen.split(' ')[1]==='w'?1:-1;
      a.score=score.mate!=null?{mate:score.mate*sign}:{cp:score.cp*sign};
      const move=result.bestmove||result.pv?.split(' ')[0];
      a.best=a.chess.moves({verbose:true}).some(m=>m.lan===move)?move:null;
      this.paintPuzzleAnalysis();return true;
    };
    try {
      const engine=await this.getAnalysisEngine();if(!valid())return;
      const history={initialFen:a.initialFen,moves:a.chess.history({verbose:true}).map(m=>m.lan)};
      const result=await engine.analyse(fen,this.settings().engineDepth||16,1,history,apply);
      if(valid()&&!apply(result))throw Error('No evaluation returned');
    } catch {
      if(valid()){a.best=null;a.score=null;a.error='Analysis is unavailable. You can still move the pieces.';}
    } finally {
      if(valid()){a.pending=false;this.paintPuzzleAnalysis();}
    }
  }
  submitAnalysisMove(value) {
    const a=this.puzzleAnalysis;let move;
    try {move=playUci(a.chess,value);}catch{return;}
    a.line=a.line.slice(0,a.index);a.line.push(move.lan);a.index++;
    this.selected=null;this.onPuzzleMove(move.san);this.analysisRequest=this.requestPuzzleAnalysis();
  }
  stepPuzzleAnalysis(index) {
    const a=this.puzzleAnalysis;if(!a||!Number.isInteger(index)||index<0||index>a.line.length)return;
    this.cancelBoardInput?.();this.selected=null;this.promotionPending=null;
    a.chess.load(a.initialFen);
    for(const move of a.line.slice(0,index))playUci(a.chess,move);
    a.index=index;this.analysisRequest=this.requestPuzzleAnalysis();
  }
  puzzleAnalysisView() {
    const a=this.puzzleAnalysis,h=this.h,board=this.board(a.chess.fen(),{interactive:true,last:a.line[a.index-1]});
    board.classList.add('has-puzzle-analysis');
    return h('div',{class:'puzzle-analysis-session'},h('div',{class:'puzzle-practice-heading'},this.heading('Puzzle analysis')),
      this.p('Move the pieces for either side to explore the position.','learn-small'),h('div',{class:'learn-study'},board),
      h('div',{class:'puzzle-analysis-controls'},this.button('← Back to puzzle',()=>this.returnToCompletedPuzzle()),
        this.button('Reset position',()=>this.stepPuzzleAnalysis(0),{disabled:a.index===0}),
        this.button('Undo move',()=>this.stepPuzzleAnalysis(a.index-1),{disabled:a.index===0}),
        this.button('Redo move',()=>this.stepPuzzleAnalysis(a.index+1),{disabled:a.index===a.line.length})),
      h('div',{class:'puzzle-analysis-status',role:'status','aria-live':'polite'}),
      this.button('Retry analysis',()=>{this.releaseAnalysisEngine();this.analysisRequest=this.requestPuzzleAnalysis();},{class:'learn-button puzzle-analysis-retry',hidden:!a.error}));
  }
  paintPuzzleAnalysis() {
    const a=this.puzzleAnalysis;if(!a||this.closed||this.closing)return;
    const board=this.boardElement||this.root.querySelector('.learn-board');
    const mount=this.embedded?.boardWrap||board?.closest('.learn-board-column');if(!mount)return;
    // As in the review bar, retain the same fill node so CSS can interpolate.
    // Pending positions hold the previous value instead of jumping back to 50%.
    if(!this.analysisBar)this.analysisBar=this.h('div',{role:'img'},this.h('div',{class:'white-fill',style:'height:50%'}),this.h('span',{class:'score top'}),this.h('span',{class:'score bot'},'…'));
    const bar=this.analysisBar;
    if(bar.parentElement!==mount)mount.prepend(bar);
    bar.className='puzzle-analysis-evalbar evalbar eb-'+(this.settings().barStyle||'classic')+(this.flipped?' flipped':'');
    const score=a.score;
    const label=a.error?'Evaluation unavailable':!score?'Evaluation pending':score.mate!=null?'Evaluation: '+(a.chess.isCheckmate()?'checkmate':(score.mate>0?'White':'Black')+' mates in '+Math.abs(score.mate)):'Evaluation: '+(score.cp/100).toFixed(2)+' pawns for White';
    bar.title=label;bar.setAttribute('aria-label',label);
    if(score){
      const cp=score.cp??(score.mate>0?600:-600);
      const share=score.mate!=null?(score.mate>0?100:0):50+Math.max(-600,Math.min(600,cp))/600*46;
      const text=score.mate!=null?(a.chess.isCheckmate()?'#':`M${Math.abs(score.mate)}`):(Math.abs(cp)/100).toFixed(2);
      bar.querySelector('.white-fill').style.height=share+'%';
      bar.querySelector('.score.top').textContent=cp<0?text:'';
      bar.querySelector('.score.bot').textContent=cp>=0?text:'';
    }
    const arrow=board.querySelector('.puzzle-analysis-arrow');
    if(!a.best||arrow?.dataset.move!==a.best||arrow?.dataset.flipped!==String(this.flipped)){
      arrow?.remove();
      if(a.best){const next=this.puzzleHintArrow(a.best,'Best move');next.dataset.move=a.best;next.dataset.flipped=String(this.flipped);board.append(next);}
    }
    const status=this.root.querySelector('.puzzle-analysis-status');
    const text=a.error||(a.pending?'Analysing…':a.chess.isCheckmate()?'Checkmate':a.chess.isDraw()?'Draw':(a.chess.turn()==='w'?'White':'Black')+' to move');
    if(status&&status.textContent!==text)status.textContent=text;
    const retry=this.root.querySelector('.puzzle-analysis-retry');if(retry)retry.hidden=!a.error;
  }
  puzzleHintArrow(move,label='Hint') {
    const svg=this.doc.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('class','best-arrow '+(label==='Hint'?'puzzle-hint-arrow':'puzzle-analysis-arrow'));svg.setAttribute('viewBox','0 0 8 8');
    svg.setAttribute('role','img');svg.setAttribute('aria-label',label+': '+move.slice(0,2)+' to '+move.slice(2,4));
    if(this.embedded?.drawBestArrow)svg.append(this.embedded.drawBestArrow(move.slice(0,2),move.slice(2,4),this.flipped));
    else {
      const point=sq=>[this.flipped?7.5-(sq.charCodeAt(0)-97):sq.charCodeAt(0)-96.5,this.flipped?Number(sq[1])-.5:8.5-Number(sq[1])];
      const [x,y]=point(move.slice(0,2)),[tx,ty]=point(move.slice(2,4)),length=Math.hypot(tx-x,ty-y);
      const path=this.doc.createElementNS(svg.namespaceURI,'path');
      path.setAttribute('d','M0,-.12 H'+(length-.5)+' V-.35 L'+length+',0 L'+(length-.5)+',.35 V.12 H0 Z');
      path.setAttribute('transform','translate('+x+' '+y+') rotate('+(Math.atan2(ty-y,tx-x)*180/Math.PI)+')');path.setAttribute('fill','var(--accent)');path.setAttribute('opacity','.8');svg.append(path);
    }
    return svg;
  }
  cancelPuzzleReply() {
    this.replyAnimation?.cancel();this.replyAnimation=null;
    this.doc.defaultView.clearTimeout(this.replyTimer);this.replyTimer=null;
    this.releaseReply?.(false);this.releaseReply=null;this.replyPending=false;
  }
  waitForPuzzleReply(delay=800) {
    this.replyPending=true;
    return new Promise(resolve=>{this.releaseReply=resolve;this.replyTimer=this.doc.defaultView.setTimeout(()=>{this.replyTimer=null;this.releaseReply=null;this.replyPending=false;resolve(true);},delay);});
  }
  puzzleMotionEnabled() {return this.settings().moveAnim!==false&&!this.doc.defaultView.matchMedia?.('(prefers-reduced-motion: reduce)').matches;}
  animatePuzzleReply(move,{duration=280}={}) {
    if(!this.puzzleMotionEnabled())return;
    const animations=[];
    const slide=(fromSquare,toSquare)=>{
      const from=this.root.querySelector('[data-square="'+fromSquare+'"]'),to=this.root.querySelector('[data-square="'+toSquare+'"]');
      const piece=to?.querySelector('.piece-img, img');if(!from||!piece?.animate)return;
      const a=from.getBoundingClientRect(),b=to.getBoundingClientRect();to.classList.add('puzzle-reply-target');
      const animation=piece.animate([{transform:'translate('+(a.x-b.x)+'px,'+(a.y-b.y)+'px)'},{transform:'translate(0,0)'}],{duration,easing:'ease-out'});
      animations.push(animation);animation.finished.catch(()=>{}).finally(()=>to.classList.remove('puzzle-reply-target'));
    };
    const from=move.slice(0,2),to=move.slice(2,4);slide(from,to);
    if(new Chess(this.currentFen()).get(to)?.type==='k'&&Math.abs(from.charCodeAt(0)-to.charCodeAt(0))===2)slide((to[0]==='g'?'h':'a')+to[1],(to[0]==='g'?'f':'d')+to[1]);
    this.replyAnimation={cancel:()=>animations.forEach(a=>a.cancel())};
    return Promise.allSettled(animations.map(a=>a.finished));
  }
  solutionFen(p,ply) {const c=new Chess(p.fen);for(const m of p.solution.slice(0,ply))playUci(c,m);return c.fen();}
  async submitPuzzle(value) {
    if(this.closed||this.closing||this.activity?.kind!=='puzzle')return;
    if(this.busy||this.attemptRecorded||this.run?.clock.expired()){if(this.run?.clock.expired())await this.finishChallenge('Time is up');return;}
    const a=this.activity,p=this.puzzles.find(p=>p.id===a.id);this.busy=true;this.run?.clock.pause();
    this.cancelPuzzleSound();this.cancelPuzzleReply();
    const generation=this.generation;let replyMove=null;
    const answer=validatePuzzleMove(p,a.step,value);
    this.selected=null;this.wrongMove=null;this.puzzleResult=null;
    if(answer.status==='correct') {
      this.puzzleResult={status:'correct',from:answer.move.from,square:answer.move.to};
      this.puzzleMoves.push(answer.move.lan);
      this.onPuzzleMove(answer.move.san);
      if(this.run)this.run.correctMoves++;this.lastMove=value;this.puzzleFen=answer.fen;a.step++;
      this.hintSquare=null;this.hintArrow=null;this.hintStep=null;
      if(!answer.terminal&&a.step<p.solution.length){
        const c=new Chess(this.puzzleFen),reply=playUci(c,p.solution[a.step]);
        this.feedback={status:'info',title:'Correct move',feedback:'Opponent’s turn'};
        // Save the stable position after the forced reply. Closing during the pause
        // keeps the accepted move without leaving an odd-ply resume or a live timer.
        const snapshot={...a,step:a.step+1};
        this.opponentPlaying=true;
        const waiting=this.waitForPuzzleReply();this.render();
        if(!this.run)await this.persist(p=>{p.resume={...snapshot};p.puzzleResume={...snapshot};});
        if(!await waiting||this.closed||this.closing||generation!==this.generation||this.activity!==a){this.busy=false;return;}
        this.puzzleResult=null;
        replyMove=p.solution[a.step];this.lastMove=replyMove;this.puzzleFen=c.fen();a.step++;
        this.puzzleMoves.push(replyMove);
        this.onPuzzleMove(reply.san);
      }
      if(answer.terminal||a.step>=p.solution.length) {
        this.onPuzzleSuccess();
        this.feedback={status:'completed',title:a.mistakes?'Puzzle completed':a.assisted?'Completed with assistance':'Solved!',feedback:a.mistakes?'You finished the line. The Elo loss stays; further attempts do not change it.':a.assisted?'Review the idea and try another puzzle without help.':'You found the complete continuation.'};
        // Paint the accepted position in the drop event, before storage can yield
        // and expose the old origin square after the drag ghost is released.
        this.render();
        await this.recordAttempt(true,false);
      } else {this.feedback={status:'info',title:'Your turn',feedback:'Your opponent has replied.'};}
    } else {
      this.feedback=answer;
      if(answer.status==='incorrect'){
        this.puzzleResult={status:'incorrect',square:value.slice(2,4)};
        a.mistakes++;if(this.run)this.run.mistakes++;
        this.wrongMove=[value.slice(0,2),value.slice(2,4)];this.onPuzzleWrong();
        this.feedback={status:'incorrect',title:'Wrong move',feedback:'That move is not the puzzle continuation. The position is restored. '+(a.rated?'Your first mistake counts once; further attempts do not cost more Elo.':'This is an unrated retry. Your Elo stays the same.')};
        const snapshot={...a},timed=!!this.run;
        this.render();
        await this.persist(progress=>{
          if(snapshot.rated)ratePuzzle(progress,p,false,'wrong');
          const r=progress.puzzles[snapshot.id]||={clean:0,assisted:0,mistakes:0,attempts:0,struggled:false};
          r.struggled=true;if(!timed){progress.resume={...snapshot};progress.puzzleResume={...snapshot};}
        });
      }
    }
    if(replyMove){
      this.render();await this.animatePuzzleReply(replyMove);
      if(this.closed||this.closing||generation!==this.generation||this.activity!==a)return;
    }
    this.opponentPlaying=false;this.busy=false;this.render({preservePickup:true});this.run?.clock.ready();this.updateClock();
  }
  async recordAttempt(completed,skipped) {
    if(this.attemptRecorded)return;this.attemptRecorded=true;
    const a={...this.activity},puzzle=this.puzzles.find(p=>p.id===a.id);
    if(this.run){if(completed){if(a.assisted)this.run.assisted++;else this.run.solved++;}if(skipped)this.run.skips++;if(a.mistakes||a.assisted||skipped)this.run.missed.push(a.id);}
    await this.persist(p=>{
      if(a.rated)ratePuzzle(p,puzzle,completed&&!a.assisted&&!a.mistakes,skipped?'skip':a.mistakes?'wrong':a.assisted?'solution':'solved');
      recordPuzzle(p,a.id,{completed,skipped,assisted:a.assisted,mistakes:a.mistakes});if(p.resume?.id===a.id)p.resume=null;
      if(!this.run&&p.puzzleResume?.id===a.id)p.puzzleResume=null;
    });
  }
  async hintPuzzle() {
    if(this.busy||this.attemptRecorded||this.run?.clock.expired()){if(this.run?.clock.expired())await this.finishChallenge('Time is up');return;}
    const a=this.activity,p=this.puzzles.find(p=>p.id===a.id),value=p.solution[a.step];a.assisted=true;
    this.hintLevel=this.hintStep===a.step?Math.min(2,this.hintLevel+1):1;this.hintStep=a.step;
    this.hintSquare=value.slice(0,2);this.hintArrow=this.hintLevel===2?value:null;
    this.feedback={status:'info',feedback:this.hintArrow?'Move '+value.slice(0,2)+' to '+value.slice(2,4)+'.':'Move the '+NAMES[new Chess(this.currentFen()).get(this.hintSquare).type]+' on '+this.hintSquare+'.'};
    this.busy=true;this.run?.clock.pause();const snapshot={...a},timed=!!this.run;
    await this.persist(progress=>{if(snapshot.rated)ratePuzzle(progress,p,false,'hint');if(!timed){progress.resume={...snapshot};progress.puzzleResume={...snapshot};}});
    this.busy=false;this.render();this.run?.clock.ready();this.updateClock();
  }
  async revealPuzzle() {
    if(this.run?.clock.expired()){await this.finishChallenge('Time is up');return;}
    if(this.busy||this.attemptRecorded)return;this.busy=true;this.run?.clock.pause();this.activity.assisted=true;this.hintSquare=null;this.hintArrow=null;this.solutionPly=0;
    this.puzzleResult=null;
    await this.recordAttempt(true,false);this.feedback={status:'revealed',feedback:'Solution revealed. This is saved as an assisted solution.'};this.busy=false;this.render();this.run?.clock.ready();this.updateClock();
  }
  async skipPuzzle() {if(this.run?.clock.expired()){await this.finishChallenge('Time is up');return;}if(this.busy||this.attemptRecorded)return;this.busy=true;this.run?.clock.pause();await this.recordAttempt(false,true);this.busy=false;await this.nextPuzzle();}
  async nextPuzzle() {
    if(this.busy||!this.attemptRecorded)return;this.busy=true;this.run?.clock.pause();this.hintSquare=null;
    if(this.adaptivePuzzles){
      await this.store.load();const puzzle=pickRatedPuzzle(this.filteredPuzzles(),this.store.value,{seen:this.adaptiveSeen});
      if(this.closed||this.closing){this.busy=false;return;}
      if(puzzle){this.adaptiveSeen.add(puzzle.id);this.queue.push(puzzle);}
      else this.ratedLibraryComplete=true;
    }
    if(++this.queueIndex>=this.queue.length){this.busy=false;if(this.run)await this.finishChallenge('All puzzles in this run are complete');else{this.activity=null;this.feedback=null;this.page='puzzles';this.render();}return;}
    await this.preparePuzzle(this.queue[this.queueIndex]);
  }
  async startChallenge(duration) {
    this.challengeSetup=null;this.result=null;this.run={duration,clock:new ChallengeClock(duration),solved:0,assisted:0,mistakes:0,skips:0,correctMoves:0,missed:[]};
    await this.startPuzzleSelection(this.puzzles);
    clearInterval(this.ticker);this.ticker=setInterval(()=>{if(this.run?.clock.expired()&&!this.busy)this.finishChallenge('Time is up');else this.updateClock();},200);
  }
  updateClock() {const node=this.root?.querySelector('#learn-clock');if(node&&this.run){const seconds=Math.ceil(this.run.clock.remaining()/1000);node.textContent=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;}}
  async finishChallenge(reason,show=true) {
    if(!this.run||this.finishing)return;this.finishing=true;this.run.clock.pause();clearInterval(this.ticker);
    this.stopPuzzleAnalysis();
    // Record an unfinished puzzle that accumulated mistakes; an untouched board
    // at timeout is not silently counted as a skip or as an attempted puzzle.
    if(!this.attemptRecorded&&(this.activity?.mistakes||this.activity?.assisted))await this.recordAttempt(false,false);
    const run=this.run;this.run=null;
    let result=challengeResult(run,this.store.value.bests[run.duration]||0);
    await this.persist(p=>{result=challengeResult(run,p.bests[run.duration]||0);p.bests[run.duration]=result.best;p.challenges.push(result);p.challenges=p.challenges.slice(-100);});
    this.result={...result,reason};this.activity=null;this.busy=false;this.finishing=false;if(show&&!this.closed){this.scrollToTop();this.render();}
  }
  resultView() {
    const h=this.h,r=this.result;
    return h('section',{class:'learn-results'},h('span',{class:'learn-eyebrow'},`${r.duration/60}-minute challenge · ${r.reason}`),h('h1',{},r.personalBest?'A new personal best.':'Good practice, well played.'),
      h('div',{class:'learn-stats'},...[[r.solved,'Puzzles solved'],[r.mistakes,'Mistakes'],[r.accuracy+'%','Move accuracy'],[r.best,'Personal best'],[r.assisted,'Assisted solutions'],[r.skips,'Skipped']].map(([n,label])=>h('div',{},h('strong',{},n),h('span',{},label)))),
      this.p('Only unassisted completions count toward your timed score. Each puzzle appeared once in this run.'),
      this.button('Review missed puzzles',()=>{const missed=this.puzzles.filter(p=>r.missed.includes(p.id));this.result=null;this.startPuzzleSelection(missed);},{disabled:!r.missed.length,class:'learn-button primary'}),
      this.button('Try another challenge',()=>{this.result=null;this.navigate('puzzles');}),this.button('Back to puzzles',()=>{this.result=null;this.navigate('puzzles');}));
  }

  openingsView() {
    const h=this.h,items=OPENINGS.filter(o=>this.matches(o.title+' '+o.family+' '+o.plans)
      && (this.filters.family==='All'||this.filters.family===o.family)
      && (this.filters.difficulty==='All'||DIFFICULTIES[o.level-1]===this.filters.difficulty));
    return h('div',{},this.heading('Openings'),
      h('div',{class:'learn-filters'},this.search(),this.select('Family','family',['All',...new Set(OPENINGS.map(o=>o.family))]),this.select('Level','difficulty',['All',...DIFFICULTIES]),this.select('Playing color','color',['Both','White','Black'])),
      items.length?h('div',{class:'learn-library'},...items.map(o=>this.card(o.family,o.title,o.lines.length+' variations · '+DIFFICULTIES[o.level-1],()=>this.startOpening(o.id,{color:this.filters.color==='Black'?'b':'w'}),'Study →'))):this.empty('Try another opening family or search term.'));
  }
  async startOpening(id,resume={}) {
    const o=OPENINGS.find(o=>o.id===id);if(!o)return;this.result=null;this.page='openings';this.generation++;this.scrollToTop(true);
    this.activity={kind:'opening',id,line:Math.min(resume.line||0,o.lines.length-1),ply:resume.ply||0,color:resume.color||'w',practice:!!resume.practice};this.openingAssisted=!!resume.assisted;this.clearAnswer();this.setOpeningState();
    if(this.activity.practice)this.autoReply();
    await this.persist(p=>{const r=p.openings[id]||={status:'in progress',completed:{}};if(r.status!=='completed')r.status='in progress';p.resume={...this.activity};});this.render();
  }
  setOpeningState() {const a=this.activity,o=OPENINGS.find(o=>o.id===a.id);this.openingState=linePositions(o.lines[a.line]);a.ply=Math.max(0,Math.min(a.ply,this.openingState.moves.length));this.flipped=a.color==='b';}
  autoReply() {const a=this.activity;if(a.ply<this.openingState.moves.length&&new Chess(this.openingState.positions[a.ply]).turn()!==a.color)a.ply++;}
  openingView() {
    const h=this.h,a=this.activity,o=OPENINGS.find(o=>o.id===a.id),line=o.lines[a.line],max=this.openingState.moves.length,complete=a.practice&&a.ply>=max;
    const lineSelect=h('select',{'aria-label':'Opening variation',disabled:this.busy,onchange:e=>{a.line=+e.target.value;a.ply=0;this.openingAssisted=false;a.assisted=false;this.clearAnswer();this.setOpeningState();if(a.practice)this.autoReply();this.persist(p=>{p.resume={...a};}).then(()=>this.render());}},...o.lines.map((l,i)=>h('option',{value:i},l.name)));lineSelect.value=a.line;
    const colorSelect=h('select',{'aria-label':'Practice color',disabled:this.busy,onchange:e=>{a.color=e.target.value;a.ply=0;this.openingAssisted=false;a.assisted=false;this.clearAnswer();this.setOpeningState();if(a.practice)this.autoReply();this.persist(p=>{p.resume={...a};}).then(()=>this.render());}},h('option',{value:'w'},'White'),h('option',{value:'b'},'Black'));colorSelect.value=a.color;
    return h('div',{},h('div',{class:'learn-activity-head'},this.button('← Opening library',()=>this.navigate('openings'),{disabled:this.busy}),h('span',{class:'learn-eyebrow'},o.family),this.heading(o.title),h('div',{class:'learn-inline'},lineSelect,colorSelect,this.button(a.practice?'Study the line':'Practise this line',async()=>{a.practice=!a.practice;a.ply=0;this.openingAssisted=false;a.assisted=false;this.clearAnswer();if(a.practice)this.autoReply();await this.persist(p=>{p.resume={...a};});this.render();},{class:'learn-button primary',disabled:this.busy}))),
      h('div',{class:'learn-study'},this.board(this.openingState.positions[a.ply],{interactive:a.practice&&!complete&&!this.busy,last:this.lastMove}),h('article',{class:'learn-panel learn-copy'},
        a.practice?h('div',{},h('h3',{},complete?'Line completed':`Your turn as ${a.color==='w'?'White':'Black'}`),!complete&&this.moveInput(),this.feedbackView(),!complete&&this.button('Show the idea',async()=>{this.openingAssisted=true;a.assisted=true;this.feedback={status:'info',feedback:line.notes[a.ply]};await this.persist(p=>{p.resume={...a};});this.render();},{disabled:this.busy}),complete&&this.button('Practise again',async()=>{a.ply=0;this.openingAssisted=false;a.assisted=false;this.feedback=null;this.autoReply();await this.persist(p=>{p.resume={...a};});this.render();})):
          h('div',{},h('h3',{},a.ply?line.moves[a.ply-1]:'The starting position'),this.p(a.ply?line.notes[a.ply-1]:'Choose a variation and step through the moves. Watch how development and central choices work together.'),this.moveNavigation(a.ply,max,async next=>{a.ply=next;this.lastMove=next?this.openingState.moves[next-1]:null;await this.persist(p=>{p.resume={...a};});this.render();}),h('div',{class:'learn-line'},...line.moves.map((san,i)=>this.button(san,async()=>{a.ply=i+1;this.lastMove=this.openingState.moves[i];await this.persist(p=>{p.resume={...a};});this.render();},{'aria-current':a.ply===i+1?'step':null})))),
        h('div',{class:'learn-opening-notes'},...[["Plans for both sides",o.plans],["Pawn structure",o.structure],["Common mistake",o.mistakes],["Thematic tactic",o.tactic]].map(([title,copy])=>h('details',{class:'learn-notes'},h('summary',{},title),this.p(copy)))))));
  }
  async submitOpening(value) {
    if(this.busy)return;const a=this.activity,o=OPENINGS.find(o=>o.id===a.id),line=o.lines[a.line],state=this.openingState,c=new Chess(state.positions[a.ply]);let m;
    try{m=playUci(c,value);}catch{this.feedback={status:'illegal',feedback:'That move is illegal in the current position.'};this.render();return;}
    this.selected=null;
    let next=m.lan===state.moves[a.ply]?a.ply+1:state.positions.findIndex((fen,i)=>i>a.ply&&positionKey(fen)===positionKey(c.fen()));
    if(next<0) {
      const alternate=o.lines.map(linePositions).map((other,index)=>({other,index,ply:other.positions.findIndex(fen=>positionKey(fen)===positionKey(c.fen()))})).find(item=>item.ply>=0);
      if(alternate){a.line=alternate.index;this.openingState=alternate.other;next=alternate.ply;}
    }
    if(next<0){this.feedback={status:'info',feedback:`${m.san} is legal, but outside this selected line. That does not mean it is a bad move. Try the course continuation or study another variation.`};this.render();return;}
    this.busy=true;const note=line.notes[a.ply];a.ply=next;this.lastMove=value;this.autoReply();const completed=a.ply>=this.openingState.moves.length;
    this.feedback={status:completed?'completed':'info',feedback:completed?'You completed the line from your chosen side. Keep the plans in mind when the game takes a different route.':`Good: ${note} The opponent has replied.`};
    await this.persist(p=>{const r=p.openings[o.id];if(completed){r.completed[a.line+':'+a.color]={assisted:!!this.openingAssisted,at:Date.now()};r.status=o.lines.every((_,i)=>['w','b'].every(color=>r.completed[i+':'+color]))?'completed':'in progress';}p.resume=completed?null:{...a};});this.busy=false;this.render();
  }
}
