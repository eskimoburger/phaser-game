import Phaser from 'phaser';
import { Paddle } from '../entities/Paddle';

export class InputManager {
    private scene: Phaser.Scene;
    private playerPaddle: Paddle;
    private inputMode: 'mouse' | 'touch' | 'keyboard' | 'gamepad' = 'mouse';
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd?: any;
    private gamepad?: Phaser.Input.Gamepad.Gamepad;
    
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
        
        // Gamepad setup
        if (this.scene.input.gamepad) {
            // Enable gamepad plugin if not already enabled
            if (!this.scene.input.gamepad.enabled) {
                this.scene.input.gamepad.enabled = true;
            }
            
            this.scene.input.gamepad.on('connected', (pad: Phaser.Input.Gamepad.Gamepad) => {
                this.gamepad = pad;
                console.log('Gamepad connected:', pad.id);
                console.log('Button count:', pad.buttons?.length || 0);
                console.log('Axes count:', pad.axes?.length || 0);
                this.inputMode = 'gamepad';
            });
            
            this.scene.input.gamepad.on('disconnected', () => {
                this.gamepad = undefined;
                console.log('Gamepad disconnected');
                this.inputMode = 'mouse';
            });
            
            // Check if gamepad is already connected
            if (this.scene.input.gamepad.total > 0) {
                this.gamepad = this.scene.input.gamepad.getPad(0);
                if (this.gamepad) {
                    console.log('Gamepad already connected:', this.gamepad.id);
                    this.inputMode = 'gamepad';
                }
            }
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
        // Update gamepad state if connected
        if (!this.gamepad && this.scene.input.gamepad && this.scene.input.gamepad.total > 0) {
            this.gamepad = this.scene.input.gamepad.getPad(0);
            if (this.gamepad) {
                console.log('Gamepad detected in update:', this.gamepad.id);
                this.inputMode = 'gamepad';
            }
        }
        
        // Check for gamepad input first
        if (this.gamepad && this.gamepad.connected) {
            const hasInput = this.updateGamepadInput();
            if (hasInput && this.inputMode !== 'gamepad') {
                this.inputMode = 'gamepad';
            }
        }
        
        switch (this.inputMode) {
            case 'keyboard':
                this.updateKeyboardInput();
                break;
            case 'gamepad':
                if (this.gamepad && this.gamepad.connected) {
                    this.updateGamepadInput();
                }
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
    
    private updateGamepadInput(): boolean {
        if (!this.gamepad || !this.gamepad.connected) return false;
        
        const speed = 8;
        let deltaX = 0;
        let deltaY = 0;
        let hasInput = false;
        
        // Left stick for movement (primary input) - axes 0 and 1
        if (this.gamepad.axes && this.gamepad.axes.length >= 2) {
            const leftStickX = this.gamepad.axes[0].getValue();
            const leftStickY = this.gamepad.axes[1].getValue();
            
            // Apply deadzone
            const deadzone = 0.15;
            if (Math.abs(leftStickX) > deadzone) {
                deltaX = leftStickX * speed;
                hasInput = true;
            }
            if (Math.abs(leftStickY) > deadzone) {
                deltaY = leftStickY * speed;
                hasInput = true;
            }
        }
        
        // Right stick support (axes 2 and 3) as alternative
        if (!hasInput && this.gamepad.axes && this.gamepad.axes.length >= 4) {
            const rightStickX = this.gamepad.axes[2].getValue();
            const rightStickY = this.gamepad.axes[3].getValue();
            
            const deadzone = 0.15;
            if (Math.abs(rightStickX) > deadzone) {
                deltaX = rightStickX * speed;
                hasInput = true;
            }
            if (Math.abs(rightStickY) > deadzone) {
                deltaY = rightStickY * speed;
                hasInput = true;
            }
        }
        
        // D-pad support (fallback/alternative input)
        if (!hasInput && this.gamepad.buttons) {
            // Xbox/PS5 D-pad: left=14, right=15, up=12, down=13
            if (this.gamepad.buttons[14] && this.gamepad.buttons[14].pressed) {
                deltaX = -speed;
                hasInput = true;
            } else if (this.gamepad.buttons[15] && this.gamepad.buttons[15].pressed) {
                deltaX = speed;
                hasInput = true;
            }
            
            if (this.gamepad.buttons[12] && this.gamepad.buttons[12].pressed) {
                deltaY = -speed;
                hasInput = true;
            } else if (this.gamepad.buttons[13] && this.gamepad.buttons[13].pressed) {
                deltaY = speed;
                hasInput = true;
            }
        }
        
        // Face buttons as alternative movement (Xbox: A=0, B=1, X=2, Y=3 | PS5: X=0, Circle=1, Square=2, Triangle=3)
        if (!hasInput && this.gamepad.buttons && this.gamepad.buttons.length > 3) {
            if (this.gamepad.buttons[2] && this.gamepad.buttons[2].pressed) { // X/Square - left
                deltaX = -speed;
                hasInput = true;
            } else if (this.gamepad.buttons[1] && this.gamepad.buttons[1].pressed) { // B/Circle - right  
                deltaX = speed;
                hasInput = true;
            }
            
            if (this.gamepad.buttons[3] && this.gamepad.buttons[3].pressed) { // Y/Triangle - up
                deltaY = -speed;
                hasInput = true;
            } else if (this.gamepad.buttons[0] && this.gamepad.buttons[0].pressed) { // A/X - down
                deltaY = speed;
                hasInput = true;
            }
        }
        
        if (deltaX !== 0 || deltaY !== 0) {
            this.playerPaddle.setTarget(
                this.playerPaddle.x + deltaX,
                this.playerPaddle.y + deltaY
            );
        }
        
        return hasInput;
    }
    
    private handlePointerMove(pointer: Phaser.Input.Pointer): void {
        if (this.inputMode === 'keyboard' || this.inputMode === 'gamepad') return;
        
        // Move paddle to pointer position
        this.playerPaddle.setTarget(pointer.x, pointer.y);
    }
    
    private handlePointerDown(pointer: Phaser.Input.Pointer): void {
        if (this.inputMode === 'keyboard' || this.inputMode === 'gamepad') return;
        
        // Immediate movement on touch/click
        this.playerPaddle.setTarget(pointer.x, pointer.y);
        this.playerPaddle.setSmoothness(0.3); // Faster response on direct input
    }
    
    private handlePointerUp(_pointer: Phaser.Input.Pointer): void {
        if (this.inputMode === 'keyboard' || this.inputMode === 'gamepad') return;
        
        // Return to normal smoothness
        this.playerPaddle.setSmoothness(0.1);
    }
    
    public getInputMode(): string {
        return this.inputMode;
    }
    
    public setInputMode(mode: 'mouse' | 'touch' | 'keyboard' | 'gamepad'): void {
        this.inputMode = mode;
    }
    
    public getGamepadInfo(): string {
        if (!this.scene.input.gamepad) {
            return 'Gamepad not supported';
        }
        
        const total = this.scene.input.gamepad.total;
        if (total === 0) {
            return 'No gamepads connected';
        }
        
        const pad = this.scene.input.gamepad.getPad(0);
        if (!pad) {
            return 'Gamepad found but not accessible';
        }
        
        return `Connected: ${pad.id}, Buttons: ${pad.buttons?.length || 0}, Axes: ${pad.axes?.length || 0}, Active: ${pad.connected}`;
    }
    
    public debugGamepadState(): void {
        if (!this.gamepad) {
            console.log('No gamepad connected');
            return;
        }
        
        console.log('=== Gamepad Debug Info ===');
        console.log('ID:', this.gamepad.id);
        console.log('Connected:', this.gamepad.connected);
        console.log('Button count:', this.gamepad.buttons?.length || 0);
        console.log('Axes count:', this.gamepad.axes?.length || 0);
        
        if (this.gamepad.axes && this.gamepad.axes.length >= 2) {
            console.log('Left Stick X:', this.gamepad.axes[0].getValue().toFixed(3));
            console.log('Left Stick Y:', this.gamepad.axes[1].getValue().toFixed(3));
        }
        
        if (this.gamepad.axes && this.gamepad.axes.length >= 4) {
            console.log('Right Stick X:', this.gamepad.axes[2].getValue().toFixed(3));
            console.log('Right Stick Y:', this.gamepad.axes[3].getValue().toFixed(3));
        }
        
        if (this.gamepad.buttons) {
            const pressedButtons = [];
            for (let i = 0; i < this.gamepad.buttons.length; i++) {
                if (this.gamepad.buttons[i] && this.gamepad.buttons[i].pressed) {
                    pressedButtons.push(i);
                }
            }
            if (pressedButtons.length > 0) {
                console.log('Pressed buttons:', pressedButtons.join(', '));
            }
        }
        console.log('=========================');
    }
    
    public destroy(): void {
        this.scene.input.off('pointermove', this.handlePointerMove, this);
        this.scene.input.off('pointerdown', this.handlePointerDown, this);
        this.scene.input.off('pointerup', this.handlePointerUp, this);
    }
}