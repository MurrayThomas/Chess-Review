// Cost-ordered execution groups. These are implementation controls, not research acceptance.
// Rules, terminal states and inexpensive baseline move facts are always retained.
const group = (id, name, cost, description, flags, studies, defaultOn = false) =>
  ({id, name, cost, description, flags: flags.split(' ').filter(Boolean), studies: studies.split(' ').filter(Boolean), defaultOn});
export const CONCEPT_GROUPS = [
  group('features', 'Attacks, lines & piece placement', 'Fast', 'Direct attacks, pins, open lines, placement and changes in defenders.',
    'foundationTags inventoryTags openLineTags placementTags', 'E081 E083 E084 E087 E199 E200', true),
  group('pawns', 'Pawn structure & board features', 'Fast–moderate', 'Pawn chains, isolated pawns, central contacts, symmetry and rook-ending shapes.',
    'centerTags structureTags formationTags pawnSpaceTags closedFileTags', 'E082 E090 E092 E093 FRIEND-01 FRIEND-02', true),
  group('history', 'Recorded routes & development tempo', 'Moderate', 'Tempo comparisons, recorded routes and repeated sequences. Requires move history.',
    '', 'E086 E091 E096', true),
  group('immediate', 'Immediate checks & mating warnings', 'Moderate', 'Legal checks and captures, mate in one, move review and conditional opponent-turn warnings.',
    'pawnShieldTags', 'E085 E201 E209 E237', true),
  group('tactics', 'Tactical proof searches', 'Slow', 'Forks, material gains, overload, sacrifices, mating nets and defensive resources.',
    'intermediateSacrificeTags namedDecoyTags crossCheckTags desperadoTags interferenceTags clearanceRecoveryTags overloadTags defenseCountTags historyMateTags netPatternTags supportedMateTags combinationTags decoyTags defensiveTags uniqueDefense',
    'E088 E095 E098 E099 E101 E104 E107 E108 E110 E115 E117 E118 E119 E121 E122 E123 E131 E136 E139 E142'),
  group('endgames', 'Pawn races & endgame policies', 'Slow', 'Promotion routes, pawn races, opposition, reserve tempi and bounded conversion policies.',
    'kingCenterTags waitingTempoTags pawnRaceTags triangulationTags wrongBishopTags rookCheckTags blockadeTags',
    'E089 E097 E102 E105 E106 E109 E112 E124 E125 E126 E127 E134 E135'),
  group('positional', 'Detailed positional comparisons', 'Very slow', 'Tracked opening formations, outposts, pawn breaks, mobility comparisons and restriction proofs.',
    'octopusTags outpostTags invasionTags rookSwingTags blockedPositionTags pawnStormTags pawnBreakTags pawnRestraintTags',
    'E094 E100 E111 E113 E114 E116 E128 E129 E130 E132 E133 E147 E148 E149 E151 E152 E157 E159 E160 E161 FRIEND-03'),
  group('policies', 'Complete candidate & objective policies', 'Very slow', 'Complete mating panels, coordination and declared-goal comparisons. Many require inputs unavailable in a normal review.',
    '', 'E103 E120 E137 E138 E140 E141 E143 E144 E145 E146 E150 E153 E154 E155 E156 E158 E162 E163 E164 E165 E166 E167 E168 E169 E170 E171 E172 E173 E174 E175 E177 E189 E202 E206'),
];
export const DEFAULT_CONCEPT_GROUPS = CONCEPT_GROUPS.filter(g => g.defaultOn).map(g => g.id);
export function normalizeConceptGroups(value = DEFAULT_CONCEPT_GROUPS) {
  return CONCEPT_GROUPS.filter(g => Array.isArray(value) && value.includes(g.id)).map(g => g.id);
}
export function selectedGroups(input) { return normalizeConceptGroups(input.conceptGroups ?? CONCEPT_GROUPS.map(g => g.id)); }
export function studyEnabled(input, study) { return CONCEPT_GROUPS.some(g => selectedGroups(input).includes(g.id) && g.studies.includes(study)); }
export function detectorInput(input) { const {conceptGroups, ...clean} = input; return clean; }
export function groupFlags(input) {
  const selected = selectedGroups(input);
  return Object.fromEntries(CONCEPT_GROUPS.flatMap(g => g.flags).map(flag => [flag,
    CONCEPT_GROUPS.some(g => selected.includes(g.id) && g.flags.includes(flag))]));
}
