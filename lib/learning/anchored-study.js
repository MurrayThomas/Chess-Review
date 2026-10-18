import {DIFFICULTIES, THEME_NAMES} from './content.js';
import {canRatePuzzle} from './puzzle-rating.js';

// Use the measured review rectangle verbatim. Only the study panel chooses a
// side; Settings and a narrow viewport must never recenter or shrink the board.
export function anchoredLearningLayout({width, height, top = 60, board, settingsWidth = 286, settingsOpen = false}) {
  const edge = 20, gap = width < 1100 ? 24 : 40;
  const right = width - (settingsOpen && width >= 760 ? settingsWidth + 24 : edge);
  const leftEnd = Math.min(board.x - gap, right);
  const leftRoom = leftEnd - edge, rightStart = board.x + board.width + gap;
  const rightRoom = right - rightStart, useRight = rightRoom >= 340 || rightRoom >= leftRoom;
  const room = useRight ? rightRoom : leftRoom, stacked = room < 340;
  const panelWidth = stacked ? Math.max(1, right - edge) : Math.min(800, room);
  const panelX = stacked ? edge : useRight ? rightStart : leftEnd - panelWidth;
  const boardY = board.y - top, boardHeight = board.height || board.width;
  const panelY = stacked ? Math.max(16, boardY + boardHeight + 88) : Math.max(16, boardY);
  return {boardX:board.x, boardY, boardSize:board.width, boardHeight, panelX, panelY, panelWidth,
    panelHeight:Math.max(240, height - top - panelY - 24), stacked};
}

// One primary action, with browsing and timed practice available underneath.
// Disclosure state lives on the workspace because input changes rerender it.
export function anchoredPuzzles(w) {
  const h = w.h, items = w.filteredPuzzles(), resume = w.store.value.resume;
  const mistakes = w.puzzles.filter(p => w.store.value.puzzles[p.id]?.struggled);
  const solved = Object.values(w.store.value.puzzles).filter(p => p.clean > 0).length;
  const disclosure = (key, label, ...children) => h('details', {class:'study-disclosure', open:!!w[key],
    ontoggle:e => {if (e.currentTarget.isConnected) w[key] = e.currentTarget.open;}}, h('summary', {onclick:e => {
      e.preventDefault(); const details=e.currentTarget.parentNode;
      details.open=!details.open; w[key]=details.open;
    }}, label), ...children);
  const filters = disclosure('studyFiltersOpen', 'Filter puzzles',
    h('div', {class:'learn-filters'}, w.select('Difficulty','difficulty',['All',...DIFFICULTIES]),
      w.select('Theme','theme',['All',...Object.values(THEME_NAMES)]),
      w.select('Phase','phase',['All','Opening','Middlegame','Endgame']),
      w.select('Puzzle rating','rating',['Near my Elo','All ratings']),
      w.select('Progress','status',['All','Unsolved','Solved','Assisted','Mistakes'])));
  const timed = disclosure('studyTimedOpen', 'Timed challenge',
    w.p('Solve a mixed set against the clock. Only unassisted solutions count.'),
    h('div', {class:'learn-inline'}, ...[60,300,600].map(seconds => w.button(seconds/60+' min', () => {
      w.challengeSetup = seconds; w.studyTimedOpen = true; w.render();
    }, {'aria-pressed':String(w.challengeSetup===seconds)}))),
    w.challengeSetup && h('div', {class:'learn-rules'},
      h('h3', {}, `${w.challengeSetup/60}-minute challenge`),
      w.p('Wrong moves keep the same position. Skips move to the next puzzle. Hints and revealed solutions are recorded as assisted and do not increase your score.'),
      w.p('Accuracy counts correct legal moves. The clock pauses while loading, checking or saving; thinking time continues in the background. Returning to review ends and saves the run.'),
      w.button('Start challenge', () => w.startChallenge(w.challengeSetup), {class:'learn-button primary'})));
  return h('div', {class:'study-puzzles'},
    h('div', {class:'study-page-title'}, w.heading('Puzzles'), h('span', {}, `${solved.toLocaleString()} solved · ${w.puzzles.length.toLocaleString()} positions`)),
    w.p('Find the best move. Play it on the board.'),
    w.puzzleRatingView(),
    resume && h('div', {class:'study-resume'}, h('span', {}, w.resumeLabel(resume)),
      w.button('Continue', () => w.resume(resume), {'data-focus':'study-resume'})),
    h('section', {class:'study-practice', 'aria-label':'Puzzle practice'},
      h('div', {}, h('h3', {}, 'Rated practice'), w.p('New puzzles near your Elo. The next puzzle adjusts to each result.')),
      w.button('Play at my level', () => w.startRatedPuzzles(), {class:'learn-button primary', 'data-focus':'study-start'}),
      w.button('Review mistakes'+(mistakes.length ? ` (${mistakes.length})` : ''), () => w.startPuzzleSelection(mistakes), {disabled:!mistakes.length})),
    w.ratedLibraryComplete&&w.p('You have tried every new puzzle in this library. Revisit your mistakes or browse below to keep practising.','learn-small'),
    timed,
    h('section', {class:'study-library', 'aria-label':'Puzzle library'},
      h('div', {class:'study-library-heading'}, h('h3', {}, 'Puzzle library'), h('span', {role:'status'}, `${items.length.toLocaleString()} positions`)),
      w.search(), filters,
      h('div', {class:'study-selection'}, w.p('Practise the positions below as a set.'),
        w.button('Practise selection', () => w.startPuzzleSelection(items), {disabled:!items.length})),
      items.length ? h('div', {class:'learn-cards puzzle-library'}, ...items.slice(0,w.puzzleLimit||12).map(p =>
        w.card(`${p.difficulty} · ${p.phase}`, `${THEME_NAMES[p.theme]} · ${p.rating}`,
          w.store.value.puzzles[p.id]?.clean ? 'Solved · unrated review' : canRatePuzzle(w.store.value,p) ? 'New · rated' : 'Previously tried · unrated retry',
          () => w.startPuzzleSelection([p]), 'Solve')))
        : w.empty('No puzzles match these filters. Try another selection.'),
      items.length>(w.puzzleLimit||12) && w.button('Show more puzzles', () => {w.puzzleLimit=(w.puzzleLimit||12)+12; w.render();})));
}
