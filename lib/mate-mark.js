// Checkmate is shown on the mated king's square: a red glow behind the king and
// a "#" badge in the corner the move grades use. Plain check is not marked.
export function matedKingSquare(chess) {
  if (!chess.isCheckmate()) return null;
  const turn = chess.turn();
  for (const row of chess.board()) {
    for (const piece of row) if (piece?.type === 'k' && piece.color === turn) return piece.square;
  }
  return null;
}

export function mateMark(document) {
  const glow = document.createElement('span');
  glow.className = 'mate-glow';
  glow.setAttribute('aria-hidden', 'true');
  const badge = document.createElement('span');
  badge.className = 'mate-badge';
  badge.setAttribute('role', 'img');
  badge.setAttribute('aria-label', 'Checkmate');
  const vector = (tag, attributes) => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
    return node;
  };
  const svg = vector('svg', {viewBox:'0 0 100 100', width:100, height:100, 'aria-hidden':'true'});
  svg.append(
    vector('circle', {cx:50, cy:50, r:49, fill:'#e02e2e'}),
    vector('path', {d:'M43 25 37 75 M63 25 57 75 M27 41H75 M25 59H73', fill:'none', stroke:'#fff', 'stroke-width':8.5, 'stroke-linecap':'round'}),
  );
  badge.append(svg);
  return [glow, badge];
}
