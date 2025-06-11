import { Paddle } from '../entities/Paddle';
import { Puck } from '../entities/Puck';
import { BotDifficulty, BotState, BOT_CONFIG, RINK } from '../../constants/airHockey';

export class BotAI {
    private paddle: Paddle;
    private puck: Puck;
    private difficulty: BotDifficulty;
    private state: BotState;
    private homePosition: { x: number; y: number };
    private lastMissTime: number = 0;
    private reactionDelay: number = 0;
    private maxReactionDelay: number;
    
    // Difficulty-based parameters
    private maxSpeed: number;
    private predictionAccuracy: number;
    private errorMargin: number;
    private attackThreshold: number;
    private lookAheadFrames: number;
    private strategicThinking: number;
    private cornerPrediction: number;
    private counterAttackChance: number;
    
    constructor(paddle: Paddle, puck: Puck, difficulty: BotDifficulty = 'medium') {
        this.paddle = paddle;
        this.puck = puck;
        this.difficulty = difficulty;
        this.state = BOT_CONFIG.DEFAULT_STATE;
        this.homePosition = { x: RINK.centerX, y: RINK.botMinY + 200 };
        this.maxReactionDelay = BOT_CONFIG.MAX_REACTION_DELAY;
        
        this.applyDifficultySettings();
    }
    
    private applyDifficultySettings(): void {
        const settings = BOT_CONFIG.DIFFICULTIES[this.difficulty];
        
        this.maxSpeed = settings.maxSpeed;
        this.predictionAccuracy = settings.predictionAccuracy;
        this.errorMargin = settings.errorMargin;
        this.attackThreshold = settings.attackThreshold;
        this.lookAheadFrames = settings.lookAheadFrames;
        this.strategicThinking = settings.strategicThinking;
        this.cornerPrediction = settings.cornerPrediction;
        this.counterAttackChance = settings.counterAttackChance;
        
        // Adjust paddle smoothness based on difficulty
        const smoothness = Math.max(0.05, BOT_CONFIG.SMOOTHNESS - (this.maxSpeed - 12) * 0.01);
        this.paddle.setSmoothness(smoothness);
    }
    
    public update(_deltaTime: number): void {
        this.updateReactionDelay();
        this.updateState();
        this.executeCurrentStrategy();
    }
    
    private updateReactionDelay(): void {
        if (this.reactionDelay > 0) {
            this.reactionDelay--;
        }
    }
    
    private updateState(): void {
        const puckPosition = { x: this.puck.x, y: this.puck.y };
        const puckVelocity = this.getPuckVelocity();
        const distanceToPuck = Phaser.Math.Distance.Between(
            this.paddle.x, this.paddle.y,
            puckPosition.x, puckPosition.y
        );
        
        // Determine if puck is heading toward bot
        const puckHeadingToBot = puckVelocity.y < 0 && puckPosition.y > RINK.centerY;
        
        // State machine logic
        switch (this.state) {
            case 'defend':
                if (puckHeadingToBot && distanceToPuck < 300) {
                    this.state = 'attack';
                } else if (!puckHeadingToBot && Math.random() < this.strategicThinking) {
                    this.state = 'wait';
                }
                break;
                
            case 'attack':
                if (!puckHeadingToBot || distanceToPuck > 400) {
                    this.state = 'defend';
                }
                break;
                
            case 'wait':
                if (puckHeadingToBot) {
                    this.state = 'defend';
                } else if (Math.random() < this.counterAttackChance) {
                    this.state = 'attack';
                }
                break;
                
            case 'recover':
                if (Date.now() - this.lastMissTime > 1000) {
                    this.state = 'defend';
                }
                break;
        }
    }
    
    private executeCurrentStrategy(): void {
        if (this.reactionDelay > 0) return;
        
        let targetPosition: { x: number; y: number };
        
        switch (this.state) {
            case 'defend':
                targetPosition = this.getDefensivePosition();
                break;
                
            case 'attack':
                targetPosition = this.getAttackPosition();
                break;
                
            case 'wait':
                targetPosition = this.getWaitPosition();
                break;
                
            case 'recover':
                targetPosition = this.homePosition;
                break;
                
            default:
                targetPosition = this.homePosition;
        }
        
        // Add error margin based on difficulty
        const errorX = (Math.random() - 0.5) * this.errorMargin;
        const errorY = (Math.random() - 0.5) * this.errorMargin;
        
        targetPosition.x += errorX;
        targetPosition.y += errorY;
        
        this.paddle.setTarget(targetPosition.x, targetPosition.y);
        
        // Set reaction delay
        this.reactionDelay = Math.floor(Math.random() * this.maxReactionDelay);
    }
    
    private getDefensivePosition(): { x: number; y: number } {
        const puckPosition = { x: this.puck.x, y: this.puck.y };
        const puckVelocity = this.getPuckVelocity();
        
        // Predict where puck will be
        const predictedPosition = this.predictPuckPosition(this.lookAheadFrames);
        
        // Position between puck and goal
        const goalCenterX = RINK.centerX;
        const defensiveY = this.homePosition.y;
        
        let targetX: number;
        
        if (Math.abs(puckVelocity.y) < 50) {
            // Puck is moving slowly, position directly between puck and goal
            targetX = (predictedPosition.x + goalCenterX) / 2;
        } else {
            // Intercept the puck
            targetX = predictedPosition.x;
        }
        
        return { x: targetX, y: defensiveY };
    }
    
    private getAttackPosition(): { x: number; y: number } {
        const predictedPosition = this.predictPuckPosition(this.lookAheadFrames / 2);
        
        // Move to intercept puck aggressively
        return {
            x: predictedPosition.x,
            y: Math.max(RINK.botMinY, predictedPosition.y - 50)
        };
    }
    
    private getWaitPosition(): { x: number; y: number } {
        // Stay near home but react to puck movement
        
        return {
            x: this.homePosition.x + (this.puck.x - RINK.centerX) * 0.3,
            y: this.homePosition.y
        };
    }
    
    private predictPuckPosition(frames: number): { x: number; y: number } {
        const puckVelocity = this.getPuckVelocity();
        const currentPosition = { x: this.puck.x, y: this.puck.y };
        
        // Simple linear prediction with accuracy factor
        const accuracy = this.predictionAccuracy;
        
        return {
            x: currentPosition.x + (puckVelocity.x * frames * accuracy),
            y: currentPosition.y + (puckVelocity.y * frames * accuracy)
        };
    }
    
    private getPuckVelocity(): { x: number; y: number } {
        if (!this.puck.body || !('velocity' in this.puck.body)) {
            return { x: 0, y: 0 };
        }
        
        const body = this.puck.body as Phaser.Physics.Arcade.Body;
        return {
            x: body.velocity.x,
            y: body.velocity.y
        };
    }
    
    public setDifficulty(difficulty: BotDifficulty): void {
        this.difficulty = difficulty;
        this.applyDifficultySettings();
    }
    
    public getDifficulty(): BotDifficulty {
        return this.difficulty;
    }
    
    public getState(): BotState {
        return this.state;
    }
    
    public onPuckMiss(): void {
        this.lastMissTime = Date.now();
        this.state = 'recover';
    }
    
    public setHomePosition(x: number, y: number): void {
        this.homePosition = { x, y };
    }
}