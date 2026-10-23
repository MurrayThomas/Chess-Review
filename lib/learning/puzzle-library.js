// The shipped library is immutable. Also refresh on replacement or append so
// small composed libraries and test fixtures can use the same workspace.
export class PuzzleLibrary {
  invalidate() {this.puzzles = null;}
  use(puzzles) {
    if (this.puzzles === puzzles && this.length === puzzles.length) return;
    this.puzzles = puzzles;
    this.length = puzzles.length;
    this.ratingBounds = this.lookup = this.selection = null;
  }
  bounds(puzzles) {
    this.use(puzzles);
    if (!this.ratingBounds) {
      let min = Infinity, max = -Infinity;
      for (const puzzle of puzzles) {
        min = Math.min(min, puzzle.rating);
        max = Math.max(max, puzzle.rating);
      }
      min = puzzles.length ? Math.floor(min / 50) * 50 : 0;
      this.ratingBounds = [min, Math.max(min + 50, Math.ceil(max / 50) * 50)];
    }
    return [...this.ratingBounds];
  }
  find(puzzles, id) {
    this.use(puzzles);
    if (!this.lookup || this.lookup.id !== id) this.lookup = {id, puzzle:puzzles.find(puzzle => puzzle.id === id)};
    return this.lookup?.puzzle;
  }
  select(puzzles, range, themes) {
    this.use(puzzles);
    const key = JSON.stringify([range, [...themes].sort()]);
    if (this.selection?.key !== key) this.selection = {key,
      puzzles:!range && !themes.size ? puzzles : puzzles.filter(puzzle =>
        (!range || puzzle.rating >= range[0] && puzzle.rating <= range[1]) &&
        (!themes.size || puzzle.themes.some(theme => themes.has(theme))))};
    return this.selection.puzzles;
  }
  matching(puzzles, range, themes) {
    // Preserve the caller's ability to shuffle or edit its own result array.
    return this.select(puzzles, range, themes).slice();
  }
  count(puzzles, range, themes) {
    return this.select(puzzles, range, themes).length;
  }
}
