export const MAX_LEVEL = 20;

const width = 10;
const height = 20;

const BLOCKS = [ 'O', 'I', 'S', 'Z', 'L', 'J', 'T' ];

const getBlock = (block) => {
    switch(block) {
        case 'O':
            return [
                [false, false, false, false],
                [false, true, true, false],
                [false, true, true, false],
                [false, false, false, false],
            ];
        case 'I':
            return [
                [false, true, false, false],
                [false, true, false, false],
                [false, true, false, false],
                [false, true, false, false],
            ];
        case 'S':
            return [
                [false, false, false, false],
                [false, true, true, false],
                [true, true, false, false],
                [false, false, false, false],
            ];
        case 'Z':
            return [
                [false, false, false, false],
                [false, true, true, false],
                [false, false, true, true],
                [false, false, false, false],
            ];
        case 'L':
            return [
                [false, false, false, false],
                [false, true, false, false],
                [false, true, false, false],
                [false, true, true, false],
            ];
        case 'J':
            return [
                [false, false, false, false],
                [false, false, true, false],
                [false, false, true, false],
                [false, true, true, false],
            ];
        case 'T':
            return [
                [false, false, false, false],
                [false, true, true, true],
                [false, false, true, false],
                [false, false, false, false],
            ];
        default:
            return [
                [false, false, false, false],
                [false, false, false, false],
                [false, false, false, false],
                [false, false, false, false],
            ];
    }
};

const rotateBlock = (inputBlock, num) => {
    const block = num > 0 ? rotateBlock(inputBlock, num - 1) : inputBlock;
    return [
        [block[0][3], block[1][3], block[2][3], block[3][3]],
        [block[0][2], block[1][2], block[2][2], block[3][2]],
        [block[0][1], block[1][1], block[2][1], block[3][1]],
        [block[0][0], block[1][0], block[2][0], block[3][0]],
    ];
};
const rotateLeft = (block, num) => rotateBlock(block, 0);
const rotateRight = (block, num) => rotateBlock(block, 2);

export const getRandomBlock = () => {
    const sel = Math.floor(Math.random() * BLOCKS.length);
    const rotations = Math.floor(Math.random() * 3);
    const block = getBlock(BLOCKS[sel]);

    return rotateBlock(block, rotations);
}

const getEmptyBoard = () => Array.from({ length: height }, () => (Array.from({ length: width }, () => false )));

const renderBlockOnBoard = (block, board, position) => {
    let collision = false;
    let outOfBounds = false;
    let gameOver = false;
    const updatedBoard = JSON.parse(JSON.stringify(board));

    for (let y = 0; y < block.length; y++) {
        const boardY =  y + position.y;
        if (boardY < 0 || boardY >= board.length) {
            outOfBounds |= (boardY >= board.length) && block[y].some((c) => c);
            continue;
        }
        for (let x = 0; x < block[y].length ; x++) {
            const boardX =  x + position.x;
            if (boardX < 0 || boardX >= board[boardY].length) {
                outOfBounds |= block[y][x];
                continue;
            }

            updatedBoard[boardY][boardX] = block[y][x] || board[boardY][boardX];
            collision ||= block[y][x] && board[boardY][boardX];
            gameOver = collision && boardY <= 0;

            if (gameOver || collision) {
                return { collision, gameOver, board };
            }
        }
    }

    return { collision, gameOver, board: updatedBoard, outOfBounds };
}

const getStartPosition = (block) => {
    const x = 4;
    for (let y = 0; y < block.length; y++) {
        if (block[y].some((v) => v)) {
            return { x, y: -y  -1 };
        }
    }

    return { x, y: 0 };
}

const getBlockOffsets = (block) => {
    const rect = {
        top: block.findIndex((row) => row.some((x) => x)),
        bottom: block.findLastIndex((row) => row.some((x) => x)),
        left: Math.min(...block.map((row) =>
            row.findIndex((c) =>  c)
        ).filter((v) => v >= 0)),
        right: Math.max(...block.map((row) =>
            row.findLastIndex((c) =>  c)
        )),
    };
    Object.keys(rect).forEach((k) => rect[k] = Math.max(rect[k], 0));
    return {
        top: rect.top,
        bottom: block.length - rect.bottom - 1,
        left: rect.left,
        right: block[0].length - rect.right - 1,
    };
};

