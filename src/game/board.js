const width = 10;
const height = 20;

export const getEmptyBoard = () => Array.from({ length: height }, () => (Array.from({ length: width }, () => false )));

export const renderBlockOnBoard = (block, board, position) => {
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

export const processBoard = (board) => {
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
