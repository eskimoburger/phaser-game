import Phaser from 'phaser';
import { Paddle } from '../entities/Paddle';
import { Puck } from '../entities/Puck';
import { BotAI } from '../systems/BotAI';
import { InputManager } from '../systems/InputManager';
import { GameManager } from '../systems/GameManager';
import { RINK, BotDifficulty } from '../../constants/airHockey';

export default class AirHockeyRefactored extends Phaser.Scene {
    // Core game objects
    private playerPaddle!: Paddle;
    private botPaddle!: Paddle;
    private puck!: Puck;
    
    // Game systems
    private botAI!: BotAI;
    private inputManager!: InputManager;
    private gameManager!: GameManager;
    
    // UI elements
    private healthBarLeft!: Phaser.GameObjects.Graphics;
    private healthBarRight!: Phaser.GameObjects.Graphics;
    private timerText!: Phaser.GameObjects.Text;
    private countdownText!: Phaser.GameObjects.Text;
    
    // Game state
    private difficulty: BotDifficulty = 'medium';
    
    constructor() {
        super({ 
            key: 'AirHockeyRefactored',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { x: 0, y: 0 },
                    debug: false
                }
            }
        });
    }
    
    preload(): void {
        console.log('AirHockey: Starting preload...');
        
        this.load.image('airhockey-background', 'assets/airhockey/airhockey-background.svg');
        this.load.image('puck', 'assets/airhockey/wizball.png');
        this.load.image('blue-paddle', 'assets/characters/player.png');
        this.load.image('red-paddle', 'assets/characters/boss-field2.png');
        this.load.image('help-icon', 'assets/airhockey/help.svg');
        this.load.image('net', 'assets/airhockey/net.svg');
    }
    
    create(data?: { difficulty?: BotDifficulty; resumeGame?: boolean }): void {
        console.log('AirHockey: Scene created successfully!');
        
        this.difficulty = data?.difficulty || 'medium';
        
        this.createBackground();
        this.createGameObjects();
        this.createSystems();
        this.createUI();
        this.setupPhysics();
        this.setupEventListeners();
        
        // Start the game
        this.gameManager.startGame();
    }
    
    private createBackground(): void {
        this.add.image(540, 960, 'airhockey-background');
        this.add.image(RINK.centerX, RINK.centerY, 'net');
    }
    
    private createGameObjects(): void {
        // Create paddles
        this.playerPaddle = new Paddle(this, RINK.centerX, RINK.playerMinY + 100, 'blue-paddle', true);
        this.botPaddle = new Paddle(this, RINK.centerX, RINK.botMinY + 200, 'red-paddle', false);
        
        // Create puck
        this.puck = new Puck(this, RINK.centerX, RINK.centerY);
    }
    
    private createSystems(): void {
        // Initialize AI system
        this.botAI = new BotAI(this.botPaddle, this.puck, this.difficulty);
        
        // Initialize input system
        this.inputManager = new InputManager(this, this.playerPaddle);
        
        // Initialize game management system
        this.gameManager = new GameManager(this);
    }
    
    private createUI(): void {
        // Health bars
        this.healthBarLeft = this.add.graphics();
        this.healthBarRight = this.add.graphics();
        this.updateHealthBars();
        
        // Timer
        this.timerText = this.add.text(RINK.centerX, 50, '00:00', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Countdown text
        this.countdownText = this.add.text(RINK.centerX, RINK.centerY, '', {
            fontSize: '72px',
            color: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setVisible(false);
        
        // Help icon
        this.add.image(50, 50, 'help-icon')
            .setInteractive()
            .on('pointerdown', this.showHelp, this);
    }
    
    private setupPhysics(): void {
        // Puck vs paddles collision
        this.physics.add.collider(this.puck, this.playerPaddle, this.handlePaddleHit, undefined, this);
        this.physics.add.collider(this.puck, this.botPaddle, this.handlePaddleHit, undefined, this);
        
        // World bounds collision for puck
        this.physics.world.on('worldbounds', this.handleWorldBounds, this);
    }
    
    private setupEventListeners(): void {
        // Game manager events
        this.gameManager.on('countdownStart', this.onCountdownStart, this);
        this.gameManager.on('countdown', this.onCountdown, this);
        this.gameManager.on('gameStart', this.onGameStart, this);
        this.gameManager.on('timerUpdate', this.onTimerUpdate, this);
        this.gameManager.on('healthChange', this.onHealthChange, this);
        this.gameManager.on('goal', this.onGoal, this);
        this.gameManager.on('resetPuck', this.resetPuckPosition, this);
        this.gameManager.on('gameEnd', this.onGameEnd, this);
        this.gameManager.on('miniGameStart', this.onMiniGameStart, this);
        
        // Input for escape key (optional features)
        this.input.keyboard?.once('keydown-ESC', this.handleEscape, this);
    }
    
    update(_time: number, delta: number): void {
        // Update all systems
        this.inputManager.update();
        this.botAI.update(delta);
        this.gameManager.update(delta);
        
        // Update game objects
        this.playerPaddle.update();
        this.botPaddle.update();
        this.puck.update();
        
        // Check for goals
        this.checkGoals();
        
        // Debug gamepad info (remove in production)
        if (Math.floor(_time) % 2000 < delta) { // Log every 2 seconds
            const gamepadInfo = this.inputManager.getGamepadInfo();
            const inputMode = this.inputManager.getInputMode();
            console.log(`Input Mode: ${inputMode}, Gamepad: ${gamepadInfo}`);
        }
    }
    
    private handlePaddleHit(_puck: any, paddle: any): void {
        const hitPower = paddle === this.playerPaddle ? 1.2 : 1.0;
        this.puck.hit(paddle, hitPower);
    }
    
    private handleWorldBounds(_event: any, body: any): void {
        if (body.gameObject === this.puck) {
            this.puck.wallBounce();
        }
    }
    
    private checkGoals(): void {
        const puckY = this.puck.y;
        const puckRadius = RINK.puckRadius;
        
        // Check top goal (bot's goal)
        if (puckY - puckRadius <= RINK.topGoalY) {
            this.gameManager.scoreGoal('left', 15);
        }
        
        // Check bottom goal (player's goal)
        if (puckY + puckRadius >= RINK.bottomGoalY) {
            this.gameManager.scoreGoal('right', 15);
            this.botAI.onPuckMiss(); // Bot missed defending
        }
    }
    
    private resetPuckPosition(): void {
        this.puck.reset(RINK.centerX, RINK.centerY);
        
        // Give puck initial velocity toward random side
        const randomAngle = (Math.random() - 0.5) * Math.PI / 3; // ±30 degrees
        const initialSpeed = 300;
        
        if (this.puck.body && 'setVelocity' in this.puck.body) {
            const body = this.puck.body as Phaser.Physics.Arcade.Body;
            body.setVelocity(
                Math.sin(randomAngle) * initialSpeed,
                Math.cos(randomAngle) * initialSpeed * (Math.random() > 0.5 ? 1 : -1)
            );
        }
    }
    
    // Event handlers
    private onCountdownStart(): void {
        this.countdownText.setVisible(true);
        this.countdownText.setText('GET READY!');
    }
    
    private onCountdown(value: number): void {
        if (value > 0) {
            this.countdownText.setText(value.toString());
        } else {
            this.countdownText.setText('GO!');
        }
    }
    
    private onGameStart(): void {
        this.time.delayedCall(1000, () => {
            this.countdownText.setVisible(false);
        });
        
        this.resetPuckPosition();
    }
    
    private onTimerUpdate(time: number): void {
        const minutes = Math.floor(time / 60000);
        const seconds = Math.floor((time % 60000) / 1000);
        this.timerText.setText(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }
    
    private onHealthChange(_data: { side: string; health: number }): void {
        this.updateHealthBars();
    }
    
    private onGoal(data: { side: string; damage: number }): void {
        // Add visual effects, sounds, etc.
        console.log(`Goal scored by ${data.side}! Damage: ${data.damage}`);
        
        // Flash effect
        this.cameras.main.flash(500, 255, 255, 255);
    }
    
    private onGameEnd(data: { winner: string; time: number }): void {
        // Show game over screen
        this.add.text(RINK.centerX, RINK.centerY, `${data.winner.toUpperCase()} WINS!`, {
            fontSize: '48px',
            color: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Return to menu after delay
        this.time.delayedCall(3000, () => {
            this.scene.start('MainMenu');
        });
    }
    
    private onMiniGameStart(): void {
        // Launch mini game
        this.scene.launch('MatchingMiniGame');
        this.scene.pause();
    }
    
    private updateHealthBars(): void {
        const leftHealth = this.gameManager.getHealth('left');
        const rightHealth = this.gameManager.getHealth('right');
        
        // Clear and redraw health bars
        this.healthBarLeft.clear();
        this.healthBarRight.clear();
        
        // Left health bar (green to red gradient)
        this.healthBarLeft.fillStyle(leftHealth > 50 ? 0x00ff00 : leftHealth > 25 ? 0xffff00 : 0xff0000);
        this.healthBarLeft.fillRect(50, 100, (leftHealth / 100) * 200, 20);
        
        // Right health bar
        this.healthBarRight.fillStyle(rightHealth > 50 ? 0x00ff00 : rightHealth > 25 ? 0xffff00 : 0xff0000);
        this.healthBarRight.fillRect(RINK.maxX - 250, 100, (rightHealth / 100) * 200, 20);
    }
    
    private showHelp(): void {
        // Show help overlay or pause game
        console.log('Help requested');
        // Implementation depends on your help system
    }
    
    private handleEscape(): void {
        // Pause game or show menu
        this.scene.pause();
        this.scene.launch('PauseMenu');
    }
    
    public setDifficulty(difficulty: BotDifficulty): void {
        this.difficulty = difficulty;
        if (this.botAI) {
            this.botAI.setDifficulty(difficulty);
        }
    }
    
    public getDifficulty(): BotDifficulty {
        return this.difficulty;
    }
    
    shutdown(): void {
        // Clean up systems
        this.inputManager?.destroy();
        this.gameManager?.removeAllListeners();
    }
}