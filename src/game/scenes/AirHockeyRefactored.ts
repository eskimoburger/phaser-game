import Phaser from 'phaser';
                                                    
// Rink boundaries (matching original)
const RINK = {
  minX: 0,
  maxX: 1080,
  playerMinY: 700,
  playerMaxY: 1075,
  botMinY: 155,
  botMaxY: 580,
  topGoalY: 155,
  bottomGoalY: 1125,
  centerX: 540,
  centerY: 640,
  puckRadius: 50
};

export default class AirHockeyRefactored extends Phaser.Scene {
    // Core game objects (matching original)
    private ball!: Phaser.Physics.Arcade.Sprite;
    private paddleLeft!: Phaser.Physics.Arcade.Sprite;  // Player paddle
    private paddleRight!: Phaser.Physics.Arcade.Sprite; // Bot paddle
    private background!: Phaser.GameObjects.Image;
    
    // UI elements
    private healthBarLeft!: Phaser.GameObjects.Graphics;
    private timerText!: Phaser.GameObjects.Text;
    private countdownText!: Phaser.GameObjects.Text;
    private characterNameText!: Phaser.GameObjects.Text;
    private bgTop!: Phaser.GameObjects.Image;
    private bgBottom!: Phaser.GameObjects.Image;
    
    // Game state (matching original)
    private leftHealth = 100;
    private rightHealth = 100;
    private gameTimer = 180; // 3 minutes
    private gameStarted = false;
    private countdownActive = false;
    private countdownValue = 3;
    
    // Character selection
    private selectedCharacter: string = 'boss1';
    private characterName: string = 'Lady Delayna';
    
    // Bot AI (simplified)
    private botTargetX = RINK.centerX;
    private botTargetY = RINK.botMinY + 200;
    private botSmoothness = 0.08;
    
    // Input handling
    private paddleLeftTargetX = RINK.centerX;
    private paddleLeftTargetY = RINK.playerMinY + 100;
    private playerSmoothness = 0.15;
    
