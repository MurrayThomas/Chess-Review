import {LESSONS, OPENINGS} from './content.js';
import {progressTotals} from './progress.js';

// Presentations developed in separate design worktrees, now selectable together.
export const LEARNING_PRESENTATIONS = [
  {id:'morph', label:'Morph in place', description:'Layered panels reassemble into a spacious card layout.'},
  {id:'morph2', label:'Morph in place 2', description:'A slower board swoop into a centered study space, with room for Settings.'},
  {id:'morph3', label:'Morph in place 3', description:'Your full-size board, familiar piece handling, and a flowing study transition.'},
  {id:'morph4', label:'Morph in place 4', description:'The board stays exactly where it is. A simple study panel for puzzles, openings and concepts.'},
  {id:'studio', label:'Studio Morph', description:'A quick surface morph into a framed studio with understated tabs.'},
  {id:'minimal', label:'Minimal morph', description:'A compact study desk with fine dividers and a light, quick transition.'},
  {id:'board', label:'Board morph', description:'A minimal learning studio with numbered destinations and a short panel fold.'},
  {id:'newway', label:'New way', description:'A warm, editorial study space. One featured position, a clear next step, and your whole library.'},
  {id:'page', label:'Separate page', description:'The original full-screen learning workspace.'},
];

export function presentationFor(settings) {
  if (LEARNING_PRESENTATIONS.some(option=>option.id===settings.learningTransition)) return settings.learningTransition;
  if (settings.learningPresentation === 'studio') return 'board';
  if (settings.learningLayout === 'morph') return 'minimal';
  if (settings.learningLayout === 'page' || settings.learningPresentation === 'page') return 'page';
  return 'morph';
}

