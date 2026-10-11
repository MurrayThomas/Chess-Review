# E210 — sustainable nonchecking mate-threat policy

2026-10-11 preregistration after E209362adb2. BUILD-FIRST; current-main exception,
research-only local commits/no push. Fixed queue rank163 C0467 is the earliest
remaining detector occurrence without code. E093 covers checking-to-repetition;
E132/E136 explicitly require sustainable all-defense policy for perpetual attack.
Do not relabel finite observed threats or a cooperative repetition as perpetual.

Build inspectPerpetualAttack(input,options,certificate), default disabled. Input
exact actual fen/history, required player w/b when enabled; maxNodes0..50000.
History authenticates every legal move and repetition key; optional threefold/
fifty claims can be declined, automatic fivefold/150-halfmove or board terminal
cannot be continued. Current claimable/terminal/opponent-turn inputs withhold.
No engine, tablebase, game acquisition or production change.

Certificate is a finite closed policy graph, schema perpetual-policy-v1, actor,
root canonical first-four-FEN-field key and1..64states. At each actor state it
specifies one legal quiet noncapturing/nonpromoting NONCHECKING move, next key
and a legal mate-in-one threat in the explicitly artificial actor-turn diagram
after that move (flip turn/clear EP, no fictional history). At every defender
state list EVERY legal reply and exact next key. All reachable states must be
live, outside check, and inside graph. Reject duplicates, missing/extra/illegal
edges, wrong keys, unreachable padding, unsupported threats and broken closure.
Use source chess.js/legalPosition and E027 turnBoard; no search for a strategy.

Admit only a full certificate. Every subsequent actor turn renews a nonchecking
mate threat and every defense stays in this policy. If N distinct reachable actor
states exist, after at most4N further plies from the actual actor-turn root, one
actor state has appeared three times by pigeonhole. Actual current repetition
counts can only shorten that bound. Earlier defender claim/automatic draw also
ends in a draw; claims are opportunities, not automatically awarded outcomes.
This is a sustainable resource until draw, not an infinite-play claim, a forced
win, best move or player intent. Certificate supply is a prerequisite; absence
does not mean no such policy exists. Full original C0467 scope stays in scope,
including queen/piece-chasing and other recurring threats not just mate threats.

Return all verified state/edge/threat bindings, actual history separately, the
universal closure and recurrence bound, plus ONE deterministic actual-history
sample to its actor claim/earlier automatic draw. Label it a sample, not evidence
of every path by enumeration; graph closure/theorem provides universal proof.
Choose first sorted defender reply for the sample. No historical occurrence is
manufactured by the static zero-counter diagrams. New output qualityClaim:false.
Charge setup2+history length,1 per graph state/1 legal inventory,1 actor edge,
1 threat diagram+1 threat play,1 every defender edge,1 per sample ply and1 final
mapping. Exhaustion limit+1 drops all new proof/answer. Library internals/time
not bounded. Record exact source/fixture/dependency hashes and D001 receipt.

Author hypothesis: White Kf6,Ra5,Bc4,Nf5 versus Kh8, white to move. Ra6 threatens
Rh6 mate in the actor-turn diagram; ...Kh7 Ra5 threatens Rh5 mate, ...Kh8 closes
the four-ply cycle. All quiet actual turns, not checking. This is authored and
not yet evaluated. Test both colors, one genuine prior cycle, fresh root and
clock99/optional-claim/automatic-terminal interactions. A version without Nf5
is prospectively the escape-negative: every newly legal reply must refute the
old graph. Other controls mutate threat/counter/edge/domain/root/actor/history.

Independent checker imports no own runtime/control/certificate builder or E027
turnBoard. Reconstruct fields directly, verify all edges in a separately ordered
pass, calculate reachability/recurrence bound and actual sample/counts. Shared
chess.js/legalPosition rule admission limits independence. Focused checks: legal
both-color closed policy, current/prior history, declared artificial threats,
complete defender domain, terminal/check/claim prerequisites, strict/getters/
disabled/missing, exact/short/zero atomic cap, mutation rejection and isolation.
One guarded cheap four-state pilot before larger matrices: full admission and
independent checker must take <=2seconds, else retain cost and revise before
expanding. No repeated full-file pass after success; no cumulative suite.

Defer combined original-occurrence/support/absence/priority/history/terminal/
claim/budget integration, saved semantic replay and changed main/repeat/clean
reproductions. General recurrent nonmating attacks, policy discovery, actual
game prevalence/precision, human utility and production promotion remain open.
