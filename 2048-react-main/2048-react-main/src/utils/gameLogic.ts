export interface GameState {
    board: number[][];
    score: number;
    gameOver: boolean;
    won: boolean;
}

export const BOARD_SIZE = 4;

export const createEmptyBoard = (): number[][] => 
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));

export const addRandomTile = (board: number[][]): number[][] => {
    const emptyCells: { r: number; c: number }[] = [];
    const newBoard = [...board.map(row => [...row])];

    board.forEach((row, r) => {
        row.forEach((cell, c) => {
            if (cell === 0) emptyCells.push({ r, c });
        });
    });

    if (emptyCells.length > 0) {
        const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
    }

    return newBoard;
};

export const moveBoard = (
    board: number[][],
    direction: 'up' | 'down' | 'left' | 'right'
): { board: number[][]; score: number; moved: boolean } => {
    let score = 0;
    let moved = false;
    const rotatedBoard = rotateBoard(board, direction);
    
    const newBoard = rotatedBoard.map(row => {
        const newRow = row.filter(cell => cell !== 0);
        
        for (let i = 0; i < newRow.length - 1; i++) {
            if (newRow[i] === newRow[i + 1]) {
                newRow[i] *= 2;
                score += newRow[i];
                newRow.splice(i + 1, 1);
                moved = true;
            }
        }
        
        while (newRow.length < BOARD_SIZE) {
            newRow.push(0);
        }
        
        if (JSON.stringify(newRow) !== JSON.stringify(row)) {
            moved = true;
        }
        
        return newRow;
    });

    return {
        board: unrotateBoard(newBoard, direction),
        score,
        moved
    };
};

const rotateBoard = (board: number[][], direction: string): number[][] => {
    const rotated = JSON.parse(JSON.stringify(board));
    switch(direction) {
        case 'left': return rotated;
        case 'right': 
            return rotated.map((row: number[]) => row.reverse());
        case 'up':
            return rotated[0].map((_: number, colIndex: number) => 
                rotated.map((row: number[]) => row[colIndex]).reverse()
            );
        case 'down':
            return rotated[0].map((_: number, colIndex: number) => 
                rotated.map((row: number[]) => row[colIndex])
            );
        default:
            return rotated;
    }
};

const unrotateBoard = (board: number[][], direction: string): number[][] => {
    switch(direction) {
        case 'left': return board;
        case 'right': 
            return board.map(row => row.reverse());
        case 'up':
            return board[0].map((_: number, colIndex: number) => 
                board.map(row => row[colIndex]).reverse()
            );
        case 'down':
            return board[0].map((_: number, colIndex: number) => 
                board.map(row => row[colIndex])
            );
        default:
            return board;
    }
};

export const checkGameStatus = (board: number[][]): { gameOver: boolean; won: boolean } => {
    const won = board.some(row => row.includes(2048));
    
    if (won) return { gameOver: true, won: true };
    
    const isBoardFull = board.every(row => row.every(cell => cell !== 0));
    if (!isBoardFull) return { gameOver: false, won: false };
    
    // Check for possible merges
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const current = board[r][c];
            if (
                (r > 0 && board[r-1][c] === current) ||
                (r < BOARD_SIZE-1 && board[r+1][c] === current) ||
                (c > 0 && board[r][c-1] === current) ||
                (c < BOARD_SIZE-1 && board[r][c+1] === current)
            ) {
                return { gameOver: false, won: false };
            }
        }
    }
    
    return { gameOver: true, won: false };
};
