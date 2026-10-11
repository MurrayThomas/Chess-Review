import {parents as originalParents} from '../../E249-material-matched-positional-win/code/parents.mjs';
export {after} from '../../E249-material-matched-positional-win/code/parents.mjs';
export async function parents(ctx){const families=await originalParents(ctx);for(const f of families)for(const role of Object.values(f.roles))role.input.move=f.id==='h2'?'f5g6':'f4g3';return families;}
