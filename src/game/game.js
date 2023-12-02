import { BLOCKS, getBlock, getRandomBlock, rotateLeft, rotateRight } from './blocks.js';
import { getEmptyBoard, processBoard, renderBlockOnBoard } from './board.js';

export const MAX_LEVEL = 20;

const getStartPosition = (block) => {
    const x = 4;
    for (let y = 0; y < block.length; y++) {
        if (block[y].some((v) => v)) {
            return { x, y: -y  -1 };
        }
    }

    return { x, y: 0 };
}

const getNextPosition = (move, position, block, board) => {
    return { x: position.x + move.x, y: position.y + move.y };
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
            nextPosition = null;
            rotatedBlock = null;
            continue;
        } else if (next.gameOver) {
            gameOver = true;
            board = board.map((row) => row.map((_) => true));
            continue;
        } else if (next.collision && ['RL', 'RR', 'L', 'R', 'D'].includes(move)) {
            nextPosition = null;
            rotatedBlock = null;
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

            const multiplier = 2 * Math.ceil(currentLevel / 4);
            if (value.lines > (currentLevel + 1) * multiplier) {
                const nextLevel = currentLevel >= 20 ? 0 : currentLevel + 1;

                callback({ value, done }, nextLevel);
                clearInterval(timer);

                if (playing) {
                    startGameLoop(nextLevel);
                }
            } else {
                callback({ value, done }, currentLevel);
            }
        }, (40 * (21 - currentLevel)))
    }

    startGameLoop(level);
    play();
    return { play };
}
