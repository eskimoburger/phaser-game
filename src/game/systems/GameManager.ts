import Phaser from 'phaser';
import { GameState } from '../../constants/airHockey';

export class GameManager extends Phaser.Events.EventEmitter {
    private scene: Phaser.Scene;
    private gameState: Partial<GameState>;
    private gameTimer: number = 0;
    private gameStarted: boolean = false;
    private countdownActive: boolean = false;
    private countdownValue: number = 3;
    private miniGameUsed: boolean = false;
    
    constructor(scene: Phaser.Scene) {
        super();
        this.scene = scene;
        this.gameState = this.getInitialState();
    }
    
    private getInitialState(): Partial<GameState> {
        return {
            rightHealth: 100,
            leftHealth: 100,
            gameTimer: 0,
            gameStarted: false,
            countdownActive: false,
            countdownValue: 3,
            miniGameUsed: false,
            puckFireActive: false
        };
    }
    
    public startGame(): void {
        this.startCountdown();
    }
    
    public startCountdown(): void {
        if (this.countdownActive) return;
        
        this.countdownActive = true;
        this.countdownValue = 3;
        
        const countdownTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                this.countdownValue--;
                this.emit('countdown', this.countdownValue);
                
                if (this.countdownValue <= 0) {
                    this.countdownActive = false;
                    this.gameStarted = true;
                    this.emit('gameStart');
                    countdownTimer.destroy();
                }
            },
            repeat: 3
        });
        
        this.emit('countdownStart');
    }
    
    public update(deltaTime: number): void {
        if (!this.gameStarted || this.countdownActive) return;
        
        this.gameTimer += deltaTime;
        
        // Emit timer update every second
        if (Math.floor(this.gameTimer) % 1000 < deltaTime) {
            this.emit('timerUpdate', this.gameTimer);
        }
        
        this.checkGameEnd();
    }
    
    public scoreGoal(side: 'left' | 'right', damage: number = 10): void {
        if (!this.gameStarted) return;
        
        if (side === 'left') {
            this.gameState.rightHealth = Math.max(0, (this.gameState.rightHealth || 100) - damage);
            this.emit('healthChange', { side: 'right', health: this.gameState.rightHealth });
        } else {
            this.gameState.leftHealth = Math.max(0, (this.gameState.leftHealth || 100) - damage);
            this.emit('healthChange', { side: 'left', health: this.gameState.leftHealth });
        }
        
        this.emit('goal', { side, damage });
        
        // Reset puck position after goal
        this.emit('resetPuck');
    }
    
    private checkGameEnd(): void {
        if ((this.gameState.leftHealth || 0) <= 0) {
            this.endGame('right');
        } else if ((this.gameState.rightHealth || 0) <= 0) {
            this.endGame('left');
        }
    }
    
    public endGame(winner: 'left' | 'right'): void {
        if (!this.gameStarted) return;
        
        this.gameStarted = false;
        this.emit('gameEnd', { winner, time: this.gameTimer });
    }
    
    public pauseGame(): void {
        if (!this.gameStarted) return;
        
        this.emit('gamePause');
    }
    
    public resumeGame(): void {
        if (this.gameStarted) return;
        
        this.emit('gameResume');
    }
    
    public resetGame(): void {
        this.gameState = this.getInitialState();
        this.gameTimer = 0;
        this.gameStarted = false;
        this.countdownActive = false;
        this.countdownValue = 3;
        this.miniGameUsed = false;
        
        this.emit('gameReset');
    }
    
    public triggerMiniGame(): void {
        if (this.miniGameUsed) return;
        
        this.miniGameUsed = true;
        this.pauseGame();
        this.emit('miniGameStart');
    }
    
    public onMiniGameComplete(success: boolean): void {
        if (success) {
            this.emit('miniGameSuccess');
        } else {
            this.emit('miniGameFailure');
        }
        
        this.resumeGame();
    }
    
    public getGameState(): Partial<GameState> {
        return {
            ...this.gameState,
            gameTimer: this.gameTimer,
            gameStarted: this.gameStarted,
            countdownActive: this.countdownActive,
            countdownValue: this.countdownValue,
            miniGameUsed: this.miniGameUsed
        };
    }
    
    public loadGameState(state: Partial<GameState>): void {
        this.gameState = { ...state };
        this.gameTimer = state.gameTimer || 0;
        this.gameStarted = state.gameStarted || false;
        this.countdownActive = state.countdownActive || false;
        this.countdownValue = state.countdownValue || 3;
        this.miniGameUsed = state.miniGameUsed || false;
        
        this.emit('stateLoaded', this.gameState);
    }
    
    public isGameActive(): boolean {
        return this.gameStarted && !this.countdownActive;
    }
    
    public getTimeElapsed(): number {
        return this.gameTimer;
    }
    
    public getHealth(side: 'left' | 'right'): number {
        return side === 'left' ? 
            (this.gameState.leftHealth || 100) : 
            (this.gameState.rightHealth || 100);
    }
}