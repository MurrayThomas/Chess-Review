// Catalog meanings are reference language, never an assessment of the parsed move.
export const references=[
 ['C0985','Algebraic notation','Moves use board coordinates and piece letters.','legal-syntax'],
 ['C0986','Descriptive notation','Historical notation uses relative ranks and piece-file names; a dialect and ambiguity policy are required for conversion.','reference-only'],
 ['C0987','SAN','Legal standard algebraic moves, including disambiguation, capture, promotion, castling and check suffixes.','legal-syntax'],
 ['C0988','PGN','Single-game tagged movetext with legal branches and reported annotations/results.','bounded-format'],
 ['C0989','FEN','Full position fields include side, castling, en-passant and move counters; prior history is not encoded.','position-format'],
 ['C0990','Move number','The fullmove counter increases after Black; a Black-start line uses three dots.','position-format'],
 ['C0991','Variation','A legal hypothetical continuation, without a claim of best play.','legal-tree'],
 ['C0992','Main line','The unparenthesized recorded continuation; this does not establish optimal play.','legal-tree'],
 ['C0993','Side variation','An alternative to the preceding move, replayed from that move\'s before position.','legal-tree'],
 ['C0994','Annotation','Comments and numeric glyphs transport an annotator\'s report.','reported-opinion'],
 ['C0995','!','Good move.','reported-opinion'],['C0996','!!','Brilliant or excellent move.','reported-opinion'],
 ['C0997','?','Mistake.','reported-opinion'],['C0998','??','Blunder.','reported-opinion'],
 ['C0999','!?','Interesting move.','reported-opinion'],['C1000','?!','Dubious move.','reported-opinion'],
 ['C1001','+=','White slightly better.','reference-only'],['C1002','=+','Black slightly better.','reference-only'],
 ['C1003','±','White clearly better.','reference-only'],['C1004','∓','Black clearly better.','reference-only'],
 ['C1005','=','Equal.','reference-only'],['C1006','∞','Unclear or compensation in the teaching catalog; not an interchangeable evaluation proof.','reference-only']
].map(([id,label,description,scope])=>({id,label,description,scope,qualityClaim:false}));
export function notationReferences(){return structuredClone(references);}