    constructor() {
        super({ 
            key: 'AirHockeyRefactored',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { x: 0, y: 0 },
                    debug: true
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
        
        // Load character-specific backgrounds
        this.load.image('bg-boss-1-top', 'assets/characters/boss-field1.png');
        this.load.image('bg-boss-1-bottom', 'assets/characters/boss-field1.png');
        this.load.image('bg-boss-2-top', 'assets/characters/boss-field2.png');
        this.load.image('bg-boss-2-bottom', 'assets/characters/boss-field2.png');
    }
    
    create(data?: { resumeGame?: boolean }): void {
        console.log('🏒 AirHockey: Scene created successfully!');
        
        // Reset game state
        this.leftHealth = 100;
        this.rightHealth = 100;
        this.gameTimer = 180;
        this.gameStarted = false;
        this.countdownActive = false;
        this.countdownValue = 3;
        
        // Setup world bounds (matching original)
        this.physics.world.setBounds(0, 0, 1080, 1280);
        this.physics.world.setBoundsCollision(true, true, true, true);
        
        // Get selected character from localStorage
        this.getSelectedCharacter();
        
        console.log('🎬 Creating game elements...');
        this.createWorldBackground();
        this.createGameObjects();
        this.createUI();
        this.setupPhysics();
        this.setupInput();
        
        // Start countdown
        console.log('🚀 Starting countdown...');
        this.startCountdown();
        console.log('✅ AirHockey scene initialization complete!');
    }
    
    private getSelectedCharacter(): void {
        // Get selected character from localStorage (set by CharacterSelect scene)
        const savedCharacter = localStorage.getItem('selectedCharacter');
        console.log('🎮 AirHockey: Reading character from localStorage:', savedCharacter);
        
        if (savedCharacter) {
            this.selectedCharacter = savedCharacter;
            // Map character frame to character name
            const characterNames = ['Lady Delayna', 'Phantom Tax'];
            const characterFrames = ['boss1', 'boss2'];
            const characterIndex = characterFrames.indexOf(savedCharacter);
            
            if (characterIndex !== -1) {
                this.characterName = characterNames[characterIndex];
                console.log('✅ Character mapped successfully:', this.selectedCharacter, '->', this.characterName);
            } else {
                console.warn('⚠️ Character not found in mapping, using default');
            }
        } else {
            console.log('📝 No saved character found, using default:', this.selectedCharacter, this.characterName);
        }
        
        console.log('🏁 Final character selection - Frame:', this.selectedCharacter, 'Name:', this.characterName);
    }
    
    private createWorldBackground(): void {
        // Create background areas (matching original layout)
        const playAreaCenter = 640;
        const statsAreaCenter = 1600;
        
        // Playing area background
        this.add.rectangle(540, playAreaCenter, 1080, 1280, 0x0a4d0a, 0.3);
        
        // Stats area background
        this.add.rectangle(540, statsAreaCenter, 1080, 640, 0x1a1a1a, 0.8).setDepth(1);
        
        // Main hockey rink background
        this.background = this.add.image(540, playAreaCenter, 'airhockey-background');
        this.background.displayHeight = 1280;
        this.background.displayWidth = 1080;
        this.background.depth = 0;
        console.log('🖼️ Main background created');
        
        // Character-specific backgrounds for top and bottom areas
        const bgKey = this.selectedCharacter === 'boss1' ? 'bg-boss-1' : 'bg-boss-2';
        console.log('🎨 Using background key:', bgKey, 'for character:', this.selectedCharacter);
        
        // Top background (opponent area)
        this.bgTop = this.add.image(540, 400, `${bgKey}-top`)
            .setOrigin(0.5)
            .setAlpha(0.3)
            .setScale(0.8);
        console.log('⬆️ Top background created:', `${bgKey}-top`);
        
        // Bottom background (player area)  
        this.bgBottom = this.add.image(540, 1500, `${bgKey}-bottom`)
            .setOrigin(0.5)
            .setAlpha(0.3)
            .setScale(0.8);
        console.log('⬇️ Bottom background created:', `${bgKey}-bottom`);
        
        // Goals and net
        this.add.rectangle(RINK.centerX, RINK.topGoalY - (155/4), 300, 155, 0xffffff, 0.0).setDepth(2);
        this.add.image(RINK.centerX, RINK.bottomGoalY + (RINK.puckRadius*2) - 70, 'net').setScale(0.6).setDepth(2);
        
        // Debug goal lines (matching original)
        this.add.line(0, 0, RINK.minX, RINK.topGoalY, RINK.maxX, RINK.topGoalY, 0xff0000).setOrigin(0, 0).setDepth(5);
        this.add.line(0, 0, RINK.minX, RINK.bottomGoalY, RINK.maxX, RINK.bottomGoalY, 0x0000ff).setOrigin(0, 0).setDepth(5);
        
        console.log('🥅 Goals and boundaries created');
    }
    
    private createGameObjects(): void {
        // Create ball/puck (matching original setup)
        this.ball = this.physics.add.sprite(RINK.centerX, RINK.centerY, 'puck')
            .setScale(0.5)
            .setOrigin(0.5, 0.5)
            .setCircle(RINK.puckRadius, (this.textures.get('puck').get(0).width / 2) - RINK.puckRadius, 
                                     (this.textures.get('puck').get(0).height / 2) - RINK.puckRadius)
            .setBounce(1.0)
            .setCollideWorldBounds(true)
            .setMaxVelocity(2000);
        
        // Start ball stationary
        this.ball.setVelocity(0, 0);
        this.ball.setDamping(true).setDrag(0.002);
        
        // Enable world bounds collision detection
        (this.ball.body as Phaser.Physics.Arcade.Body).onWorldBounds = true;
        console.log('🏒 Puck created');
        
        // Create player paddle (left/blue) 
        this.paddleLeft = this.physics.add.sprite(RINK.centerX, RINK.playerMinY + 100, 'blue-paddle')
            .setScale(1)
            .setOrigin(0.5, 0.5)
            .setImmovable(true);
        
        // Dynamically center collision circle on player sprite
        const playerTexture = this.textures.get('blue-paddle');
        const playerFrame = playerTexture.get(0);
        const playerCircleRadius = 35;
        const playerOffsetX = (playerFrame.width / 2) - playerCircleRadius;
        const playerOffsetY = (playerFrame.height / 2) - playerCircleRadius;
        (this.paddleLeft.body as Phaser.Physics.Arcade.Body).setCircle(playerCircleRadius, playerOffsetX, playerOffsetY);
        (this.paddleLeft.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
        
        this.paddleLeft.setInteractive();
        this.input.setDraggable(this.paddleLeft);
        
        // Add drag events for player paddle
        this.paddleLeft.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
            if (!this.gameStarted) return;
            
            // Constrain to player area
            const constrainedX = Phaser.Math.Clamp(dragX, 50, RINK.maxX - 50);
            const constrainedY = Phaser.Math.Clamp(dragY, RINK.playerMinY, RINK.playerMaxY);
            
            this.paddleLeft.setPosition(constrainedX, constrainedY);
            this.paddleLeftTargetX = constrainedX;
            this.paddleLeftTargetY = constrainedY;
            
            console.log('🔵 Player paddle dragged to:', constrainedX, constrainedY);
        });
        
        console.log('🔵 Player paddle created');
        
        // Create bot paddle (right/red)
        this.paddleRight = this.physics.add.sprite(RINK.centerX, RINK.botMaxY - 100, 'red-paddle')
            .setScale(1)
            .setOrigin(0.5, 0.5)
            .setImmovable(true);
        
        // Dynamically center collision circle on boss sprite
        const bossTexture = this.textures.get('red-paddle');
        const bossFrame = bossTexture.get(0);
        const circleRadius = 35;
        const offsetX = (bossFrame.width / 2) - circleRadius;
        const offsetY = (bossFrame.height / 2) - circleRadius;
        (this.paddleRight.body as Phaser.Physics.Arcade.Body).setCircle(circleRadius, offsetX, offsetY);
        (this.paddleRight.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
        
        console.log('🔴 Bot paddle created');
    }
    
    private setupPhysics(): void {
        // Ball vs paddle collisions (matching original)
        this.physics.add.collider(this.ball, this.paddleLeft, (ball, paddle) => 
            this.handlePaddleHit(ball as Phaser.Physics.Arcade.Sprite, paddle as Phaser.Physics.Arcade.Sprite), undefined, this);
        this.physics.add.collider(this.ball, this.paddleRight, (ball, paddle) => 
            this.handlePaddleHit(ball as Phaser.Physics.Arcade.Sprite, paddle as Phaser.Physics.Arcade.Sprite), undefined, this);
        
        // World bounds collision handling (matching original)
        this.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body) => {
            if (body.gameObject === this.ball) {
                console.log('🧱 Wall hit!');
                // Enhanced wall collision - add speed boost (matching original)
                this.onWallHit();
            }
        });
        
        console.log('⚽ Physics collisions setup');
    }
    
