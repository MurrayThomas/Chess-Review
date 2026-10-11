import {Chess} from '../../../../lib/chess.js';
export const input=pgn=>({pgn,source:'authored-E222',eventId:'synthetic-development'});
export const setup=(fen,moves,result='*')=>'[SetUp "1"]\n[FEN "'+fen+'"]\n[Result "'+result+'"]\n\n'+moves+' '+result;
export const cases=[
 ['empty','*'],
 ['ordinary','1. e4 e5 2. Nf3 Nc6 *'],
 ['nested','{root} 1. e4! {first} (1. d4 d5 (1... Nf6 {nested}) 2. c4) {after branch} (1. c4 e5) e5 $255 2. Nf3?! *'],
 ['suffixes','1. e4! e5? 2. Nf3!! Nc6?? 3. Bb5!? a6?! *'],
 ['numeric','1. d4 $0 $10 $11 $12 $13 $14 $15 $16 $17 $255 d5 *'],
 ['escapes','[Event "Quote \\" and slash \\\\"]\n[Annotator "Synthetic"]\n\n;before\n1.e4 ;literal } and { braces\ne5 *'],
 ['escape-line','%private nonarchival synthetic escape\n1.e4 {multi\n% retained inside comment\nline} e5 *'],
 ['black-start',setup('4k3/8/8/8/8/8/8/R3K3 b - - 7 23','23... Kf7 24. Ra7+ (24. Rb1) Ke6')],
 ['castles',setup('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1','1. O-O (1. O-O-O) O-O-O')],
 ['promotion',setup('7k/P7/8/8/8/8/8/4K3 w - - 0 1','1. a8=Q+ (1. a8=N)')],
 ['en-passant',setup('4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 2','2. exd6')],
 ['disambiguation',setup('4k3/8/8/8/8/8/8/1N2KN2 w - - 0 1','1. Nbd2 (1. Nfd2)')],
 ['mate',setup('7k/8/5KQ1/8/8/8/8/8 w - - 0 1','1. Qg7#','1-0')],
 ['reported-result','[Result "0-1"]\n\n1. e4 0-1'],
 ['optional-fifty',setup('4k3/8/8/8/8/8/8/R3K3 w - - 100 1','1. Ra2 Kf7 *'.replace(/ \*$/,''))],
 ['long-comment','{'+('authored '.repeat(40))+'} 1. d4 d5 *'],
 ['repetition-claim-declined','1. Nf3 Nf6 2. Ng1 Ng8 3. Nf3 Nf6 4. Ng1 Ng8 5. Nf3 *'],
 ['set-up-zero','[SetUp "0"]\n\n1. e4 *']
].map(([id,pgn])=>({id,input:input(pgn),options:{enabled:true}}));
export const startFen=new Chess().fen();
export const commentBoundaries=['1. {before first move} e4 *','1. e4 1... {before Black move} e5 *'].map(input);
export const invalids=[
 '1. e5 *','1. e4+ *','1. Pe4 *','1. e2e4 *','1. e4!!! *','1.. e4 *','1... e4 *','2. e4 *',
 '1. e4 (1. d5) *','(1. e4) *','1. e4 () *','1. e4 (1. d4 *','1. e4 (1. d4 1-0) *',
 '1. e4 $256 *','$1 1. e4 *','1. e4 {unclosed *','1. e4','1. e4 * 1. d4 *',
 '[Result "1-0"] 1. e4 *','[Event "a"] [Event "b"] *','[SetUp "1"] *',
 '[FEN "'+startFen+'"] *','[SetUp "2"] *','[Event "bad\\q"] *','[Event "line\nbreak"] *',
 setup('4k3/8/8/8/8/8/8/4K3 w - - 0 1','1. Kf2'),
 setup('4k3/8/8/8/8/8/8/R3K3 w - - 150 1','1. Ra2'),
 setup('4k3/8/8/8/8/8/8/1N2KN2 w - - 0 1','1. Nd2'),
 '1. Nf3 Nf6 2. Ng1 Ng8 3. Nf3 Nf6 4. Ng1 Ng8 5. Nf3 Nf6 6. Ng1 Ng8 7. Nf3 Nf6 8. Ng1 Ng8 9. Nf3 *',
 setup('7k/8/5KQ1/8/8/8/8/8 w - - 0 1','1. Qg7# Kh7'),
 '1. e4 1. *'
];
