import Phaser from 'phaser';
import { RINK, PHYSICS } from '../../constants/airHockey';

export class Puck extends Phaser.Physics.Arcade.Sprite {
    private fireEffect?: Phaser.GameObjects.Particles.ParticleEmitter;
    private lastSpeed: number = 0;
    private speedHistory: number[] = [];
    
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'puck');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setupPhysics();
        this.setupFireEffect();
    }
    
    private setupPhysics(): void {
        if (!this.body || !('setBounce' in this.body)) return;
        
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setBounce(1, 1);
        body.setCollideWorldBounds(true);
        body.setCircle(RINK.puckRadius);
        body.setMaxVelocity(PHYSICS.MAX_BALL_SPEED, PHYSICS.MAX_BALL_SPEED);
    }
    
    private setupFireEffect(): void {
        // Create fire effect particle emitter
        this.fireEffect = this.scene.add.particles(this.x, this.y, 'fire-particle', {
            scale: { start: 0.3, end: 0 },
            speed: { min: 50, max: 150 },
            lifespan: 300,
            quantity: 2,
            alpha: { start: 0.8, end: 0 },
            emitting: false
        });
    }
    
    public hit(paddle: Phaser.Physics.Arcade.Sprite, hitPower: number = 1): void {
        if (!this.body || !paddle.body) return;
        
        const body = this.body as Phaser.Physics.Arcade.Body;
        
        // Calculate hit direction and apply force
        const angle = Phaser.Math.Angle.Between(paddle.x, paddle.y, this.x, this.y);
        const force = PHYSICS.PADDLE_HIT_BASE_SPEED_INCREASE * hitPower;
        
        // Apply velocity based on hit
        body.setVelocity(
            Math.cos(angle) * force,
            Math.sin(angle) * force
        );
        
        // Add speed boost
        const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
        const newSpeed = Math.min(currentSpeed * PHYSICS.PADDLE_HIT_SPEED_MULTIPLIER, PHYSICS.MAX_BALL_SPEED);
        
        const normalizedVelX = body.velocity.x / currentSpeed;
        const normalizedVelY = body.velocity.y / currentSpeed;
        
        body.setVelocity(
            normalizedVelX * newSpeed,
            normalizedVelY * newSpeed
        );
        
        this.updateFireEffect();
    }
    
    public wallBounce(): void {
        if (!this.body) return;
        
        const body = this.body as Phaser.Physics.Arcade.Body;
        
        // Add speed boost on wall hit
        const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
        const speedBoost = Math.min(PHYSICS.WALL_HIT_SPEED_BOOST, PHYSICS.WALL_HIT_MAX_BOOST);
        const newSpeed = Math.min(currentSpeed * PHYSICS.WALL_HIT_SPEED_MULTIPLIER + speedBoost, PHYSICS.MAX_BALL_SPEED);
        
        const normalizedVelX = body.velocity.x / currentSpeed;
        const normalizedVelY = body.velocity.y / currentSpeed;
        
        body.setVelocity(
            normalizedVelX * newSpeed,
            normalizedVelY * newSpeed
        );
        
        this.updateFireEffect();
    }
    
    public update(): void {
        if (!this.body) return;
        
        const currentSpeed = Math.sqrt(this.body.velocity.x ** 2 + this.body.velocity.y ** 2);
        
        // Speed boost if too slow
        if (currentSpeed < PHYSICS.MIN_BALL_SPEED_THRESHOLD) {
            const body = this.body as Phaser.Physics.Arcade.Body;
            const normalizedVelX = body.velocity.x / currentSpeed || 1;
            const normalizedVelY = body.velocity.y / currentSpeed || 0;
            
            body.setVelocity(
                normalizedVelX * PHYSICS.BALL_BOOST_SPEED,
                normalizedVelY * PHYSICS.BALL_BOOST_SPEED
            );
        }
        
        this.updateFireEffect();
        this.trackSpeed(currentSpeed);
    }
    
    private updateFireEffect(): void {
        if (!this.fireEffect || !this.body) return;
        
        const currentSpeed = Math.sqrt(this.body.velocity.x ** 2 + this.body.velocity.y ** 2);
        const speedRatio = currentSpeed / PHYSICS.MAX_BALL_SPEED;
        
        // Update fire effect position
        this.fireEffect.setPosition(this.x, this.y);
        
        // Enable/disable fire effect based on speed
        if (speedRatio > 0.6) {
            this.fireEffect.emitting = true;
            this.fireEffect.quantity = Math.floor(speedRatio * 5);
        } else {
            this.fireEffect.emitting = false;
        }
    }
    
    private trackSpeed(speed: number): void {
        this.speedHistory.push(speed);
        if (this.speedHistory.length > 60) { // Keep last 60 frames
            this.speedHistory.shift();
        }
        this.lastSpeed = speed;
    }
    
    public getSpeed(): number {
        return this.lastSpeed;
    }
    
    public getAverageSpeed(): number {
        if (this.speedHistory.length === 0) return 0;
        return this.speedHistory.reduce((sum, speed) => sum + speed, 0) / this.speedHistory.length;
    }
    
    public reset(x: number, y: number): void {
        this.setPosition(x, y);
        if (this.body && 'setVelocity' in this.body) {
            (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
        }
        this.speedHistory = [];
        this.lastSpeed = 0;
        if (this.fireEffect) this.fireEffect.emitting = false;
    }
    
    public destroy(): void {
        this.fireEffect?.destroy();
        super.destroy();
    }
}