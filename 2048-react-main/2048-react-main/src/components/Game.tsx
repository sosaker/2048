import React, { useState, useEffect, useCallback } from 'react';
import { GameState, createEmptyBoard, addRandomTile, moveBoard, checkGameStatus } from '../utils/gameLogic';
import '../styles/Game.css';

const Game: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>({
        board: createEmptyBoard(),
        score: 0,
        gameOver: false,
        won: false
    });

    const initializeGame = useCallback(() => {
        let newBoard = createEmptyBoard();
        newBoard = addRandomTile(newBoard);
        newBoard = addRandomTile(newBoard);
        setGameState({
            board: newBoard,
            score: 0,
            gameOver: false,
            won: false
        });
    }, []);

    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (gameState.gameOver) return;

        let direction: 'up' | 'down' | 'left' | 'right';
        switch (event.key) {
            case 'ArrowUp':
                direction = 'up';
                break;
            case 'ArrowDown':
                direction = 'down';
                break;
            case 'ArrowLeft':
                direction = 'left';
                break;
            case 'ArrowRight':
                direction = 'right';
                break;
            default:
                return;
        }

        const { board: newBoard, score: moveScore, moved } = moveBoard(gameState.board, direction);
        
        if (moved) {
            const finalBoard = addRandomTile(newBoard);
            const { gameOver, won } = checkGameStatus(finalBoard);
            
            setGameState(prev => ({
                board: finalBoard,
                score: prev.score + moveScore,
                gameOver,
                won
            }));
        }
    }, [gameState]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    // Touch handling
    const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        setTouchStart({ x: touch.clientX, y: touch.clientY });
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!touchStart) return;

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStart.x;
        const deltaY = touch.clientY - touchStart.y;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            const event = new KeyboardEvent('keydown', {
                key: deltaX > 0 ? 'ArrowRight' : 'ArrowLeft'
            });
            handleKeyDown(event);
        } else {
            // Vertical swipe
            const event = new KeyboardEvent('keydown', {
                key: deltaY > 0 ? 'ArrowDown' : 'ArrowUp'
            });
            handleKeyDown(event);
        }

        setTouchStart(null);
    };

    return (
        <div className="game-container">
            <div className="header">
                <h1>2048</h1>
                <div className="score-container">
                    <div className="score-label">Score</div>
                    <div className="score">{gameState.score}</div>
                </div>
            </div>
            
            <div 
                className="game-board"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {gameState.board.map((row, rowIndex) => (
                    row.map((cell, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`tile ${cell ? 'tile-' + cell : ''}`}
                        >
                            {cell || ''}
                        </div>
                    ))
                ))}
            </div>

            {(gameState.gameOver || gameState.won) && (
                <div className="game-over">
                    <div className="game-over-message">
                        {gameState.won ? 'You Won!' : 'Game Over!'}
                    </div>
                    <button onClick={initializeGame}>Play Again</button>
                </div>
            )}

            <button className="new-game-btn" onClick={initializeGame}>
                New Game
            </button>
        </div>
    );
};

export default Game;
