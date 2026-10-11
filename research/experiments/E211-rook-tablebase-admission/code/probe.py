# SPDX-License-Identifier: GPL-3.0-or-later
# New research probe program; unmodified python-chess dependency in E141/vendor.
import hashlib,json,pathlib,platform,sys
request=json.load(sys.stdin)
vendor=pathlib.Path('research/experiments/E141-admitted-kqk-tablebases/vendor').resolve()
dependency=json.loads((vendor/'dependency.json').read_text(encoding='utf8'))
for name,expected in dependency['files'].items():
    assert hashlib.sha256((vendor/name).read_bytes()).hexdigest()==expected
sys.path.insert(0,str(vendor))
import chess
import chess.syzygy
assert chess.__version__=='1.11.2'
assert pathlib.Path(chess.__file__).resolve()==(vendor/'chess/__init__.py').resolve()
closure=sorted(chess.syzygy.all_dependencies(['KRPvKR']))
assert sorted(request['files'])==[name+'.rtbw' for name in closure]
directory=pathlib.Path(request['directory']).resolve()
hashes={}
for name,expected in request['files'].items():
    raw=(directory/name).read_bytes()
    assert len(raw)==expected['bytes'] and hashlib.sha256(raw).hexdigest()==expected['sha256']
    hashes[name]=expected['sha256']
input_data=request['input'];history=input_data.get('history')
board=chess.Board(history['fen'] if history else input_data['fen'])
for code in history['moves'] if history else []:
    assert not board.is_game_over(claim_draw=True)
    move=chess.Move.from_uci(code);assert move in board.legal_moves;board.push(move)
assert board.is_valid() and board.fen()==input_data['fen'] and not board.castling_rights and board.ep_square is None
material=chess.syzygy.normalize_tablename(chess.syzygy.calc_key(board))
assert material in closure or material=='KvK'
def flags():
    return {'checkmate':board.is_checkmate(),'stalemate':board.is_stalemate(),'insufficient':board.is_insufficient_material()}
with chess.syzygy.open_tablebase(str(directory)) as tables:
    def observe():
        return {'fen':board.fen(),'wdl':tables.probe_wdl(board),'flags':flags()}
    root=observe();rows=[]
    for move in sorted(board.legal_moves,key=lambda m:m.uci()):
        san=board.san(move);zeroing=board.is_zeroing(move);board.push(move)
        try: rows.append({'move':move.uci(),'san':san,'zeroing':zeroing,**observe()})
        finally: board.pop()
executable=pathlib.Path(sys.executable)
print(json.dumps({'schema':'local-syzygy-rook-wdl-panel-v1','status':'complete','observationKind':'local-syzygy','material':material,'closure':closure,'root':root,'rows':rows,'positionProbes':1+len(rows),'ruleModel':'WDL50 zero-counter outcome; no arbitrary-clock/repetition adjudication','metadata':{'package':'chess','version':chess.__version__,'modules':dependency['files'],'tables':hashes,'python':{'version':sys.version,'implementation':platform.python_implementation(),'executable':str(executable),'sha256':hashlib.sha256(executable.read_bytes()).hexdigest()}}}))