    private onWallHit(): void {
        // Wall hit speed boost (matching original logic)
        const WALL_HIT_SPEED_BOOST = 200;
        const WALL_HIT_SPEED_MULTIPLIER = 1.08;
        const WALL_HIT_MAX_BOOST = 600;
        
        const body = this.ball.body as Phaser.Physics.Arcade.Body;
        const currentSpeed = Math.sqrt(body.velocity.x * body.velocity.x + body.velocity.y * body.velocity.y);
        
        if (currentSpeed > 0) {
            const speedBoost = Math.min(WALL_HIT_SPEED_BOOST, WALL_HIT_MAX_BOOST);
            const newSpeed = currentSpeed * WALL_HIT_SPEED_MULTIPLIER + speedBoost;
            const normalizedVelX = body.velocity.x / currentSpeed;
            const normalizedVelY = body.velocity.y / currentSpeed;
            
            body.setVelocity(normalizedVelX * newSpeed, normalizedVelY * newSpeed);
        }
    }
    
    private setupInput(): void {
        // Mouse/touch input
        this.input.on('pointermove', this.handlePointerMove, this);
        
        // Keyboard input (matching original)
        if (this.input.keyboard) {
            const cursors = this.input.keyboard.createCursorKeys();
            const wasd = this.input.keyboard.addKeys('W,S,A,D');
            
            // Store for update loop (ensuring they exist)
            (this as any).cursors = cursors;
            (this as any).wasd = wasd;
            
            console.log('🎮 Keyboard setup:', !!cursors, !!wasd);
        }
        
        // Initialize paddle targets
        this.paddleLeftTargetX = RINK.centerX;
        this.paddleLeftTargetY = RINK.playerMinY + 100;
        
        console.log('🎮 Input setup complete');
    }
    
