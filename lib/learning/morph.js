// Capture outgoing review and study panels for the shared learning transition.
export function capturePanels(nodes) {
  return [...nodes].map(node => {
    const style = node.ownerDocument.defaultView.getComputedStyle(node);
    return {node, rect:node.getBoundingClientRect(), snapshot:node.cloneNode(true), style:{fontSize:style.fontSize, fontFamily:style.fontFamily, padding:style.padding}};
  })
    .filter(({rect}) => rect.width > 1 && rect.height > 1);
}