const getNextPosition = (move, position, block, board) => {
    return { x: position.x + move.x, y: position.y + move.y };
}

const processBoard = (board) => {
    let newLines = 0;
    const extraLines = [];
    const newBoard = board.map(
        (row, index) => {
            const isFull = row.every(t => t);
            if (isFull) {
                newLines++;
                extraLines.push(row.map( _ => false));
            }

            return isFull ? false : row;
        }
    ).filter(r => r);


    return {
        newBoard: [...extraLines, ...newBoard ],
        newLines,
        points: newLines * 10 + (newLines > 1 ? Math.pow(newLines, 2) : 0),
    };
}

const moves = [
    'L',
    'D',
    'R',
    'RL',
    'RR',
];
const DROP = 100;
moves[DROP] = 'DROP';

function* gameEngine() {
    let board = getEmptyBoard();
    let renderedBoard = board;
    let block = getRandomBlock();
    let rotatedBlock = null
    let nextBlock = getRandomBlock();
    let position = getStartPosition(block);
    let nextPosition = null;

    let lines = 0;
    let score = 0;
    let gameOver = false;
    let fall = false;

    while (!gameOver) {
        const code = yield({ board: renderedBoard, nextBlock, score, lines, gameOver, fall });
        const move = moves[code];

        switch(move) {
            case 'RL':
                rotatedBlock = rotateLeft(block);
                break;
            case 'RR':
                rotatedBlock = rotateRight(block);
                break;
            case 'L':
                nextPosition = getNextPosition({ x: -1, y: 0 }, position, block, board);
                break;
            case 'R':
                nextPosition = getNextPosition({ x: 1, y: 0 }, position, block, board);
                break;
            case 'D':
                fall = true;
            case 'DROP':
                nextPosition = getNextPosition({ x: 0, y: 1 }, position, block, board);
                break;
        }

        const next = renderBlockOnBoard(rotatedBlock || block, board, nextPosition || position);

        if ((next.outOfBounds || next.collision) && move === 'D') {
            fall = false;
        }

        if (next.outOfBounds && move !== 'DROP') {
            continue;
        } else if (next.gameOver) {
            gameOver = true;
            board = board.map((row) => row.map((_) => true));
            continue;
        } else if (next.collision && ['RL', 'RR', 'L', 'R', 'D'].includes(move)) {
            continue;
        } else if ((next.collision || next.outOfBounds) && 'DROP' === move) {
            const result = renderBlockOnBoard(block, board, position);
            const { newBoard, points, newLines } = processBoard(result.board);

            board = newBoard;
            score += points;
            lines += newLines;
            block = nextBlock;
            rotatedBlock = null;
            nextBlock = getRandomBlock();
            position = getStartPosition(block);
            nextPosition = null;
        } else {
            renderedBoard = next.board;
            position = nextPosition ?? position;
            block = rotatedBlock ?? block;
            nextPosition = null;
            rotatedBlock = null;
        }
    }
    yield({ board, nextBlock, score, lines, gameOver, fall });
}

export function startGame(level = 0, callback) {
    const game = gameEngine();
    const play = (move) => {
        let result = game.next(move);
        if (moves[move] === 'D' && result.value.fall) {
            while (result.value.fall) {
                result = game.next(move);
            }
        }
        return result;
    };
    let playing = true;

    const startGameLoop = (currentLevel) => {
        const timer = setInterval(() => {
            const { value, done } = game.next(DROP);
            playing = !done;
            if (!playing) {
                clearInterval(timer);
                return;
            }

            if (value.lines > (currentLevel + 1) * 10) {
                currentLevel++;

                if (currentLevel > 20) {
                    currentLevel = 0;
                }
                callback({ value, done }, currentLevel);
                clearInterval(timer);

                if (playing) {
                    startGameLoop(currentLevel + 1);
                }
            } else {
                callback({ value, done }, currentLevel);
            }
        }, (15 * (90 - level*4)))
    }

    startGameLoop(level);
    play();
    return { play };
}
