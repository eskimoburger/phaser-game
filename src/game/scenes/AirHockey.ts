import Phaser from "phaser";

// Game state interface for saving/loading
interface GameState {
  // Game progress
  rightHealth: number;
  leftHealth: number;
  gameTimer: number;
  gameStarted: boolean;
  countdownActive: boolean;
  countdownValue: number;
  
  // Ball state
  ballX: number;
  ballY: number;
  ballVelocityX: number;
  ballVelocityY: number;
  
  // Paddle states
  paddleLeftX: number;
  paddleLeftY: number;
  paddleRightX: number;
  paddleRightY: number;
  
  // Game settings
  botDifficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'extreme' | 'impossible';
  botState: 'defend' | 'attack' | 'wait' | 'recover';
  
  // Input state
  inputMode: 'none' | 'keyboard' | 'touch' | 'drag' | 'gamepad';
  paddleLeftTargetX: number;
  paddleLeftTargetY: number;
  
  // Timer state
  timerColor: string;
  
  // Mini game state
  miniGameUsed: boolean;
  
  // Fire effect state
  puckFireActive: boolean;
}

// Rink boundaries and zones
const RINK = {
  minX:0,
  maxX:1080,
  playerMinY: 700,    // Blue paddle (player) minimum Y
  playerMaxY: 1075,   // Blue paddle (player) maximum Y
  botMinY: 155,       // Red paddle (bot) minimum Y
  botMaxY: 580,       // Red paddle (bot) maximum Y
  topGoalY: 155,       // Top goal line (when puck top crosses this)
  bottomGoalY: 1125,  // Bottom goal line (when puck bottom crosses this)
  centerX: 540,       // Horizontal center
  centerY: 640,       // Vertical center (between zones)
  puckRadius: 50      // Adjusted puck collision radius to match visual appearance
};

export default class AirHockey extends Phaser.Scene {
  private rightHealth = 100;
  private leftHealth = 100;
 
  // --- Tunable Game Parameters ---
  // private botSpeed = 8; // Bot movement speed (Reduced for smoother movement)
  private botReactionDelay = 0; // Current delay counter for bot reactions
  private botMaxReactionDelay = 3; // Max delay frames before bot reacts (Reduced for smoother response)
  private botSmoothness = 0.08; // Interpolation factor for smooth movement (0.05 = very smooth, 0.3 = responsive)
  private botEmergencySmoothness = 0.15; // Faster movement when in danger
  
  // Bot difficulty system
  private botDifficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'extreme' | 'impossible' = 'medium';
  private botMaxSpeed = 12; // Will be set by difficulty
  private botPredictionAccuracy = 0.7; // Will be set by difficulty
  private botErrorMargin = 20; // Will be set by difficulty
  private botAttackThreshold = 0.6; // Will be set by difficulty
  
  // Advanced AI parameters for extreme difficulty
  private botLookAheadFrames = 30; // Will be set by difficulty
  private botStrategicThinking = 0.5; // Will be set by difficulty
  private botCornerPrediction = 0.3; // Will be set by difficulty
  private botCounterAttackChance = 0.4; // Will be set by difficulty
  
  // Bot state machine
  private botState: 'defend' | 'attack' | 'wait' | 'recover' = 'defend';
  private botHomePosition = { x: RINK.centerX, y: RINK.botMinY + 200 }; // Adjusted for larger boss character
  private botLastMissTime = 0; // Time when bot last missed the puck

  private PADDLE_HIT_BASE_SPEED_INCREASE = 120; // Base speed added on paddle hit (Increased from 60 for more impact)
  private PADDLE_HIT_SPEED_MULTIPLIER = 1.03; // Speed multiplier on paddle hit (Increased from 1.015 for more acceleration)
  private MAX_BALL_SPEED = 2000; // Maximum speed the puck can reach (Increased from 1600 for more excitement)
  private PADDLE_HIT_ANGLE_INFLUENCE_DEGREES = 25; // Max degrees to alter puck angle (Increased for more control)

  private MIN_BALL_SPEED_THRESHOLD = 400; // If ball speed drops below this (Increased from 350)
  private BALL_BOOST_SPEED = 950;         // Speed to boost the ball to (Increased from 800)
  // --- End Tunable Game Parameters ---

  // New wall collision parameters - ENHANCED FOR MAXIMUM FUN!
  private WALL_HIT_SPEED_BOOST = 200; // Speed added when hitting walls (Increased from 80)
  private WALL_HIT_SPEED_MULTIPLIER = 1.08; // Speed multiplier for wall bounces (Increased from 1.02)
  private WALL_HIT_MAX_BOOST = 600; // Maximum speed boost from wall hits (Increased from 300)

  // Game objects
  private ball!: Phaser.Physics.Arcade.Sprite;
  private paddleLeft!: Phaser.Physics.Arcade.Sprite;
  private paddleRight!: Phaser.Physics.Arcade.Sprite;
  private background!: Phaser.GameObjects.Image;
  private rightGoal!: Phaser.GameObjects.Rectangle;
  private leftGoal!: Phaser.GameObjects.Image;

  // UI elements
  private title!: Phaser.GameObjects.Text;
  private blueHealthLabel!: Phaser.GameObjects.Text;
  private blueHealthBar!: Phaser.GameObjects.Graphics;
  private redHealthLabel!: Phaser.GameObjects.Text;
  private redHealthBar!: Phaser.GameObjects.Graphics;
  private gameInfo!: Phaser.GameObjects.Text;
  private help!: Phaser.GameObjects.Sprite;
  private helpModal!: Phaser.GameObjects.Text;
  private win?: Phaser.GameObjects.Text;
  private gameRestart?: Phaser.GameObjects.Text;
  private inputModeIndicator!: Phaser.GameObjects.Text;
  private botStateIndicator!: Phaser.GameObjects.Text;
  private botDifficultyIndicator!: Phaser.GameObjects.Text;
  
  // Boss character animation settings
  private bossAngerLevel: number = 0;

  // Background areas
  private playingAreaBackground!: Phaser.GameObjects.GameObject;
  private statsBackground!: Phaser.GameObjects.Rectangle;
  private blueStatsBackground!: Phaser.GameObjects.Rectangle;
  private redStatsBackground!: Phaser.GameObjects.Rectangle;

  // Audio
  private puckhit!: Phaser.Sound.BaseSound;
  private goal!: Phaser.Sound.BaseSound;
  private wall!: Phaser.Sound.BaseSound;
  private cheer!: Phaser.Sound.BaseSound;
  private music!: Phaser.Sound.BaseSound;

  // Input
  // private cursorKeys!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyUp!: Phaser.Input.Keyboard.Key;
  private keyDown!: Phaser.Input.Keyboard.Key;
  private keyLeft!: Phaser.Input.Keyboard.Key;
  private keyRight!: Phaser.Input.Keyboard.Key;

  // Enhanced input control system
  private isDragging = false;
  private isTouchMoving = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private paddleStartX = 0;
  private paddleStartY = 0;
  private touchControlsSetup = false;
  
  // Smooth movement properties
  private playerSmoothness = 0.15; // Interpolation factor for smooth player movement
  private keyboardVelocityX = 0; // Current keyboard velocity X
  private keyboardVelocityY = 0; // Current keyboard velocity Y
  private keyboardAcceleration = 0.8; // How quickly to accelerate
  private keyboardDamping = 0.85; // How quickly to decelerate when keys released

  private isRedDragging = false;
  private redDragStartX = 0;
  private redDragStartY = 0;
  private redPaddleStartX = 0;
  private redPaddleStartY = 0;

  // Input priority and conflict resolution
  private lastInputTime = 0;
  private lastInputType: 'none' | 'keyboard' | 'touch' | 'drag' | 'gamepad' = 'none';
  private inputSwitchCooldown = 100; // ms before allowing input type switch
  private keyboardInputActive = false;
  private touchInputActive = false;

  // Game state
  // private playAreaTop = 0;
  private playAreaBottom = 1280;
  private playAreaCenter = 640;
  // private statsAreaTop = 1280;
  // private statsAreaBottom = 1920;
  private statsAreaCenter = 1600;

  private paddleLeftTargetX = RINK.centerX;
  private paddleLeftTargetY = RINK.playerMinY + 100;
  private inputMode: 'none' | 'keyboard' | 'touch' | 'drag' | 'gamepad' = 'none';
  private debugTwoPlayer = false;
  private lastWallSfx = 0;

  private targetTouchX?: number;
  private targetTouchY?: number;

  // Timer system
  private gameTimer = 180; // 3 minutes in seconds
  private timerText!: Phaser.GameObjects.Text;
  private timerEvent?: Phaser.Time.TimerEvent;
  
  // Sliding help button for mini game
  private slidingHelpButton?: Phaser.GameObjects.Container;
  private slidingHelpShown = false;
  private miniGameUsed = false; // Track if mini game has been used this session
  
  // Game pause state for mini game
  private gamePaused = false;
  private storedBallVelocityX = 0;
  private storedBallVelocityY = 0;
  
  // Saved game state for mini game transitions
  private savedGameState?: GameState;
  
  // Fire effect system
  private puckFireActive = false;
  private fireEffectGraphics?: Phaser.GameObjects.Graphics;
  private fireParticles: Phaser.GameObjects.GameObject[] = [];

  // Countdown system
  private countdownText?: Phaser.GameObjects.Text;
  private countdownValue = 3;
  private countdownActive = false;
  private gameStarted = false;

  // Impact force system
  private paddleLeftPrevX = RINK.centerX;
  private paddleLeftPrevY = RINK.playerMinY + 100;
  private paddleRightPrevX = RINK.centerX;
  private paddleRightPrevY = RINK.botMaxY - 100;

  // Ball trace effect system
  private ballTracePoints: Array<{x: number, y: number, time: number}> = [];
  private traceGraphics!: Phaser.GameObjects.Graphics;
  private readonly MAX_TRACE_POINTS = 15; // Maximum number of trace points
  private readonly TRACE_LIFETIME = 300; // Trace lifetime in milliseconds
  private readonly TRACE_MIN_DISTANCE = 8; // Minimum distance between trace points

  // Gamepad input properties
  private gamepadConnected = false;
  private gamepad?: Phaser.Input.Gamepad.Gamepad;
  private gamepadThreshold = 0.2; // Minimum threshold for stick movement
  private gamepadVelocityX = 0;
  private gamepadVelocityY = 0;
  private gamepadAcceleration = 0.8;
  private gamepadDamping = 0.85;
  private gamepadDeadzone = 0.1;

  // Character selection properties
  private selectedCharacter: string = 'boss1';
  private characterName: string = 'Lady Delayna';
  private characterBackground: string = 'boss-bg1';