// Preserve the Minimal morph and Board morph designs without duplicating their
// lesson, puzzle, opening or progress engines.
export function presentationHome(w) {
  const h=w.h, totals=progressTotals(w.store.value), resume=w.store.value.resume;
  if (w.presentation==='newway') {
    // Keep the featured position stable while browsing; merely viewing it never
    // creates an attempt or overwrites the learner's saved activity.
    const puzzle=w.featuredPuzzle ||= w.puzzles.find(p=>p.solution.length>=3&&!w.store.value.puzzles[p.id]?.clean)||w.puzzles[0];
    const row=(number,title,copy,meta,action)=>h('button',{type:'button',class:'newway-route',onclick:action,'data-focus':'newway-'+number},
      h('span',{class:'newway-route-number'},number),h('span',{class:'newway-route-copy'},h('strong',{},title),h('span',{},copy)),h('span',{class:'newway-route-meta'},meta),h('span',{'aria-hidden':'true'},'↗'));
    const board=w.board(puzzle.fen);
    board.append(h('div',{class:'newway-position-note'},h('span',{class:'newway-live-dot','aria-hidden':'true'}),h('span',{},puzzle.fen.split(' ')[1]==='w'?'White to move':'Black to move'),h('span',{},'Find the best continuation.')));
    board.append(w.button('Try this position ↗',()=>w.startPuzzleSelection([puzzle]),{class:'learn-button primary newway-board-start'}));
    return h('div',{class:'newway-home'},board,
      h('section',{class:'newway-intro'},h('span',{class:'learn-eyebrow'},'THE STUDY / CHESS REVIEW'),h('h1',{},'A fresh look\nat the board.'),w.p('A position to solve. An idea to keep.\nMake a little room for better chess.')),
      h('section',{class:'newway-feature'},h('div',{class:'newway-feature-top'},h('span',{class:'learn-eyebrow'},'ON THE BOARD'),h('span',{class:'newway-feature-tag'},'Unhurried practice')),
        h('h2',{},'Your move.'),w.p('Take a moment. Look for checks, captures and threats. Then put your idea on the board.'),
        w.button('Try this position',()=>w.startPuzzleSelection([puzzle]),{class:'learn-button primary newway-start','data-focus':'featured-puzzle'})),
      resume&&h('section',{class:'newway-resume'},h('span',{},h('small',{},'PICK UP YOUR THREAD'),h('strong',{},w.resumeLabel(resume))),w.button('Continue →',()=>w.resume(resume))),
      h('div',{class:'newway-library-head'},h('h2',{},'Follow your curiosity'),h('span',{},'THE LIBRARY')),
      h('div',{class:'newway-routes'},
        row('01','Puzzles','Train your eye for the opportunity.',w.puzzles.length+' positions',()=>w.navigate('puzzles')),
        row('02','Chess concepts','Understand what makes a move work.',LESSONS.length+' lessons',()=>w.navigate('concepts')),
        row('03','Openings','Meet the position with a plan.',OPENINGS.length+' courses',()=>w.navigate('openings'))),
      h('footer',{class:'newway-progress'},h('span',{},h('strong',{},totals.unique),' puzzles solved'),h('span',{},h('strong',{},totals.lessons),' lessons completed'),h('span',{},'Saved on this device')));
  }
  if (w.presentation==='minimal') return h('div',{class:'learn-desk-home'},
    h('section',{class:'learn-hero'},h('span',{class:'learn-eyebrow'},'YOUR NEXT CHAPTER'),h('h2',{},'Good moves start with understanding.'),
      w.p('One board. Three ways to grow. Choose what you want to work on today.'),
      resume && w.button('Continue where you left off →',()=>w.resume(resume),{class:'learn-button primary'})),
    h('div',{class:'learn-cards destinations'},
      w.card('01 / PRACTISE','Puzzles','Find the move. Train your eye for the next opportunity.',()=>w.navigate('puzzles'),'Practise puzzles →'),
      w.card('02 / UNDERSTAND','Concepts','Turn useful ideas into instincts, one lesson at a time.',()=>w.navigate('concepts'),'Explore concepts →'),
      w.card('03 / PREPARE','Opening theory','Build a repertoire around plans you understand.',()=>w.navigate('openings'),'Study openings →')),
    h('footer',{class:'learn-desk-footer'},h('span',{},`${totals.unique} puzzles solved`),h('span',{},`${totals.lessons} lessons completed`),h('span',{},'Progress saved on this device')));
  if (w.presentation!=='board') return null;
  const row=(number,title,copy,action,count)=>h('button',{type:'button',class:'studio-destination',onclick:action,'data-focus':'destination-'+number},
    h('span',{class:'studio-number'},number),h('span',{class:'studio-destination-copy'},h('strong',{},title),h('span',{},copy)),h('span',{class:'studio-destination-end'},count,h('span',{'aria-hidden':'true'},'↗')));
  return h('div',{class:'studio-home'},
    h('span',{class:'learn-eyebrow'},'A moment to improve'),h('h1',{},'Your next\ngood move.'),w.p('A little practice, a clearer understanding.'),
    h('div',{class:'studio-destinations'},
      row('01','Solve a puzzle','Find the move that changes everything.',()=>w.navigate('puzzles'),w.puzzles.length+' positions'),
      row('02','Understand an idea','Learn the patterns behind good decisions.',()=>w.navigate('concepts'),LESSONS.length+' lessons'),
      row('03','Explore an opening','Know the plan, as well as the moves.',()=>w.navigate('openings'),OPENINGS.length+' courses')),
    h('div',{class:'studio-next'},h('div',{},h('span',{class:'learn-eyebrow'},resume?'Pick up where you left off':'A place to begin'),h('strong',{},resume?w.resumeLabel(resume):'Develop your pieces')),
      w.button(resume?'Continue →':'Start lesson →',()=>resume?w.resume(resume):w.startLesson('development'),{class:'learn-button primary'})),
    h('p',{class:'studio-progress'},`${totals.unique} puzzles solved · ${totals.lessons} lessons completed`));
}

export function presentationChrome(w, header, nav, main) {
  const h=w.h;
  if (w.presentation==='newway') {
    const masthead=h('header',{class:'learn-header newway-masthead'},
      w.button('Chess Review',()=>w.navigate('home'),{class:'learn-button newway-wordmark','data-focus':'newway-home',disabled:!!w.run||w.busy}),
      nav,w.button('← Back to review',()=>w.close(),{class:'learn-button newway-return','data-focus':'review'}));
    w.root.querySelector('.newway-masthead')?.remove();
    w.root.prepend(masthead);
    return [main];
  }
  if (w.presentation==='minimal') return [h('header',{class:'learn-header learn-desk-header'},
    h('div',{},h('span',{class:'learn-eyebrow'},'CHESS REVIEW / STUDY'),h('h1',{},'A little better, every move.')),
    w.button('Back to review',()=>w.close(),{'data-focus':'review',class:'learn-button learn-return'})),nav,main];
  if (w.presentation!=='board') return [header,nav,main];
  nav.querySelector('[data-focus="home"]')?.remove();
  return [h('header',{class:'learn-header studio-top'},
    w.button('Learning Studio',()=>w.navigate('home'),{class:'learn-button studio-wordmark','data-focus':'studio-home','aria-label':'Learning Studio home',disabled:!!w.run||w.busy}),
    w.button('↗ Return to review',()=>w.close(),{class:'learn-button studio-return','data-focus':'review'})),nav,main,
    h('footer',{class:'studio-footer'},h('span',{},w.activity?'One position. One idea.':'Small steps. Stronger chess.'),h('span',{},'Saved on this device'))];
}
