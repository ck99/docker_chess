const Chess = require('chess.js').Chess;
const Engine = require('node-uci').Engine;

const stockfish  = __dirname + '/stockfish.sh';
const lc0        = __dirname + '/lc0.sh';
const enginePath = lc0;

let start = 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3';
start = '8/4N1pk/8/6R1/8/8/8/K7 w - - 0 1';
start = '2r3k1/pp3pp1/3N3p/4P3/P2p4/1P3qPn/1Q3P1P/3R1K2 b - - 0 1';
// start = '8/6K1/1p1B1RB1/8/2Q5/2n1kP1N/3b4/4n3 w - - 0 1';
// start = (new Chess()).fen();

let validator = ((c) => {
    return (fen) => {
        let initial = c.validate_fen(fen);

        if(initial.valid) {
            let fen_split = fen.split(" ");
            console.log(fen_split[0]);
            if(fen_split[0].indexOf('K') < 0) {
                initial = {
                    valid: false,
                    error_number: 1,
                    error: "White King is missing"
                }
            } else if(fen_split[0].indexOf('k') < 0) {
                initial = {
                    valid: false,
                    error_number: 1,
                    error: "Black King is missing"
                }
            }
        }
        return initial;
    }
})(new Chess());

console.log(validator(start));

const engine = new Engine(enginePath);
engine
    .chain()
    .init()
    // .setoption('MultiPV', 2)
    .position(start)
    .go({ depth: 5 })
    .then(result => {
        console.log(result.bestmove)
        let x = result.info.filter(i => {
            return i.pv.startsWith(result.bestmove)
        });

        console.log(x);
        console.log(x[0].score);
        engine.quit();

        let chess = new Chess(start);
        let preMove = chess.ascii();

        chess.move(result.bestmove, {sloppy: true});

        let postMove = chess.ascii();

        let history = chess.history({ verbose: true });

        console.log(history[history.length -1]);


        console.log(preMove);
        console.log(postMove);
        console.log(chess.fen());

    })
    .catch(error => {
        console.log(error);
    });
