export const BLOCKS = [ 'O', 'I', 'S', 'Z', 'L', 'J', 'T' ];

export const getBlock = (block) => {
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
export const rotateLeft = (block, num) => rotateBlock(block, 0);
export const rotateRight = (block, num) => rotateBlock(block, 2);

export const getRandomBlock = () => {
    const sel = Math.floor(Math.random() * BLOCKS.length);
    const rotations = Math.floor(Math.random() * 3);
    const block = getBlock(BLOCKS[sel]);

    return rotateBlock(block, rotations);
}
