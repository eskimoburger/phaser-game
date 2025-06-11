import Phaser from 'phaser';
import { Paddle } from '../entities/Paddle';

export class InputManager {
    private scene: Phaser.Scene;
    private playerPaddle: Paddle;
    private inputMode: 'mouse' | 'touch' | 'keyboard' = 'mouse';
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd?: any;
    
    constructor(scene: Phaser.Scene, playerPaddle: Paddle) {
        this.scene = scene;
        this.playerPaddle = playerPaddle;
        
        this.setupInputs();
    }
    
    private setupInputs(): void {
        // Keyboard inputs
        if (this.scene.input.keyboard) {
            this.cursors = this.scene.input.keyboard.createCursorKeys();
            this.wasd = this.scene.input.keyboard.addKeys('W,S,A,D');
        }
        
        // Mouse/touch inputs
        this.scene.input.on('pointermove', this.handlePointerMove, this);
        this.scene.input.on('pointerdown', this.handlePointerDown, this);
        this.scene.input.on('pointerup', this.handlePointerUp, this);
        
        // Auto-detect input type
        this.scene.input.on('pointermove', () => {
            if (this.inputMode !== 'mouse') {
                this.inputMode = 'mouse';
            }
        });
        
        if (this.scene.input.keyboard) {
            this.scene.input.keyboard.on('keydown', () => {
                if (this.inputMode !== 'keyboard') {
                    this.inputMode = 'keyboard';
                }
            });
        }
    }
    
    public update(): void {
        switch (this.inputMode) {
            case 'keyboard':
                this.updateKeyboardInput();
                break;
            case 'mouse':
            case 'touch':
                // Mouse/touch input is handled by events
                break;
        }
    }
    
    private updateKeyboardInput(): void {
        if (!this.cursors || !this.wasd) return;
        
        const speed = 8;
        let deltaX = 0;
        let deltaY = 0;
        
        // Arrow keys or WASD
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            deltaX = -speed;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            deltaX = speed;
        }
        
        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            deltaY = -speed;
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            deltaY = speed;
        }
        
        if (deltaX !== 0 || deltaY !== 0) {
            this.playerPaddle.setTarget(
                this.playerPaddle.x + deltaX,
                this.playerPaddle.y + deltaY
            );
        }
    }
    
    private handlePointerMove(pointer: Phaser.Input.Pointer): void {
        if (this.inputMode === 'keyboard') return;
        
        // Move paddle to pointer position
        this.playerPaddle.setTarget(pointer.x, pointer.y);
    }
    
    private handlePointerDown(pointer: Phaser.Input.Pointer): void {
        if (this.inputMode === 'keyboard') return;
        
        // Immediate movement on touch/click
        this.playerPaddle.setTarget(pointer.x, pointer.y);
        this.playerPaddle.setSmoothness(0.3); // Faster response on direct input
    }
    
    private handlePointerUp(pointer: Phaser.Input.Pointer): void {
        if (this.inputMode === 'keyboard') return;
        
        // Return to normal smoothness
        this.playerPaddle.setSmoothness(0.1);
    }
    
    public getInputMode(): string {
        return this.inputMode;
    }
    
    public setInputMode(mode: 'mouse' | 'touch' | 'keyboard'): void {
        this.inputMode = mode;
    }
    
    public destroy(): void {
        this.scene.input.off('pointermove', this.handlePointerMove, this);
        this.scene.input.off('pointerdown', this.handlePointerDown, this);
        this.scene.input.off('pointerup', this.handlePointerUp, this);
    }
}