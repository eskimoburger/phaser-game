import Phaser from 'phaser';
import { RINK } from '../../constants/airHockey';

export class Paddle extends Phaser.Physics.Arcade.Sprite {
    private isPlayer: boolean;
    private targetX: number = 0;
    private targetY: number = 0;
    private smoothness: number = 0.1;
    
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, isPlayer: boolean = false) {
        super(scene, x, y, texture);
        
        this.isPlayer = isPlayer;
        this.targetX = x;
        this.targetY = y;
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setupPhysics();
    }
    
    private setupPhysics(): void {
        if (!this.body || !('setImmovable' in this.body)) return;
        
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setImmovable(true);
        body.setCircle(50); // Adjust based on paddle size
        body.setCollideWorldBounds(true);
    }
    
    public setTarget(x: number, y: number): void {
        this.targetX = this.constrainPosition(x, 'x');
        this.targetY = this.constrainPosition(y, 'y');
    }
    
    public setSmoothness(smoothness: number): void {
        this.smoothness = Math.max(0.01, Math.min(1, smoothness));
    }
    
    public update(): void {
        // Smooth movement towards target
        const deltaX = this.targetX - this.x;
        const deltaY = this.targetY - this.y;
        
        const newX = this.x + deltaX * this.smoothness;
        const newY = this.y + deltaY * this.smoothness;
        
        this.setPosition(
            this.constrainPosition(newX, 'x'),
            this.constrainPosition(newY, 'y')
        );
    }
    
    private constrainPosition(value: number, axis: 'x' | 'y'): number {
        if (axis === 'x') {
            return Math.max(RINK.minX + 50, Math.min(RINK.maxX - 50, value));
        } else {
            if (this.isPlayer) {
                return Math.max(RINK.playerMinY, Math.min(RINK.playerMaxY, value));
            } else {
                return Math.max(RINK.botMinY, Math.min(RINK.botMaxY, value));
            }
        }
    }
    
    public moveToPosition(x: number, y: number, immediate: boolean = false): void {
        const constrainedX = this.constrainPosition(x, 'x');
        const constrainedY = this.constrainPosition(y, 'y');
        
        if (immediate) {
            this.setPosition(constrainedX, constrainedY);
            this.targetX = constrainedX;
            this.targetY = constrainedY;
        } else {
            this.setTarget(constrainedX, constrainedY);
        }
    }
    
    public getDistanceToTarget(): number {
        const deltaX = this.targetX - this.x;
        const deltaY = this.targetY - this.y;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }
    
    public isInZone(): boolean {
        if (this.isPlayer) {
            return this.y >= RINK.playerMinY && this.y <= RINK.playerMaxY;
        } else {
            return this.y >= RINK.botMinY && this.y <= RINK.botMaxY;
        }
    }
}