  constructor() {
    super({ 
      key: 'AirHockey',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: true
        }
      }
    });
  }

  preload() {
    console.log('AirHockey: Starting preload...');
    
    this.load.on('filecomplete', (key: string) => {
      console.log('AirHockey: Loaded asset:', key);
    });
    
    this.load.on('loaderror', (file: any) => {
      console.error('AirHockey: Failed to load:', file.key, file.src);
    });
    
    this.load.image('airhockey-background', "assets/airhockey/airhockey-background.svg");
    this.load.image('puck', 'assets/airhockey/wizball.png');
    this.load.image('blue-paddle', 'assets/characters/player.png');
    this.load.image('red-paddle', 'assets/characters/boss-field2.png');
    this.load.image("boss-field1", "assets/characters/boss-field1.png");
    this.load.image("boss-field2", "assets/characters/boss-field2.png");
    this.load.image("boss-bg1", "assets/background/boss1.png");
    this.load.image("boss-bg2", "assets/background/boss2.png");
    
    this.load.image("help-icon", "assets/airhockey/help.svg");
    this.load.image("net", "assets/airhockey/net.svg");
    
    // Skip audio loading for now to avoid decode errors
    // this.load.audio("wall-sound", ["assets/airhockey/wall_sound.mp3"]);
    // this.load.audio("puckhit-sound", ["assets/airhockey/puckhit.mp3"]);
    // this.load.audio("goal-sound", ["assets/airhockey/goal.mp3"]);
    // this.load.audio("gamemusic", ["assets/airhockey/music.mp3"]);
    // this.load.audio("cheer-sound", ["assets/airhockey/win.mp3"]);
  }

  create(data?: { miniGameResult?: boolean; resumeGame?: boolean }) {
    console.log('AirHockey: Scene created successfully!');
    
    // Check if we're resuming from mini game
    if (data?.resumeGame && this.savedGameState) {
      this.restoreGameState(data.miniGameResult || false);
      return;
    }
    
    // Set up gamepad input
    this.input.gamepad?.on('connected', (pad: Phaser.Input.Gamepad.Gamepad) => {
      console.log('AirHockey: Gamepad connected:', pad.id);
      this.gamepadConnected = true;
      this.gamepad = pad;
    });

    this.input.gamepad?.on('disconnected', (pad: Phaser.Input.Gamepad.Gamepad) => {
      console.log('AirHockey: Gamepad disconnected:', pad.id);
      this.gamepadConnected = false;
      this.gamepad = undefined;
      // Reset gamepad input state
      this.gamepadVelocityX = 0;
      this.gamepadVelocityY = 0;
      
      // If currently in gamepad mode, reset input mode
      if (this.inputMode === 'gamepad') {
        this.inputMode = 'none';
        this.lastInputType = 'none';
      }
    });
    
    // Check for already connected gamepads
    if (this.input.gamepad?.total) {
      this.gamepad = this.input.gamepad.getPad(0);
      this.gamepadConnected = true;
      console.log('AirHockey: Gamepad already connected:', this.gamepad.id);
    }
    
    // Reset all game state (only for new games)
    this.rightHealth = 100;
    this.leftHealth = 100;
    this.botReactionDelay = 0; // Reset bot reaction delay counter
    this.gameTimer = 180; // Reset timer to 3 minutes
    
    // Reset UI state
    this.win = undefined;
    this.gameRestart = undefined;

    // Reset countdown state
    this.countdownValue = 3;
    this.countdownActive = false;
    this.gameStarted = false;

    // Reset sliding help button state
    this.slidingHelpShown = false;
    if (this.slidingHelpButton) {
      this.slidingHelpButton.destroy();
      this.slidingHelpButton = undefined;
    }
    
    // Reset mini game state
    this.miniGameUsed = false;
    
    // Reset fire effect state
    this.puckFireActive = false;
    if (this.fireEffectGraphics) {
      this.fireEffectGraphics.destroy();
      this.fireEffectGraphics = undefined;
    }
    this.fireParticles.forEach(particle => particle.destroy());
    this.fireParticles = [];
    
    // Reset game pause state
    this.gamePaused = false;
    this.storedBallVelocityX = 0;
    this.storedBallVelocityY = 0;
    
    // Clear saved game state for new games
    this.savedGameState = undefined;

    this.physics.world.setBounds(0, 0, 1080, 1280);
    this.physics.world.setBoundsCollision(true, true, true, true);

    this.playingAreaBackground = this.add.rectangle(540, this.playAreaCenter, 1080, 1280, 0xffffff, 0);
    this.statsBackground = this.add.rectangle(540, this.statsAreaCenter, 1080, 640, 0x1a1a1a, 0.8);
    this.statsBackground.depth = 1;

    // Create split stats backgrounds for health loss blink effect
    this.blueStatsBackground = this.add.rectangle(270, this.statsAreaCenter, 540, 640, 0x1a1a1a, 0.8);
    this.blueStatsBackground.depth = 2;
    this.redStatsBackground = this.add.rectangle(810, this.statsAreaCenter, 540, 640, 0x1a1a1a, 0.8);
    this.redStatsBackground.depth = 2;

    this.title = this.add.text(540, 1320, 'AIR HOCKEY', {
      fontFamily: 'Commando',
      fontSize: '56px',
      color: '#ffffff'
    });
    this.title.setOrigin(0.5, 0);
    this.title.depth = 3;

    this.blueHealthLabel = this.add.text(150, 1420, 'Blue Health:', {
      fontFamily: 'Commando',
      fontSize: '24px',
      color: '#4da6ff'
    });
    this.blueHealthLabel.setOrigin(0, 0.5);
    this.blueHealthLabel.depth = 3;

    // Create stylized health bars using Graphics
    this.blueHealthBar = this.add.graphics();
    this.blueHealthBar.depth = 4;

    this.redHealthLabel = this.add.text(930, 1420, this.characterName, {
      fontFamily: 'Commando',
      fontSize: '24px',
      color: '#ff4d4d'
    });
    this.redHealthLabel.setOrigin(1, 0.5);
    this.redHealthLabel.depth = 3;

    this.redHealthBar = this.add.graphics();
    this.redHealthBar.depth = 4;

    this.gameInfo = this.add.text(540, 1580, 'Controls: Drag paddles directly OR tap/click to move OR use WASD keys OR gamepad\nBlue paddle: bottom half only - ESC: menu, R: restart, T: test timer (10s), F: test fire effect\nBot Difficulty: Q = BEGINNER, 1 = Easy, 2 = Medium, 3 = Hard, 4 = EXTREME, 5 = IMPOSSIBLE', {
      fontFamily: 'Commando',
      fontSize: '16px',
      color: '#cccccc',
      wordWrap: { width: 1000 },
      align: 'center'
    });
    this.gameInfo.setOrigin(0.5, 0.5);
    this.gameInfo.depth = 3;

    // Add input mode indicator
    this.inputModeIndicator = this.add.text(270, 1680, 'Input: None', {
      fontFamily: 'Commando',
      fontSize: '14px',
      color: '#888888',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 8, y: 4 }
    });
    this.inputModeIndicator.setOrigin(0.5, 0.5);
    this.inputModeIndicator.depth = 3;
    
    // Add bot state indicator
    this.botStateIndicator = this.add.text(540, 1680, 'Bot: Defend', {
      fontFamily: 'Commando',
      fontSize: '14px',
      color: '#ff8888',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 8, y: 4 }
    });
    this.botStateIndicator.setOrigin(0.5, 0.5);
    this.botStateIndicator.depth = 3;
    
    // Add bot difficulty indicator
    this.botDifficultyIndicator = this.add.text(810, 1680, 'Difficulty: Medium', {
      fontFamily: 'Commando',
      fontSize: '14px',
      color: '#ffaa00',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 8, y: 4 }
    });
    this.botDifficultyIndicator.setOrigin(0.5, 0.5);
    this.botDifficultyIndicator.depth = 3;

    // Add countdown timer
    this.timerText = this.add.text(540, 1520, this.formatTime(this.gameTimer), {
      fontFamily: 'Commando',
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.timerText.setOrigin(0.5, 0.5);
    this.timerText.depth = 3;

    // Add timer label
    this.add.text(540, 1480, 'TIME REMAINING', {
      fontFamily: 'Commando',
      fontSize: '24px',
      color: '#cccccc'
    }).setOrigin(0.5, 0.5).setDepth(3);

    // this.cursorKeys = this.input.keyboard!.createCursorKeys();
    this.keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyUp = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.keyDown = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.keyLeft = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.keyRight = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

    this.isDragging = false;
    this.isTouchMoving = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.paddleStartX = 0;
    this.paddleStartY = 0;
    this.touchControlsSetup = false;

    this.isRedDragging = false;
    this.redDragStartX = 0;
    this.redDragStartY = 0;
    this.redPaddleStartX = 0;
    this.redPaddleStartY = 0;

    this.background = this.add.image(540, this.playAreaCenter, 'airhockey-background');
    this.background.displayHeight = 1280;
    this.background.displayWidth = 1080;
    this.background.depth = 0;

    this.rightGoal = this.add.rectangle(RINK.centerX, RINK.topGoalY - (155/4), 300, 155, 0xffffff, 0.0);
    this.rightGoal.depth = 2;

    this.leftGoal = this.add.image(RINK.centerX, RINK.bottomGoalY + (RINK.puckRadius*2) - 70 , 'net').setScale(0.6);
    this.leftGoal.depth = 2;

    // Debug goal lines - visualize goal boundaries
    // this.add.line(0, 0, RINK.minX, RINK.topGoalY, RINK.maxX, RINK.topGoalY, 0xff0000).setOrigin(0, 0).setDepth(5);
    // this.add.line(0, 0, RINK.minX, RINK.bottomGoalY, RINK.maxX, RINK.bottomGoalY, 0x0000ff).setOrigin(0, 0).setDepth(5);

    this.ball = this.physics.add.sprite(RINK.centerX, RINK.centerY, 'puck')
      .setScale(0.5)
      .setOrigin(0.5, 0.5) // Ensure the puck is centered properly
      .setCircle(RINK.puckRadius, (this.textures.get('puck').get(0).width / 2) - RINK.puckRadius, 
                                 (this.textures.get('puck').get(0).height / 2) - RINK.puckRadius) // Adjust offset to center the collision circle
      .setBounce(1.0)
      .setCollideWorldBounds(true)
      .setMaxVelocity(this.MAX_BALL_SPEED);

    // Start ball stationary - will be activated after countdown
    this.ball.setVelocity(0, 0);
    this.ball.setDamping(true).setDrag(0.002);

    // Initialize ball trace graphics
    this.traceGraphics = this.add.graphics();
    this.traceGraphics.setDepth(1); // Behind the ball but above background
    this.ballTracePoints = []; // Reset trace points

    (this.ball.body as Phaser.Physics.Arcade.Body).onWorldBounds = true;
    this.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body) => {
      if (body.gameObject === this.ball) {
        const now = this.time.now;
        if (now - (this.lastWallSfx || 0) > 50) {
          this.wall.play();
          this.lastWallSfx = now;
        }
        
        // Enhanced wall collision - add speed boost
        this.onWallHit();
      }
    });

    this.paddleLeft = this.physics.add.sprite(RINK.centerX, RINK.playerMinY + 100, 'blue-paddle')
      .setScale(1)
      .setOrigin(0.5, 0.5) // Ensure sprite is centered on its position
      .setImmovable(true);
          this.paddleRight = this.physics.add.sprite(RINK.centerX, RINK.botMaxY - 100, 'red-paddle')
      .setScale(1)
      .setOrigin(0.5, 0.5) // Ensure sprite is centered on its position
      .setImmovable(true);
      
    // Get selected character from localStorage (moved here after paddles are created)
    this.getSelectedCharacter();
      
    // Dynamically center the collision circle on the boss sprite
    const bossTexture = this.textures.get('red-paddle');
    const bossFrame = bossTexture.get(0);
    
    console.log('Boss texture dimensions:', bossFrame.width, bossFrame.height);
    // Use the same circle radius for both paddles for consistent collision
    const circleRadius = 35;
    // Calculate offsets from top-left to center the collision circle
    const offsetX = (bossFrame.width / 2) - circleRadius;
    const offsetY = (bossFrame.height / 2) - circleRadius;
    (this.paddleRight.body as Phaser.Physics.Arcade.Body).setCircle(circleRadius, offsetX, offsetY);
    
    // Dynamically center the collision circle on the player sprite
    const playerTexture = this.textures.get('blue-paddle');
    const playerFrame = playerTexture.get(0);
    const playerCircleRadius = 35;
    const playerOffsetX = (playerFrame.width / 2) - playerCircleRadius;
    const playerOffsetY = (playerFrame.height / 2) - playerCircleRadius;
    (this.paddleLeft.body as Phaser.Physics.Arcade.Body).setCircle(playerCircleRadius, playerOffsetX, playerOffsetY);

    (this.paddleLeft.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
    (this.paddleRight.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);

    this.paddleLeft.setInteractive();
    this.input.setDraggable(this.paddleLeft);
    this.paddleRight.setInteractive();
    this.input.setDraggable(this.paddleRight);

    this.physics.add.collider(this.ball, this.paddleLeft, (ball, paddle) => this.onPaddleHit(ball as Phaser.Physics.Arcade.Sprite, paddle as Phaser.Physics.Arcade.Sprite), undefined, this);
    this.physics.add.collider(this.ball, this.paddleRight, (ball, paddle) => this.onPaddleHit(ball as Phaser.Physics.Arcade.Sprite, paddle as Phaser.Physics.Arcade.Sprite), undefined, this);

    // Create placeholder audio objects that won't cause errors
    this.puckhit = { play: () => {}, isPlaying: false } as any;
    this.goal = { play: () => {}, isPlaying: false } as any;
    this.wall = { play: () => {}, isPlaying: false } as any;
    this.cheer = { play: () => {}, stop: () => {}, isPlaying: false } as any;
    this.music = { play: () => {}, stop: () => {}, pause: () => {}, isPlaying: false } as any;
    
    this.events.once('shutdown', () => {
      if (this.music && this.music.isPlaying) this.music.stop();
      if (this.cheer && this.cheer.isPlaying) this.cheer.stop();
    });

    this.paddleLeftTargetX = RINK.centerX;
    this.paddleLeftTargetY = RINK.playerMinY + 100;
    this.inputMode = 'none';

    this.debugTwoPlayer = false;
    this.lastWallSfx = 0;

    this.help = this.add.sprite(540, 1750, 'help-icon');
    this.help.setScale(1.0);
    this.help.depth = 4;
    this.help.visible = false;

    this.helpModal = this.add.text(540, 1700, 'Help', {
      color: 'white',
      fontSize: '32px'
    });
    this.helpModal.setOrigin(0.5, 0.5);
    this.helpModal.setInteractive();
    this.helpModal.on('pointerover', () => { this.help.visible = true; });
    this.helpModal.on('pointerout', () => { this.help.visible = false; });

    // Add keyboard shortcut to return to main menu
    this.input.keyboard?.on('keydown-ESC', () => {
      // If mini-game help is active, prevent escape and show warning
      if (this.slidingHelpButton && this.gamePaused) {
        console.log('AirHockey: ESC pressed - but mini-game entry is forced');
        
        // Show a warning message
        const warningText = this.add.text(RINK.centerX, RINK.centerY + 100, 'YOU MUST ENTER THE MINI-GAME!', {
          fontFamily: 'Commando',
          fontSize: '28px',
          color: '#ff0000',
          stroke: '#000000',
          strokeThickness: 4
        });
        warningText.setOrigin(0.5, 0.5);
        warningText.setDepth(110);
        
        // Make it flash to grab attention
        this.tweens.add({
          targets: warningText,
          alpha: 0.3,
          duration: 100,
          yoyo: true,
          repeat: 5,
          onComplete: () => {
            warningText.destroy();
          }
        });
        return;
      }
      
      // Normal behavior if mini-game not active
      this.scene.start('MainMenu');
    });

    // Add keyboard shortcut to restart game (for testing)
    this.input.keyboard?.on('keydown-R', () => {
      console.log('AirHockey: R key pressed - restarting game');
      if (this.timerEvent) {
        this.timerEvent.destroy();
        this.timerEvent = undefined;
      }
      this.input.removeAllListeners();
      this.touchControlsSetup = false;
      this.scene.restart();
    });

    // Add keyboard shortcut to test timer (for testing - sets timer to 10 seconds)
    this.input.keyboard?.on('keydown-T', () => {
      console.log('AirHockey: T key pressed - setting timer to 10 seconds for testing');
      this.gameTimer = 10;
      this.timerText.setText(this.formatTime(this.gameTimer));
      this.timerText.setColor('#ff4444'); // Make it red to show it's in test mode
    });

    // Add keyboard shortcuts for difficulty adjustment
    this.input.keyboard?.on('keydown-Q', () => {
      this.setBotDifficulty('beginner');
      this.showDifficultyChange('BEGINNER');
      this.playBossTaunt('pathetic');
      console.log('AirHockey: Boss difficulty set to PATHETIC');
    });
    
    this.input.keyboard?.on('keydown-ONE', () => {
      this.setBotDifficulty('easy');
      this.showDifficultyChange('Easy');
      this.playBossTaunt('weak');
      console.log('AirHockey: Boss difficulty set to Weak');
    });
    
    this.input.keyboard?.on('keydown-TWO', () => {
      this.setBotDifficulty('medium');
      this.showDifficultyChange('Medium');
      this.playBossTaunt('average');
      console.log('AirHockey: Boss difficulty set to Average');
    });
    
    this.input.keyboard?.on('keydown-THREE', () => {
      this.setBotDifficulty('hard');
      this.showDifficultyChange('Hard');
      this.playBossTaunt('powerful');
      console.log('AirHockey: Boss difficulty set to Powerful');
    });
    
    this.input.keyboard?.on('keydown-FOUR', () => {
      this.setBotDifficulty('extreme');
      this.showDifficultyChange('EXTREME');
      this.playBossTaunt('enraged');
      console.log('AirHockey: Boss difficulty set to ENRAGED');
    });
    
    this.input.keyboard?.on('keydown-FIVE', () => {
      this.setBotDifficulty('impossible');
      this.showDifficultyChange('IMPOSSIBLE');
      this.playBossTaunt('godlike');
      console.log('AirHockey: Boss difficulty set to GODLIKE');
    });
    
    // Add fire effect test key for debugging
    this.input.keyboard?.on('keydown-F', () => {
      if (this.puckFireActive) {
        this.removeFireEffect();
        console.log('AirHockey: Fire effect removed via F key');
      } else {
        this.activateFireEffect();
        console.log('AirHockey: Fire effect activated via F key');
      }
    });

    this.setupTouchControls();
    this.updateHealthBars(); // Initialize the stylized health bars
    this.setBotDifficulty(this.botDifficulty); // Initialize bot parameters properly
    this.startCountdown();
  }

  update() {
    const lbody = this.paddleLeft.body as Phaser.Physics.Arcade.Body;

    // Store previous positions FIRST before any movement
    this.storePreviousPositions();

    // Only run game logic if game has started and countdown is complete AND game is not paused
    if (this.gameStarted && !this.countdownActive && !this.gamePaused) {
      if (!this.isRedDragging && (!this.win && !this.gameRestart)) {
        this.updateBotAI();
      }

      // Maintain minimum ball velocity
      const currentVelocity = this.ball.body!.velocity.length();
      if (currentVelocity < this.MIN_BALL_SPEED_THRESHOLD && currentVelocity > 0 && (!this.win && !this.gameRestart)) {
        const normalizedVelocity = this.ball.body!.velocity.clone().normalize();
        (this.ball.body as Phaser.Physics.Arcade.Body).setVelocity(normalizedVelocity.x * this.BALL_BOOST_SPEED, normalizedVelocity.y * this.BALL_BOOST_SPEED);
      }

      // Goal scoring
      const puckTop = this.ball.y - RINK.puckRadius;
      const puckBottom = this.ball.y + RINK.puckRadius;

      if (puckTop <= RINK.topGoalY && (!this.win && !this.gameRestart)) {
        this.handleGoal(true);
      } else if (puckBottom >= RINK.bottomGoalY && (!this.win && !this.gameRestart)) {
        this.handleGoal(false);
      }
    }
    
    // Always allow paddle movement (even during countdown) but not when game is paused for mini game
    if (!this.win && !this.gameRestart && !this.gamePaused) {
        this.updateInputState();
        this.applyPaddleMovement(lbody);
    }

    // Update ball trace effect (but only when not paused)
    if (!this.gamePaused) {
      this.updateBallTrace();
    }
    
    // Update fire effect (but only when not paused)
    if (!this.gamePaused && this.puckFireActive) {
      this.updateFireEffect();
    }

    // Update UI indicators
    this.updateInputModeIndicator();
    this.updateBotStateIndicator();

    if (this.debugTwoPlayer && (!this.win && !this.gameRestart) && this.gameStarted && !this.countdownActive && !this.gamePaused) {
      const rbody = this.paddleRight.body as Phaser.Physics.Arcade.Body;
      if (this.keyUp.isDown) this.paddleRight.y -= 10;
      else if (this.keyDown.isDown) this.paddleRight.y += 10;
      if (this.keyLeft.isDown) this.paddleRight.x -= 10;
      else if (this.keyRight.isDown) this.paddleRight.x += 10;
      this.paddleRight.x = Math.max(RINK.minX, Math.min(RINK.maxX, this.paddleRight.x));
      this.paddleRight.y = Math.max(RINK.botMinY, Math.min(RINK.botMaxY, this.paddleRight.y));
      rbody.updateFromGameObject();
    }
  }

  private handleGoal(playerScored: boolean) {
    this.goal.play();
    
    // Check for special fire effect rule BEFORE removing the effect
    const hadFireEffect = this.puckFireActive;
    
    // Remove fire effect when goal is scored
    if (this.puckFireActive) {
      this.removeFireEffect();
      console.log('AirHockey: Fire effect removed due to goal!');
    }
    
    // Special fire effect rule: If player scores with fire effect, instant win!
    if (playerScored && hadFireEffect) {
      console.log('AirHockey: FIRE GOAL! Player wins instantly!');
      
      // Set bot health to 0 for instant win
      this.rightHealth = 0;
      this.leftHealth = Math.max(this.leftHealth, 1); // Ensure player health is not 0
      
      // Create special fire goal effect
      this.createFireGoalEffect();
    } else {
      // Normal goal scoring
      if (playerScored) {
        this.rightHealth -= 10;
        // Trigger red blink effect for red player losing health
        this.triggerHealthLossBlink('red');
      } else {
        this.leftHealth -= 10;
        // Trigger blue blink effect for blue player losing health
        this.triggerHealthLossBlink('blue');
        
        // Show sliding help button when player health is very low
        if (this.leftHealth <= 10 && !this.slidingHelpShown && !this.miniGameUsed && !this.win && !this.gameRestart) {
          this.showSlidingHelpButton();
        }
      }
    }
    
    this.updateHealthBars();

    // Stop the ball and reset its position
    this.ball.body!.stop();
    this.ball.setPosition(RINK.centerX, RINK.centerY);
    this.ball.setVelocity(0, playerScored ? 350 : -350);

    // Clear ball trace on goal
    this.ballTracePoints = [];
    if (this.traceGraphics) {
      this.traceGraphics.clear();
    }

    // Reset paddle positions to their starting positions
    const blueStartX = RINK.centerX;
    const blueStartY = RINK.playerMinY + 100;
    const redStartX = RINK.centerX;
    const redStartY = RINK.botMaxY - 100;

    // Reset blue paddle (player)
    this.paddleLeft.setPosition(blueStartX, blueStartY);
    (this.paddleLeft.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
    
    // Reset red paddle (bot)
    this.paddleRight.setPosition(redStartX, redStartY);
    (this.paddleRight.body as Phaser.Physics.Arcade.Body).updateFromGameObject();

    // Reset paddle target positions for smooth movement
    this.paddleLeftTargetX = blueStartX;
    this.paddleLeftTargetY = blueStartY;

    // Reset all input states to prevent conflicts
    this.isDragging = false;
    this.isRedDragging = false;
    this.isTouchMoving = false;
    this.keyboardInputActive = false;
    this.touchInputActive = false;
    
    // Clear touch targets
    this.targetTouchX = undefined;
    this.targetTouchY = undefined;
    
    // Reset input tracking
    this.inputMode = 'none';
    this.lastInputType = 'none';
    this.lastInputTime = 0;

    // Reset paddle previous positions for impact force calculation
    this.paddleLeftPrevX = blueStartX;
    this.paddleLeftPrevY = blueStartY;
    this.paddleRightPrevX = redStartX;
    this.paddleRightPrevY = redStartY;

    // Add visual feedback for paddle reset
    this.createPaddleResetEffect(this.paddleLeft);
    this.createPaddleResetEffect(this.paddleRight);

    console.log(`AirHockey: Goal scored! ${playerScored ? 'Player' : 'Bot'} scored. Paddles reset to starting positions.`);

    if (this.rightHealth <= 0 || this.leftHealth <= 0) {
      // Stop the timer when game ends by health
      if (this.timerEvent) {
        this.timerEvent.destroy();
        this.timerEvent = undefined;
      }

      this.music.pause();
      this.cheer.play();

      if (this.win) this.win.destroy();
      if (this.gameRestart) this.gameRestart.destroy();
      
      const winnerText = this.leftHealth <=0 ? 'RED WINS!!!!!' : 'BLUE WINS!!!!';
      const winnerColor = this.leftHealth <=0 ? '#ff4d4d' : '#4da6ff';

      this.win = this.add.text(RINK.centerX, RINK.centerY - 100, winnerText, {
        fontFamily: 'Commando',
        fontSize: '80px',
        color: winnerColor,
        stroke: '#000000',
        strokeThickness: 6
      });
      this.win.setOrigin(0.5, 0.5);
      this.win.depth = 10;

      this.gameRestart = this.add.text(RINK.centerX, RINK.centerY + 20, 'Click to Restart Game', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '40px',
        color: 'white',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: { x: 20, y: 10 },
        align: 'center'
      });
      this.gameRestart.setOrigin(0.5, 0.5);
      this.gameRestart.depth = 10;
      this.gameRestart.setInteractive();
      this.gameRestart.once('pointerdown', () => {
        console.log('AirHockey: Restart button clicked');
        if (this.cheer && this.cheer.isPlaying) this.cheer.stop();
        
        // Clean up timer
        if (this.timerEvent) {
          this.timerEvent.destroy();
          this.timerEvent = undefined;
        }
        
        // Clean up any existing event listeners
        this.input.removeAllListeners();
        
        // Reset touch controls flag so they get set up again
        this.touchControlsSetup = false;
        
        console.log('AirHockey: Restarting scene...');
        this.scene.restart();
      });

      this.ball.body!.stop();
      const leftBody = this.paddleLeft.body as Phaser.Physics.Arcade.Body;
      const rightBody = this.paddleRight.body as Phaser.Physics.Arcade.Body;
      leftBody.setVelocity(0, 0);
      rightBody.setVelocity(0, 0);
    }
  }

  private setupTouchControls() {
    if (this.touchControlsSetup) return;
    this.touchControlsSetup = true;

    // Drag events - highest priority
    this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
      if (this.win || this.gameRestart) return;
      
      const currentTime = this.time.now;
      
      if (gameObject === this.paddleLeft) {
        // Clear conflicting input states
        this.clearOtherInputStates('drag');
        
        this.isDragging = true;
        this.isTouchMoving = false;
        this.dragStartX = pointer.x;
        this.dragStartY = pointer.y;
        this.paddleStartX = this.paddleLeft.x;
        this.paddleStartY = this.paddleLeft.y;
        
        // Update target positions to current position to prevent conflicts
        this.paddleLeftTargetX = this.paddleLeft.x;
        this.paddleLeftTargetY = this.paddleLeft.y;
        
        // Update input tracking
        this.lastInputTime = currentTime;
        this.lastInputType = 'drag';
        
        console.log('AirHockey: Started dragging blue paddle');
      } else if (gameObject === this.paddleRight) {
        this.isRedDragging = true;
        this.redDragStartX = pointer.x;
        this.redDragStartY = pointer.y;
        this.redPaddleStartX = this.paddleRight.x;
        this.redPaddleStartY = this.paddleRight.y;
        
        console.log('AirHockey: Started dragging red paddle');
      }
    });

    this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number, dragY: number) => {
      if (this.win || this.gameRestart) return;
      
      if (gameObject === this.paddleLeft && this.isDragging) {
        const deltaX = pointer.x - this.dragStartX;
        const deltaY = pointer.y - this.dragStartY;
        let newX = this.paddleStartX + deltaX;
        let newY = this.paddleStartY + deltaY;
        
        // Apply constraints
        newX = Math.max(RINK.minX, Math.min(RINK.maxX, newX));
        newY = Math.max(RINK.playerMinY, Math.min(RINK.playerMaxY, newY));
        
        this.paddleLeft.setPosition(newX, newY);
        (this.paddleLeft.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
        
        // Update input tracking
        this.lastInputTime = this.time.now;
      } else if (gameObject === this.paddleRight && this.isRedDragging) {
        const deltaX = pointer.x - this.redDragStartX;
        const deltaY = pointer.y - this.redDragStartY;
        let newX = this.redPaddleStartX + deltaX;
        let newY = this.redPaddleStartY + deltaY;
        
        // Apply constraints
        newX = Math.max(RINK.minX, Math.min(RINK.maxX, newX));
        newY = Math.max(RINK.botMinY, Math.min(RINK.botMaxY, newY));
        
        this.paddleRight.setPosition(newX, newY);
        (this.paddleRight.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
      }
    });

    this.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
      if (gameObject === this.paddleLeft) {
        this.isDragging = false;
        
        // Update target positions to current paddle position to prevent repositioning
        this.paddleLeftTargetX = this.paddleLeft.x;
        this.paddleLeftTargetY = this.paddleLeft.y;
        
        console.log('AirHockey: Stopped dragging blue paddle at', this.paddleLeft.x, this.paddleLeft.y);
      } else if (gameObject === this.paddleRight) {
        this.isRedDragging = false;
        console.log('AirHockey: Stopped dragging red paddle');
      }
    });

    // Touch/tap events - medium priority
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.win || this.gameRestart) return;
      
      const currentTime = this.time.now;
      const timeSinceLastInput = currentTime - this.lastInputTime;
      
      // Only handle touch if not dragging and enough time has passed since last input
      if (pointer.y > RINK.centerY && !this.isDragging && !this.isTouchMoving && 
          (this.lastInputType !== 'keyboard' || timeSinceLastInput > this.inputSwitchCooldown)) {
        
        const paddleDistance = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.paddleLeft.x, this.paddleLeft.y);
        const paddleRadius = (this.paddleLeft.body as Phaser.Physics.Arcade.Body).radius;
        
        // Only start touch movement if clicking away from paddle
        if (paddleDistance > paddleRadius + 30) {
          // Clear conflicting input states
          this.clearOtherInputStates('touch');
          
          let targetY = pointer.y;
          if (pointer.y > this.playAreaBottom) {
            targetY = RINK.playerMaxY - 50;
          }
          
          this.targetTouchX = Math.max(RINK.minX, Math.min(RINK.maxX, pointer.x));
          this.targetTouchY = Math.max(RINK.playerMinY, Math.min(RINK.playerMaxY, targetY));
          this.isTouchMoving = true;
          
          // Update input tracking
          this.lastInputTime = currentTime;
          this.lastInputType = 'touch';
          
          console.log('AirHockey: Started touch movement to', this.targetTouchX, this.targetTouchY);
        }
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.win || this.gameRestart) return;
      
      // Only update touch target if actively touch moving and not dragging
      if (pointer.isDown && pointer.y > RINK.centerY && !this.isDragging && this.isTouchMoving) {
        let targetY = pointer.y;
        if (pointer.y > this.playAreaBottom) {
          targetY = RINK.playerMaxY - 50;
        }
        
        this.targetTouchX = Math.max(RINK.minX, Math.min(RINK.maxX, pointer.x));
        this.targetTouchY = Math.max(RINK.playerMinY, Math.min(RINK.playerMaxY, targetY));
        
        // Update input tracking
        this.lastInputTime = this.time.now;
      }
    });

    this.input.on('pointerup', () => {
      // Only stop touch movement if not dragging
      if (!this.isDragging) {
        if (this.isTouchMoving) {
          console.log('AirHockey: Stopped touch movement');
        }
        this.isTouchMoving = false;
        this.targetTouchX = undefined;
        this.targetTouchY = undefined;
      }
    });
  }

  private updateBotAI() {
    const rbody = this.paddleRight.body as Phaser.Physics.Arcade.Body;
    
    // 1. TRACKING THE PUCK
    const ballX = this.ball.x;
    const ballY = this.ball.y;
    const ballVelX = this.ball.body!.velocity.x;
    const ballVelY = this.ball.body!.velocity.y;
    const ballSpeed = this.ball.body!.velocity.length();
    const paddleX = this.paddleRight.x;
    const paddleY = this.paddleRight.y;
    
    // Calculate distances and angles
    const distanceToBall = Phaser.Math.Distance.Between(paddleX, paddleY, ballX, ballY);
    
    // Predict puck trajectory
    const predictedPosition = this.predictPuckPosition(ballX, ballY, ballVelX, ballVelY);
    
    // 2. MOVEMENT STRATEGY - Update bot state ONCE per frame
    this.updateBotState(ballY, ballVelY, distanceToBall, ballSpeed);
    
    // Define safe movement bounds
    const safeMinX = RINK.minX + rbody.radius;
    const safeMaxX = RINK.maxX - rbody.radius;
    const safeMinY = RINK.botMinY + rbody.radius;
    const safeMaxY = RINK.botMaxY - rbody.radius;
    
    // 3. DECISION-MAKING - Calculate target position based on state
    let targetX = this.botHomePosition.x;
    let targetY = this.botHomePosition.y;
    let movementSpeed = this.botSmoothness;
    
    switch (this.botState) {
      case 'defend':
        // Position between puck and goal
        const defenseResult = this.calculateDefensivePosition(predictedPosition, paddleX, paddleY);
        targetX = defenseResult.x;
        targetY = defenseResult.y;
        movementSpeed = defenseResult.urgency ? this.botEmergencySmoothness : this.botSmoothness;
        break;
        
      case 'attack':
        // Move to strike position
        const attackResult = this.calculateAttackPosition(ballX, ballY, ballVelX, ballVelY, 0);
        targetX = attackResult.x;
        targetY = attackResult.y;
        movementSpeed = this.botEmergencySmoothness; // Faster for attacks
        break;
        
      case 'wait':
        // Return to home position or track passively
        if (distanceToBall > 300) {
          targetX = this.botHomePosition.x;
          targetY = this.botHomePosition.y;
        } else {
          // Passive tracking
          targetX = ballX;
          targetY = this.botHomePosition.y;
        }
        movementSpeed = this.botSmoothness * 0.5; // Slower when waiting
        break;
        
      case 'recover':
        // Quick return to defensive position
        targetX = this.botHomePosition.x;
        targetY = this.botHomePosition.y;
        movementSpeed = this.botEmergencySmoothness * 1.2; // Extra fast for recovery
        break;
    }
    
    // 4. PROXIMITY-BASED MOVEMENT ADJUSTMENT - Simplified
    if (distanceToBall < 80) {
      // When very close to ball, be more careful
      movementSpeed *= 0.6; // Slow down significantly when very close
    } else if (distanceToBall < 150) {
      // When moderately close, slow down a bit
      movementSpeed *= 0.8;
    }
    
    // 5. DIFFICULTY ADJUSTMENTS
    const difficultyAdjustment = this.applyDifficultySettings(targetX, targetY, movementSpeed);
    targetX = difficultyAdjustment.x;
    targetY = difficultyAdjustment.y;
    movementSpeed = difficultyAdjustment.speed;
    
    // 6. EDGE CASE HANDLING - Simplified
    // Avoid getting stuck on walls
    if (paddleX <= RINK.minX + rbody.radius + 10) {
      targetX = Math.max(targetX, RINK.minX + rbody.radius + 20);
    } else if (paddleX >= RINK.maxX - rbody.radius - 10) {
      targetX = Math.min(targetX, RINK.maxX - rbody.radius - 20);
    }
    
    // Don't overshoot into own goal area
    if (targetY < RINK.botMinY + 80) {
      targetY = Math.max(targetY, RINK.botMinY + 80);
    }
    
    // Apply movement constraints
    targetX = Math.max(safeMinX, Math.min(safeMaxX, targetX));
    targetY = Math.max(safeMinY, Math.min(safeMaxY, targetY));
    
    // 7. SIMPLIFIED MOVEMENT - Remove complex easing and reaction delays
    const currentX = this.paddleRight.x;
    const currentY = this.paddleRight.y;
    
    // Direct movement with speed cap
    const deltaX = targetX - currentX;
    const deltaY = targetY - currentY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > 1) { // Only move if there's meaningful distance
      // Calculate movement vector
      const normalizedX = deltaX / distance;
      const normalizedY = deltaY / distance;
      
      // Apply movement speed
      const moveSpeed = Math.min(this.botMaxSpeed * movementSpeed, distance);
      
      const newX = currentX + normalizedX * moveSpeed;
      const newY = currentY + normalizedY * moveSpeed;
      
      this.paddleRight.setPosition(newX, newY);
    }
    
    // Update physics body
    rbody.updateFromGameObject();
  }
  
  // Easing function for smooth bot movement
  private easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }
  
  private predictPuckPosition(x: number, y: number, velX: number, velY: number): {x: number, y: number} {
    // Enhanced prediction system with improved accuracy for harder difficulties
    const baseTime = this.botDifficulty === 'extreme' ? 0.8 : 
                     this.botDifficulty === 'hard' ? 0.6 : 0.5;
    const predictionTime = baseTime * this.botPredictionAccuracy;
    
    let predictedX = x;
    let predictedY = y;
    let currentVelX = velX;
    let currentVelY = velY;
    
    // Simulate multiple bounces for higher difficulties
    const simulationSteps = this.botDifficulty === 'extreme' ? 5 : 
                           this.botDifficulty === 'hard' ? 3 : 1;
    const timeStep = predictionTime / simulationSteps;
    
    for (let step = 0; step < simulationSteps; step++) {
      // Predict position for this time step
      let nextX = predictedX + currentVelX * timeStep;
      let nextY = predictedY + currentVelY * timeStep;
      
      // Check for wall bounces and update velocity accordingly
      if (nextX <= RINK.minX) {
        nextX = RINK.minX;
        currentVelX = -currentVelX * 0.98; // Slight energy loss on bounce
      } else if (nextX >= RINK.maxX) {
        nextX = RINK.maxX;
        currentVelX = -currentVelX * 0.98;
      }
      
      if (nextY <= RINK.topGoalY) {
        nextY = RINK.topGoalY;
        currentVelY = -currentVelY * 0.98;
      } else if (nextY >= RINK.bottomGoalY) {
        nextY = RINK.bottomGoalY;
        currentVelY = -currentVelY * 0.98;
      }
      
      // Apply drag simulation for more accurate prediction
      currentVelX *= 0.998;
      currentVelY *= 0.998;
      
      predictedX = nextX;
      predictedY = nextY;
    }
    
    // Add strategic randomness based on difficulty level
    const randomFactor = this.botDifficulty === 'extreme' ? 0 : 
                         this.botDifficulty === 'hard' ? 0.2 :
                         this.botDifficulty === 'medium' ? 0.5 : 1.0;
    if (randomFactor > 0) {
      const errorAmount = randomFactor * this.botErrorMargin;
      predictedX += (Math.random() - 0.5) * errorAmount;
      predictedY += (Math.random() - 0.5) * errorAmount;
    }
    
    return { x: predictedX, y: predictedY };
  }
  
  private updateBotState(ballY: number, ballVelY: number, distance: number, ballSpeed: number) {
    const currentTime = this.time.now;
    
    // Choose the appropriate state machine based on difficulty
    switch (this.botDifficulty) {
      case 'beginner':
        // Recovery logic for beginner
        if (this.botState === 'recover' && currentTime - this.botLastMissTime < 800) {
          return; // Stay in recovery for at least 800ms
        }
        if (this.botState === 'recover' && currentTime - this.botLastMissTime >= 800) {
          this.botState = 'defend'; // Exit recovery
        }
        this.updateBeginnerAIState(ballY, ballVelY, distance, ballSpeed);
        break;
        
      case 'impossible':
        // IMPOSSIBLE BOT NEVER GOES INTO RECOVERY - it never misses!
        this.updateImpossibleAIState(ballY, ballVelY, distance, ballSpeed);
        return; // Exit early - no recovery logic needed
        
      case 'extreme':
        // Recovery logic for extreme
        if (this.botState === 'recover' && currentTime - this.botLastMissTime < 800) {
          return; // Stay in recovery for at least 800ms
        }
        if (this.botState === 'recover' && currentTime - this.botLastMissTime >= 800) {
          this.botState = 'defend'; // Exit recovery
        }
        this.updateExtremeAIState(ballY, ballVelY, distance, ballSpeed);
        break;
        
      default: // easy, medium, hard
        // Recovery logic for standard difficulties
        if (this.botState === 'recover' && currentTime - this.botLastMissTime < 800) {
          return; // Stay in recovery for at least 800ms
        }
        if (this.botState === 'recover' && currentTime - this.botLastMissTime >= 800) {
          this.botState = 'defend'; // Exit recovery
        }
        this.updateStandardAIState(ballY, ballVelY, distance, ballSpeed);
        break;
    }
    
    // Check for missed ball condition (bot missed and ball is behind)
    // Only apply to non-impossible bots
    const paddleY = this.paddleRight.y;
    const paddleX = this.paddleRight.x;
    const ballX = this.ball.x;
    
    if (ballY < paddleY - 80 && Math.abs(ballX - paddleX) > 120 && this.botState !== 'recover') {
      this.botLastMissTime = currentTime;
      this.botState = 'recover';
    }
  }
  
  private updateBeginnerAIState(ballY: number, ballVelY: number, distance: number, ballSpeed: number) {
    // Intentionally bad AI that makes poor decisions
    
    // Random chance to just ignore the ball completely
    if (Math.random() < 0.3) {
      this.botState = 'wait';
      return;
    }
    
    // Usually defaults to wait/defend poorly
    if (ballY > RINK.centerY) {
      // Ball is far away - just wait around
      this.botState = 'wait';
    } else {
      // Ball is close but bot doesn't react well
      if (Math.random() < 0.8) {
        // Usually just tries to defend poorly
        this.botState = 'defend';
      } else {
        // Occasionally tries to attack but badly
        this.botState = 'attack';
      }
    }
    
    // Sometimes randomly switch to recovery for no reason
    if (Math.random() < 0.1) {
      this.botState = 'recover';
    }
  }
  
  private updateImpossibleAIState(ballY: number, ballVelY: number, distance: number, ballSpeed: number) {
    // TRULY IMPOSSIBLE AI - NEVER LOSES, NEVER MISSES, ALWAYS PERFECT
    const playerX = this.paddleLeft.x;
    const playerY = this.paddleLeft.y;
    const ballX = this.ball.x;
    const ballVelX = this.ball.body!.velocity.x;
    
    // RULE 1: Always intercept ball that's coming toward bot
    if (ballVelY < 0 && ballY > RINK.botMinY + 50) {
      // Ball is moving toward bot - ALWAYS attack/intercept
      this.botState = 'attack';
      return;
    }
    
    // RULE 2: If ball is very close to bot, ALWAYS intercept
    if (distance < 150 && ballY < RINK.centerY + 100) {
      this.botState = 'attack';
      return;
    }
    
    // RULE 3: If ball is in bot territory and not moving away fast, attack
    if (ballY < RINK.centerY && ballVelY > -100) {
      this.botState = 'attack';
      return;
    }
    
    // RULE 4: Perfect counter-attack when player is out of position
    const playerDistanceFromBall = Math.abs(playerX - ballX);
    if (playerDistanceFromBall > 120 && ballY > RINK.centerY + 50) {
      // Player is far from ball - perfect opportunity to attack
      this.botState = 'attack';
      return;
    }
    
    // RULE 5: Always attack if ball is slow or stationary
    if (ballSpeed < 300) {
      this.botState = 'attack';
      return;
    }
    
    // RULE 6: Defensive positioning only when ball is far and moving away fast
    if (ballY > RINK.centerY + 200 && ballVelY > 200) {
      this.botState = 'defend';
    } else {
      // Default to attack - impossible bot is ALWAYS aggressive
      this.botState = 'attack';
    }
  }
  
  private updateExtremeAIState(ballY: number, ballVelY: number, distance: number, ballSpeed: number) {
    const playerX = this.paddleLeft.x;
    const playerY = this.paddleLeft.y;
    const ballX = this.ball.x;
    
    // Calculate strategic factors
    const ballInBotTerritory = ballY < RINK.centerY;
    const ballMovingToBot = ballVelY < 0;
    const ballMovingToPlayer = ballVelY > 0;
    const isCloseRange = distance < 120;
    const isMediumRange = distance < 250;
    const playerOutOfPosition = Math.abs(playerX - ballX) > 100;
    const ballNearGoal = ballY < RINK.botMinY + 150;
    
    // Counter-attack opportunity detection
    const counterAttackOpportunity = ballMovingToPlayer && ballY > RINK.centerY && 
                                   playerOutOfPosition && Math.random() < this.botCounterAttackChance;
    
    if (counterAttackOpportunity) {
      // Aggressive counter-attack
      this.botState = 'attack';
    } else if (ballNearGoal && (ballMovingToBot || isCloseRange)) {
      // Emergency defense when ball is near goal
      this.botState = 'defend';
    } else if (ballInBotTerritory && isCloseRange && ballSpeed < 500) {
      // Attack when ball is close and manageable
      this.botState = 'attack';
    } else if (ballInBotTerritory && isMediumRange && ballMovingToBot) {
      // Intercept incoming ball
      if (Math.random() < this.botAttackThreshold) {
        this.botState = 'attack';
      } else {
        this.botState = 'defend';
      }
    } else if (ballY > RINK.centerY + 200 && ballMovingToPlayer) {
      // Ball is far away, wait strategically
      this.botState = 'wait';
    } else {
      // Default defensive posture
      this.botState = 'defend';
    }
  }
  
  private updateStandardAIState(ballY: number, ballVelY: number, distance: number, ballSpeed: number) {
    // Original state logic for non-extreme difficulties
    if (ballY > RINK.centerY + 100 && ballVelY > 0) {
      // Puck is far in player's territory and moving away
      this.botState = 'wait';
    } else if (ballY < RINK.centerY && (ballVelY < -50 || distance < 200)) {
      // Puck is in bot's territory
      if (distance < 150 && ballSpeed < 400 && Math.random() < this.botAttackThreshold) {
        // Close enough and slow enough to attack
        this.botState = 'attack';
      } else {
        // Defend
        this.botState = 'defend';
      }
    } else {
      // Default to defend
      this.botState = 'defend';
    }
  }
  
  private calculateDefensivePosition(predicted: {x: number, y: number}, paddleX: number, paddleY: number): {x: number, y: number, urgency: boolean} {
    // Simplified defensive positioning
    const goalCenterX = RINK.centerX;
    const ballX = this.ball.x;
    const ballY = this.ball.y;
    const ballSpeed = this.ball.body!.velocity.length();
    
    // Basic defensive strategy: position between ball and goal
    let targetX = predicted.x;
    let targetY = this.botHomePosition.y;
    
    // If ball is heading toward goal center, intercept directly
    if (Math.abs(predicted.x - goalCenterX) < 200) {
      targetX = predicted.x;
      targetY = Math.max(predicted.y - 100, this.botHomePosition.y);
    } else {
      // Ball is to the side - position defensively
      targetX = goalCenterX + (predicted.x - goalCenterX) * 0.7; // Move 70% toward ball's X
      targetY = this.botHomePosition.y;
    }
    
    // Clamp to reasonable defensive area
    targetX = Math.max(RINK.minX + 50, Math.min(RINK.maxX - 50, targetX));
    targetY = Math.max(RINK.botMinY + 100, Math.min(RINK.botMaxY - 50, targetY));
    
    // Check urgency - ball close to goal or moving fast
    const urgency = ballY < RINK.botMinY + 250 || ballSpeed > 600;
    
    return { x: targetX, y: targetY, urgency };
  }
  
  private calculateAttackPosition(ballX: number, ballY: number, ballVelX: number, ballVelY: number, angle: number): {x: number, y: number} {
    // Simplified attack strategy - more predictable behavior
    let targetGoalX = RINK.centerX;
    let targetGoalY = RINK.bottomGoalY;
    
    // Basic strategic shot placement based on difficulty
    if (this.botDifficulty === 'extreme' || this.botDifficulty === 'impossible') {
      // Advanced bots analyze player position
      const playerX = this.paddleLeft.x;
      
      // Choose target based on player position
      if (playerX > RINK.centerX + 80) {
        targetGoalX = RINK.centerX - 100; // Aim left side
      } else if (playerX < RINK.centerX - 80) {
        targetGoalX = RINK.centerX + 100; // Aim right side
      } else {
        // Power shot through center with slight variation
        targetGoalX = RINK.centerX + (Math.random() - 0.5) * 80;
      }
    } else {
      // Basic bots just aim roughly at goal with some randomness
      const randomness = this.botDifficulty === 'hard' ? 60 : 
                        this.botDifficulty === 'medium' ? 100 : 150;
      targetGoalX = RINK.centerX + (Math.random() - 0.5) * randomness;
    }
    
    // Calculate optimal strike angle
    const desiredAngle = Phaser.Math.Angle.Between(ballX, ballY, targetGoalX, targetGoalY);
    
    // Position paddle for optimal strike - simplified distance calculation
    const strikeDistance = 45; // Fixed distance for consistency
    
    let targetX = ballX - Math.cos(desiredAngle) * strikeDistance;
    let targetY = ballY - Math.sin(desiredAngle) * strikeDistance;
    
    // For higher difficulties, add slight prediction for moving balls
    if (this.botDifficulty === 'extreme' || this.botDifficulty === 'impossible') {
      const ballSpeed = Math.sqrt(ballVelX * ballVelX + ballVelY * ballVelY);
      if (ballSpeed > 200) {
        // Add slight lead for moving targets
        const leadTime = 0.15; // Small lead time
        targetX += ballVelX * leadTime;
        targetY += ballVelY * leadTime;
      }
    }
    
    return { x: targetX, y: targetY };
  }
  
  private applyDifficultySettings(targetX: number, targetY: number, speed: number): {x: number, y: number, speed: number} {
    // Apply difficulty-based adjustments ONLY for positioning and speed
    let adjustedX = targetX;
    let adjustedY = targetY;
    let adjustedSpeed = speed;
    
    switch (this.botDifficulty) {
      case 'beginner':
        // Add massive error margin and make it even worse
        adjustedX += (Math.random() - 0.5) * this.botErrorMargin * 8; // Huge error
        adjustedY += (Math.random() - 0.5) * this.botErrorMargin * 6; // Big vertical error
        // Extremely reduced speed
        adjustedSpeed *= 0.2;
        
        // Random chance to completely miss (go wrong direction)
        if (Math.random() < 0.4) {
          adjustedX += (Math.random() - 0.5) * 300; // Sometimes go completely wrong way
        }
        
        // Random chance to just stop moving completely
        if (Math.random() < 0.2) {
          adjustedSpeed = 0;
        }
        break;
        
      case 'easy':
        // Add error margin
        adjustedX += (Math.random() - 0.5) * this.botErrorMargin * 2;
        adjustedY += (Math.random() - 0.5) * this.botErrorMargin;
        // Reduce speed
        adjustedSpeed *= 0.6;
        break;
        
      case 'medium':
        // Moderate error margin
        adjustedX += (Math.random() - 0.5) * this.botErrorMargin;
        adjustedY += (Math.random() - 0.5) * this.botErrorMargin * 0.5;
        // Normal speed
        adjustedSpeed *= 0.8;
        break;
        
      case 'hard':
        // Minimal error
        adjustedX += (Math.random() - 0.5) * this.botErrorMargin * 0.3;
        // Full speed
        adjustedSpeed *= 1.0;
        break;
        
      case 'extreme':
        // Near-perfect precision - minimal error margin
        adjustedX += (Math.random() - 0.5) * this.botErrorMargin * 0.1; // Tiny bit of error for realism
        // Responsive movement but not overpowered
        adjustedSpeed *= 1.1; // Reduced from 1.2 to 1.1
        
        // Apply strategic positioning
        if (this.botState === 'attack') {
          // Fast attack positioning but not instant
          adjustedSpeed *= 1.15; // Reduced from 1.3 to 1.15
        }
        break;
        
      case 'impossible':
        // Perfect precision - no error whatsoever
        // No adjustment to position - perfect targeting
        
        // Maximum speed with strategic bonuses
        adjustedSpeed *= 1.5; // Super fast base speed
        
        // Apply perfect strategic positioning
        if (this.botState === 'attack') {
          // Instant attack positioning
          adjustedSpeed *= 2.0; // Lightning fast attacks
        } else if (this.botState === 'defend') {
          // Perfect defensive positioning
          adjustedSpeed *= 1.8; // Very fast defense
        }
        
        // Predict and counter player movement patterns
        const playerX = this.paddleLeft.x;
        const playerY = this.paddleLeft.y;
        const playerPrevX = this.paddleLeftPrevX;
        const playerPrevY = this.paddleLeftPrevY;
        
        // Calculate player movement vector and counter it
        const playerVelX = playerX - playerPrevX;
        const playerVelY = playerY - playerPrevY;
        
        // Adjust position to counter player movement
        if (Math.abs(playerVelX) > 2) {
          adjustedX += playerVelX * 3; // Anticipate player movement
        }
        
        break;
    }
    
    return { x: adjustedX, y: adjustedY, speed: adjustedSpeed };
  }
  
  private setBotDifficulty(difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'extreme' | 'impossible') {
    this.botDifficulty = difficulty;
    
    // Set difficulty-specific parameters
    switch (difficulty) {
      case 'beginner':
        // Intentionally bad bot that can't win
        this.botMaxSpeed = 3; // Very slow
        this.botMaxReactionDelay = 15; // Very slow reactions
        this.botPredictionAccuracy = 0.1; // Terrible prediction
        this.botErrorMargin = 80; // Huge error margin
        this.botAttackThreshold = 0.1; // Almost never attacks
        this.botStrategicThinking = 0.0; // No strategy
        this.botCornerPrediction = 0.0; // Can't predict corners
        this.botCounterAttackChance = 0.0; // Never counter-attacks
        this.botLookAheadFrames = 5; // Very short prediction
        break;
        
      case 'easy':
        this.botMaxSpeed = 6; // Reduced for better control
        this.botMaxReactionDelay = 6;
        this.botPredictionAccuracy = 0.4;
        this.botErrorMargin = 40; // Large error margin
        this.botAttackThreshold = 0.3;
        this.botStrategicThinking = 0.2;
        this.botCornerPrediction = 0.1;
        this.botCounterAttackChance = 0.2;
        this.botLookAheadFrames = 15;
        break;
        
      case 'medium':
        this.botMaxSpeed = 9; // Reduced for better control
        this.botMaxReactionDelay = 3;
        this.botPredictionAccuracy = 0.7;
        this.botErrorMargin = 20; // Standard error margin
        this.botAttackThreshold = 0.6;
        this.botStrategicThinking = 0.5;
        this.botCornerPrediction = 0.3;
        this.botCounterAttackChance = 0.4;
        this.botLookAheadFrames = 30;
        break;
        
      case 'hard':
        this.botMaxSpeed = 12; // Reduced for better control
        this.botMaxReactionDelay = 1;
        this.botPredictionAccuracy = 0.9;
        this.botErrorMargin = 10; // Small error margin
        this.botAttackThreshold = 0.8;
        this.botStrategicThinking = 0.7;
        this.botCornerPrediction = 0.6;
        this.botCounterAttackChance = 0.6;
        this.botLookAheadFrames = 45;
        break;
        
      case 'extreme':
        this.botMaxSpeed = 14; // Further reduced for precise control
        this.botMaxReactionDelay = 1; // Keep at 1 instead of 0 to avoid division issues
        this.botPredictionAccuracy = 0.95; // Reduced from 1.0 to 0.95 (near perfect but not perfect)
        this.botErrorMargin = 5; // Very small error margin
        this.botAttackThreshold = 0.75; // Reduced from 0.9 to 0.75 (still aggressive but not overwhelming)
        this.botLookAheadFrames = 60;
        this.botStrategicThinking = 0.8; // Reduced from 0.9 to 0.8
        this.botCornerPrediction = 0.7; // Reduced from 0.8 to 0.7
        this.botCounterAttackChance = 0.5; // Reduced from 0.7 to 0.5 (balanced counter-attacking)
        break;
        
      case 'impossible':
        // Unbeatable bot - player cannot win
        this.botMaxSpeed = 25; // Lightning fast
        this.botMaxReactionDelay = 0; // Instant reactions
        this.botPredictionAccuracy = 1.0; // Perfect prediction
        this.botErrorMargin = 0; // No error margin
        this.botAttackThreshold = 1.0; // Always attacks when possible
        this.botLookAheadFrames = 120; // Sees far into future
        this.botStrategicThinking = 1.0; // Perfect strategy
        this.botCornerPrediction = 1.0; // Perfect corner shots
        this.botCounterAttackChance = 1.0; // Always counter-attacks
        break;
    }
    
    console.log(`Bot difficulty set to ${difficulty}:`, {
      maxSpeed: this.botMaxSpeed,
      predictionAccuracy: this.botPredictionAccuracy,
      errorMargin: this.botErrorMargin,
      attackThreshold: this.botAttackThreshold
    });
  }
  
  private calculateCollisionTiming(ballX: number, ballY: number, ballVelX: number, ballVelY: number, paddleX: number, paddleY: number): {x: number, y: number} | null {
    // Calculate optimal position for collision timing
    if (Math.abs(ballVelY) < 50) return null; // Ball not moving much vertically
    
    // Time until ball reaches paddle Y position
    const timeToCollision = (paddleY - ballY) / ballVelY;
    
    if (timeToCollision < 0 || timeToCollision > 1) return null; // Not approaching or too far
    
    // Predict where ball will be horizontally at collision time
    const collisionX = ballX + ballVelX * timeToCollision;
    
    // Move to intercept position
    return { x: collisionX, y: paddleY };
  }

  private updateHealthBars() {
    // Using colors from the reference image - cyan/teal gradient for blue player
    this.updateHealthBar(this.blueHealthBar, this.leftHealth, 150, 1460, '#00ffff', '#00cccc', false, false);
    // Using colors from the reference image - pink/magenta gradient for red player  
    this.updateHealthBar(this.redHealthBar, this.rightHealth, 630, 1460, '#ff69b4', '#e91e63', true, true);
  }

  private triggerHealthLossBlink(player: 'blue' | 'red') {
    const targetBackground = player === 'blue' ? this.blueStatsBackground : this.redStatsBackground;
    const originalColor = 0x1a1a1a; // Original dark background color
    const originalAlpha = 0.8;
    
    // Stop any existing blink animation on this background
    this.tweens.killTweensOf(targetBackground);
    
    // Create a smooth, gradual damage effect with multiple phases
    
    // Phase 1: Quick intense red flash (damage impact)
    this.tweens.add({
      targets: targetBackground,
      fillColor: 0xff3333, // Bright red
      alpha: 0.95,
      duration: 120,
      ease: 'Quad.easeOut',
      onComplete: () => {
        // Phase 2: Fade to darker red (damage lingering)
        this.tweens.add({
          targets: targetBackground,
          fillColor: 0xaa1111, // Darker red
          alpha: 0.9,
          duration: 200,
          ease: 'Sine.easeInOut',
          onComplete: () => {
            // Phase 3: Gradual recovery to normal
            this.tweens.add({
              targets: targetBackground,
              fillColor: originalColor,
              alpha: originalAlpha,
              duration: 400,
              ease: 'Quad.easeIn',
              onComplete: () => {
                // Ensure final state is correct
                targetBackground.setFillStyle(originalColor, originalAlpha);
              }
            });
          }
        });
      }
    });

    // Add a subtle scale pulse for impact feel
    const originalScale = targetBackground.scaleX;
    this.tweens.add({
      targets: targetBackground,
      scaleX: originalScale * 1.02,
      scaleY: originalScale * 1.02,
      duration: 150,
      ease: 'Back.easeOut',
      yoyo: true,
      onComplete: () => {
        targetBackground.setScale(originalScale);
      }
    });

    // Add a subtle brightness overlay effect
    const overlayEffect = this.add.rectangle(
      targetBackground.x, 
      targetBackground.y, 
      targetBackground.width, 
      targetBackground.height, 
      0xffffff, 
      0.3
    );
    overlayEffect.setDepth(targetBackground.depth + 0.5);
    
    this.tweens.add({
      targets: overlayEffect,
      alpha: 0,
      duration: 300,
      ease: 'Quad.easeOut',
      onComplete: () => {
        overlayEffect.destroy();
      }
    });
  }

  private updateHealthBar(healthBar: Phaser.GameObjects.Graphics, health: number, x: number, y: number, topColor: string, bottomColor: string, reverse: boolean = false, fillFromRight: boolean = false) {
    healthBar.clear();
    
    // Bar dimensions
    const barWidth = 300;
    const barHeight = 30;
    const skewAmount = barHeight * 0.1; // Smaller skew to match the loading bar style
    const borderWidth = 2;
    
    // Calculate health percentage
    const healthPercent = Math.max(0, health / 100);
    const progressWidth = (barWidth - borderWidth) * healthPercent;
    
    // Draw border as a parallelogram stroke - reverse skew direction for right bar
    let borderPoints;
    if (reverse) {
      // Reversed parallelogram (skew goes the other way)
      borderPoints = [
        new Phaser.Math.Vector2(x + skewAmount, y - barHeight/2),               // Top left (skewed)
        new Phaser.Math.Vector2(x + barWidth, y - barHeight/2),                 // Top right
        new Phaser.Math.Vector2(x + barWidth, y + barHeight/2),                 // Bottom right
        new Phaser.Math.Vector2(x, y + barHeight/2)                             // Bottom left (skewed)
      ];
    } else {
      // Normal parallelogram
      borderPoints = [
        new Phaser.Math.Vector2(x, y - barHeight/2),                            // Top left
        new Phaser.Math.Vector2(x + barWidth, y - barHeight/2),                 // Top right
        new Phaser.Math.Vector2(x + barWidth - skewAmount, y + barHeight/2),    // Bottom right (skewed)
        new Phaser.Math.Vector2(x - skewAmount, y + barHeight/2)                // Bottom left (skewed)
      ];
    }
    
    // Draw border
    healthBar.lineStyle(borderWidth, 0x000000, 1);
    healthBar.strokePoints(borderPoints, true, true);
    
    // Add a slight glow to the border
    healthBar.lineStyle(borderWidth/2, 0xFFFFFF, 0.3);
    healthBar.strokePoints(borderPoints, true, true);
    
    // Draw background as parallelogram (dark)
    healthBar.fillStyle(0x1A0D40, 1);
    healthBar.fillPoints(borderPoints, true);
    
    // Draw health progress if there's any
    if (progressWidth > 0) {
      // Position for the progress filling - adjust for fill direction
      let progressX;
      if (fillFromRight) {
        // Fill from right to left (for red health bar)
        progressX = reverse ? x + barWidth - progressWidth + skewAmount + borderWidth/2 : x + barWidth - progressWidth + borderWidth/2;
      } else {
        // Fill from left to right (for blue health bar)
        progressX = reverse ? x + skewAmount + borderWidth/2 : x + borderWidth/2;
      }
      
      // Calculate the midpoint for the two-tone effect
      const midY = y;
      
      // Draw the top half of the progress (bright color)
      healthBar.fillStyle(Phaser.Display.Color.HexStringToColor(topColor).color, 1);
      
      // Top half of progress shape
      let topProgressPoints;
      if (reverse) {
        topProgressPoints = [
          new Phaser.Math.Vector2(progressX, y - barHeight/2 + borderWidth/2),  // Top left
          new Phaser.Math.Vector2(progressX + progressWidth, y - barHeight/2 + borderWidth/2),  // Top right
          new Phaser.Math.Vector2(progressX + progressWidth - skewAmount/2, midY),  // Bottom right (half skewed)
          new Phaser.Math.Vector2(progressX - skewAmount/2, midY)  // Bottom left (half skewed)
        ];
      } else {
        topProgressPoints = [
          new Phaser.Math.Vector2(progressX, y - barHeight/2 + borderWidth/2),  // Top left
          new Phaser.Math.Vector2(progressX + progressWidth, y - barHeight/2 + borderWidth/2),  // Top right
          new Phaser.Math.Vector2(progressX + progressWidth - skewAmount/2, midY),  // Bottom right (half skewed)
          new Phaser.Math.Vector2(progressX - skewAmount/2, midY)  // Bottom left (half skewed)
        ];
      }
      
      healthBar.fillPoints(topProgressPoints, true);
      
      // Draw the bottom half of the progress (darker color)
      healthBar.fillStyle(Phaser.Display.Color.HexStringToColor(bottomColor).color, 1);
      
      // Bottom half of progress shape
      let bottomProgressPoints;
      if (reverse) {
        bottomProgressPoints = [
          new Phaser.Math.Vector2(progressX - skewAmount/2, midY),  // Top left (half skewed)
          new Phaser.Math.Vector2(progressX + progressWidth - skewAmount/2, midY),  // Top right (half skewed)
          new Phaser.Math.Vector2(progressX + progressWidth, y + barHeight/2 - borderWidth/2),  // Bottom right
          new Phaser.Math.Vector2(progressX, y + barHeight/2 - borderWidth/2)  // Bottom left
        ];
      } else {
        bottomProgressPoints = [
          new Phaser.Math.Vector2(progressX - skewAmount/2, midY),  // Top left (half skewed)
          new Phaser.Math.Vector2(progressX + progressWidth - skewAmount/2, midY),  // Top right (half skewed)
          new Phaser.Math.Vector2(progressX + progressWidth - skewAmount, y + barHeight/2 - borderWidth/2),  // Bottom right (skewed)
          new Phaser.Math.Vector2(progressX - skewAmount, y + barHeight/2 - borderWidth/2)  // Bottom left (skewed)
        ];
      }
      
      healthBar.fillPoints(bottomProgressPoints, true);
      
      // Add white streak effect when health is high enough
      if (progressWidth > 30) {
        const streakWidth = 20;
        let whiteStreakX;
        
        if (fillFromRight) {
          // For right-to-left fill, streak should be at the left edge of the progress
          whiteStreakX = progressX;
        } else {
          // For left-to-right fill, streak should be at the right edge of the progress
          whiteStreakX = progressX + progressWidth - streakWidth;
        }
        
        // Create white streak points
        let whiteStreakPoints;
        if (reverse) {
          whiteStreakPoints = [
            new Phaser.Math.Vector2(whiteStreakX, y - barHeight/2 + borderWidth/2),
            new Phaser.Math.Vector2(whiteStreakX + streakWidth, y - barHeight/2 + borderWidth/2),
            new Phaser.Math.Vector2(whiteStreakX + streakWidth, y + barHeight/2 - borderWidth/2),
            new Phaser.Math.Vector2(whiteStreakX, y + barHeight/2 - borderWidth/2)
          ];
        } else {
          whiteStreakPoints = [
            new Phaser.Math.Vector2(whiteStreakX, y - barHeight/2 + borderWidth/2),
            new Phaser.Math.Vector2(whiteStreakX + streakWidth, y - barHeight/2 + borderWidth/2),
            new Phaser.Math.Vector2(whiteStreakX + streakWidth - skewAmount, y + barHeight/2 - borderWidth/2),
            new Phaser.Math.Vector2(whiteStreakX - skewAmount, y + barHeight/2 - borderWidth/2)
          ];
        }
        
        healthBar.fillStyle(0xFFFFFF, 0.8);
        healthBar.fillPoints(whiteStreakPoints, true);
      }
    }
  }

  private onPaddleHit(ball: Phaser.Physics.Arcade.Sprite, paddle: Phaser.Physics.Arcade.Sprite) {
    this.puckhit.play();

    // Calculate paddle velocity (impact force)
    let paddleVelX = 0;
    let paddleVelY = 0;
    
    if (paddle === this.paddleLeft) {
      paddleVelX = paddle.x - this.paddleLeftPrevX;
      paddleVelY = paddle.y - this.paddleLeftPrevY;
    } else {
      paddleVelX = paddle.x - this.paddleRightPrevX;
      paddleVelY = paddle.y - this.paddleRightPrevY;
    }

    // Calculate impact force magnitude with enhanced scaling
    const paddleSpeed = Math.sqrt(paddleVelX * paddleVelX + paddleVelY * paddleVelY);
    const impactForceMultiplier = 1 + (paddleSpeed * 1.5); // Increased from 0.8 for more dramatic impact
    
    const currentSpeed = ball.body!.velocity.length();
    let newSpeed = currentSpeed * this.PADDLE_HIT_SPEED_MULTIPLIER + this.PADDLE_HIT_BASE_SPEED_INCREASE;
    
    // Apply impact force to speed with enhanced scaling
    newSpeed *= impactForceMultiplier;
    
    // Add bonus speed for powerful hits
    if (paddleSpeed > 8) {
      const powerBonus = (paddleSpeed - 8) * 25; // Extra speed for fast paddle movement
      newSpeed += powerBonus;
    }
    
    // Enhanced maximum speed check
    newSpeed = Math.min(newSpeed, this.MAX_BALL_SPEED);

    let reflectionAngle = Phaser.Math.Angle.Between(paddle.x, paddle.y, ball.x, ball.y);

    // Enhanced angle influence for more dramatic shots
    const hitOffset = (ball.x - paddle.x) / (paddle.body as Phaser.Physics.Arcade.Body).radius;
    const clampedHitOffset = Math.max(-1, Math.min(1, hitOffset)); 
    reflectionAngle += clampedHitOffset * Phaser.Math.DEG_TO_RAD * this.PADDLE_HIT_ANGLE_INFLUENCE_DEGREES;

    // Enhanced paddle velocity influence for more dynamic gameplay
    const velocityInfluence = paddle === this.paddleLeft ? 20 : 18; // Slightly different for player vs bot
    const ballVelX = Math.cos(reflectionAngle) * newSpeed + paddleVelX * velocityInfluence;
    const ballVelY = Math.sin(reflectionAngle) * newSpeed + paddleVelY * velocityInfluence;
    
    // Ensure we don't exceed max speed after adding paddle velocity
    const finalSpeed = Math.sqrt(ballVelX * ballVelX + ballVelY * ballVelY);
    if (finalSpeed > this.MAX_BALL_SPEED) {
      const scale = this.MAX_BALL_SPEED / finalSpeed;
      (ball.body as Phaser.Physics.Arcade.Body).setVelocity(ballVelX * scale, ballVelY * scale);
    } else {
      (ball.body as Phaser.Physics.Arcade.Body).setVelocity(ballVelX, ballVelY);
    }

    // Create enhanced impact effect
    this.createImpactEffect(ball.x, ball.y, impactForceMultiplier);
    
    // Add screen shake for powerful hits
    if (impactForceMultiplier > 3) {
      this.cameras.main.shake(100, 0.02);
    }
    
    console.log(`Paddle hit: speed=${Math.round(finalSpeed)}, impact=${impactForceMultiplier.toFixed(2)}, paddleSpeed=${paddleSpeed.toFixed(1)}`);
  }

  private updateInputState() {
    const currentTime = this.time.now;
    const timeSinceLastInput = currentTime - this.lastInputTime;
    
    // Check for keyboard input activity
    const keyboardActive = this.keyA.isDown || this.keyD.isDown || this.keyW.isDown || this.keyS.isDown;
    
    // Check for gamepad input activity
    const gamepadActive = this.checkGamepadActivity();
    
    // Priority system: Drag > Touch > Gamepad > Keyboard
    // Only switch input types if enough time has passed to avoid conflicts
    
    if (this.isDragging) {
      // Drag has highest priority - immediately switch and maintain
      this.clearOtherInputStates('drag');
      this.inputMode = 'drag';
      this.lastInputType = 'drag';
      this.lastInputTime = currentTime;
    } 
    else if (this.isTouchMoving && this.targetTouchX !== undefined && this.targetTouchY !== undefined) {
      // Touch has second priority - switch if not conflicting with recent input
      const dragCooldown = this.lastInputType === 'drag' ? this.inputSwitchCooldown * 3 : this.inputSwitchCooldown;
      if (this.inputMode !== 'touch' && 
          (this.lastInputType !== 'keyboard' || timeSinceLastInput > this.inputSwitchCooldown) &&
          (this.lastInputType !== 'gamepad' || timeSinceLastInput > this.inputSwitchCooldown) &&
          (this.lastInputType !== 'drag' || timeSinceLastInput > dragCooldown)) {
        this.clearOtherInputStates('touch');
        this.inputMode = 'touch';
        this.lastInputType = 'touch';
        this.lastInputTime = currentTime;
      }
      
      if (this.inputMode === 'touch') {
        this.handleTouchInput();
      }
    }
    else if (gamepadActive) {
      // Gamepad has third priority - switch if not conflicting with higher priority inputs
      const dragCooldown = this.lastInputType === 'drag' ? this.inputSwitchCooldown * 3 : this.inputSwitchCooldown;
      if (this.inputMode !== 'gamepad' && 
          (this.lastInputType !== 'touch' || timeSinceLastInput > this.inputSwitchCooldown) &&
          (this.lastInputType !== 'drag' || timeSinceLastInput > dragCooldown)) {
        this.clearOtherInputStates('gamepad');
        this.inputMode = 'gamepad';
        this.lastInputType = 'gamepad';
        this.lastInputTime = currentTime;
      }
      
      if (this.inputMode === 'gamepad') {
        this.handleGamepadInput();
      }
    }  
    else if (keyboardActive) {
      // Keyboard has lowest priority - only switch if no other input is active
      const dragCooldown = this.lastInputType === 'drag' ? this.inputSwitchCooldown * 3 : this.inputSwitchCooldown;
      if (this.inputMode !== 'keyboard' && 
          (this.lastInputType !== 'touch' || timeSinceLastInput > this.inputSwitchCooldown) &&
          (this.lastInputType !== 'gamepad' || timeSinceLastInput > this.inputSwitchCooldown) &&
          (this.lastInputType !== 'drag' || timeSinceLastInput > dragCooldown)) {
        this.clearOtherInputStates('keyboard');
        this.inputMode = 'keyboard';
        this.lastInputType = 'keyboard';
        this.lastInputTime = currentTime;
      }
      
      if (this.inputMode === 'keyboard') {
        this.handleKeyboardInput();
      }
    }
    else {
      // No input detected - gradually return to neutral state
      // Use longer cooldown after drag to prevent immediate switching
      const cooldownMultiplier = this.lastInputType === 'drag' ? 4 : 2;
      if (timeSinceLastInput > this.inputSwitchCooldown * cooldownMultiplier) {
        this.inputMode = 'none';
        this.lastInputType = 'none';
      }
    }
  }

  private clearOtherInputStates(activeInputType: 'drag' | 'touch' | 'keyboard' | 'gamepad') {
    switch (activeInputType) {
      case 'drag':
        // Clear touch, keyboard, and gamepad states
        this.isTouchMoving = false;
        this.targetTouchX = undefined;
        this.targetTouchY = undefined;
        this.keyboardInputActive = false;
        this.keyboardVelocityX = 0;
        this.keyboardVelocityY = 0;
        this.gamepadVelocityX = 0;
        this.gamepadVelocityY = 0;
        break;
      case 'touch':
        // Clear keyboard and gamepad states (drag is handled separately)
        this.keyboardInputActive = false;
        this.keyboardVelocityX = 0;
        this.keyboardVelocityY = 0;
        this.gamepadVelocityX = 0;
        this.gamepadVelocityY = 0;
        break;
      case 'keyboard':
        // Clear touch and gamepad states (drag is handled separately)
        this.isTouchMoving = false;
        this.targetTouchX = undefined;
        this.targetTouchY = undefined;
        this.gamepadVelocityX = 0;
        this.gamepadVelocityY = 0;
        break;
      case 'gamepad':
        // Clear touch and keyboard states (drag is handled separately)
        this.isTouchMoving = false;
        this.targetTouchX = undefined;
        this.targetTouchY = undefined;
        this.keyboardInputActive = false;
        this.keyboardVelocityX = 0;
        this.keyboardVelocityY = 0;
        break;
    }
  }

  private handleTouchInput() {
    const currentX = this.paddleLeft.x;
    const currentY = this.paddleLeft.y;
    
    // Calculate distance to touch target
    const deltaX = this.targetTouchX! - currentX;
    const deltaY = this.targetTouchY! - currentY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Use adaptive speed based on distance for more natural movement
    const maxTouchSpeed = 22;
    const minTouchSpeed = 8;
    
    // Speed scales with distance but has minimum and maximum bounds
    let touchSpeed = Math.min(maxTouchSpeed, Math.max(minTouchSpeed, distance * 0.15));
    
    // Apply smooth movement toward touch target
    if (distance > 2) {
      const moveX = (deltaX / distance) * touchSpeed;
      const moveY = (deltaY / distance) * touchSpeed;
      
      this.paddleLeftTargetX = currentX + moveX;
      this.paddleLeftTargetY = currentY + moveY;
    } else {
      // Close to target - snap to it
      this.paddleLeftTargetX = this.targetTouchX!;
      this.paddleLeftTargetY = this.targetTouchY!;
    }
  }

  private handleKeyboardInput() {
    const maxKeyboardSpeed = 12; // Maximum velocity in each direction
    let inputX = 0;
    let inputY = 0;
    
    // Get input direction
    if (this.keyA.isDown) inputX -= 1;
    if (this.keyD.isDown) inputX += 1;
    if (this.keyW.isDown) inputY -= 1;
    if (this.keyS.isDown) inputY += 1;
    
    // Apply smooth acceleration/deceleration
    if (inputX !== 0) {
      this.keyboardVelocityX += inputX * this.keyboardAcceleration;
      this.keyboardVelocityX = Math.max(-maxKeyboardSpeed, Math.min(maxKeyboardSpeed, this.keyboardVelocityX));
    } else {
      this.keyboardVelocityX *= this.keyboardDamping; // Smooth deceleration
      if (Math.abs(this.keyboardVelocityX) < 0.1) this.keyboardVelocityX = 0;
    }
    
    if (inputY !== 0) {
      this.keyboardVelocityY += inputY * this.keyboardAcceleration;
      this.keyboardVelocityY = Math.max(-maxKeyboardSpeed, Math.min(maxKeyboardSpeed, this.keyboardVelocityY));
    } else {
      this.keyboardVelocityY *= this.keyboardDamping; // Smooth deceleration
      if (Math.abs(this.keyboardVelocityY) < 0.1) this.keyboardVelocityY = 0;
    }
    
    // Apply velocity to target position
    this.paddleLeftTargetX = this.paddleLeft.x + this.keyboardVelocityX;
    this.paddleLeftTargetY = this.paddleLeft.y + this.keyboardVelocityY;
  }

  private updateInputModeIndicator() {
    if (!this.inputModeIndicator) return;
    
    let text = 'Input: ';
    let color = '#888888';
    
    switch (this.inputMode) {
      case 'drag':
        text += 'Dragging';
        color = '#4da6ff'; // Blue
        break;
      case 'touch':
        text += 'Touch/Tap';
        color = '#00ff88'; // Green
        break;
      case 'keyboard':
        text += 'Keyboard (WASD)';
        color = '#ffaa44'; // Orange
        break;
      case 'gamepad':
        text += 'Gamepad';
        color = '#ff44ff'; // Purple
        break;
      default:
        text += 'None';
        color = '#888888'; // Gray
        break;
    }
    
    // Add gamepad info if connected
    if (this.gamepadConnected && this.gamepad) {
      text += this.inputMode === 'gamepad' ? ` (${this.gamepad.id.substring(0, 15)}...)` : '';
    }
    
    this.inputModeIndicator.setText(text);
    this.inputModeIndicator.setColor(color);
  }
  
  private updateBotStateIndicator() {
    if (!this.botStateIndicator || !this.botDifficultyIndicator) return;
    
    // Update bot state display
    let stateText = 'Boss: ';
    let stateColor = '#888888';
    
    switch (this.botState) {
      case 'defend':
        stateText += 'Blocking';
        stateColor = '#4da6ff'; // Blue
        this.updateBossAnimation('defend');
        break;
      case 'attack':
        stateText += 'Attacking';
        stateColor = '#ff4444'; // Red
        this.updateBossAnimation('attack');
        break;
      case 'wait':
        stateText += 'Planning';
        stateColor = '#888888'; // Gray
        this.updateBossAnimation('wait');
        break;
      case 'recover':
        stateText += 'Recovering';
        stateColor = '#ffaa44'; // Orange
        this.updateBossAnimation('recover');
        break;
    }
    
    this.botStateIndicator.setText(stateText);
    this.botStateIndicator.setColor(stateColor);
    
    // Update difficulty display
    let diffText = 'Difficulty: ';
    let diffColor = '#888888';
    
    switch (this.botDifficulty) {
      case 'beginner':
        diffText += 'PATHETIC';
        diffColor = '#44ff44'; // Bright green
        break;
      case 'easy':
        diffText += 'Weak';
        diffColor = '#00ff00'; // Green
        break;
      case 'medium':
        diffText += 'Average';
        diffColor = '#ffaa00'; // Orange
        break;
      case 'hard':
        diffText += 'Powerful';
        diffColor = '#ff0000'; // Red
        break;
      case 'extreme':
        diffText += 'ENRAGED';
        diffColor = '#ff00ff'; // Magenta
        break;
      case 'impossible':
        diffText += 'GODLIKE';
        diffColor = '#ff0000'; // Bright red
        break;
    }
    
    this.botDifficultyIndicator.setText(diffText);
    this.botDifficultyIndicator.setColor(diffColor);
  }

  private applyPaddleMovement(lbody: Phaser.Physics.Arcade.Body) {
    // Only apply movement if not in drag mode (drag handles its own movement)
    if (this.inputMode !== 'drag') {
      const constrainedX = Math.max(RINK.minX, Math.min(RINK.maxX, this.paddleLeftTargetX));
      const constrainedY = Math.max(RINK.playerMinY, Math.min(RINK.playerMaxY, this.paddleLeftTargetY));
      
      // Use smooth interpolation for all non-drag movement
      const currentX = this.paddleLeft.x;
      const currentY = this.paddleLeft.y;
      
      // Calculate distance to target
      const deltaX = constrainedX - currentX;
      const deltaY = constrainedY - currentY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Only move if there's a meaningful change
      if (distance > 0.5) {
        // Use different smoothness factors based on input type
        let smoothness = this.playerSmoothness;
        
        if (this.inputMode === 'keyboard') {
          // Keyboard movement should be more responsive but still smooth
          smoothness = 0.25;
        } else if (this.inputMode === 'touch') {
          // Touch movement should be smoother
          smoothness = 0.18;
        }
        
        // Apply smooth interpolation
        const newX = Phaser.Math.Linear(currentX, constrainedX, smoothness);
        const newY = Phaser.Math.Linear(currentY, constrainedY, smoothness);
        
        this.paddleLeft.setPosition(newX, newY);
        lbody.updateFromGameObject();
      }
    }
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  private startGameTimer() {
    // Clear any existing timer
    if (this.timerEvent) {
      this.timerEvent.destroy();
    }

    // Create a timer that ticks every second
    this.timerEvent = this.time.addEvent({
      delay: 1000, // 1 second
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
  }

  private updateTimer() {
    if (this.gameTimer > 0 && !this.win && !this.gameRestart && !this.gamePaused) {
      this.gameTimer--;
      this.timerText.setText(this.formatTime(this.gameTimer));
      
      // Change color when time is running low
      if (this.gameTimer <= 30) {
        this.timerText.setColor('#ff4444'); // Red when 30 seconds or less
      } else if (this.gameTimer <= 60) {
        this.timerText.setColor('#ffaa44'); // Orange when 1 minute or less
      }
      
      // Show sliding help button when time is 10 seconds or less
      if (this.gameTimer <= 10 && !this.slidingHelpShown && !this.miniGameUsed && !this.win && !this.gameRestart) {
        this.showSlidingHelpButton();
      }
      
      // Time's up!
      if (this.gameTimer <= 0) {
        this.handleTimeUp();
      }
    }
  }

  private handleTimeUp() {
    console.log('AirHockey: Time is up!');
    
    // Stop the timer
    if (this.timerEvent) {
      this.timerEvent.destroy();
      this.timerEvent = undefined;
    }

    // Determine winner based on health
    let winnerText: string;
    let winnerColor: string;
    
    if (this.leftHealth > this.rightHealth) {
      winnerText = 'BLUE WINS BY TIME!';
      winnerColor = '#4da6ff';
    } else if (this.rightHealth > this.leftHealth) {
      winnerText = 'RED WINS BY TIME!';
      winnerColor = '#ff4d4d';
    } else {
      winnerText = 'TIME UP - TIE GAME!';
      winnerColor = '#ffffff';
    }

    // Stop the game
    this.music.pause();
    this.cheer.play();

    if (this.win) this.win.destroy();
    if (this.gameRestart) this.gameRestart.destroy();

    this.win = this.add.text(RINK.centerX, RINK.centerY - 100, winnerText, {
      fontFamily: 'Commando',
      fontSize: '80px',
      color: winnerColor,
      stroke: '#000000',
      strokeThickness: 6
    });
    this.win.setOrigin(0.5, 0.5);
    this.win.depth = 10;

    this.gameRestart = this.add.text(RINK.centerX, RINK.centerY + 20, 'Click to Restart Game', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '40px',
      color: 'white',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 20, y: 10 },
      align: 'center'
    });
    this.gameRestart.setOrigin(0.5, 0.5);
    this.gameRestart.depth = 10;
    this.gameRestart.setInteractive();
    this.gameRestart.once('pointerdown', () => {
      console.log('AirHockey: Restart button clicked');
      if (this.cheer && this.cheer.isPlaying) this.cheer.stop();
      
      // Clean up any existing event listeners
      this.input.removeAllListeners();
      
      // Reset touch controls flag so they get set up again
      this.touchControlsSetup = false;
      
      console.log('AirHockey: Restarting scene...');
      this.scene.restart();
    });

    // Stop puck and paddles
    this.ball.body!.stop();
    const leftBody = this.paddleLeft.body as Phaser.Physics.Arcade.Body;
    const rightBody = this.paddleRight.body as Phaser.Physics.Arcade.Body;
    leftBody.setVelocity(0, 0);
    rightBody.setVelocity(0, 0);
  }

  private startCountdown() {
    console.log('AirHockey: Starting countdown...');
    this.countdownActive = true;
    this.countdownValue = 3;
    
    // Create countdown text in center of playing area
    this.countdownText = this.add.text(RINK.centerX, RINK.centerY, '3', {
      fontFamily: 'Commando',
      fontSize: '120px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 8
    });
    this.countdownText.setOrigin(0.5, 0.5);
    this.countdownText.setDepth(15);

    // Start countdown timer
    this.time.addEvent({
      delay: 1000, // 1 second
      callback: this.updateCountdown,
      callbackScope: this,
      repeat: 3 // Will fire 4 times total (3, 2, 1, GO)
    });
  }

  private updateCountdown() {
    if (!this.countdownText) return;

    this.countdownValue--;
    
    if (this.countdownValue > 0) {
      // Show numbers 2, 1
      this.countdownText.setText(this.countdownValue.toString());
      this.countdownText.setColor('#ffffff');
    } else if (this.countdownValue === 0) {
      // Show "GO!"
      this.countdownText.setText('GO!');
      this.countdownText.setColor('#00ff00');
    } else {
      // Countdown finished - start the game
      this.countdownText.destroy();
      this.countdownText = undefined;
      this.countdownActive = false;
      this.gameStarted = true;
      
      // Start the ball moving
      this.ball.setVelocity(0, 700);
      
      // Start the game timer
      this.startGameTimer();
      
      console.log('AirHockey: Game started!');
    }
  }

  // private updatePaddlePositions() {
  //   // Store CURRENT positions as NEXT frame's previous positions  
  //   // This allows proper velocity calculation for impact force
    
  //   // Note: This method is called BEFORE movement updates, so we're storing
  //   // the position from BEFORE this frame's movement
  //   // The velocity calculation in onPaddleHit will be: currentPos - storedPrevPos
  // }
  
  private storePreviousPositions() {
    // Store the ACTUAL previous positions before any movement occurs
    this.paddleLeftPrevX = this.paddleLeft.x;
    this.paddleLeftPrevY = this.paddleLeft.y;
    this.paddleRightPrevX = this.paddleRight.x;
    this.paddleRightPrevY = this.paddleRight.y;
  }

  private updateBallTrace() {
    if (!this.ball || !this.traceGraphics) return;

    const currentTime = this.time.now;
    const ballX = this.ball.x;
    const ballY = this.ball.y;
    const ballSpeed = this.ball.body!.velocity.length();

    // Only add trace points when ball is moving and game is active
    if (ballSpeed > 50 && this.gameStarted && !this.countdownActive) {
      // Check if we should add a new trace point (minimum distance from last point)
      const lastPoint = this.ballTracePoints[this.ballTracePoints.length - 1];
      if (!lastPoint || 
          Phaser.Math.Distance.Between(ballX, ballY, lastPoint.x, lastPoint.y) >= this.TRACE_MIN_DISTANCE) {
        
        // Add new trace point
        this.ballTracePoints.push({
          x: ballX,
          y: ballY,
          time: currentTime
        });

        // Remove excess points
        if (this.ballTracePoints.length > this.MAX_TRACE_POINTS) {
          this.ballTracePoints.shift();
        }
      }
    }

    // Remove old trace points based on lifetime
    this.ballTracePoints = this.ballTracePoints.filter(point => 
      currentTime - point.time < this.TRACE_LIFETIME
    );

    // Draw the trace
    this.drawBallTrace();
  }

  private drawBallTrace() {
    if (!this.traceGraphics || this.ballTracePoints.length < 2) {
      this.traceGraphics?.clear();
      return;
    }

    this.traceGraphics.clear();

    const currentTime = this.time.now;
    const ballSpeed = this.ball.body!.velocity.length();
    
    // Enhanced trace color system based on ball speed
    const speedRatio = Math.min(ballSpeed / this.MAX_BALL_SPEED, 1);
    let baseColor: number;
    let traceIntensity: number;
    
    if (speedRatio > 0.8) {
      baseColor = 0xff0000; // Red for ultra-fast
      traceIntensity = 1.2;
    } else if (speedRatio > 0.6) {
      baseColor = 0xff4444; // Bright red for very fast
      traceIntensity = 1.0;
    } else if (speedRatio > 0.4) {
      baseColor = 0xffaa44; // Orange for fast
      traceIntensity = 0.8;
    } else if (speedRatio > 0.2) {
      baseColor = 0x44aaff; // Blue for normal
      traceIntensity = 0.6;
    } else {
      baseColor = 0x88bbff; // Light blue for slow
      traceIntensity = 0.4;
    }

    // Draw enhanced trace as connected lines with dynamic effects
    for (let i = 1; i < this.ballTracePoints.length; i++) {
      const prevPoint = this.ballTracePoints[i - 1];
      const currentPoint = this.ballTracePoints[i];
      
      // Calculate alpha based on age and position in trace
      const age = currentTime - currentPoint.time;
      const ageAlpha = 1 - (age / this.TRACE_LIFETIME);
      const positionAlpha = i / this.ballTracePoints.length;
      const alpha = ageAlpha * positionAlpha * traceIntensity; // Apply intensity multiplier
      
      // Enhanced line width calculation based on speed and position
      const baseWidth = speedRatio > 0.6 ? RINK.puckRadius * 0.4 : RINK.puckRadius * 0.3;
      const lineWidth = Math.max(1, baseWidth * positionAlpha);
      
      if (alpha > 0.1) { // Only draw if alpha is significant
        this.traceGraphics.lineStyle(lineWidth, baseColor, alpha);
        this.traceGraphics.beginPath();
        this.traceGraphics.moveTo(prevPoint.x, prevPoint.y);
        this.traceGraphics.lineTo(currentPoint.x, currentPoint.y);
        this.traceGraphics.strokePath();
        
        // Add glow effect for high-speed trails
        if (speedRatio > 0.7 && alpha > 0.3) {
          this.traceGraphics.lineStyle(lineWidth * 1.8, baseColor, alpha * 0.3);
          this.traceGraphics.beginPath();
          this.traceGraphics.moveTo(prevPoint.x, prevPoint.y);
          this.traceGraphics.lineTo(currentPoint.x, currentPoint.y);
          this.traceGraphics.strokePath();
        }
      }
    }
  }

  private createImpactEffect(x: number, y: number, impactForce: number) {
    // Enhanced visual impact effect based on force and ball radius
    const baseEffectSize = RINK.puckRadius * 0.8; // Base size relative to puck radius
    const effectSize = Math.min(baseEffectSize + (impactForce * RINK.puckRadius * 0.4), RINK.puckRadius * 3); // Increased scaling
    
    // Dynamic effect color based on impact force
    let effectColor: number;
    if (impactForce > 4) {
      effectColor = 0xff0000; // Red for super powerful hits
    } else if (impactForce > 2.5) {
      effectColor = 0xff4444; // Bright red for strong hits
    } else if (impactForce > 1.5) {
      effectColor = 0xffaa00; // Orange for medium hits
    } else {
      effectColor = 0xffffff; // White for normal hits
    }
    
    // Create main impact circle effect
    const impactCircle = this.add.circle(x, y, effectSize, effectColor, 0.7);
    impactCircle.setDepth(8);
    
    // Animate the main effect
    this.tweens.add({
      targets: impactCircle,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        impactCircle.destroy();
      }
    });

    // Create enhanced particle burst for strong impacts
    if (impactForce > 1.5) {
      const particleCount = Math.min(Math.floor(impactForce * 6), 16); // More particles for stronger impacts
      const particleSize = RINK.puckRadius * 0.15; // Larger particle size
      const burstDistance = RINK.puckRadius * (1.5 + impactForce * 0.3); // Distance scales with impact
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const distance = burstDistance + Math.random() * 20;
        
        const particle = this.add.circle(x, y, particleSize, effectColor, 0.9);
        particle.setDepth(8);
        
        const targetX = x + Math.cos(angle) * distance;
        const targetY = y + Math.sin(angle) * distance;
        
        this.tweens.add({
          targets: particle,
          x: targetX,
          y: targetY,
          alpha: 0,
          scaleX: 0.2,
          scaleY: 0.2,
          duration: 500 + Math.random() * 300,
          ease: 'Power2',
          onComplete: () => {
            particle.destroy();
          }
        });
      }
    }
    
    // Add shockwave effect for very powerful hits
    if (impactForce > 3) {
      const shockwave = this.add.circle(x, y, 10, effectColor, 0.3);
      shockwave.setDepth(7);
      shockwave.setStrokeStyle(4, effectColor, 0.8);
      
      this.tweens.add({
        targets: shockwave,
        radius: effectSize * 2,
        alpha: 0,
        duration: 600,
        ease: 'Power2',
        onComplete: () => {
          shockwave.destroy();
        }
      });
    }
  }

  private createPaddleResetEffect(paddle: Phaser.Physics.Arcade.Sprite) {
    // Create a visual effect to show paddle reset
    const paddleColor = paddle === this.paddleLeft ? 0x4da6ff : 0xff4d4d; // Blue for left, red for right
    const effectRadius = 50;
    
    // Create expanding ring effect
    const resetRing = this.add.circle(paddle.x, paddle.y, 10, paddleColor, 0.8);
    resetRing.setDepth(9);
    resetRing.setStrokeStyle(3, paddleColor, 1);
    
    // Animate the ring expanding and fading
    this.tweens.add({
      targets: resetRing,
      radius: effectRadius,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => {
        resetRing.destroy();
      }
    });

    // Create a brief flash on the paddle itself
    const originalTint = paddle.tint;
    paddle.setTint(0xffffff);
    
    this.tweens.add({
      targets: paddle,
      alpha: 0.7,
      duration: 150,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        paddle.setTint(originalTint);
        paddle.setAlpha(1);
      }
    });
  }
  
  private showDifficultyChange(difficulty: string) {
    // Create a temporary text to show difficulty change
    let textColor = '#00ff00'; // Default green for Easy
    let effectColor = 0x00ff00;
    let bossText = '';
    
    switch (difficulty) {
      case 'BEGINNER':
        textColor = '#44ff44'; // Bright green for beginner
        effectColor = 0x44ff44;
        bossText = 'BOSS: PATHETIC MODE';
        break;
      case 'Easy':
        textColor = '#00ff00';
        effectColor = 0x00ff00;
        bossText = 'BOSS: WEAK MODE';
        break;
      case 'Medium':
        textColor = '#ffaa00';
        effectColor = 0xffaa00;
        bossText = 'BOSS: AVERAGE MODE';
        break;
      case 'Hard':
        textColor = '#ff0000';
        effectColor = 0xff0000;
        bossText = 'BOSS: POWERFUL MODE';
        break;
      case 'EXTREME':
        textColor = '#ff00ff'; // Magenta for extreme
        effectColor = 0xff00ff;
        bossText = 'BOSS: ENRAGED MODE';
        break;
      case 'IMPOSSIBLE':
        textColor = '#ff0000'; // Bright red for impossible
        effectColor = 0xff0000;
        bossText = 'BOSS: GODLIKE MODE';
        break;
    }
    
    const difficultyText = this.add.text(RINK.centerX, RINK.centerY - 200, bossText, {
      fontFamily: 'Commando',
      fontSize: difficulty === 'EXTREME' ? '56px' : '48px',
      color: textColor,
      stroke: '#000000',
      strokeThickness: difficulty === 'EXTREME' ? 6 : 4
    });
    difficultyText.setOrigin(0.5, 0.5);
    difficultyText.setDepth(15);
    
    // Special difficulty effects
    if (difficulty === 'EXTREME') {
      // Add pulsing glow effect
      this.tweens.add({
        targets: difficultyText,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        yoyo: true,
        repeat: 3,
        ease: 'Sine.easeInOut'
      });
      
      // Add warning message
      const warningText = this.add.text(RINK.centerX, RINK.centerY - 140, 'WARNING: MAXIMUM DIFFICULTY!', {
        fontFamily: 'Commando',
        fontSize: '24px',
        color: '#ff4444',
        stroke: '#000000',
        strokeThickness: 3
      });
      warningText.setOrigin(0.5, 0.5);
      warningText.setDepth(15);
      
      // Animate warning text
      this.tweens.add({
        targets: warningText,
        alpha: 0,
        y: warningText.y - 50,
        duration: 2000,
        ease: 'Power2',
        onComplete: () => {
          warningText.destroy();
        }
      });
    } else if (difficulty === 'IMPOSSIBLE') {
      // Dramatic effects for impossible mode
      
      // Screen flash effect
      const flashOverlay = this.add.rectangle(RINK.centerX, RINK.centerY, 1080, 1280, 0xff0000, 0.3);
      flashOverlay.setDepth(20);
      
      this.tweens.add({
        targets: flashOverlay,
        alpha: 0,
        duration: 500,
        ease: 'Power2.easeOut',
        onComplete: () => {
          flashOverlay.destroy();
        }
      });
      
      // Intense pulsing effect
      this.tweens.add({
        targets: difficultyText,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 150,
        yoyo: true,
        repeat: 5,
        ease: 'Back.easeInOut'
      });
      
      // Dramatic warning messages
      const warningText1 = this.add.text(RINK.centerX, RINK.centerY - 160, 'DANGER: IMPOSSIBLE DIFFICULTY!', {
        fontFamily: 'Commando',
        fontSize: '28px',
        color: '#ff0000',
        stroke: '#000000',
        strokeThickness: 4
      });
      warningText1.setOrigin(0.5, 0.5);
      warningText1.setDepth(15);
      
      const warningText2 = this.add.text(RINK.centerX, RINK.centerY - 120, 'PLAYER CANNOT WIN', {
        fontFamily: 'Commando',
        fontSize: '24px',
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 3
      });
      warningText2.setOrigin(0.5, 0.5);
      warningText2.setDepth(15);
      
      // Animate warning texts
      this.tweens.add({
        targets: [warningText1, warningText2],
        alpha: 0,
        y: '-=80',
        duration: 2500,
        ease: 'Power2',
        delay: 500,
        onComplete: () => {
          warningText1.destroy();
          warningText2.destroy();
        }
      });
      
      // Make warnings blink
      this.tweens.add({
        targets: [warningText1, warningText2],
        alpha: 0.3,
        duration: 200,
        yoyo: true,
        repeat: 6,
        ease: 'Power2'
      });
    }
    
    // Animate the main difficulty text
    this.tweens.add({
      targets: difficultyText,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: difficulty === 'EXTREME' ? 2000 : 1500,
      ease: 'Power2',
      onComplete: () => {
        difficultyText.destroy();
      }
    });
    
    // Update bot paddle tint based on difficulty
    this.paddleRight.setTint(effectColor);
    
    // Reset tint after a moment (longer for extreme)
    this.time.delayedCall(difficulty === 'EXTREME' ? 1000 : 500, () => {
      this.paddleRight.clearTint();
    });
  }

  private onWallHit() {
    // Enhanced wall collision mechanics - MAXIMUM BOUNCE FUN!
    const currentSpeed = this.ball.body!.velocity.length();
    
    // Make boss react to wall hits
    if (this.botDifficulty !== 'beginner' && Math.random() > 0.5) {
      this.paddleRight.setTint(0xffdddd);
      this.time.delayedCall(200, () => {
        this.updateBossAnimation(this.botState);
      });
    }
    
    // Add massive speed boost based on current speed
    let speedBoost = this.WALL_HIT_SPEED_BOOST;
    
    // Scale speed boost DRAMATICALLY based on current velocity
    if (currentSpeed > 1200) {
      speedBoost *= 2.5; // 250% extra boost for ultra-high-speed hits!
    } else if (currentSpeed > 800) {
      speedBoost *= 2.0; // 200% extra boost for high-speed hits
    } else if (currentSpeed > 500) {
      speedBoost *= 1.5; // 150% extra boost for medium-speed hits
    }
    
    // Apply maximum boost limit
    speedBoost = Math.min(speedBoost, this.WALL_HIT_MAX_BOOST);
    
    // Calculate new speed with enhanced multiplier
    let newSpeed = currentSpeed * this.WALL_HIT_SPEED_MULTIPLIER + speedBoost;
    
    // Add extra "pinball effect" - small chance for mega boost!
    if (Math.random() < 0.15) { // 15% chance for crazy boost
      newSpeed *= 1.3;
      console.log('🚀 PINBALL MEGA BOOST! 🚀');
    }
    
    newSpeed = Math.min(newSpeed, this.MAX_BALL_SPEED);
    
    // Apply the speed boost while maintaining direction
    if (currentSpeed > 0) {
      const currentVelocity = this.ball.body!.velocity;
      const normalizedVelocity = currentVelocity.clone().normalize();
      
      (this.ball.body as Phaser.Physics.Arcade.Body).setVelocity(
        normalizedVelocity.x * newSpeed,
        normalizedVelocity.y * newSpeed
      );
    }
    
    // Create enhanced wall hit effect
    this.createWallHitEffect(currentSpeed, newSpeed);
    
    console.log(`🔥 WALL BOUNCE: ${Math.round(currentSpeed)} → ${Math.round(newSpeed)} (+${Math.round(newSpeed - currentSpeed)})`);
  }
  
  private createWallHitEffect(currentSpeed: number, newSpeed: number) {
    // Create enhanced visual effect for wall collision
    const ballX = this.ball.x;
    const ballY = this.ball.y;
    const speedIncrease = newSpeed - currentSpeed;
    
    // Determine which wall was hit based on ball position
    let wallX = ballX;
    let wallY = ballY;
    
    if (ballX <= RINK.minX + RINK.puckRadius) {
      wallX = RINK.minX; // Left wall
    } else if (ballX >= RINK.maxX - RINK.puckRadius) {
      wallX = RINK.maxX; // Right wall
    }
    
    if (ballY <= RINK.topGoalY + RINK.puckRadius) {
      wallY = RINK.topGoalY; // Top wall
    } else if (ballY >= RINK.bottomGoalY - RINK.puckRadius) {
      wallY = RINK.bottomGoalY; // Bottom wall
    }
    
    // Enhanced spark effect based on speed increase
    const sparkCount = Math.min(8 + Math.floor(speedIncrease / 50), 20); // More sparks for bigger boosts
    let effectColor = 0xffaa00; // Default orange
    
    // Dynamic colors based on speed boost intensity
    if (speedIncrease > 400) {
      effectColor = 0xff0000; // Red for massive boosts
    } else if (speedIncrease > 250) {
      effectColor = 0xff4444; // Bright red for big boosts
    } else if (speedIncrease > 150) {
      effectColor = 0xffaa00; // Orange for good boosts
    }
    
    // Create enhanced spark burst
    for (let i = 0; i < sparkCount; i++) {
      const angle = (i / sparkCount) * Math.PI * 2;
      const distance = 30 + Math.random() * 50 + (speedIncrease / 10); // Distance scales with boost
      
      const spark = this.add.circle(wallX, wallY, 3 + Math.random() * 2, effectColor, 0.9);
      spark.setDepth(8);
      
      const targetX = wallX + Math.cos(angle) * distance;
      const targetY = wallY + Math.sin(angle) * distance;
      
      this.tweens.add({
        targets: spark,
        x: targetX,
        y: targetY,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 400 + Math.random() * 300,
        ease: 'Power2',
        onComplete: () => {
          spark.destroy();
        }
      });
    }
    
    // Add explosive shockwave for big bounces
    if (speedIncrease > 200) {
      const shockwave = this.add.circle(wallX, wallY, 20, effectColor, 0.4);
      shockwave.setDepth(7);
      shockwave.setStrokeStyle(6, effectColor, 0.8);
      
      this.tweens.add({
        targets: shockwave,
        radius: 80 + speedIncrease / 5,
        alpha: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => {
          shockwave.destroy();
        }
      });
    }
    
    // Enhanced camera shake based on bounce intensity
    if (speedIncrease > 300) {
      this.cameras.main.shake(150, 0.025); // Intense shake for massive bounces
    } else if (speedIncrease > 150) {
      this.cameras.main.shake(100, 0.02); // Strong shake for big bounces
    } else if (newSpeed > 1000) {
      this.cameras.main.shake(80, 0.015); // Normal shake for fast bounces
    }
  }

  private showSlidingHelpButton() {
    if (this.slidingHelpShown || this.slidingHelpButton) return;
    
    this.slidingHelpShown = true;
    console.log('AirHockey: Showing sliding help button for mini game - FORCED ENTRY');
    
    // Pause the game when help button appears - cannot be resumed except by entering mini-game
    this.pauseGame();
    
    // Add darkened background overlay to block interaction with game
    const darkOverlay = this.add.rectangle(RINK.centerX, RINK.centerY, RINK.maxX * 2, RINK.bottomGoalY * 2, 0x000000, 0.5);
    darkOverlay.setDepth(90); // Below the help button but above everything else
    
    // Create container for the sliding help button
    this.slidingHelpButton = this.add.container(-400, RINK.centerY);
    this.slidingHelpButton.setDepth(100); // Ensure it's above everything
    this.slidingHelpButton.setScale(1.5); // Make it bigger and more noticeable
    
    // Create transparent background for the button - the image already has a background
    const buttonBg = this.add.rectangle(0, 0, 400, 200, 0x483d99, 0);
    // No stroke needed as the image has its own border
    
    // Create help icon using loaded asset - this image already has all the text
    const helpIcon = this.add.image(0, 0,"help-icon");
    helpIcon.setScale(0.3);
    helpIcon.setOrigin(0.5, 0.5);
    
    // Add pulsing effect
    const pulseEffect = this.add.circle(0, 0, 45, 0x00ffff, 0.3);
    
    // Add components to container
    this.slidingHelpButton.add([pulseEffect, buttonBg, helpIcon]);
    
    // Make it interactive - increase the hit area to make it easier to click
    this.slidingHelpButton.setSize(400, 200);
    this.slidingHelpButton.setInteractive({
      useHandCursor: true  // Show hand cursor on hover
    });
    
    // Add click handler
    this.slidingHelpButton.on('pointerdown', () => {
      console.log('AirHockey: Help button clicked!');
      // Resume the game first
      this.resumeGame();
      // Then enter mini game
      this.enterMiniGame();
    });
    
    // Add another debug handler for any click issues
    this.slidingHelpButton.on('pointerover', () => {
      console.log('AirHockey: Mouse over help button');
    });
    
    // Add hover effects
    this.slidingHelpButton.on('pointerover', () => {
      this.tweens.add({
        targets: this.slidingHelpButton,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        ease: 'Back.easeOut'
      });
    });
    
    this.slidingHelpButton.on('pointerout', () => {
      this.tweens.add({
        targets: this.slidingHelpButton,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: 'Back.easeOut'
      });
    });
    
    // No background click to resume game - force mini-game entry
    const bgClickArea = this.add.rectangle(RINK.centerX, RINK.centerY, RINK.maxX * 2, RINK.bottomGoalY * 2, 0x000000, 0.01);
    bgClickArea.setInteractive();
    bgClickArea.setDepth(95); // Below the help button but above the dark overlay
    bgClickArea.on('pointerdown', () => {
      console.log('AirHockey: Background clicked - but mini-game is forced');
      // Show a "Must enter mini-game" message
      const warningText = this.add.text(RINK.centerX, RINK.centerY + 100, 'YOU MUST ENTER THE MINI-GAME!', {
        fontFamily: 'Commando',
        fontSize: '28px',
        color: '#ff0000',
        stroke: '#000000',
        strokeThickness: 4
      });
      warningText.setOrigin(0.5, 0.5);
      warningText.setDepth(110);
      
      // Make it flash to grab attention
      this.tweens.add({
        targets: warningText,
        alpha: 0.3,
        duration: 100,
        yoyo: true,
        repeat: 5,
        onComplete: () => {
          warningText.destroy();
        }
      });
    });
    
    // Slide in animation from left to center
    this.tweens.add({
      targets: this.slidingHelpButton,
      x: RINK.centerX - 250, // Center of the screen
      duration: 800,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Add continuous pulsing effect
        this.tweens.add({
          targets: pulseEffect,
          scaleX: 1.2,
          scaleY: 1.2,
          alpha: 0.1,
          duration: 1000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        
        // Add gentle floating animation
        this.tweens.add({
          targets: this.slidingHelpButton,
          y: RINK.centerY - 10,
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    });
  }
  
  private pauseGame() {
    if (this.gamePaused) return; // Already paused
    
    console.log('AirHockey: Pausing game for help button');
    
    // Set paused state
    this.gamePaused = true;
    
    // Store ball velocity
    this.storedBallVelocityX = this.ball.body!.velocity.x;
    this.storedBallVelocityY = this.ball.body!.velocity.y;
    
    // Stop the ball
    this.ball.body!.stop();
    
    // Pause the timer
    if (this.timerEvent) {
      this.timerEvent.paused = true;
    }
    
    console.log('AirHockey: Game paused successfully');
  }
  
  private resumeGame() {
    if (!this.gamePaused) return; // Not paused
    
    console.log('AirHockey: Resuming game');
    
    // Reset paused state
    this.gamePaused = false;
    
    // Restore ball velocity
    (this.ball.body as Phaser.Physics.Arcade.Body).setVelocity(this.storedBallVelocityX, this.storedBallVelocityY);
    
    // Resume timer
    if (this.timerEvent) {
      this.timerEvent.paused = false;
    }
    
    console.log('AirHockey: Game resumed successfully');
  }

  private enterMiniGame() {
    console.log('AirHockey: Entering mini game!');
    
    // Mark mini game as used for this session
    this.miniGameUsed = true;
    
    // Save the complete game state
    this.saveGameState();
    
    // Find and destroy the dark overlay
    const darkOverlay = this.children.list.find(
      child => child instanceof Phaser.GameObjects.Rectangle && 
      child.depth === 90 && 
      child.fillAlpha === 0.5
    );
    
    if (darkOverlay) {
      darkOverlay.destroy();
    }
    
    // Hide the sliding help button
    if (this.slidingHelpButton) {
      this.slidingHelpButton.destroy();
      this.slidingHelpButton = undefined;
    }
    
    // Transition to mini game scene
    this.scene.start('MatchingMiniGame');
  }

  private saveGameState() {
    console.log('AirHockey: Saving game state for mini game');
    
    // Get current timer color
    const currentTimerColor = this.timerText.style.color as string || '#ffffff';
    
    this.savedGameState = {
      // Game progress
      rightHealth: this.rightHealth,
      leftHealth: this.leftHealth,
      gameTimer: this.gameTimer,
      gameStarted: this.gameStarted,
      countdownActive: this.countdownActive,
      countdownValue: this.countdownValue,
      
      // Ball state
      ballX: this.ball.x,
      ballY: this.ball.y,
      ballVelocityX: this.ball.body!.velocity.x,
      ballVelocityY: this.ball.body!.velocity.y,
      
      // Paddle states
      paddleLeftX: this.paddleLeft.x,
      paddleLeftY: this.paddleLeft.y,
      paddleRightX: this.paddleRight.x,
      paddleRightY: this.paddleRight.y,
      
      // Game settings
      botDifficulty: this.botDifficulty,
      botState: this.botState,
      
      // Input state
      inputMode: this.inputMode,
      paddleLeftTargetX: this.paddleLeftTargetX,
      paddleLeftTargetY: this.paddleLeftTargetY,
      
      // Timer state
      timerColor: currentTimerColor,
      
      // Mini game state
      miniGameUsed: this.miniGameUsed,
      
      // Fire effect state
      puckFireActive: this.puckFireActive
    };
    
    console.log('AirHockey: Game state saved successfully');
  }
  
  private restoreGameState(miniGameSuccess: boolean) {
    if (!this.savedGameState) {
      console.error('AirHockey: No saved game state found!');
      return;
    }
    
    console.log('AirHockey: Restoring game state from mini game');
    
    const state = this.savedGameState;
    
    // Restore game progress
    this.rightHealth = state.rightHealth;
    this.leftHealth = state.leftHealth;
    this.gameTimer = state.gameTimer;
    this.gameStarted = state.gameStarted;
    this.countdownActive = state.countdownActive;
    this.countdownValue = state.countdownValue;
    
    // Apply mini game bonus if successful
    if (miniGameSuccess) {
      this.gameTimer += 15; // Add 15 seconds bonus
      console.log('AirHockey: Applied +15 seconds bonus from mini game');
      console.log('AirHockey: Will activate fire effect after scene setup!');
      // Fire effect will be activated after scene setup is complete
    } else {
      // Restore fire effect state from saved game
      this.puckFireActive = state.puckFireActive;
    }
    
    // Setup the scene again with minimal initialization
    this.gamePaused = false;
    this.slidingHelpShown = false;
    if (this.slidingHelpButton) {
      this.slidingHelpButton.destroy();
      this.slidingHelpButton = undefined;
    }
    
    // this.playAreaTop = 0;
    this.playAreaBottom = 1280;
    this.playAreaCenter = 640;
    // this.statsAreaTop = 1280;
    // this.statsAreaBottom = 1920;
    this.statsAreaCenter = 1600;

    this.physics.world.setBounds(0, 0, 1080, 1280);
    this.physics.world.setBoundsCollision(true, true, true, true);

    // Recreate backgrounds
    // Create character background image as the playing area background
    if (this.characterBackground) {
      this.playingAreaBackground = this.add.image(540, this.playAreaCenter, this.characterBackground)
        // .setAlpha(0.4)  // Semi-transparent
        .setDisplaySize(1080, 1280) // Fit to play area
        .setDepth(0);   // Make sure it's behind game elements
    } else {
      // Fallback to dark green background if no character background
      this.playingAreaBackground = this.add.rectangle(540, this.playAreaCenter, 1080, 1280,  0xffffff, 0);
    }
    
    // Create stats area background
    this.statsBackground = this.add.rectangle(540, this.statsAreaCenter, 1080, 640, 0x1a1a1a, 0.8);
    this.statsBackground.depth = 1;

    this.blueStatsBackground = this.add.rectangle(270, this.statsAreaCenter, 540, 640, 0x1a1a1a, 0.8);
    this.blueStatsBackground.depth = 2;
    this.redStatsBackground = this.add.rectangle(810, this.statsAreaCenter, 540, 640, 0x1a1a1a, 0.8);
    this.redStatsBackground.depth = 2;

    // Recreate UI elements
    this.title = this.add.text(540, 1320, 'AIR HOCKEY', {
      fontFamily: 'Commando',
      fontSize: '56px',
      color: '#ffffff'
    });
    this.title.setOrigin(0.5, 0);
    this.title.depth = 3;

    this.blueHealthLabel = this.add.text(150, 1420, 'Blue Health:', {
      fontFamily: 'Commando',
      fontSize: '24px',
      color: '#4da6ff'
    });
    this.blueHealthLabel.setOrigin(0, 0.5);
    this.blueHealthLabel.depth = 3;

    this.blueHealthBar = this.add.graphics();
    this.blueHealthBar.depth = 4;

    this.redHealthLabel = this.add.text(930, 1420, this.characterName, {
      fontFamily: 'Commando',
      fontSize: '24px',
      color: '#ff4d4d'
    });
    this.redHealthLabel.setOrigin(1, 0.5);
    this.redHealthLabel.depth = 3;

    this.redHealthBar = this.add.graphics();
    this.redHealthBar.depth = 4;

    this.gameInfo = this.add.text(540, 1580, 'Controls: Drag paddles directly OR tap/click to move OR use WASD keys OR gamepad\nBlue paddle: bottom half only - ESC: menu, R: restart, T: test timer (10s), F: test fire effect\nBot Difficulty: Q = BEGINNER, 1 = Easy, 2 = Medium, 3 = Hard, 4 = EXTREME, 5 = IMPOSSIBLE', {
      fontFamily: 'Commando',
      fontSize: '16px',
      color: '#cccccc',
      wordWrap: { width: 1000 },
      align: 'center'
    });
    this.gameInfo.setOrigin(0.5, 0.5);
    this.gameInfo.depth = 3;

    this.inputModeIndicator = this.add.text(270, 1680, 'Input: None', {
      fontFamily: 'Commando',
      fontSize: '14px',
      color: '#888888',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 8, y: 4 }
    });
    this.inputModeIndicator.setOrigin(0.5, 0.5);
    this.inputModeIndicator.depth = 3;
    
    this.botStateIndicator = this.add.text(540, 1680, 'Bot: Defend', {
      fontFamily: 'Commando',
      fontSize: '14px',
      color: '#ff8888',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 8, y: 4 }
    });
    this.botStateIndicator.setOrigin(0.5, 0.5);
    this.botStateIndicator.depth = 3;
    
    this.botDifficultyIndicator = this.add.text(810, 1680, 'Difficulty: Medium', {
      fontFamily: 'Commando',
      fontSize: '14px',
      color: '#ffaa00',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 8, y: 4 }
    });
    this.botDifficultyIndicator.setOrigin(0.5, 0.5);
    this.botDifficultyIndicator.depth = 3;

    this.timerText = this.add.text(540, 1520, this.formatTime(this.gameTimer), {
      fontFamily: 'Commando',
      fontSize: '48px',
      color: miniGameSuccess ? '#00ff00' : state.timerColor, // Green if bonus applied
      stroke: '#000000',
      strokeThickness: 4
    });
    this.timerText.setOrigin(0.5, 0.5);
    this.timerText.depth = 3;

    this.add.text(540, 1480, 'TIME REMAINING', {
      fontFamily: 'Commando',
      fontSize: '24px',
      color: '#cccccc'
    }).setOrigin(0.5, 0.5).setDepth(3);

    // Reset timer color after showing bonus
    if (miniGameSuccess) {
      this.time.delayedCall(2000, () => {
        if (this.gameTimer <= 10) {
          this.timerText.setColor('#ff4444');
        } else if (this.gameTimer <= 30) {
          this.timerText.setColor('#ff4444');
        } else if (this.gameTimer <= 60) {
          this.timerText.setColor('#ffaa44');
        } else {
          this.timerText.setColor('#ffffff');
        }
      });
    }

    // Setup input
    this.keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyUp = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.keyDown = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.keyLeft = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.keyRight = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

    // Reset input states
    this.isDragging = false;
    this.isTouchMoving = false;
    this.isRedDragging = false;
    this.touchControlsSetup = false;

    // Recreate game objects
    this.background = this.add.image(540, this.playAreaCenter, 'airhockey-background');
    this.background.displayHeight = 1280;
    this.background.displayWidth = 1080;
    this.background.depth = 0;

    this.rightGoal = this.add.rectangle(RINK.centerX, RINK.topGoalY - (155/4), 300, 155, 0xffffff, 0.0);
    this.rightGoal.depth = 2;

    this.leftGoal = this.add.image(RINK.centerX, RINK.bottomGoalY + (RINK.puckRadius*2) - 70 , 'net').setScale(0.6);
    this.leftGoal.depth = 2;

    // Debug goal lines
    this.add.line(0, 0, RINK.minX, RINK.topGoalY, RINK.maxX, RINK.topGoalY, 0xff0000).setOrigin(0, 0).setDepth(5);
    this.add.line(0, 0, RINK.minX, RINK.bottomGoalY, RINK.maxX, RINK.bottomGoalY, 0x0000ff).setOrigin(0, 0).setDepth(5);

    // Restore ball
    this.ball = this.physics.add.sprite(state.ballX, state.ballY, 'puck')
      .setScale(0.5)
      .setOrigin(0.5, 0.5) // Ensure the puck is centered properly
      .setCircle(RINK.puckRadius, (this.textures.get('puck').get(0).width / 2) - RINK.puckRadius, 
                                 (this.textures.get('puck').get(0).height / 2) - RINK.puckRadius) // Adjust offset to center the collision circle
      .setBounce(1.0)
      .setCollideWorldBounds(true)
      .setMaxVelocity(this.MAX_BALL_SPEED);

    this.ball.setVelocity(state.ballVelocityX, state.ballVelocityY);
    this.ball.setDamping(true).setDrag(0.002);

    // Initialize ball trace graphics
    this.traceGraphics = this.add.graphics();
    this.traceGraphics.setDepth(1);
    this.ballTracePoints = [];

    (this.ball.body as Phaser.Physics.Arcade.Body).onWorldBounds = true;
    this.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body) => {
      if (body.gameObject === this.ball) {
        const now = this.time.now;
        if (now - (this.lastWallSfx || 0) > 50) {
          this.wall.play();
          this.lastWallSfx = now;
        }
        this.onWallHit();
      }
    });

    // Restore paddles
 // this.paddleLeft = this.physics.add.sprite(state.paddleLeftX, state.paddleLeftY, 'blue-paddle').setCircle(35).setImmovable(true);
          this.paddleRight = this.physics.add.sprite(state.paddleRightX, state.paddleRightY, 'red-paddle')
      .setScale(1)
      .setOrigin(0.5, 0.5) // Ensure sprite is centered on its position
      .setImmovable(true);
      
     this.paddleLeft = this.physics.add.sprite(state.paddleLeftX, state.paddleLeftY, 'blue-paddle')
      .setScale(1)
      .setOrigin(0.5, 0.5) // Ensure sprite is centered on its position
      .setImmovable(true);

    // Dynamically center the collision circle on the boss sprite
    const bossTexture = this.textures.get('red-paddle');
    const bossFrame = bossTexture.get(0);

    // Use the same circle radius for both paddles for consistent collision
    const circleRadius = 35;
    // Calculate offsets from top-left to center the collision circle
    const offsetX = (bossFrame.width / 2) - circleRadius;
    const offsetY = (bossFrame.height / 2) - circleRadius;
    (this.paddleRight.body as Phaser.Physics.Arcade.Body).setCircle(circleRadius, offsetX, offsetY);
    

    const playerTexture = this.textures.get('blue-paddle');
    const playerFrame = playerTexture.get(0);
    const playerCircleRadius = 35;
    const playerOffsetX = (playerFrame.width / 2) - playerCircleRadius;
    const playerOffsetY = (playerFrame.height / 2) - playerCircleRadius;
    (this.paddleLeft.body as Phaser.Physics.Arcade.Body).setCircle(playerCircleRadius, playerOffsetX, playerOffsetY);

 

    (this.paddleLeft.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
    (this.paddleRight.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);

    this.paddleLeft.setInteractive();
    this.input.setDraggable(this.paddleLeft);
    this.paddleRight.setInteractive();
    this.input.setDraggable(this.paddleRight);

    this.physics.add.collider(this.ball, this.paddleLeft, (ball, paddle) => this.onPaddleHit(ball as Phaser.Physics.Arcade.Sprite, paddle as Phaser.Physics.Arcade.Sprite), undefined, this);
    this.physics.add.collider(this.ball, this.paddleRight, (ball, paddle) => this.onPaddleHit(ball as Phaser.Physics.Arcade.Sprite, paddle as Phaser.Physics.Arcade.Sprite), undefined, this);

    // Restore audio placeholders
    this.puckhit = { play: () => {}, isPlaying: false } as any;
    this.goal = { play: () => {}, isPlaying: false } as any;
    this.wall = { play: () => {}, isPlaying: false } as any;
    this.cheer = { play: () => {}, stop: () => {}, isPlaying: false } as any;
    this.music = { play: () => {}, stop: () => {}, pause: () => {}, isPlaying: false } as any;

    // Restore input state
    this.inputMode = state.inputMode as 'none' | 'keyboard' | 'touch' | 'drag' | 'gamepad';
    this.paddleLeftTargetX = state.paddleLeftTargetX;
    this.paddleLeftTargetY = state.paddleLeftTargetY;
    
    // Restore mini game state
    this.miniGameUsed = state.miniGameUsed;

    // Setup keyboard shortcuts again
    this.input.keyboard?.on('keydown-ESC', () => {
      // If mini-game help is active, prevent escape and show warning
      if (this.slidingHelpButton && this.gamePaused) {
        console.log('AirHockey: ESC pressed - but mini-game entry is forced');
        
        // Show a warning message
        const warningText = this.add.text(RINK.centerX, RINK.centerY + 100, 'YOU MUST ENTER THE MINI-GAME!', {
          fontFamily: 'Commando',
          fontSize: '28px',
          color: '#ff0000',
          stroke: '#000000',
          strokeThickness: 4
        });
        warningText.setOrigin(0.5, 0.5);
        warningText.setDepth(110);
        
        // Make it flash to grab attention
        this.tweens.add({
          targets: warningText,
          alpha: 0.3,
          duration: 100,
          yoyo: true,
          repeat: 5,
          onComplete: () => {
            warningText.destroy();
          }
        });
        return;
      }
      
      // Normal behavior if mini-game not active
      this.scene.start('MainMenu');
    });

    this.input.keyboard?.on('keydown-R', () => {
      console.log('AirHockey: R key pressed - restarting game');
      if (this.timerEvent) {
        this.timerEvent.destroy();
        this.timerEvent = undefined;
      }
      this.input.removeAllListeners();
      this.touchControlsSetup = false;
      this.scene.restart();
    });

    this.input.keyboard?.on('keydown-T', () => {
      console.log('AirHockey: T key pressed - setting timer to 10 seconds for testing');
      this.gameTimer = 10;
      this.timerText.setText(this.formatTime(this.gameTimer));
      this.timerText.setColor('#ff4444');
    });

    // Add difficulty shortcuts
    this.input.keyboard?.on('keydown-Q', () => {
      this.setBotDifficulty('beginner');
      this.showDifficultyChange('BEGINNER');
    });
    
    this.input.keyboard?.on('keydown-ONE', () => {
      this.setBotDifficulty('easy');
      this.showDifficultyChange('Easy');
    });
    
    this.input.keyboard?.on('keydown-TWO', () => {
      this.setBotDifficulty('medium');
      this.showDifficultyChange('Medium');
    });
    
    this.input.keyboard?.on('keydown-THREE', () => {
      this.setBotDifficulty('hard');
      this.showDifficultyChange('Hard');
    });
    
    this.input.keyboard?.on('keydown-FOUR', () => {
      this.setBotDifficulty('extreme');
      this.showDifficultyChange('EXTREME');
    });
    
    this.input.keyboard?.on('keydown-FIVE', () => {
      this.setBotDifficulty('impossible');
      this.showDifficultyChange('IMPOSSIBLE');
    });
    
    // Add fire effect test key for debugging
    this.input.keyboard?.on('keydown-F', () => {
      if (this.puckFireActive) {
        this.removeFireEffect();
        console.log('AirHockey: Fire effect removed via F key');
      } else {
        this.activateFireEffect();
        console.log('AirHockey: Fire effect activated via F key');
      }
    });

    this.setupTouchControls();
    this.updateHealthBars();
    this.setBotDifficulty(state.botDifficulty);
    this.botState = state.botState;

    // Resume game timer
    this.startGameTimer();
    
    // Activate fire effect if needed
    if (miniGameSuccess) {
      // Mini game was successful - activate fire effect as bonus
      this.activateFireEffect();
      console.log('AirHockey: Fire effect activated as mini game bonus!');
    } else if (this.puckFireActive) {
      // Restoring existing fire effect from saved state
      this.activateFireEffect();
      console.log('AirHockey: Fire effect restored from saved state');
    }

    console.log('AirHockey: Game state restored successfully');
    console.log(`AirHockey: Mini game result: ${miniGameSuccess ? 'SUCCESS' : 'FAILED'}`);
    
    // Clear saved state after restoration
    this.savedGameState = undefined;
  }
  
  private activateFireEffect() {
    console.log('AirHockey: Activating fire effect on puck!');
    
    this.puckFireActive = true;
    
    // Destroy existing fire graphics if any
    if (this.fireEffectGraphics) {
      this.fireEffectGraphics.destroy();
    }
    
    // Create fire effect graphics
    this.fireEffectGraphics = this.add.graphics();
    this.fireEffectGraphics.setDepth(6); // Above ball trace but below UI
    
    console.log('AirHockey: Fire effect graphics created successfully!');
  }
  
  private updateFireEffect() {
    if (!this.puckFireActive || !this.ball || !this.fireEffectGraphics) return;
    
    const ballX = this.ball.x;
    const ballY = this.ball.y;
    const ballSpeed = this.ball.body!.velocity.length();
    const currentTime = this.time.now;
    
    // Clear previous fire graphics
    this.fireEffectGraphics.clear();
    
    // Create dynamic fire particles around the puck
    const particleCount = Math.min(8, 4 + Math.floor(ballSpeed / 200)); // More particles for faster puck
    const fireRadius = RINK.puckRadius * 1.2; // Fire extends beyond puck
    
    // Create flame particles
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + (currentTime * 0.01); // Rotating flames
      const distance = fireRadius + Math.sin(currentTime * 0.01 + i) * 8; // Flickering distance
      
      const particleX = ballX + Math.cos(angle) * distance;
      const particleY = ballY + Math.sin(angle) * distance;
      
      // Fire colors - red to orange to yellow
      const colors = [0xff0000, 0xff4400, 0xff8800, 0xffaa00, 0xffdd00];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // Dynamic particle size based on ball speed
      const baseSize = 3 + Math.random() * 3;
      const speedMultiplier = 1 + (ballSpeed / 1000);
      const particleSize = baseSize * speedMultiplier;
      
      this.fireEffectGraphics.fillStyle(color, 0.7 + Math.random() * 0.3);
      this.fireEffectGraphics.fillCircle(particleX, particleY, particleSize);
      
      // Add glow effect for intense flames
      if (ballSpeed > 800) {
        this.fireEffectGraphics.fillStyle(0xffff00, 0.3);
        this.fireEffectGraphics.fillCircle(particleX, particleY, particleSize * 1.5);
      }
    }
    
    // Add central fire core for high speeds
    if (ballSpeed > 600) {
      this.fireEffectGraphics.fillStyle(0xffffff, 0.6);
      this.fireEffectGraphics.fillCircle(ballX, ballY, RINK.puckRadius * 0.8);
      
      this.fireEffectGraphics.fillStyle(0xffff00, 0.8);
      this.fireEffectGraphics.fillCircle(ballX, ballY, RINK.puckRadius * 0.6);
    }
    
    // Manage fire trail particles for very fast movement
    if (ballSpeed > 400) {
      // Create trailing fire particles
      const trailParticle = this.add.circle(
        ballX + (Math.random() - 0.5) * RINK.puckRadius,
        ballY + (Math.random() - 0.5) * RINK.puckRadius,
        2 + Math.random() * 3,
        0xff4400,
        0.8
      );
      trailParticle.setDepth(5);
      
      this.fireParticles.push(trailParticle);
      
      // Animate trail particle
      this.tweens.add({
        targets: trailParticle,
        alpha: 0,
        scaleX: 0.3,
        scaleY: 0.3,
        duration: 300 + Math.random() * 200,
        ease: 'Power2.easeOut',
        onComplete: () => {
          trailParticle.destroy();
          const index = this.fireParticles.indexOf(trailParticle);
          if (index > -1) {
            this.fireParticles.splice(index, 1);
          }
        }
      });
      
      // Limit number of trail particles for performance
      if (this.fireParticles.length > 20) {
        const oldestParticle = this.fireParticles.shift();
        if (oldestParticle) {
          oldestParticle.destroy();
        }
      }
    }
  }
  
  private removeFireEffect() {
    console.log('AirHockey: Removing fire effect from puck');
    
    this.puckFireActive = false;
    
    // Destroy fire graphics
    if (this.fireEffectGraphics) {
      this.fireEffectGraphics.destroy();
      this.fireEffectGraphics = undefined;
    }
    
    // Clean up fire particles
    this.fireParticles.forEach(particle => particle.destroy());
    this.fireParticles = [];
    
    console.log('AirHockey: Fire effect removed successfully');
  }
  
  private createFireGoalEffect() {
    console.log('AirHockey: Creating special fire goal effect!');
    
    // Create massive fire explosion effect at goal
    const goalX = RINK.centerX;
    const goalY = RINK.topGoalY;
    
    // Create large fire burst
    const fireExplosion = this.add.circle(goalX, goalY, 100, 0xff0000, 0.8);
    fireExplosion.setDepth(15);
    
    // Animate the explosion
    this.tweens.add({
      targets: fireExplosion,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 800,
      ease: 'Power2.easeOut',
      onComplete: () => {
        fireExplosion.destroy();
      }
    });
    
    // Create multiple fire particles bursting outward
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 80 + Math.random() * 100;
      
      const colors = [0xff0000, 0xff4400, 0xff8800, 0xffaa00, 0xffdd00];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const particle = this.add.circle(goalX, goalY, 8 + Math.random() * 6, color, 0.9);
      particle.setDepth(14);
      
      const targetX = goalX + Math.cos(angle) * distance;
      const targetY = goalY + Math.sin(angle) * distance;
      
      this.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 1000 + Math.random() * 500,
        ease: 'Power2.easeOut',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
    
    // Create special fire goal text
    const fireGoalText = this.add.text(RINK.centerX, RINK.centerY - 150, '🔥 FIRE GOAL! 🔥', {
      fontFamily: 'Commando',
      fontSize: '64px',
      color: '#ff0000',
      stroke: '#ffff00',
      strokeThickness: 4
    });
    fireGoalText.setOrigin(0.5, 0.5);
    fireGoalText.setDepth(16);
    
    // Animate fire goal text
    this.tweens.add({
      targets: fireGoalText,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 300,
      yoyo: true,
      repeat: 2,
      ease: 'Back.easeOut'
    });
    
    this.tweens.add({
      targets: fireGoalText,
      alpha: 0,
      y: fireGoalText.y - 100,
      duration: 2000,
      delay: 1000,
      ease: 'Power2.easeOut',
      onComplete: () => {
        fireGoalText.destroy();
      }
    });
    
    // Screen flash effect
    const flashOverlay = this.add.rectangle(RINK.centerX, RINK.centerY, 1080, 1280, 0xff4400, 0.4);
    flashOverlay.setDepth(13);
    
    this.tweens.add({
      targets: flashOverlay,
      alpha: 0,
      duration: 600,
      ease: 'Power2.easeOut',
      onComplete: () => {
        flashOverlay.destroy();
      }
    });
    
    // Camera shake for dramatic effect
    this.cameras.main.shake(400, 0.03);
    
    console.log('AirHockey: Fire goal effect created successfully!');
  }

  // Boss animation methods
  private updateBossAnimation(state: 'defend' | 'attack' | 'wait' | 'recover') {
    if (!this.paddleRight) return;
    
    // Adjust boss animation based on state
    switch (state) {
      case 'attack':
        // Make boss look angry when attacking
        this.bossAngerLevel = Math.min(this.bossAngerLevel + 0.1, 1);
        this.paddleRight.setScale(1.1); // Slightly bigger when attacking
        this.paddleRight.setTint(0xff9999); // Reddish tint when attacking
        break;
        
      case 'defend':
        // Boss looks focused when defending
        this.bossAngerLevel = Math.max(this.bossAngerLevel - 0.05, 0);
        this.paddleRight.setScale(1.0);
        this.paddleRight.setTint(0xaaaaff); // Bluish tint when defending
        break;
        
      case 'wait':
        // Boss returns to normal when waiting
        this.bossAngerLevel = Math.max(this.bossAngerLevel - 0.1, 0);
        this.paddleRight.setScale(0.9); // Slightly smaller when waiting
        this.paddleRight.clearTint();
        break;
        
      case 'recover':
        // Boss looks confused when recovering
        this.bossAngerLevel = 0.3;
        this.paddleRight.setScale(1.0);
        this.paddleRight.setTint(0xffcc44); // Orange tint when recovering
        break;
    }
    
    // Apply a pulsing effect when anger level is high
    if (this.bossAngerLevel > 0.7 && !this.tweens.isTweening(this.paddleRight)) {
      this.tweens.add({
        targets: this.paddleRight,
        scaleX: this.paddleRight.scaleX * 1.1,
        scaleY: this.paddleRight.scaleY * 1.1,
        duration: 300,
        yoyo: true,
        repeat: 1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  // Add new boss taunt method
  private playBossTaunt(type: 'pathetic' | 'weak' | 'average' | 'powerful' | 'enraged' | 'godlike') {
    if (!this.paddleRight) return;
    
    // Create a speech bubble effect
    const bubbleX = this.paddleRight.x;
    const bubbleY = this.paddleRight.y - 70;
    
    let tauntText = '';
    switch(type) {
      case 'pathetic':
        tauntText = 'Ha! Too easy!';
        break;
      case 'weak':
        tauntText = 'You can do better!';
        break;
      case 'average':
        tauntText = 'Let\'s see what you got!';
        break;
      case 'powerful':
        tauntText = 'Now I\'m serious!';
        break;
      case 'enraged':
        tauntText = 'YOU WILL SUFFER!';
        break;
      case 'godlike':
        tauntText = 'WITNESS MY POWER!';
        break;
    }
    
    // Create speech bubble background
    const bubble = this.add.graphics();
    bubble.fillStyle(0xffffff, 0.9);
    bubble.lineStyle(4, 0x000000, 1);
    bubble.fillRoundedRect(bubbleX - 100, bubbleY - 30, 200, 60, 10);
    bubble.strokeRoundedRect(bubbleX - 100, bubbleY - 30, 200, 60, 10);
    
    // Add little triangle at bottom
    bubble.fillStyle(0xffffff, 0.9);
    bubble.lineStyle(2, 0x000000, 1);
    bubble.fillTriangle(
      bubbleX, bubbleY + 30,
      bubbleX - 10, bubbleY + 15,
      bubbleX + 10, bubbleY + 15
    );
    bubble.strokeTriangle(
      bubbleX, bubbleY + 30,
      bubbleX - 10, bubbleY + 15,
      bubbleX + 10, bubbleY + 15
    );
    
    bubble.setDepth(20);
    
    // Add taunt text
    const text = this.add.text(bubbleX, bubbleY, tauntText, {
      fontFamily: 'Commando',
      fontSize: '18px',
      color: '#000000',
      align: 'center'
    });
    text.setOrigin(0.5, 0.5);
    text.setDepth(21);
    
    // Animate the boss when taunting
    this.paddleRight.setScale(1.2);  // Grow slightly
    
    // Clear after a moment
    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: [bubble, text],
        alpha: 0,
        duration: 300,
        onComplete: () => {
          bubble.destroy();
          text.destroy();
          this.updateBossAnimation(this.botState);
        }
      });
    });
  }

  private checkGamepadActivity(): boolean {
    if (!this.gamepadConnected || !this.gamepad) return false;

    // Check left stick
    const leftStickX = this.gamepad.leftStick.x;
    const leftStickY = this.gamepad.leftStick.y;
    
    // Check D-pad
    const dpadLeft = this.gamepad.left;
    const dpadRight = this.gamepad.right;
    const dpadUp = this.gamepad.up;
    const dpadDown = this.gamepad.down;
    
    // Check main buttons that could be used for movement
    const aButton = this.gamepad.A;
    const bButton = this.gamepad.B;
    const xButton = this.gamepad.X;
    const yButton = this.gamepad.Y;
    
    // Consider gamepad active if any control exceeds threshold
    return (
      Math.abs(leftStickX) > this.gamepadThreshold ||
      Math.abs(leftStickY) > this.gamepadThreshold ||
      dpadLeft || dpadRight || dpadUp || dpadDown ||
      aButton || bButton || xButton || yButton
    );
  }

  private handleGamepadInput() {
    if (!this.gamepadConnected || !this.gamepad) return;

    const maxGamepadSpeed = 12; // Maximum velocity in each direction
    let inputX = 0;
    let inputY = 0;
    
    // Process left stick input with deadzone
    if (Math.abs(this.gamepad.leftStick.x) > this.gamepadDeadzone) {
      inputX = this.gamepad.leftStick.x;
    }
    
    if (Math.abs(this.gamepad.leftStick.y) > this.gamepadDeadzone) {
      inputY = this.gamepad.leftStick.y;
    }
    
    // Process D-pad input as digital values
    if (this.gamepad.left) inputX -= 1;
    if (this.gamepad.right) inputX += 1;
    if (this.gamepad.up) inputY -= 1;
    if (this.gamepad.down) inputY += 1;
    
    // Apply smooth acceleration/deceleration similar to keyboard
    if (inputX !== 0) {
      this.gamepadVelocityX += inputX * this.gamepadAcceleration;
      this.gamepadVelocityX = Math.max(-maxGamepadSpeed, Math.min(maxGamepadSpeed, this.gamepadVelocityX));
    } else {
      this.gamepadVelocityX *= this.gamepadDamping; // Smooth deceleration
      if (Math.abs(this.gamepadVelocityX) < 0.1) this.gamepadVelocityX = 0;
    }
    
    if (inputY !== 0) {
      this.gamepadVelocityY += inputY * this.gamepadAcceleration;
      this.gamepadVelocityY = Math.max(-maxGamepadSpeed, Math.min(maxGamepadSpeed, this.gamepadVelocityY));
    } else {
      this.gamepadVelocityY *= this.gamepadDamping; // Smooth deceleration
      if (Math.abs(this.gamepadVelocityY) < 0.1) this.gamepadVelocityY = 0;
    }
    
    // Apply velocity to target position
    this.paddleLeftTargetX = this.paddleLeft.x + this.gamepadVelocityX;
    this.paddleLeftTargetY = this.paddleLeft.y + this.gamepadVelocityY;
    
    // Update input timestamp for priority system
    this.lastInputTime = this.time.now;
  }

    private getSelectedCharacter(): void {
    // Get selected character from localStorage (set by CharacterSelect scene)
    const savedCharacter = localStorage.getItem('selectedCharacter');
    console.log('🎮 AirHockey: Reading character from localStorage:', savedCharacter);
    
    if (savedCharacter) {
      this.selectedCharacter = savedCharacter;
      // Map character frame to character name, texture and background
      const characterNames = ['Lady Delayna', 'Phantom Tax'];
      const characterFrames = ['boss1', 'boss2'];
      const characterTextures = ['boss-field1', 'boss-field2'];
      const characterBackgrounds = ['boss-bg1', 'boss-bg2'];
      const characterIndex = characterFrames.indexOf(savedCharacter);
      
      if (characterIndex !== -1) {
        this.characterName = characterNames[characterIndex];
        this.characterBackground = characterBackgrounds[characterIndex];
        console.log('✅ Character mapped successfully:', this.selectedCharacter, '->', this.characterName);
        
        // Set right paddle texture based on selected character
        if(this.paddleRight) {
          const paddleTexture = characterTextures[characterIndex];
          console.log('🎮 Setting bot paddle texture to:', paddleTexture);
          this.paddleRight.setTexture(paddleTexture);
        }
        
        // Set background based on selected character
        if(this.playingAreaBackground) {
          this.playingAreaBackground.destroy();
          
          // Create background image - this becomes the new playing area background
          const bgImage = this.add.image(540, this.playAreaCenter, this.characterBackground)
            .setAlpha(0.4)  // Semi-transparent (increased from 0.2 for better visibility)
            .setDisplaySize(1080, 1280) // Fit to play area
            .setDepth(0);   // Make sure it's behind game elements
            
          // Set the background image as the playing area background reference
          this.playingAreaBackground = bgImage;
          
          console.log('🖼️ Updated playing area background to:', this.characterBackground);
        }
      } else {
        console.warn('⚠️ Character not found in mapping, using default');
      }
    } else {
      console.log('📝 No saved character found, using default:', this.selectedCharacter, this.characterName);
    }
    
    console.log('🏁 Final character selection - Frame:', this.selectedCharacter, 'Name:', this.characterName);
    
    // Update UI with character name if available
    if (this.redHealthLabel) {
      this.redHealthLabel.setText(this.characterName);
    }
  }
}