    private createUI(): void {
        // Title (matching original layout)
        this.add.text(540, 1320, 'AIR HOCKEY', {
            fontFamily: 'Commando',
            fontSize: '56px',
            color: '#ffffff'
        }).setOrigin(0.5, 0).setDepth(3);
        
        // Health labels
        this.add.text(150, 1420, 'Player Health:', {
            fontFamily: 'Commando',
            fontSize: '24px',
            color: '#4da6ff'
        }).setOrigin(0, 0.5).setDepth(3);
        
        // Character name display (replacing right health bar)
        this.characterNameText = this.add.text(930, 1420, this.characterName, {
            fontFamily: 'Commando',
            fontSize: '24px',
            color: '#ff4d4d'
        }).setOrigin(1, 0.5).setDepth(3);
        console.log('📝 Character name text created:', this.characterName);
        
        // Health bars
        this.healthBarLeft = this.add.graphics();
        this.healthBarLeft.depth = 4;
        this.updateHealthBars();
        
        // Timer with label (matching original)
        this.add.text(540, 1480, 'TIME REMAINING', {
            fontFamily: 'Commando',
            fontSize: '24px',
            color: '#cccccc'
        }).setOrigin(0.5, 0.5).setDepth(3);
        
        this.timerText = this.add.text(540, 1520, this.formatTime(this.gameTimer), {
            fontFamily: 'Commando',
            fontSize: '48px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5, 0.5).setDepth(3);
        
        // Game info (matching original)
        this.add.text(540, 1580, 'Controls: Drag paddles directly OR tap/click to move OR use WASD keys', {
            fontFamily: 'Commando',
            fontSize: '16px',
            color: '#cccccc',
            wordWrap: { width: 1000 },
            align: 'center'
        }).setOrigin(0.5, 0.5).setDepth(3);
        
        // Countdown text
        this.countdownText = this.add.text(RINK.centerX, RINK.centerY, '', {
            fontSize: '72px',
            color: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setVisible(false);
        
        console.log('🎨 UI elements created');
    }
    
    private startCountdown(): void {
        this.countdownActive = true;
        this.countdownValue = 3;
        this.countdownText.setVisible(true);
        this.countdownText.setText('GET READY!');
        
        this.time.delayedCall(1000, () => {
            this.countdownText.setText('3');
            this.time.delayedCall(1000, () => {
                this.countdownText.setText('2');
                this.time.delayedCall(1000, () => {
                    this.countdownText.setText('1');
                    this.time.delayedCall(1000, () => {
                        this.countdownText.setText('GO!');
                        this.time.delayedCall(1000, () => {
                            this.countdownText.setVisible(false);
                            this.startGame();
                        });
                    });
                });
            });
        });
    }
    
    private startGame(): void {
        this.gameStarted = true;
        this.countdownActive = false;
        
        // Give ball initial velocity
        this.resetBall();
        
        // Start game timer
        this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
        
        console.log('🎮 Game started!');
    }
    
    update(): void {
        if (!this.gameStarted) return;
        
        // Update player paddle movement
        this.updatePlayerInput();
        
        // Update bot AI
        this.updateBotAI();
        
        // Check for goals
        this.checkGoals();
        
        // Debug ball speed (every 2 seconds)
        if (this.time.now % 2000 < 16) {
            const ballBody = this.ball.body as Phaser.Physics.Arcade.Body;
            const speed = Math.sqrt(ballBody.velocity.x * ballBody.velocity.x + ballBody.velocity.y * ballBody.velocity.y);
            console.log('⚽ Ball speed:', Math.round(speed), 'Position:', Math.round(this.ball.x), Math.round(this.ball.y));
        }
    }
    
    private updatePlayerInput(): void {
        const speed = 8;
        let deltaX = 0;
        let deltaY = 0;
        
        // Keyboard input
        const cursors = (this as any).cursors;
        const wasd = (this as any).wasd;
        
        if (cursors || wasd) {
            if (cursors?.left.isDown || wasd?.A.isDown) deltaX = -speed;
            if (cursors?.right.isDown || wasd?.D.isDown) deltaX = speed;
            if (cursors?.up.isDown || wasd?.W.isDown) deltaY = -speed;
            if (cursors?.down.isDown || wasd?.S.isDown) deltaY = speed;
        }
        
        if (deltaX !== 0 || deltaY !== 0) {
            this.paddleLeftTargetX = this.paddleLeft.x + deltaX;
            this.paddleLeftTargetY = this.paddleLeft.y + deltaY;
        }
        
        // Smooth movement
        this.paddleLeft.x = Phaser.Math.Linear(this.paddleLeft.x, this.paddleLeftTargetX, this.playerSmoothness);
        this.paddleLeft.y = Phaser.Math.Linear(this.paddleLeft.y, this.paddleLeftTargetY, this.playerSmoothness);
        
        // Keep paddle in bounds
        this.paddleLeft.x = Phaser.Math.Clamp(this.paddleLeft.x, 50, RINK.maxX - 50);
        this.paddleLeft.y = Phaser.Math.Clamp(this.paddleLeft.y, RINK.playerMinY, RINK.playerMaxY);
    }
    
    private updateBotAI(): void {
        // Simple bot AI - follow the ball
        const ballX = this.ball.x;
        const ballY = this.ball.y;
        
        // Predict ball position
        this.botTargetX = ballX;
        this.botTargetY = RINK.botMinY + 200;
        
        // Smooth movement
        this.paddleRight.x = Phaser.Math.Linear(this.paddleRight.x, this.botTargetX, this.botSmoothness);
        this.paddleRight.y = Phaser.Math.Linear(this.paddleRight.y, this.botTargetY, this.botSmoothness);
        
        // Keep bot paddle in bounds
        this.paddleRight.x = Phaser.Math.Clamp(this.paddleRight.x, 50, RINK.maxX - 50);
        this.paddleRight.y = Phaser.Math.Clamp(this.paddleRight.y, RINK.botMinY, RINK.botMaxY);
    }
    
    private handlePaddleHit(ball: Phaser.Physics.Arcade.Sprite, paddle: Phaser.Physics.Arcade.Sprite): void {
        // Enhanced paddle hit (matching original logic)
        const PADDLE_HIT_BASE_SPEED_INCREASE = 120;
        const PADDLE_HIT_SPEED_MULTIPLIER = 1.03;
        const MAX_BALL_SPEED = 2000;
        
        const ballBody = ball.body as Phaser.Physics.Arcade.Body;
        const currentSpeed = Math.sqrt(ballBody.velocity.x * ballBody.velocity.x + ballBody.velocity.y * ballBody.velocity.y);
        
        // Calculate hit direction
        const angle = Phaser.Math.Angle.Between(paddle.x, paddle.y, ball.x, ball.y);
        
        // Increase speed on hit
        let newSpeed = currentSpeed;
        if (currentSpeed > 0) {
            newSpeed = Math.min(currentSpeed * PADDLE_HIT_SPEED_MULTIPLIER + PADDLE_HIT_BASE_SPEED_INCREASE, MAX_BALL_SPEED);
        } else {
            newSpeed = 400; // Initial speed if ball was stationary
        }
        
        // Apply hit power boost for player paddle
        const hitPower = paddle === this.paddleLeft ? 1.2 : 1.0;
        newSpeed *= hitPower;
        
        ball.setVelocity(
            Math.cos(angle) * newSpeed,
            Math.sin(angle) * newSpeed
        );
        
        console.log('🏒 Paddle hit! Speed:', Math.round(newSpeed), 'Power:', hitPower);
    }
    
    private handlePointerMove(pointer: Phaser.Input.Pointer): void {
        if (!this.gameStarted) return;
        
        // Move player paddle to pointer position (constrain to player area)
        this.paddleLeftTargetX = Phaser.Math.Clamp(pointer.x, 50, RINK.maxX - 50);
        this.paddleLeftTargetY = Phaser.Math.Clamp(pointer.y, RINK.playerMinY, RINK.playerMaxY);
        
        console.log('🖱️ Mouse move:', pointer.x, pointer.y, '->', this.paddleLeftTargetX, this.paddleLeftTargetY);
    }
    
    private checkGoals(): void {
        const ballY = this.ball.y;
        const ballRadius = RINK.puckRadius;
        
        // Check top goal (player scores)
        if (ballY - ballRadius <= RINK.topGoalY) {
            this.scoreGoal('player');
        }
        
        // Check bottom goal (bot scores)
        if (ballY + ballRadius >= RINK.bottomGoalY) {
            this.scoreGoal('bot');
        }
    }
    
    private scoreGoal(scorer: 'player' | 'bot'): void {
        const damage = 15;
        
        if (scorer === 'player') {
            this.rightHealth -= damage;
            console.log('🥅 Player scores! Bot health:', this.rightHealth);
        } else {
            this.leftHealth -= damage;
            console.log('🥅 Bot scores! Player health:', this.leftHealth);
        }
        
        this.updateHealthBars();
        this.cameras.main.flash(500, 255, 255, 255);
        
        // Check for game end
        if (this.leftHealth <= 0 || this.rightHealth <= 0) {
            this.endGame();
        } else {
            this.resetBallAfterGoal();
        }
    }
    
    private resetBall(): void {
        this.ball.setPosition(RINK.centerX, RINK.centerY);
        
        // Give ball immediate velocity (no delay for first start)
        const angle = (Math.random() - 0.5) * Math.PI / 3;
        const speed = 300;
        this.ball.setVelocity(
            Math.sin(angle) * speed,
            Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1)
        );
        
        console.log('⚽ Ball reset with velocity:', Math.round(speed));
    }
    
    private resetBallAfterGoal(): void {
        this.ball.setPosition(RINK.centerX, RINK.centerY);
        this.ball.setVelocity(0, 0);
        
        // Give ball new velocity after short delay (for goals)
        this.time.delayedCall(1000, () => {
            const angle = (Math.random() - 0.5) * Math.PI / 3;
            const speed = 300;
            this.ball.setVelocity(
                Math.sin(angle) * speed,
                Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1)
            );
        });
    }
    
    private updateTimer(): void {
        if (!this.gameStarted) return;
        
        this.gameTimer--;
        this.timerText.setText(this.formatTime(this.gameTimer));
        
        if (this.gameTimer <= 0) {
            this.endGame();
        }
    }
    
    private formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    private endGame(): void {
        this.gameStarted = false;
        
        let winner = 'DRAW';
        if (this.leftHealth > this.rightHealth) winner = 'PLAYER';
        else if (this.rightHealth > this.leftHealth) winner = 'BOT';
        
        this.add.text(RINK.centerX, RINK.centerY, `${winner} WINS!`, {
            fontSize: '48px',
            color: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        this.time.delayedCall(3000, () => {
            this.scene.start('MainMenu');
        });
        
        console.log('🏁 Game ended! Winner:', winner);
    }
    
    private showHelp(): void {
        console.log('🆘 Help requested');
        // Implementation depends on your help system
    }
    
    private updateHealthBars(): void {
        // Clear and redraw health bar
        this.healthBarLeft.clear();
        
        // Player health bar (matching original styling)
        const healthPercent = this.leftHealth / 100;
        const barWidth = 200;
        const barHeight = 30;
        const barX = 150;
        const barY = 1440;
        
        // Background
        this.healthBarLeft.fillStyle(0x222222);
        this.healthBarLeft.fillRect(barX, barY, barWidth, barHeight);
        
        // Health fill (green to red gradient based on health)
        let color = 0x00ff00; // Green
        if (this.leftHealth < 50) color = 0xffff00; // Yellow
        if (this.leftHealth < 25) color = 0xff0000; // Red
        
        this.healthBarLeft.fillStyle(color);
        this.healthBarLeft.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        // Border
        this.healthBarLeft.lineStyle(2, 0xffffff);
        this.healthBarLeft.strokeRect(barX, barY, barWidth, barHeight);
        
        // Character name replaces the right health bar display
        // Health bar shows player health, character name shows selected character
    }
}