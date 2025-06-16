import Phaser from "phaser";

interface GameState {
  
  rightHealth: number;
  leftHealth: number;
  gameTimer: number;
  gameStarted: boolean;
  countdownActive: boolean;
  countdownValue: number;
  
  ballX: number;
  ballY: number;
  ballVelocityX: number;
  ballVelocityY: number;
  
  paddleLeftX: number;
  paddleLeftY: number;
  paddleRightX: number;
  paddleRightY: number;
  
  botDifficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'extreme' | 'impossible';
  botState: 'defend' | 'attack' | 'wait' | 'recover';
  
  inputMode: 'none' | 'keyboard' | 'touch' | 'drag' | 'gamepad';
  paddleLeftTargetX: number;
  paddleLeftTargetY: number;
  
  timerColor: string;
  
  miniGameUsed: boolean;
  
  puckFireActive: boolean;
  
  selectedCharacter: string;
  characterName: string;
  characterBackground: string;
}

const RINK = {
  minX:0,
  maxX:1080,
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

const BOT_STATE_CONFIG = {
  defend: { text: 'Blocking', color: '#4da6ff' },
  attack: { text: 'Attacking', color: '#ff4444' },
  wait: { text: 'Planning', color: '#888888' },
  recover: { text: 'Recovering', color: '#ffaa44' }
};

const BOSS_TAUNTS = {
  pathetic: 'Ha! Too easy!',
  weak: 'You can do better!',
  average: 'Let\'s see what you got!',
  powerful: 'Now I\'m serious!',
  enraged: 'YOU WILL SUFFER!',
  godlike: 'WITNESS MY POWER!'
};

const UI_CONFIG = {
  // Screen dimensions
  SCREEN_WIDTH: 1080,
  SCREEN_HEIGHT: 1920,
  PLAY_AREA_HEIGHT: 1280,
  STATS_AREA_HEIGHT: 640,
  CENTER_X: 540,
  
  // Y positions
  TITLE_Y: 1320,
  HEALTH_LABEL_Y: 1350,
  HEALTH_BAR_Y: 1350,
  TIME_LABEL_Y: 1380,
  TIMER_Y: 1380,
  GAME_INFO_Y: 1580,
  STATS_CENTER_Y: 1600,
  INDICATORS_Y: 1680,
  MODAL_Y: 1700,
  HELP_ICON_Y: 1750,
  
  // X positions
  BLUE_HEALTH_X: 150,
  RED_HEALTH_X: 930,
  BLUE_STATS_X: 270,
  RED_STATS_X: 810,
  RED_HEALTH_BAR_X: 630,
  
  // Sizes
  HEALTH_BAR_WIDTH: 420,
  HEALTH_BAR_HEIGHT: 80,
  STATS_BG_WIDTH: 540,
  STATS_BG_HEIGHT: 640,
  BUTTON_WIDTH: 400,
  BUTTON_HEIGHT: 200,
  
  // Modal positions
  MODAL_CENTER_Y: 960,
  BOSS_IMAGE_Y_OFFSET: -200,
  MODAL_ELEMENT_OFFSETS: {
    WINNER: 100,
    SCORE: 200,
    MESSAGE: 280,
    RESTART: 350,
    NEXT: 450
  }
};

const COLORS = {
  // Health bar colors
  BLUE_HEALTH: ['#00ffff', '#00cccc'],
  RED_HEALTH: ['#ff69b4', '#e91e63'],
  HEALTH_BG: 0x1A0D40,
  
  // Text colors
  WHITE: '#ffffff',
  BLUE: '#4da6ff',
  RED: '#ff4d4d',
  GRAY: '#cccccc',
  DARK_GRAY: '#888888',
  BLACK: '#000000',
  GREEN: '#00ff00',
  ORANGE: '#ffaa44',
  WARNING_RED: '#ff4444',
  GOLD: '#FFD700',
  
  // Background colors
  DARK_BG: 0x1a1a1a,
  
  // Difficulty colors
  DIFFICULTY: {
    beginner: '#44ff44',
    easy: '#00ff00',
    medium: '#ffaa00',
    hard: '#ff0000',
    extreme: '#ff00ff',
    impossible: '#ff0000'
  },
  
  // Fire effect colors
  FIRE_GRADIENT: [0xff0000, 0xff4400, 0xff8800, 0xffaa00, 0xffdd00]
};

const FONTS = {
  PRIMARY: 'Commando',
  FALLBACK: 'Arial, sans-serif',
  SIZES: {
    TINY: '14px',
    SMALL: '16px',
    MEDIUM: '24px',
    LARGE: '32px',
    XLARGE: '48px',
    HUGE: '56px',
    GIANT: '80px',
    COUNTDOWN: '120px'
  }
};

const PHYSICS = {
  // Ball physics
  INITIAL_BALL_VELOCITY: 350,
  INITIAL_BALL_Y_VELOCITY: 700,
  MIN_BALL_SPEED: 400,
  BALL_BOOST_SPEED: 950,
  MAX_BALL_SPEED: 2000,
  BALL_DRAG: 0.002,
  
  // Hit effects
  PADDLE_HIT_BASE_SPEED: 120,
  PADDLE_HIT_MULTIPLIER: 1.03,
  PADDLE_HIT_ANGLE_DEGREES: 25,
  WALL_HIT_SPEED_BOOST: 200,
  WALL_HIT_MULTIPLIER: 1.08,
  WALL_HIT_MAX_BOOST: 600,
  WALL_BOUNCE_DAMPING: 0.98,
  
  // Movement smoothness
  BOT_SMOOTHNESS: 0.08,
  BOT_EMERGENCY_SMOOTHNESS: 0.15,
  PLAYER_SMOOTHNESS: 0.15,
  KEYBOARD_SMOOTHNESS: 0.25,
  TOUCH_SMOOTHNESS: 0.18,
  
  // Speeds
  KEYBOARD_ACCELERATION: 0.8,
  KEYBOARD_DAMPING: 0.85,
  MAX_KEYBOARD_SPEED: 12,
  MAX_TOUCH_SPEED: 22,
  MIN_TOUCH_SPEED: 8
};

const GAME_CONFIG = {
  // Health and scoring
  INITIAL_HEALTH: 100,
  HEALTH_DECREASE: 10,
  TIMER_BONUS_SECONDS: 15,
  
  // Timers
  GAME_TIMER: 180,
  TIMER_WARNING_THRESHOLD: 30,
  TIMER_CRITICAL_THRESHOLD: 60,
  TEST_TIMER: 10,
  COUNTDOWN_START: 3,
  COUNTDOWN_DELAY: 1000,
  
  // Sizes
  PADDLE_RADIUS: 35,
  PUCK_RADIUS: 50,
  BALL_SCALE: 0.5,
  PADDLE_SCALE: 1.0,
  BOSS_ANIMATION_SCALES: { normal: 1.0, large: 1.1, small: 0.9 }
};

const ANIMATIONS = {
  // Durations
  FLASH: 100,
  VERY_SHORT: 150,
  SHORT: 200,
  STANDARD: 300,
  MEDIUM: 400,
  MEDIUM_LONG: 500,
  LONG: 600,
  SLIDE: 800,
  ONE_SECOND: 1000,
  TWO_SECONDS: 2000,
  
  // Easing
  EASE_OUT: 'Power2.easeOut',
  QUAD_OUT: 'Quad.easeOut',
  QUAD_IN: 'Quad.easeIn',
  SINE_INOUT: 'Sine.easeInOut',
  BACK_OUT: 'Back.easeOut',
  BACK_INOUT: 'Back.easeInOut'
};

const DEPTHS = {
  BACKGROUND: -1,
  TRACE: 1,
  STATS_BG: 2,
  TEXT: 3,
  UI_ELEMENTS: 4,
  PARTICLES_LOW: 5,
  PARTICLES_HIGH: 9,
  EFFECTS: 13,
  BOSS_TAUNT: 20,
  HELP_OVERLAY: 90,
  MODAL: 100,
  WARNING: 110
};

const PADDING = {
  INDICATOR: { x: 8, y: 4 },
  BUTTON: { x: 20, y: 10 },
  LARGE_BUTTON: { x: 40, y: 15 }
};

export default class AirHockey extends Phaser.Scene {
  private createStatsText(x: number, y: number, text: string, config: {
    fontSize?: string,
    color?: string,
    fontFamily?: string,
    backgroundColor?: string,
    padding?: { x: number, y: number },
    stroke?: string,
    strokeThickness?: number,
    wordWrap?: { width: number },
    align?: string
  } = {}) {
    const defaultConfig = {
      fontFamily: 'Commando',
      fontSize: '24px',
      color: '#ffffff'
    };
    return this.add.text(x, y, text, { ...defaultConfig, ...config })
      .setOrigin(0.5, 0.5)
      .setDepth(3);
  }

  // private setupPaddleDrag(paddle: Phaser.GameObjects.Sprite, isPlayer: boolean) {
  //   const dragData = isPlayer ? {
  //     dragFlag: 'isDragging',
  //     dragStartX: 'dragStartX',
  //     dragStartY: 'dragStartY',
  //     paddleStartX: 'paddleStartX',
  //     paddleStartY: 'paddleStartY',
  //     minY: RINK.playerMinY,
  //     maxY: RINK.playerMaxY
  //   } : {
  //     dragFlag: 'isRedDragging',
  //     dragStartX: 'redDragStartX',
  //     dragStartY: 'redDragStartY',
  //     paddleStartX: 'redPaddleStartX',
  //     paddleStartY: 'redPaddleStartY',
  //     minY: RINK.botMinY,
  //     maxY: RINK.botMaxY
  //   };
  //   return dragData;
  // }

  private createPaddle(x: number, y: number, texture: string): Phaser.Physics.Arcade.Sprite {
    const paddle = this.physics.add.sprite(x, y, texture)
      .setScale(1)
      .setOrigin(0.5, 0.5)
      .setImmovable(true);
    
    const paddleTexture = this.textures.get(texture);
    const paddleFrame = paddleTexture.get(0);
    const circleRadius = 35;
    const offsetX = (paddleFrame.width / 2) - circleRadius;
    const offsetY = (paddleFrame.height / 2) - circleRadius;
    
    (paddle.body as Phaser.Physics.Arcade.Body).setCircle(circleRadius, offsetX, offsetY);
    (paddle.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
    
    paddle.setInteractive();
    this.input.setDraggable(paddle);
    
    return paddle;
  }


  private createMoveTween(target: any, x?: number, y?: number, duration = 300, options: any = {}) {
    const config: any = { targets: target, duration, ...options };
    if (x !== undefined) config.x = x;
    if (y !== undefined) config.y = y;
    return this.tweens.add(config);
  }

  private createButton(x: number, y: number, width: number, height: number, text: string, onClick: () => void, config: any = {}) {
    const defaultConfig = {
      bgColor: COLORS.GOLD,
      textColor: COLORS.BLACK,
      fontSize: FONTS.SIZES.XLARGE,
      depth: DEPTHS.UI_ELEMENTS
    };
    const finalConfig = { ...defaultConfig, ...config };
    
    const button = this.add.rectangle(x, y, width, height, Phaser.Display.Color.HexStringToColor(finalConfig.bgColor).color);
    button.setInteractive({ useHandCursor: true });
    button.setDepth(finalConfig.depth);
    
    const buttonText = this.createStatsText(x, y, text, {
      fontSize: finalConfig.fontSize,
      color: finalConfig.textColor
    });
    buttonText.setDepth(finalConfig.depth + 1);
    
    button.on('pointerdown', onClick);
    button.on('pointerover', () => {
      button.setScale(1.05);
      buttonText.setScale(1.05);
    });
    button.on('pointerout', () => {
      button.setScale(1);
      buttonText.setScale(1);
    });
    
    return { button, buttonText };
  }

  private createModal(width: number, height: number, bgColor: number = 0x000000, alpha: number = 0.8) {
    const overlay = this.add.rectangle(UI_CONFIG.CENTER_X, UI_CONFIG.MODAL_CENTER_Y, UI_CONFIG.SCREEN_WIDTH, UI_CONFIG.SCREEN_HEIGHT, 0x000000, 0.7);
    overlay.setDepth(DEPTHS.MODAL);
    
    const modal = this.add.rectangle(UI_CONFIG.CENTER_X, UI_CONFIG.MODAL_CENTER_Y, width, height, bgColor, alpha);
    modal.setDepth(DEPTHS.MODAL + 1);
    
    const container = this.add.container(0, 0);
    container.setDepth(DEPTHS.MODAL + 2);
    
    return { overlay, modal, container };
  }

  private createWarningText(text: string, y: number, duration = ANIMATIONS.TWO_SECONDS) {
    const warning = this.createStatsText(UI_CONFIG.CENTER_X, y, text, {
      fontSize: FONTS.SIZES.LARGE,
      color: COLORS.WARNING_RED
    });
    warning.setDepth(DEPTHS.WARNING);
    
    this.createMoveTween(warning, undefined, y - 80, duration, {
      alpha: 0,
      ease: ANIMATIONS.QUAD_OUT,
      onComplete: () => warning.destroy()
    });
    
    return warning;
  }

  private cleanupForRestart() {
    // Clean up timers
    if (this.timerEvent) {
      this.timerEvent.destroy();
      this.timerEvent = undefined;
    }
    
    // Clear saved game state
    this.savedGameState = undefined;
    
    // Destroy sliding help button if it exists
    if (this.slidingHelpButton) {
      this.slidingHelpButton.destroy();
      this.slidingHelpButton = undefined;
    }
    
    // Kill all tweens
    this.tweens.killAll();
    
    // Remove fire effects
    if (this.puckFireActive) {
      this.removeFireEffect();
    }
    
    // Clear ball trace
    this.ballTracePoints = [];
    if (this.traceGraphics) {
      this.traceGraphics.clear();
    }
    
    // Remove all input listeners
    this.input.removeAllListeners();
    this.touchControlsSetup = false;
    
    // Reset game state flags
    this.gamePaused = false;
    this.slidingHelpShown = false;
    this.miniGameUsed = false;
    this.gameStarted = false;
    this.countdownActive = false;
  }

  private rightHealth = GAME_CONFIG.INITIAL_HEALTH;
  private leftHealth = GAME_CONFIG.INITIAL_HEALTH;

  private botSmoothness = PHYSICS.BOT_SMOOTHNESS; 
  private botEmergencySmoothness = PHYSICS.BOT_EMERGENCY_SMOOTHNESS; 
  
  private botDifficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'extreme' | 'impossible' = 'extreme';
  private botMaxSpeed = PHYSICS.MAX_KEYBOARD_SPEED; 
  private botPredictionAccuracy = 0.7; 
  private botErrorMargin = 20; 
  private botAttackThreshold = 0.6; 
  
  private botCounterAttackChance = 0.4; 
  
  private botState: 'defend' | 'attack' | 'wait' | 'recover' = 'defend';
  private botHomePosition = { x: RINK.centerX, y: RINK.botMinY + 200 }; 
  private botLastMissTime = 0; 

  private PADDLE_HIT_BASE_SPEED_INCREASE = PHYSICS.PADDLE_HIT_BASE_SPEED; 
  private PADDLE_HIT_SPEED_MULTIPLIER = PHYSICS.PADDLE_HIT_MULTIPLIER; 
  private MAX_BALL_SPEED = PHYSICS.MAX_BALL_SPEED; 
  private PADDLE_HIT_ANGLE_INFLUENCE_DEGREES = PHYSICS.PADDLE_HIT_ANGLE_DEGREES; 

  private MIN_BALL_SPEED_THRESHOLD = PHYSICS.MIN_BALL_SPEED; 
  private BALL_BOOST_SPEED = PHYSICS.BALL_BOOST_SPEED;         
  
  private WALL_HIT_SPEED_BOOST = PHYSICS.WALL_HIT_SPEED_BOOST; 
  private WALL_HIT_SPEED_MULTIPLIER = PHYSICS.WALL_HIT_MULTIPLIER; 
  private WALL_HIT_MAX_BOOST = PHYSICS.WALL_HIT_MAX_BOOST; 

  private ball!: Phaser.Physics.Arcade.Sprite;
  private paddleLeft!: Phaser.Physics.Arcade.Sprite;
  private paddleRight!: Phaser.Physics.Arcade.Sprite;

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
  

  private playingAreaBackground!: Phaser.GameObjects.GameObject;
  private statsBackground!: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
  private blueStatsBackground!: Phaser.GameObjects.Rectangle;
  private redStatsBackground!: Phaser.GameObjects.Rectangle;

  private puckhit!: Phaser.Sound.BaseSound;
  private goal!: Phaser.Sound.BaseSound;
  private wall!: Phaser.Sound.BaseSound;
  private cheer!: Phaser.Sound.BaseSound;
  private music!: Phaser.Sound.BaseSound;

  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyUp!: Phaser.Input.Keyboard.Key;
  private keyDown!: Phaser.Input.Keyboard.Key;
  private keyLeft!: Phaser.Input.Keyboard.Key;
  private keyRight!: Phaser.Input.Keyboard.Key;

  private isDragging = false;
  private isTouchMoving = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private paddleStartX = 0;
  private paddleStartY = 0;
  private touchControlsSetup = false;
  
  private playerSmoothness = PHYSICS.PLAYER_SMOOTHNESS; 
  private keyboardVelocityX = 0; 
  private keyboardVelocityY = 0; 
  private keyboardAcceleration = PHYSICS.KEYBOARD_ACCELERATION; 
  private keyboardDamping = PHYSICS.KEYBOARD_DAMPING; 

  private isRedDragging = false;
  private redDragStartX = 0;
  private redDragStartY = 0;
  private redPaddleStartX = 0;
  private redPaddleStartY = 0;

  private lastInputTime = 0;
  private lastInputType: 'none' | 'keyboard' | 'touch' | 'drag' | 'gamepad' = 'none';
  private inputSwitchCooldown = 100; 

  private playAreaBottom = UI_CONFIG.PLAY_AREA_HEIGHT;
  private playAreaCenter = UI_CONFIG.PLAY_AREA_HEIGHT / 2;
  
  private statsAreaCenter = UI_CONFIG.STATS_CENTER_Y;

  private paddleLeftTargetX = RINK.centerX;
  private paddleLeftTargetY = RINK.playerMinY + 100;
  private inputMode: 'none' | 'keyboard' | 'touch' | 'drag' | 'gamepad' = 'none';
  private lastWallSfx = 0;

  private targetTouchX?: number;
  private targetTouchY?: number;

  private gameTimer = GAME_CONFIG.GAME_TIMER; 
  private timerText!: Phaser.GameObjects.Text;
  private timerEvent?: Phaser.Time.TimerEvent;
  
  private slidingHelpButton?: Phaser.GameObjects.Container;
  private slidingHelpShown = false;
  private miniGameUsed = false; 
  
  private gamePaused = false;
  private storedBallVelocityX = 0;
  private storedBallVelocityY = 0;
  
  private savedGameState?: GameState;
  
  private puckFireActive = false;
  private fireEffectGraphics?: Phaser.GameObjects.Graphics;
  private fireParticles: Phaser.GameObjects.GameObject[] = [];

  private countdownText?: Phaser.GameObjects.Text;
  private countdownValue = GAME_CONFIG.COUNTDOWN_START;
  private countdownActive = false;
  private gameStarted = false;

  private paddleLeftPrevX = RINK.centerX;
  private paddleLeftPrevY = RINK.playerMinY + 100;
  private paddleRightPrevX = RINK.centerX;
  private paddleRightPrevY = RINK.botMaxY - 100;

  private ballTracePoints: Array<{x: number, y: number, time: number}> = [];
  private traceGraphics!: Phaser.GameObjects.Graphics;
  private readonly MAX_TRACE_POINTS = 15; 
  private readonly TRACE_LIFETIME = 300; 
  private readonly TRACE_MIN_DISTANCE = 8; 

  private gamepadConnected = false;
  private gamepad?: Phaser.Input.Gamepad.Gamepad;
  private gamepadThreshold = 0.2; 
  private gamepadVelocityX = 0;
  private gamepadVelocityY = 0;
  private gamepadAcceleration = 0.8;
  private gamepadDamping = 0.85;
  private gamepadDeadzone = 0.1;

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
    
    this.load.on('filecomplete', () => {
    });
    
    this.load.on('loaderror', () => {
    });
    
    this.load.image('airhockey-background', "assets/airhockey/airhockey-background.svg");
    this.load.image('puck', 'assets/airhockey/wizball.png');
    this.load.image('blue-paddle', 'assets/characters/player.png');
    this.load.image('red-paddle', 'assets/characters/boss-field2.png');
    this.load.image("boss-field1", "assets/characters/boss-field1.png");
    this.load.image("boss-field2", "assets/characters/boss-field2.png");
    this.load.image("boss-bg1", "assets/background/boss1.png");
    this.load.image("boss-bg2", "assets/background/boss2.png");
    this.load.image("stats-boss1", "assets/characters/boss-btm-1.png");
    this.load.image("stats-boss2", "assets/characters/boss-btm-2.png");
    
    this.load.image("help-icon", "assets/airhockey/help.svg");
    this.load.image("net", "assets/airhockey/net.svg");

  }

  create(data?: { miniGameResult?: boolean; resumeGame?: boolean }) {
    
    // Clear any lingering saved state on fresh start
    if (!data?.resumeGame) {
      this.savedGameState = undefined;
      this.slidingHelpShown = false;
      this.miniGameUsed = false;
      this.gamePaused = false;
      
      // Destroy any existing sliding help button
      if (this.slidingHelpButton) {
        this.slidingHelpButton.destroy();
        this.slidingHelpButton = undefined;
      }
      
      // Clear any existing tweens
      this.tweens.killAll();
      
      // Clear any existing timers
      if (this.timerEvent) {
        this.timerEvent.destroy();
        this.timerEvent = undefined;
      }
    }
    
    if (data?.resumeGame && this.savedGameState) {
      this.restoreGameState(data.miniGameResult || false);
      return;
    }
    
    this.input.gamepad?.on('connected', (pad: Phaser.Input.Gamepad.Gamepad) => {
      this.gamepadConnected = true;
      this.gamepad = pad;
    });

    this.input.gamepad?.on('disconnected', () => {
      this.gamepadConnected = false;
      this.gamepad = undefined;
      
      this.gamepadVelocityX = 0;
      this.gamepadVelocityY = 0;
      
      if (this.inputMode === 'gamepad') {
        this.inputMode = 'none';
        this.lastInputType = 'none';
      }
    });
    
    if (this.input.gamepad?.total) {
      this.gamepad = this.input.gamepad.getPad(0);
      this.gamepadConnected = true;
    }
    
    this.rightHealth = 100;
    this.leftHealth = 100;
     
    this.gameTimer = 180; 
    
    this.win = undefined;
    this.gameRestart = undefined;

    this.countdownValue = 3;
    this.countdownActive = false;
    this.gameStarted = false;

    this.slidingHelpShown = false;
    if (this.slidingHelpButton) {
      this.slidingHelpButton.destroy();
      this.slidingHelpButton = undefined;
    }
    
    this.miniGameUsed = false;
    
    this.puckFireActive = false;
    if (this.fireEffectGraphics) {
      this.fireEffectGraphics.destroy();
      this.fireEffectGraphics = undefined;
    }
    this.fireParticles.forEach(particle => particle.destroy());
    this.fireParticles = [];
    
    this.gamePaused = false;
    this.storedBallVelocityX = 0;
    this.storedBallVelocityY = 0;
    
    this.savedGameState = undefined;

    this.physics.world.setBounds(0, 0, UI_CONFIG.SCREEN_WIDTH, UI_CONFIG.PLAY_AREA_HEIGHT);
    this.physics.world.setBoundsCollision(true, true, true, true);

    this.playingAreaBackground = this.add.image(UI_CONFIG.CENTER_X, this.playAreaCenter, 'airhockey-background')
      .setDisplaySize(UI_CONFIG.SCREEN_WIDTH, UI_CONFIG.PLAY_AREA_HEIGHT);
    const statsBoss = this.selectedCharacter === 'boss1' ? 'stats-boss1' : 'stats-boss2';
    
    // Check if texture exists before creating image
    if (this.textures && this.textures.exists(statsBoss)) {
      this.statsBackground = this.add.image(UI_CONFIG.CENTER_X, this.statsAreaCenter, statsBoss);
      this.statsBackground.setDisplaySize(UI_CONFIG.SCREEN_WIDTH, UI_CONFIG.STATS_BG_HEIGHT);
      this.statsBackground.setOrigin(0.5, 0.5);
      this.statsBackground.setDepth(DEPTHS.UI_ELEMENTS);
    } else {
      // Create a placeholder rectangle if texture isn't ready
      this.statsBackground = this.add.rectangle(UI_CONFIG.CENTER_X, this.statsAreaCenter, UI_CONFIG.SCREEN_WIDTH, UI_CONFIG.STATS_BG_HEIGHT, 0x222222);
      this.statsBackground.setDepth(DEPTHS.UI_ELEMENTS);
      
      // Try to load the texture after a delay
      this.time.delayedCall(100, () => {
        if (this.textures && this.textures.exists(statsBoss)) {
          this.statsBackground.destroy();
          this.statsBackground = this.add.image(UI_CONFIG.CENTER_X, this.statsAreaCenter, statsBoss);
          this.statsBackground.setDisplaySize(UI_CONFIG.SCREEN_WIDTH, UI_CONFIG.STATS_BG_HEIGHT);
          this.statsBackground.setOrigin(0.5, 0.5);
          this.statsBackground.setDepth(DEPTHS.UI_ELEMENTS);
        }
      });
    }

    this.blueStatsBackground = this.add.rectangle(UI_CONFIG.BLUE_STATS_X, this.statsAreaCenter, UI_CONFIG.STATS_BG_WIDTH, UI_CONFIG.STATS_BG_HEIGHT, COLORS.DARK_BG, 0.8);
    this.blueStatsBackground.depth = DEPTHS.STATS_BG;
    this.redStatsBackground = this.add.rectangle(UI_CONFIG.RED_STATS_X, this.statsAreaCenter, UI_CONFIG.STATS_BG_WIDTH, UI_CONFIG.STATS_BG_HEIGHT, COLORS.DARK_BG, 0.8);
    this.redStatsBackground.depth = DEPTHS.STATS_BG;

    this.title = this.createStatsText(UI_CONFIG.CENTER_X, UI_CONFIG.TITLE_Y, 'AIR HOCKEY', {
      fontSize: FONTS.SIZES.HUGE
    }).setOrigin(0.5, 0);

    this.blueHealthLabel = this.createStatsText(UI_CONFIG.BLUE_HEALTH_X, UI_CONFIG.HEALTH_LABEL_Y, 'Blue Health:', {
      color: COLORS.BLUE
    }).setOrigin(0, 0.5);

    this.blueHealthBar = this.add.graphics();
    this.blueHealthBar.depth = DEPTHS.UI_ELEMENTS;

    this.redHealthLabel = this.createStatsText(UI_CONFIG.RED_HEALTH_X, UI_CONFIG.HEALTH_LABEL_Y, this.characterName, {
      color: COLORS.RED
    }).setOrigin(1, 0.5);

    this.redHealthBar = this.add.graphics();
    this.redHealthBar.depth = DEPTHS.UI_ELEMENTS;

    this.gameInfo = this.createStatsText(UI_CONFIG.CENTER_X, UI_CONFIG.GAME_INFO_Y, 'Controls: Drag paddles directly OR tap/click to move OR use WASD keys OR gamepad\nBlue paddle: bottom half only - ESC: menu, R: restart, T: test timer (10s), F: test fire effect\nBot Difficulty: Q = BEGINNER, 1 = Easy, 2 = Medium, 3 = Hard, 4 = EXTREME, 5 = IMPOSSIBLE', {
      fontSize: FONTS.SIZES.SMALL,
      color: COLORS.GRAY,
      wordWrap: { width: 1000 },
      align: 'center'
    });

    this.inputModeIndicator = this.createStatsText(UI_CONFIG.BLUE_STATS_X, UI_CONFIG.INDICATORS_Y, 'Input: None', {
      fontSize: FONTS.SIZES.TINY,
      color: COLORS.DARK_GRAY,
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: PADDING.INDICATOR
    });
    
    this.botStateIndicator = this.createStatsText(UI_CONFIG.CENTER_X, UI_CONFIG.INDICATORS_Y, 'Bot: Defend', {
      fontSize: FONTS.SIZES.TINY,
      color: '#ff8888',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: PADDING.INDICATOR
    });
    
    this.botDifficultyIndicator = this.createStatsText(UI_CONFIG.RED_STATS_X, UI_CONFIG.INDICATORS_Y, 'Difficulty: Medium', {
      fontSize: FONTS.SIZES.TINY,
      color: COLORS.ORANGE,
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: PADDING.INDICATOR
    });

    this.timerText = this.createStatsText(UI_CONFIG.CENTER_X, UI_CONFIG.TIMER_Y, this.formatTime(this.gameTimer), {
      fontSize: FONTS.SIZES.XLARGE,
      color: COLORS.WHITE,
      stroke: COLORS.BLACK,
      strokeThickness: 4
    });
    this.timerText.setDepth(DEPTHS.UI_ELEMENTS);

    this.createStatsText(UI_CONFIG.CENTER_X, UI_CONFIG.TIME_LABEL_Y, 'TIME REMAINING', {
      color: COLORS.GRAY
    });

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

    this.ball = this.physics.add.sprite(RINK.centerX, RINK.centerY, 'puck')
      .setScale(GAME_CONFIG.BALL_SCALE)
      .setOrigin(0.5, 0.5) 
      .setCircle(RINK.puckRadius, (this.textures.get('puck').get(0).width / 2) - RINK.puckRadius, 
                                 (this.textures.get('puck').get(0).height / 2) - RINK.puckRadius) 
      .setBounce(1.0)
      .setCollideWorldBounds(true)
      .setMaxVelocity(this.MAX_BALL_SPEED);

    this.ball.setVelocity(0, 0);
    this.ball.setDamping(true).setDrag(PHYSICS.BALL_DRAG);

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

    this.paddleLeft = this.createPaddle(RINK.centerX, RINK.playerMinY + 100, 'blue-paddle');
    this.paddleRight = this.createPaddle(RINK.centerX, RINK.botMaxY - 100, 'red-paddle');
    
    // Load selected character after paddles are created
    this.getSelectedCharacter();
    
    this.physics.add.collider(this.ball, this.paddleLeft, (ball, paddle) => this.onPaddleHit(ball as Phaser.Physics.Arcade.Sprite, paddle as Phaser.Physics.Arcade.Sprite), undefined, this);
    this.physics.add.collider(this.ball, this.paddleRight, (ball, paddle) => this.onPaddleHit(ball as Phaser.Physics.Arcade.Sprite, paddle as Phaser.Physics.Arcade.Sprite), undefined, this);

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

    this.input.keyboard?.on('keydown-ESC', () => {
      
      if (this.slidingHelpButton && this.gamePaused) {
        
        const warningText = this.add.text(RINK.centerX, RINK.centerY + 100, 'YOU MUST ENTER THE MINI-GAME!', {
          fontFamily: 'Commando',
          fontSize: '28px',
          color: '#ff0000',
          stroke: '#000000',
          strokeThickness: 4
        });
        warningText.setOrigin(0.5, 0.5);
        warningText.setDepth(110);
        
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
      
      this.scene.start('MainMenu');
    });

    this.input.keyboard?.on('keydown-R', () => {
      if (this.timerEvent) {
        this.timerEvent.destroy();
        this.timerEvent = undefined;
      }
      this.input.removeAllListeners();
      this.touchControlsSetup = false;
      this.scene.restart();
    });

    this.input.keyboard?.on('keydown-T', () => {
      this.gameTimer = 10;
      this.timerText.setText(this.formatTime(this.gameTimer));
      this.timerText.setColor('#ff4444'); 
    });

    const difficultyKeys: Record<string, { 
      difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'extreme' | 'impossible',
      display: string,
      taunt: 'pathetic' | 'weak' | 'average' | 'powerful' | 'enraged' | 'godlike'
    }> = {
      'Q': { difficulty: 'beginner', display: 'BEGINNER', taunt: 'pathetic' },
      'ONE': { difficulty: 'easy', display: 'Easy', taunt: 'weak' },
      'TWO': { difficulty: 'medium', display: 'Medium', taunt: 'average' },
      'THREE': { difficulty: 'hard', display: 'Hard', taunt: 'powerful' },
      'FOUR': { difficulty: 'extreme', display: 'EXTREME', taunt: 'enraged' },
      'FIVE': { difficulty: 'impossible', display: 'IMPOSSIBLE', taunt: 'godlike' }
    };

    Object.entries(difficultyKeys).forEach(([key, config]) => {
      this.input.keyboard?.on(`keydown-${key}`, () => {
        this.setBotDifficulty(config.difficulty);
        this.showDifficultyChange(config.display);
        this.playBossTaunt(config.taunt);
      });
    });
    
    this.input.keyboard?.on('keydown-F', () => {
      if (this.puckFireActive) {
        this.removeFireEffect();
      } else {
        this.activateFireEffect();
      }
    });

    this.setupTouchControls();
    this.updateHealthBars(); 
    this.setBotDifficulty(this.botDifficulty); 
    this.startCountdown();
  }

  update() {
    const lbody = this.paddleLeft.body as Phaser.Physics.Arcade.Body;

    this.storePreviousPositions();

    if (this.gameStarted && !this.countdownActive && !this.gamePaused) {
      if (!this.isRedDragging && (!this.win && !this.gameRestart)) {
        this.updateBotAI();
      }

      const currentVelocity = this.ball.body!.velocity.length();
      if (currentVelocity < this.MIN_BALL_SPEED_THRESHOLD && currentVelocity > 0 && (!this.win && !this.gameRestart)) {
        const normalizedVelocity = this.ball.body!.velocity.clone().normalize();
        (this.ball.body as Phaser.Physics.Arcade.Body).setVelocity(normalizedVelocity.x * this.BALL_BOOST_SPEED, normalizedVelocity.y * this.BALL_BOOST_SPEED);
      }

      const puckTop = this.ball.y - RINK.puckRadius;
      const puckBottom = this.ball.y + RINK.puckRadius;

      if (puckTop <= RINK.topGoalY && (!this.win && !this.gameRestart)) {
        this.handleGoal(true);
      } else if (puckBottom >= RINK.bottomGoalY && (!this.win && !this.gameRestart)) {
        this.handleGoal(false);
      }
    }
    
    if (!this.win && !this.gameRestart && !this.gamePaused) {
        this.updateInputState();
        this.applyPaddleMovement(lbody);
    }

    if (!this.gamePaused) {
      this.updateBallTrace();
    }
    
    if (!this.gamePaused && this.puckFireActive) {
      this.updateFireEffect();
    }

    this.updateInputModeIndicator();
    this.updateBotStateIndicator();

    if (false && (!this.win && !this.gameRestart) && this.gameStarted && !this.countdownActive && !this.gamePaused) {
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
    
    const hadFireEffect = this.puckFireActive;
    
    if (this.puckFireActive) {
      this.removeFireEffect();
    }
    
    if (playerScored && hadFireEffect) {
      
      this.rightHealth = 0;
      this.leftHealth = Math.max(this.leftHealth, 1); 
      
      this.createFireGoalEffect();
    } else {
      
      if (playerScored) {
        this.rightHealth -= 10;
        
        this.triggerHealthLossBlink('red');
      } else {
        this.leftHealth -= 10;
        
        this.triggerHealthLossBlink('blue');
        
        if (this.leftHealth <= 10 && !this.slidingHelpShown && !this.miniGameUsed && !this.win && !this.gameRestart) {
          this.showSlidingHelpButton();
        }
      }
    }
    
    this.updateHealthBars();

    this.ball.body!.stop();
    this.ball.setPosition(RINK.centerX, RINK.centerY);
    this.ball.setVelocity(0, playerScored ? 350 : -350);

    this.ballTracePoints = [];
    if (this.traceGraphics) {
      this.traceGraphics.clear();
    }

    const blueStartX = RINK.centerX;
    const blueStartY = RINK.playerMinY + 100;
    const redStartX = RINK.centerX;
    const redStartY = RINK.botMaxY - 100;

    this.paddleLeft.setPosition(blueStartX, blueStartY);
    (this.paddleLeft.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
    
    this.paddleRight.setPosition(redStartX, redStartY);
    (this.paddleRight.body as Phaser.Physics.Arcade.Body).updateFromGameObject();

    this.paddleLeftTargetX = blueStartX;
    this.paddleLeftTargetY = blueStartY;

    this.isDragging = false;
    this.isRedDragging = false;
    this.isTouchMoving = false;
    
    this.targetTouchX = undefined;
    this.targetTouchY = undefined;
    
    this.inputMode = 'none';
    this.lastInputType = 'none';
    this.lastInputTime = 0;

    this.paddleLeftPrevX = blueStartX;
    this.paddleLeftPrevY = blueStartY;
    this.paddleRightPrevX = redStartX;
    this.paddleRightPrevY = redStartY;

    this.createPaddleResetEffect(this.paddleLeft);
    this.createPaddleResetEffect(this.paddleRight);

    if (this.rightHealth <= 0 || this.leftHealth <= 0) {
      
      if (this.timerEvent) {
        this.timerEvent.destroy();
        this.timerEvent = undefined;
      }

      this.music.pause();
      this.cheer.play();

      if (this.win) this.win.destroy();
      if (this.gameRestart) this.gameRestart.destroy();
      
      const winnerText = this.leftHealth <=0 ? 'RED WINS!!!!!' : 'BLUE WINS!!!!';
      const isRedWinner = this.leftHealth <= 0;

      this.showEndGameModal(isRedWinner, winnerText);

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

    this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
      if (this.win || this.gameRestart) return;
      
      const currentTime = this.time.now;
      
      if (gameObject === this.paddleLeft) {
        
        this.clearOtherInputStates('drag');
        
        this.isDragging = true;
        this.isTouchMoving = false;
        this.dragStartX = pointer.x;
        this.dragStartY = pointer.y;
        this.paddleStartX = this.paddleLeft.x;
        this.paddleStartY = this.paddleLeft.y;
        
        this.paddleLeftTargetX = this.paddleLeft.x;
        this.paddleLeftTargetY = this.paddleLeft.y;
        
        this.lastInputTime = currentTime;
        this.lastInputType = 'drag';
        
      } else if (gameObject === this.paddleRight) {
        this.isRedDragging = true;
        this.redDragStartX = pointer.x;
        this.redDragStartY = pointer.y;
        this.redPaddleStartX = this.paddleRight.x;
        this.redPaddleStartY = this.paddleRight.y;
        
      }
    });

    this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
      if (this.win || this.gameRestart) return;
      
      if (gameObject === this.paddleLeft && this.isDragging) {
        const deltaX = pointer.x - this.dragStartX;
        const deltaY = pointer.y - this.dragStartY;
        let newX = this.paddleStartX + deltaX;
        let newY = this.paddleStartY + deltaY;
        
        newX = Math.max(RINK.minX, Math.min(RINK.maxX, newX));
        newY = Math.max(RINK.playerMinY, Math.min(RINK.playerMaxY, newY));
        
        this.paddleLeft.setPosition(newX, newY);
        (this.paddleLeft.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
        
        this.lastInputTime = this.time.now;
      } else if (gameObject === this.paddleRight && this.isRedDragging) {
        const deltaX = pointer.x - this.redDragStartX;
        const deltaY = pointer.y - this.redDragStartY;
        let newX = this.redPaddleStartX + deltaX;
        let newY = this.redPaddleStartY + deltaY;
        
        newX = Math.max(RINK.minX, Math.min(RINK.maxX, newX));
        newY = Math.max(RINK.botMinY, Math.min(RINK.botMaxY, newY));
        
        this.paddleRight.setPosition(newX, newY);
        (this.paddleRight.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
      }
    });

    this.input.on('dragend', (gameObject: Phaser.GameObjects.GameObject) => {
      if (gameObject === this.paddleLeft) {
        this.isDragging = false;
        
        this.paddleLeftTargetX = this.paddleLeft.x;
        this.paddleLeftTargetY = this.paddleLeft.y;
        
      } else if (gameObject === this.paddleRight) {
        this.isRedDragging = false;
      }
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.win || this.gameRestart) return;
      
      const currentTime = this.time.now;
      const timeSinceLastInput = currentTime - this.lastInputTime;
      
      if (pointer.y > RINK.centerY && !this.isDragging && !this.isTouchMoving && 
          (this.lastInputType !== 'keyboard' || timeSinceLastInput > this.inputSwitchCooldown)) {
        
        const paddleDistance = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.paddleLeft.x, this.paddleLeft.y);
        const paddleRadius = (this.paddleLeft.body as Phaser.Physics.Arcade.Body).radius;
        
        if (paddleDistance > paddleRadius + 30) {
          
          this.clearOtherInputStates('touch');
          
          let targetY = pointer.y;
          if (pointer.y > this.playAreaBottom) {
            targetY = RINK.playerMaxY - 50;
          }
          
          this.targetTouchX = Math.max(RINK.minX, Math.min(RINK.maxX, pointer.x));
          this.targetTouchY = Math.max(RINK.playerMinY, Math.min(RINK.playerMaxY, targetY));
          this.isTouchMoving = true;
          
          this.lastInputTime = currentTime;
          this.lastInputType = 'touch';
          
        }
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.win || this.gameRestart) return;
      
      if (pointer.isDown && pointer.y > RINK.centerY && !this.isDragging && this.isTouchMoving) {
        let targetY = pointer.y;
        if (pointer.y > this.playAreaBottom) {
          targetY = RINK.playerMaxY - 50;
        }
        
        this.targetTouchX = Math.max(RINK.minX, Math.min(RINK.maxX, pointer.x));
        this.targetTouchY = Math.max(RINK.playerMinY, Math.min(RINK.playerMaxY, targetY));
        
        this.lastInputTime = this.time.now;
      }
    });

    this.input.on('pointerup', () => {
      
      if (!this.isDragging) {
        if (this.isTouchMoving) {
        }
        this.isTouchMoving = false;
        this.targetTouchX = undefined;
        this.targetTouchY = undefined;
      }
    });
  }

  private updateBotAI() {
    const rbody = this.paddleRight.body as Phaser.Physics.Arcade.Body;
    const ballX = this.ball.x;
    const ballY = this.ball.y;
    const ballVelX = this.ball.body!.velocity.x;
    const ballVelY = this.ball.body!.velocity.y;
    const ballSpeed = this.ball.body!.velocity.length();
    const paddleX = this.paddleRight.x;
    const paddleY = this.paddleRight.y;
    
    const distanceToBall = Phaser.Math.Distance.Between(paddleX, paddleY, ballX, ballY);
    
    const predictedPosition = this.predictPuckPosition(ballX, ballY, ballVelX, ballVelY);
    
    this.updateBotState(ballY, ballVelY, distanceToBall, ballSpeed);
    
    const safeMinX = RINK.minX + rbody.radius;
    const safeMaxX = RINK.maxX - rbody.radius;
    const safeMinY = RINK.botMinY + rbody.radius;
    const safeMaxY = RINK.botMaxY - rbody.radius;
    
    let targetX = this.botHomePosition.x;
    let targetY = this.botHomePosition.y;
    let movementSpeed = this.botSmoothness;
    
    switch (this.botState) {
      case 'defend':
        
        const defenseResult = this.calculateDefensivePosition(predictedPosition, paddleX, paddleY);
        targetX = defenseResult.x;
        targetY = defenseResult.y;
        movementSpeed = defenseResult.urgency ? this.botEmergencySmoothness : this.botSmoothness;
        break;
        
      case 'attack':
        
        const attackResult = this.calculateAttackPosition(ballX, ballY, ballVelX, ballVelY);
        targetX = attackResult.x;
        targetY = attackResult.y;
        movementSpeed = this.botEmergencySmoothness; 
        break;
        
      case 'wait':
        
        if (distanceToBall > 300) {
          targetX = this.botHomePosition.x;
          targetY = this.botHomePosition.y;
        } else {
          
          targetX = ballX;
          targetY = this.botHomePosition.y;
        }
        movementSpeed = this.botSmoothness * 0.5; 
        break;
        
      case 'recover':
        
        targetX = this.botHomePosition.x;
        targetY = this.botHomePosition.y;
        movementSpeed = this.botEmergencySmoothness * 1.2; 
        break;
    }
    
    if (distanceToBall < 80) {
      
      movementSpeed *= 0.6; 
    } else if (distanceToBall < 150) {
      
      movementSpeed *= 0.8;
    }
    
    const difficultyAdjustment = this.applyDifficultySettings(targetX, targetY, movementSpeed);
    targetX = difficultyAdjustment.x;
    targetY = difficultyAdjustment.y;
    movementSpeed = difficultyAdjustment.speed;
    
    if (paddleX <= RINK.minX + rbody.radius + 10) {
      targetX = Math.max(targetX, RINK.minX + rbody.radius + 20);
    } else if (paddleX >= RINK.maxX - rbody.radius - 10) {
      targetX = Math.min(targetX, RINK.maxX - rbody.radius - 20);
    }
    
    if (targetY < RINK.botMinY + 80) {
      targetY = Math.max(targetY, RINK.botMinY + 80);
    }
    
    targetX = Math.max(safeMinX, Math.min(safeMaxX, targetX));
    targetY = Math.max(safeMinY, Math.min(safeMaxY, targetY));
    
    const currentX = this.paddleRight.x;
    const currentY = this.paddleRight.y;
    
    const deltaX = targetX - currentX;
    const deltaY = targetY - currentY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > 1) { 
      
      const normalizedX = deltaX / distance;
      const normalizedY = deltaY / distance;
      
      const moveSpeed = Math.min(this.botMaxSpeed * movementSpeed, distance);
      
      const newX = currentX + normalizedX * moveSpeed;
      const newY = currentY + normalizedY * moveSpeed;
      
      this.paddleRight.setPosition(newX, newY);
    }
    
    rbody.updateFromGameObject();
  }
  
  private predictPuckPosition(x: number, y: number, velX: number, velY: number): {x: number, y: number} {
    
    const baseTime = this.botDifficulty === 'extreme' ? 0.8 : 
                     this.botDifficulty === 'hard' ? 0.6 : 0.5;
    const predictionTime = baseTime * this.botPredictionAccuracy;
    
    let predictedX = x;
    let predictedY = y;
    let currentVelX = velX;
    let currentVelY = velY;
    
    const simulationSteps = this.botDifficulty === 'extreme' ? 5 : 
                           this.botDifficulty === 'hard' ? 3 : 1;
    const timeStep = predictionTime / simulationSteps;
    
    for (let step = 0; step < simulationSteps; step++) {
      
      let nextX = predictedX + currentVelX * timeStep;
      let nextY = predictedY + currentVelY * timeStep;
      
      if (nextX <= RINK.minX) {
        nextX = RINK.minX;
        currentVelX = -currentVelX * 0.98; 
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
      
      currentVelX *= 0.998;
      currentVelY *= 0.998;
      
      predictedX = nextX;
      predictedY = nextY;
    }
    
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
    
    switch (this.botDifficulty) {
      case 'beginner':
        
        if (this.botState === 'recover' && currentTime - this.botLastMissTime < 800) {
          return; 
        }
        if (this.botState === 'recover' && currentTime - this.botLastMissTime >= 800) {
          this.botState = 'defend'; 
        }
        this.updateBeginnerAIState(ballY, ballVelY, distance, ballSpeed);
        break;
        
      case 'impossible':
        
        this.updateImpossibleAIState(ballY, ballVelY, distance, ballSpeed);
        return; 
        
      case 'extreme':
        
        if (this.botState === 'recover' && currentTime - this.botLastMissTime < 800) {
          return; 
        }
        if (this.botState === 'recover' && currentTime - this.botLastMissTime >= 800) {
          this.botState = 'defend'; 
        }
        this.updateExtremeAIState(ballY, ballVelY, distance, ballSpeed);
        break;
        
      default: 
        
        if (this.botState === 'recover' && currentTime - this.botLastMissTime < 800) {
          return; 
        }
        if (this.botState === 'recover' && currentTime - this.botLastMissTime >= 800) {
          this.botState = 'defend'; 
        }
        this.updateStandardAIState(ballY, ballVelY, distance, ballSpeed);
        break;
    }
    
    const paddleY = this.paddleRight.y;
    const paddleX = this.paddleRight.x;
    const ballX = this.ball.x;
    
    if (ballY < paddleY - 80 && Math.abs(ballX - paddleX) > 120 && this.botState !== 'recover') {
      this.botLastMissTime = currentTime;
      this.botState = 'recover';
    }
  }
  
  private updateBeginnerAIState(ballY: number, _ballVelY: number, _distance: number, _ballSpeed: number) {
    
    if (Math.random() < 0.3) {
      this.botState = 'wait';
      return;
    }
    
    if (ballY > RINK.centerY) {
      
      this.botState = 'wait';
    } else {
      
      if (Math.random() < 0.8) {
        
        this.botState = 'defend';
      } else {
        
        this.botState = 'attack';
      }
    }
    
    if (Math.random() < 0.1) {
      this.botState = 'recover';
    }
  }
  
  private updateImpossibleAIState(ballY: number, ballVelY: number, distance: number, ballSpeed: number) {
    
    const playerX = this.paddleLeft.x;
    
    if (ballVelY < 0 && ballY > RINK.botMinY + 50) {
      
      this.botState = 'attack';
      return;
    }
    
    if (distance < 150 && ballY < RINK.centerY + 100) {
      this.botState = 'attack';
      return;
    }
    
    if (ballY < RINK.centerY && ballVelY > -100) {
      this.botState = 'attack';
      return;
    }
    
    const playerDistanceFromBall = Math.abs(playerX - this.ball.x);
    if (playerDistanceFromBall > 120 && ballY > RINK.centerY + 50) {
      
      this.botState = 'attack';
      return;
    }
    
    if (ballSpeed < 300) {
      this.botState = 'attack';
      return;
    }
    
    if (ballY > RINK.centerY + 200 && ballVelY > 200) {
      this.botState = 'defend';
    } else {
      
      this.botState = 'attack';
    }
  }
  
  private updateExtremeAIState(ballY: number, ballVelY: number, distance: number, ballSpeed: number) {
    const playerX = this.paddleLeft.x;
    
    const ballInBotTerritory = ballY < RINK.centerY;
    const ballMovingToBot = ballVelY < 0;
    const ballMovingToPlayer = ballVelY > 0;
    const isCloseRange = distance < 120;
    const isMediumRange = distance < 250;
    const playerOutOfPosition = Math.abs(playerX - this.ball.x) > 100;
    const ballNearGoal = ballY < RINK.botMinY + 150;
    
    const counterAttackOpportunity = ballMovingToPlayer && ballY > RINK.centerY && 
                                   playerOutOfPosition && Math.random() < this.botCounterAttackChance;
    
    if (counterAttackOpportunity) {
      
      this.botState = 'attack';
    } else if (ballNearGoal && (ballMovingToBot || isCloseRange)) {
      
      this.botState = 'defend';
    } else if (ballInBotTerritory && isCloseRange && ballSpeed < 500) {
      
      this.botState = 'attack';
    } else if (ballInBotTerritory && isMediumRange && ballMovingToBot) {
      
      if (Math.random() < this.botAttackThreshold) {
        this.botState = 'attack';
      } else {
        this.botState = 'defend';
      }
    } else if (ballY > RINK.centerY + 200 && ballMovingToPlayer) {
      
      this.botState = 'wait';
    } else {
      
      this.botState = 'defend';
    }
  }
  
  private updateStandardAIState(ballY: number, ballVelY: number, distance: number, ballSpeed: number) {
    
    if (ballY > RINK.centerY + 100 && ballVelY > 0) {
      
      this.botState = 'wait';
    } else if (ballY < RINK.centerY && (ballVelY < -50 || distance < 200)) {
      
      if (distance < 150 && ballSpeed < 400 && Math.random() < this.botAttackThreshold) {
        
        this.botState = 'attack';
      } else {
        
        this.botState = 'defend';
      }
    } else {
      
      this.botState = 'defend';
    }
  }
  
  private calculateDefensivePosition(predicted: {x: number, y: number}, _paddleX: number, _paddleY: number): {x: number, y: number, urgency: boolean} {
    
    const goalCenterX = RINK.centerX;
    const ballY = this.ball.y;
    const ballSpeed = this.ball.body!.velocity.length();
    
    let targetX = predicted.x;
    let targetY = this.botHomePosition.y;
    
    if (Math.abs(predicted.x - goalCenterX) < 200) {
      targetX = predicted.x;
      targetY = Math.max(predicted.y - 100, this.botHomePosition.y);
    } else {
      
      targetX = goalCenterX + (predicted.x - goalCenterX) * 0.7; 
      targetY = this.botHomePosition.y;
    }
    
    targetX = Math.max(RINK.minX + 50, Math.min(RINK.maxX - 50, targetX));
    targetY = Math.max(RINK.botMinY + 100, Math.min(RINK.botMaxY - 50, targetY));
    
    const urgency = ballY < RINK.botMinY + 250 || ballSpeed > 600;
    
    return { x: targetX, y: targetY, urgency };
  }
  
  private calculateAttackPosition(ballX: number, ballY: number, ballVelX: number, ballVelY: number): {x: number, y: number} {
    
    let targetGoalX = RINK.centerX;
    let targetGoalY = RINK.bottomGoalY;
    
    if (this.botDifficulty === 'extreme' || this.botDifficulty === 'impossible') {
      
      const playerX = this.paddleLeft.x;
      
      if (playerX > RINK.centerX + 80) {
        targetGoalX = RINK.centerX - 100; 
      } else if (playerX < RINK.centerX - 80) {
        targetGoalX = RINK.centerX + 100; 
      } else {
        
        targetGoalX = RINK.centerX + (Math.random() - 0.5) * 80;
      }
    } else {
      
      const randomness = this.botDifficulty === 'hard' ? 60 : 
                        this.botDifficulty === 'medium' ? 100 : 150;
      targetGoalX = RINK.centerX + (Math.random() - 0.5) * randomness;
    }
    
    const desiredAngle = Phaser.Math.Angle.Between(ballX, ballY, targetGoalX, targetGoalY);
    
    const strikeDistance = 45; 
    
    let targetX = ballX - Math.cos(desiredAngle) * strikeDistance;
    let targetY = ballY - Math.sin(desiredAngle) * strikeDistance;
    
    if (this.botDifficulty === 'extreme' || this.botDifficulty === 'impossible') {
      const ballSpeed = Math.sqrt(ballVelX * ballVelX + ballVelY * ballVelY);
      if (ballSpeed > 200) {
        
        const leadTime = 0.15; 
        targetX += ballVelX * leadTime;
        targetY += ballVelY * leadTime;
      }
    }
    
    return { x: targetX, y: targetY };
  }
  
  private applyDifficultySettings(targetX: number, targetY: number, speed: number): {x: number, y: number, speed: number} {
    
    let adjustedX = targetX;
    let adjustedY = targetY;
    let adjustedSpeed = speed;
    
    switch (this.botDifficulty) {
      case 'beginner':
        
        adjustedX += (Math.random() - 0.5) * this.botErrorMargin * 8; 
        adjustedY += (Math.random() - 0.5) * this.botErrorMargin * 6; 
        
        adjustedSpeed *= 0.2;
        
        if (Math.random() < 0.4) {
          adjustedX += (Math.random() - 0.5) * 300; 
        }
        
        if (Math.random() < 0.2) {
          adjustedSpeed = 0;
        }
        break;
        
      case 'easy':
        
        adjustedX += (Math.random() - 0.5) * this.botErrorMargin * 2;
        adjustedY += (Math.random() - 0.5) * this.botErrorMargin;
        
        adjustedSpeed *= 0.6;
        break;
        
      case 'medium':
        
        adjustedX += (Math.random() - 0.5) * this.botErrorMargin;
        adjustedY += (Math.random() - 0.5) * this.botErrorMargin * 0.5;
        
        adjustedSpeed *= 0.8;
        break;
        
      case 'hard':
        
        adjustedX += (Math.random() - 0.5) * this.botErrorMargin * 0.3;
        
        adjustedSpeed *= 1.0;
        break;
        
      case 'extreme':
        
        adjustedX += (Math.random() - 0.5) * this.botErrorMargin * 0.1; 
        
        adjustedSpeed *= 1.1; 
        
        if (this.botState === 'attack') {
          
          adjustedSpeed *= 1.15; 
        }
        break;
        
      case 'impossible':
        
        adjustedSpeed *= 1.5; 
        
        if (this.botState === 'attack') {
          
          adjustedSpeed *= 2.0; 
        } else if (this.botState === 'defend') {
          
          adjustedSpeed *= 1.8; 
        }
        
        const playerX = this.paddleLeft.x;
        // const playerY = this.paddleLeft.y;
        const playerPrevX = this.paddleLeftPrevX;
        // const playerPrevY = this.paddleLeftPrevY;
        
        const playerVelX = playerX - playerPrevX;
        // const playerVelY = playerY - playerPrevY;
        
        if (Math.abs(playerVelX) > 2) {
          adjustedX += playerVelX * 3; 
        }
        
        break;
    }
    
    return { x: adjustedX, y: adjustedY, speed: adjustedSpeed };
  }
  
  private setBotDifficulty(difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'extreme' | 'impossible') {
    this.botDifficulty = difficulty;
    
    switch (difficulty) {
      case 'beginner':
        this.botMaxSpeed = 3; 
        this.botPredictionAccuracy = 0.1; 
        this.botErrorMargin = 80; 
        this.botAttackThreshold = 0.1; 
        this.botCounterAttackChance = 0.0; 
        break;
        
      case 'easy':
        this.botMaxSpeed = 6; 
        this.botPredictionAccuracy = 0.4;
        this.botErrorMargin = 40; 
        this.botAttackThreshold = 0.3;
        this.botCounterAttackChance = 0.2;
        break;
        
      case 'medium':
        this.botMaxSpeed = 9; 
        this.botPredictionAccuracy = 0.7;
        this.botErrorMargin = 20; 
        this.botAttackThreshold = 0.6;
        this.botCounterAttackChance = 0.4;
        break;
        
      case 'hard':
        this.botMaxSpeed = 12; 
        this.botPredictionAccuracy = 0.9;
        this.botErrorMargin = 10; 
        this.botAttackThreshold = 0.8;
        this.botCounterAttackChance = 0.6;
        break;
        
      case 'extreme':
        this.botMaxSpeed = 14; 
        this.botPredictionAccuracy = 0.95; 
        this.botErrorMargin = 5; 
        this.botAttackThreshold = 0.75; 
        this.botCounterAttackChance = 0.5; 
        break;
        
      case 'impossible':
        this.botMaxSpeed = 25; 
        this.botPredictionAccuracy = 1.0; 
        this.botErrorMargin = 0; 
        this.botAttackThreshold = 1.0; 
        this.botCounterAttackChance = 1.0; 
        break;
    }
    
  }
  
  private updateHealthBars() {
    // Calculate positions to center the health bars under their labels with the new 400px width
    // Blue health bar: center it under the "Blue Health:" label
    const blueHealthX = UI_CONFIG.BLUE_HEALTH_X - (UI_CONFIG.HEALTH_BAR_WIDTH / 4);
    // Red health bar: center it under the character name label (right-aligned)
    const redHealthX = UI_CONFIG.RED_HEALTH_X - UI_CONFIG.HEALTH_BAR_WIDTH + (UI_CONFIG.HEALTH_BAR_WIDTH / 4);
    
    this.updateHealthBar(this.blueHealthBar, this.leftHealth, blueHealthX, UI_CONFIG.HEALTH_BAR_Y, '#00ffff', '#00cccc', false, false);
    
    this.updateHealthBar(this.redHealthBar, this.rightHealth, redHealthX, UI_CONFIG.HEALTH_BAR_Y, '#ff69b4', '#e91e63', true, true);
  }

  private triggerHealthLossBlink(player: 'blue' | 'red') {
    const targetBackground = player === 'blue' ? this.blueStatsBackground : this.redStatsBackground;
    const originalColor = 0x1a1a1a; 
    const originalAlpha = 0.8;
    
    this.tweens.killTweensOf(targetBackground);
    
    this.tweens.add({
      targets: targetBackground,
      fillColor: 0xff3333, 
      alpha: 0.95,
      duration: 120,
      ease: 'Quad.easeOut',
      onComplete: () => {
        
        this.tweens.add({
          targets: targetBackground,
          fillColor: 0xaa1111, 
          alpha: 0.9,
          duration: 200,
          ease: 'Sine.easeInOut',
          onComplete: () => {
            
            this.tweens.add({
              targets: targetBackground,
              fillColor: originalColor,
              alpha: originalAlpha,
              duration: 400,
              ease: 'Quad.easeIn',
              onComplete: () => {
                
                targetBackground.setFillStyle(originalColor, originalAlpha);
              }
            });
          }
        });
      }
    });

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

    const overlayEffect = this.add.rectangle(
      targetBackground.x, 
      targetBackground.y, 
      targetBackground.width, 
      targetBackground.height, 
      0xffffff, 
      0.3
    );
    overlayEffect.setDepth(DEPTHS.EFFECTS);
    
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
    
    const barWidth = UI_CONFIG.HEALTH_BAR_WIDTH;
    const barHeight = UI_CONFIG.HEALTH_BAR_HEIGHT;
    const skewAmount = barHeight * 0.1; 
    const borderWidth = 2;
    
    const healthPercent = Math.max(0, health / 100);
    const progressWidth = (barWidth - borderWidth) * healthPercent;
    
    let borderPoints;
    if (reverse) {
      
      borderPoints = [
        new Phaser.Math.Vector2(x + skewAmount, y - barHeight/2),               
        new Phaser.Math.Vector2(x + barWidth, y - barHeight/2),                 
        new Phaser.Math.Vector2(x + barWidth, y + barHeight/2),                 
        new Phaser.Math.Vector2(x, y + barHeight/2)                             
      ];
    } else {
      
      borderPoints = [
        new Phaser.Math.Vector2(x, y - barHeight/2),                            
        new Phaser.Math.Vector2(x + barWidth, y - barHeight/2),                 
        new Phaser.Math.Vector2(x + barWidth - skewAmount, y + barHeight/2),    
        new Phaser.Math.Vector2(x - skewAmount, y + barHeight/2)                
      ];
    }
    
    healthBar.lineStyle(borderWidth, 0x000000, 1);
    healthBar.strokePoints(borderPoints, true, true);
    
    healthBar.lineStyle(borderWidth/2, 0xFFFFFF, 0.3);
    healthBar.strokePoints(borderPoints, true, true);
    
    healthBar.fillStyle(0x1A0D40, 1);
    healthBar.fillPoints(borderPoints, true);
    
    if (progressWidth > 0) {
      
      let progressX;
      if (fillFromRight) {
        
        progressX = reverse ? x + barWidth - progressWidth + skewAmount + borderWidth/2 : x + barWidth - progressWidth + borderWidth/2;
      } else {
        
        progressX = reverse ? x + skewAmount + borderWidth/2 : x + borderWidth/2;
      }
      
      const midY = y;
      
      healthBar.fillStyle(Phaser.Display.Color.HexStringToColor(topColor).color, 1);
      
      let topProgressPoints;
      if (reverse) {
        topProgressPoints = [
          new Phaser.Math.Vector2(progressX, y - barHeight/2 + borderWidth/2),  
          new Phaser.Math.Vector2(progressX + progressWidth, y - barHeight/2 + borderWidth/2),  
          new Phaser.Math.Vector2(progressX + progressWidth - skewAmount/2, midY),  
          new Phaser.Math.Vector2(progressX - skewAmount/2, midY)  
        ];
      } else {
        topProgressPoints = [
          new Phaser.Math.Vector2(progressX, y - barHeight/2 + borderWidth/2),  
          new Phaser.Math.Vector2(progressX + progressWidth, y - barHeight/2 + borderWidth/2),  
          new Phaser.Math.Vector2(progressX + progressWidth - skewAmount/2, midY),  
          new Phaser.Math.Vector2(progressX - skewAmount/2, midY)  
        ];
      }
      
      healthBar.fillPoints(topProgressPoints, true);
      
      healthBar.fillStyle(Phaser.Display.Color.HexStringToColor(bottomColor).color, 1);
      
      let bottomProgressPoints;
      if (reverse) {
        bottomProgressPoints = [
          new Phaser.Math.Vector2(progressX - skewAmount/2, midY),  
          new Phaser.Math.Vector2(progressX + progressWidth - skewAmount/2, midY),  
          new Phaser.Math.Vector2(progressX + progressWidth, y + barHeight/2 - borderWidth/2),  
          new Phaser.Math.Vector2(progressX, y + barHeight/2 - borderWidth/2)  
        ];
      } else {
        bottomProgressPoints = [
          new Phaser.Math.Vector2(progressX - skewAmount/2, midY),  
          new Phaser.Math.Vector2(progressX + progressWidth - skewAmount/2, midY),  
          new Phaser.Math.Vector2(progressX + progressWidth - skewAmount, y + barHeight/2 - borderWidth/2),  
          new Phaser.Math.Vector2(progressX - skewAmount, y + barHeight/2 - borderWidth/2)  
        ];
      }
      
      healthBar.fillPoints(bottomProgressPoints, true);
      
      if (progressWidth > 30) {
        const streakWidth = 20;
        let whiteStreakX;
        
        if (fillFromRight) {
          
          whiteStreakX = progressX;
        } else {
          
          whiteStreakX = progressX + progressWidth - streakWidth;
        }
        
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

    let paddleVelX = 0;
    let paddleVelY = 0;
    
    if (paddle === this.paddleLeft) {
      paddleVelX = paddle.x - this.paddleLeftPrevX;
      paddleVelY = paddle.y - this.paddleLeftPrevY;
    } else {
      paddleVelX = paddle.x - this.paddleRightPrevX;
      paddleVelY = paddle.y - this.paddleRightPrevY;
    }

    const paddleSpeed = Math.sqrt(paddleVelX * paddleVelX + paddleVelY * paddleVelY);
    const impactForceMultiplier = 1 + (paddleSpeed * 1.5); 
    
    const currentSpeed = ball.body!.velocity.length();
    let newSpeed = currentSpeed * this.PADDLE_HIT_SPEED_MULTIPLIER + this.PADDLE_HIT_BASE_SPEED_INCREASE;
    
    newSpeed *= impactForceMultiplier;
    
    if (paddleSpeed > 8) {
      const powerBonus = (paddleSpeed - 8) * 25; 
      newSpeed += powerBonus;
    }
    
    newSpeed = Math.min(newSpeed, this.MAX_BALL_SPEED);

    let reflectionAngle = Phaser.Math.Angle.Between(paddle.x, paddle.y, ball.x, ball.y);

    const hitOffset = (ball.x - paddle.x) / (paddle.body as Phaser.Physics.Arcade.Body).radius;
    const clampedHitOffset = Math.max(-1, Math.min(1, hitOffset)); 
    reflectionAngle += clampedHitOffset * Phaser.Math.DEG_TO_RAD * this.PADDLE_HIT_ANGLE_INFLUENCE_DEGREES;

    const velocityInfluence = paddle === this.paddleLeft ? 20 : 18; 
    const ballVelX = Math.cos(reflectionAngle) * newSpeed + paddleVelX * velocityInfluence;
    const ballVelY = Math.sin(reflectionAngle) * newSpeed + paddleVelY * velocityInfluence;
    
    const finalSpeed = Math.sqrt(ballVelX * ballVelX + ballVelY * ballVelY);
    if (finalSpeed > this.MAX_BALL_SPEED) {
      const scale = this.MAX_BALL_SPEED / finalSpeed;
      (ball.body as Phaser.Physics.Arcade.Body).setVelocity(ballVelX * scale, ballVelY * scale);
    } else {
      (ball.body as Phaser.Physics.Arcade.Body).setVelocity(ballVelX, ballVelY);
    }

    this.createImpactEffect(ball.x, ball.y, impactForceMultiplier);
    
    if (impactForceMultiplier > 3) {
      this.cameras.main.shake(100, 0.02);
    }
    
  }

  private updateInputState() {
    const currentTime = this.time.now;
    const timeSinceLastInput = currentTime - this.lastInputTime;
    
    const keyboardActive = this.keyA.isDown || this.keyD.isDown || this.keyW.isDown || this.keyS.isDown;
    
    const gamepadActive = this.checkGamepadActivity();
    
    if (this.isDragging) {
      
      this.clearOtherInputStates('drag');
      this.inputMode = 'drag';
      this.lastInputType = 'drag';
      this.lastInputTime = currentTime;
    } 
    else if (this.isTouchMoving && this.targetTouchX !== undefined && this.targetTouchY !== undefined) {
      
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
      
      const cooldownMultiplier = this.lastInputType === 'drag' ? 4 : 2;
      if (timeSinceLastInput > this.inputSwitchCooldown * cooldownMultiplier) {
        this.inputMode = 'none';
        this.lastInputType = 'none';
      }
    }
  }

  private clearOtherInputStates(activeInputType: 'drag' | 'touch' | 'keyboard' | 'gamepad') {
    if (activeInputType !== 'touch') {
      this.isTouchMoving = false;
      this.targetTouchX = undefined;
      this.targetTouchY = undefined;
    }
    if (activeInputType !== 'keyboard') {
      this.keyboardVelocityX = 0;
      this.keyboardVelocityY = 0;
    }
    if (activeInputType !== 'gamepad') {
      this.gamepadVelocityX = 0;
      this.gamepadVelocityY = 0;
    }
  }

  private handleTouchInput() {
    const currentX = this.paddleLeft.x;
    const currentY = this.paddleLeft.y;
    
    const deltaX = this.targetTouchX! - currentX;
    const deltaY = this.targetTouchY! - currentY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    const maxTouchSpeed = 22;
    const minTouchSpeed = 8;
    
    let touchSpeed = Math.min(maxTouchSpeed, Math.max(minTouchSpeed, distance * 0.15));
    
    if (distance > 2) {
      const moveX = (deltaX / distance) * touchSpeed;
      const moveY = (deltaY / distance) * touchSpeed;
      
      this.paddleLeftTargetX = currentX + moveX;
      this.paddleLeftTargetY = currentY + moveY;
    } else {
      
      this.paddleLeftTargetX = this.targetTouchX!;
      this.paddleLeftTargetY = this.targetTouchY!;
    }
  }

  private handleKeyboardInput() {
    const maxKeyboardSpeed = 12; 
    let inputX = 0;
    let inputY = 0;
    
    if (this.keyA.isDown) inputX -= 1;
    if (this.keyD.isDown) inputX += 1;
    if (this.keyW.isDown) inputY -= 1;
    if (this.keyS.isDown) inputY += 1;
    
    if (inputX !== 0) {
      this.keyboardVelocityX += inputX * this.keyboardAcceleration;
      this.keyboardVelocityX = Math.max(-maxKeyboardSpeed, Math.min(maxKeyboardSpeed, this.keyboardVelocityX));
    } else {
      this.keyboardVelocityX *= this.keyboardDamping; 
      if (Math.abs(this.keyboardVelocityX) < 0.1) this.keyboardVelocityX = 0;
    }
    
    if (inputY !== 0) {
      this.keyboardVelocityY += inputY * this.keyboardAcceleration;
      this.keyboardVelocityY = Math.max(-maxKeyboardSpeed, Math.min(maxKeyboardSpeed, this.keyboardVelocityY));
    } else {
      this.keyboardVelocityY *= this.keyboardDamping; 
      if (Math.abs(this.keyboardVelocityY) < 0.1) this.keyboardVelocityY = 0;
    }
    
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
        color = '#4da6ff'; 
        break;
      case 'touch':
        text += 'Touch/Tap';
        color = '#00ff88'; 
        break;
      case 'keyboard':
        text += 'Keyboard (WASD)';
        color = '#ffaa44'; 
        break;
      case 'gamepad':
        text += 'Gamepad';
        color = '#ff44ff'; 
        break;
      default:
        text += 'None';
        color = '#888888'; 
        break;
    }
    
    if (this.gamepadConnected && this.gamepad) {
      text += this.inputMode === 'gamepad' ? ` (${this.gamepad.id.substring(0, 15)}...)` : '';
    }
    
    this.inputModeIndicator.setText(text);
    this.inputModeIndicator.setColor(color);
  }
  
  private updateBotStateIndicator() {
    if (!this.botStateIndicator || !this.botDifficultyIndicator) return;
    
    const config = BOT_STATE_CONFIG[this.botState];
    this.botStateIndicator.setText(`Boss: ${config.text}`);
    this.botStateIndicator.setColor(config.color);
    this.updateBossAnimation(this.botState);
    
    let diffText = 'Difficulty: ';
    let diffColor = '#888888';
    
    switch (this.botDifficulty) {
      case 'beginner':
        diffText += 'PATHETIC';
        diffColor = '#44ff44'; 
        break;
      case 'easy':
        diffText += 'Weak';
        diffColor = '#00ff00'; 
        break;
      case 'medium':
        diffText += 'Average';
        diffColor = '#ffaa00'; 
        break;
      case 'hard':
        diffText += 'Powerful';
        diffColor = '#ff0000'; 
        break;
      case 'extreme':
        diffText += 'ENRAGED';
        diffColor = '#ff00ff'; 
        break;
      case 'impossible':
        diffText += 'GODLIKE';
        diffColor = '#ff0000'; 
        break;
    }
    
    this.botDifficultyIndicator.setText(diffText);
    this.botDifficultyIndicator.setColor(diffColor);
  }

  private applyPaddleMovement(lbody: Phaser.Physics.Arcade.Body) {
    
    if (this.inputMode !== 'drag') {
      const constrainedX = Math.max(RINK.minX, Math.min(RINK.maxX, this.paddleLeftTargetX));
      const constrainedY = Math.max(RINK.playerMinY, Math.min(RINK.playerMaxY, this.paddleLeftTargetY));
      
      const currentX = this.paddleLeft.x;
      const currentY = this.paddleLeft.y;
      
      const deltaX = constrainedX - currentX;
      const deltaY = constrainedY - currentY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance > 0.5) {
        
        let smoothness = this.playerSmoothness;
        
        if (this.inputMode === 'keyboard') {
          
          smoothness = 0.25;
        } else if (this.inputMode === 'touch') {
          
          smoothness = 0.18;
        }
        
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
    
    if (this.timerEvent) {
      this.timerEvent.destroy();
    }

    this.timerEvent = this.time.addEvent({
      delay: 1000, 
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
  }

  private updateTimer() {
    if (this.gameTimer > 0 && !this.win && !this.gameRestart && !this.gamePaused) {
      this.gameTimer--;
      this.timerText.setText(this.formatTime(this.gameTimer));
      
      if (this.gameTimer <= 30) {
        this.timerText.setColor('#ff4444'); 
      } else if (this.gameTimer <= 60) {
        this.timerText.setColor('#ffaa44'); 
      }
      
      if (this.gameTimer <= 10 && !this.slidingHelpShown && !this.miniGameUsed && !this.win && !this.gameRestart) {
        this.showSlidingHelpButton();
      }
      
      if (this.gameTimer <= 0) {
        this.handleTimeUp();
      }
    }
  }

  private handleTimeUp() {
    
    if (this.timerEvent) {
      this.timerEvent.destroy();
      this.timerEvent = undefined;
    }

    let winnerText: string;    let isRedWinner: boolean;
    
    if (this.leftHealth > this.rightHealth) {
      winnerText = 'BLUE WINS BY TIME!';      isRedWinner = false;
    } else if (this.rightHealth > this.leftHealth) {
      winnerText = 'RED WINS BY TIME!';      isRedWinner = true;
    } else {
      winnerText = 'TIME UP - TIE GAME!';      isRedWinner = false; 
    }

    this.music.pause();
    this.cheer.play();

    if (this.win) this.win.destroy();
    if (this.gameRestart) this.gameRestart.destroy();

    this.showEndGameModal(isRedWinner, winnerText);

    this.ball.body!.stop();
    const leftBody = this.paddleLeft.body as Phaser.Physics.Arcade.Body;
    const rightBody = this.paddleRight.body as Phaser.Physics.Arcade.Body;
    leftBody.setVelocity(0, 0);
    rightBody.setVelocity(0, 0);
  }

  private startCountdown() {
    this.countdownActive = true;
    this.countdownValue = 3;
    
    this.countdownText = this.add.text(RINK.centerX, RINK.centerY, '3', {
      fontFamily: 'Commando',
      fontSize: '120px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 8
    });
    this.countdownText.setOrigin(0.5, 0.5);
    this.countdownText.setDepth(15);

    this.time.addEvent({
      delay: 1000, 
      callback: this.updateCountdown,
      callbackScope: this,
      repeat: 3 
    });
  }

  private updateCountdown() {
    if (!this.countdownText) return;

    this.countdownValue--;
    
    if (this.countdownValue > 0) {
      
      this.countdownText.setText(this.countdownValue.toString());
      this.countdownText.setColor('#ffffff');
    } else if (this.countdownValue === 0) {
      
      this.countdownText.setText('GO!');
      this.countdownText.setColor('#00ff00');
    } else {
      
      this.countdownText.destroy();
      this.countdownText = undefined;
      this.countdownActive = false;
      this.gameStarted = true;
      
      this.ball.setVelocity(0, 700);
      
      this.startGameTimer();
      
    }
  }

  private storePreviousPositions() {
    
    this.paddleLeftPrevX = this.paddleLeft.x;
    this.paddleLeftPrevY = this.paddleLeft.y;
    this.paddleRightPrevX = this.paddleRight.x;
    this.paddleRightPrevY = this.paddleRight.y;
  }

  private updateBallTrace() {
    if (!this.ball || !this.traceGraphics) return;

    const currentTime = this.time.now;
    const ballY = this.ball.y;
    const ballSpeed = this.ball.body!.velocity.length();

    if (ballSpeed > 50 && this.gameStarted && !this.countdownActive) {
      
      const lastPoint = this.ballTracePoints[this.ballTracePoints.length - 1];
      if (!lastPoint || 
          Phaser.Math.Distance.Between(this.ball.x, ballY, lastPoint.x, lastPoint.y) >= this.TRACE_MIN_DISTANCE) {
        
        this.ballTracePoints.push({
          x: this.ball.x,
          y: ballY,
          time: currentTime
        });

        if (this.ballTracePoints.length > this.MAX_TRACE_POINTS) {
          this.ballTracePoints.shift();
        }
      }
    }

    this.ballTracePoints = this.ballTracePoints.filter(point => 
      currentTime - point.time < this.TRACE_LIFETIME
    );

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
    
    const speedRatio = Math.min(ballSpeed / this.MAX_BALL_SPEED, 1);
    let baseColor: number;
    let traceIntensity: number;
    
    if (speedRatio > 0.8) {
      baseColor = 0xff0000; 
      traceIntensity = 1.2;
    } else if (speedRatio > 0.6) {
      baseColor = 0xff4444; 
      traceIntensity = 1.0;
    } else if (speedRatio > 0.4) {
      baseColor = 0xffaa44; 
      traceIntensity = 0.8;
    } else if (speedRatio > 0.2) {
      baseColor = 0x44aaff; 
      traceIntensity = 0.6;
    } else {
      baseColor = 0x88bbff; 
      traceIntensity = 0.4;
    }

    for (let i = 1; i < this.ballTracePoints.length; i++) {
      const prevPoint = this.ballTracePoints[i - 1];
      const currentPoint = this.ballTracePoints[i];
      
      const age = currentTime - currentPoint.time;
      const ageAlpha = 1 - (age / this.TRACE_LIFETIME);
      const positionAlpha = i / this.ballTracePoints.length;
      const alpha = ageAlpha * positionAlpha * traceIntensity; 
      
      const baseWidth = speedRatio > 0.6 ? RINK.puckRadius * 0.4 : RINK.puckRadius * 0.3;
      const lineWidth = Math.max(1, baseWidth * positionAlpha);
      
      if (alpha > 0.1) { 
        this.traceGraphics.lineStyle(lineWidth, baseColor, alpha);
        this.traceGraphics.beginPath();
        this.traceGraphics.moveTo(prevPoint.x, prevPoint.y);
        this.traceGraphics.lineTo(currentPoint.x, currentPoint.y);
        this.traceGraphics.strokePath();
        
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
    
    const baseEffectSize = RINK.puckRadius * 0.8; 
    const effectSize = Math.min(baseEffectSize + (impactForce * RINK.puckRadius * 0.4), RINK.puckRadius * 3); 
    
    let effectColor: number;
    if (impactForce > 4) {
      effectColor = 0xff0000; 
    } else if (impactForce > 2.5) {
      effectColor = 0xff4444; 
    } else if (impactForce > 1.5) {
      effectColor = 0xffaa00; 
    } else {
      effectColor = 0xffffff; 
    }
    
    const impactCircle = this.add.circle(x, y, effectSize, effectColor, 0.7);
    impactCircle.setDepth(8);
    
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

    if (impactForce > 1.5) {
      const particleCount = Math.min(Math.floor(impactForce * 6), 16); 
      const particleSize = RINK.puckRadius * 0.15; 
      const burstDistance = RINK.puckRadius * (1.5 + impactForce * 0.3); 
      
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
    
    const paddleColor = paddle === this.paddleLeft ? 0x4da6ff : 0xff4d4d; 
    const effectRadius = 50;
    
    const resetRing = this.add.circle(paddle.x, paddle.y, 10, paddleColor, 0.8);
    resetRing.setDepth(9);
    resetRing.setStrokeStyle(3, paddleColor, 1);
    
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
    
    let textColor = '#00ff00'; 
    let effectColor = 0x00ff00;
    let bossText = '';
    
    switch (difficulty) {
      case 'BEGINNER':
        textColor = '#44ff44'; 
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
        textColor = '#ff00ff'; 
        effectColor = 0xff00ff;
        bossText = 'BOSS: ENRAGED MODE';
        break;
      case 'IMPOSSIBLE':
        textColor = '#ff0000'; 
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
    
    if (difficulty === 'EXTREME') {
      
      this.tweens.add({
        targets: difficultyText,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        yoyo: true,
        repeat: 3,
        ease: 'Sine.easeInOut'
      });
      
      const warningText = this.add.text(RINK.centerX, RINK.centerY - 140, 'WARNING: MAXIMUM DIFFICULTY!', {
        fontFamily: 'Commando',
        fontSize: '24px',
        color: '#ff4444',
        stroke: '#000000',
        strokeThickness: 3
      });
      warningText.setOrigin(0.5, 0.5);
      warningText.setDepth(15);
      
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
      
      const flashOverlay = this.add.rectangle(UI_CONFIG.CENTER_X, UI_CONFIG.SCREEN_HEIGHT / 2, UI_CONFIG.SCREEN_WIDTH, UI_CONFIG.SCREEN_HEIGHT, 0xff0000, 0.3);
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
      
      this.tweens.add({
        targets: difficultyText,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 150,
        yoyo: true,
        repeat: 5,
        ease: 'Back.easeInOut'
      });
      
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
      
      this.tweens.add({
        targets: [warningText1, warningText2],
        alpha: 0.3,
        duration: 200,
        yoyo: true,
        repeat: 6,
        ease: 'Power2'
      });
    }
    
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
    
    this.paddleRight.setTint(effectColor);
    
    this.time.delayedCall(difficulty === 'EXTREME' ? 1000 : 500, () => {
      this.paddleRight.clearTint();
    });
  }

  private onWallHit() {
    
    const currentSpeed = this.ball.body!.velocity.length();
    
    if (this.botDifficulty !== 'beginner' && Math.random() > 0.5) {
      this.paddleRight.setTint(0xffdddd);
      this.time.delayedCall(200, () => {
        this.updateBossAnimation(this.botState);
      });
    }
    
    let speedBoost = this.WALL_HIT_SPEED_BOOST;
    
    if (currentSpeed > 1200) {
      speedBoost *= 2.5; 
    } else if (currentSpeed > 800) {
      speedBoost *= 2.0; 
    } else if (currentSpeed > 500) {
      speedBoost *= 1.5; 
    }
    
    speedBoost = Math.min(speedBoost, this.WALL_HIT_MAX_BOOST);
    
    let newSpeed = currentSpeed * this.WALL_HIT_SPEED_MULTIPLIER + speedBoost;
    
    if (Math.random() < 0.15) { 
      newSpeed *= 1.3;
    }
    
    newSpeed = Math.min(newSpeed, this.MAX_BALL_SPEED);
    
    if (currentSpeed > 0) {
      const currentVelocity = this.ball.body!.velocity;
      const normalizedVelocity = currentVelocity.clone().normalize();
      
      (this.ball.body as Phaser.Physics.Arcade.Body).setVelocity(
        normalizedVelocity.x * newSpeed,
        normalizedVelocity.y * newSpeed
      );
    }
    
    this.createWallHitEffect(currentSpeed, newSpeed);
    
  }
  
  private createWallHitEffect(currentSpeed: number, newSpeed: number) {
    const ballY = this.ball.y;
    const speedIncrease = newSpeed - currentSpeed;
    
    let wallX = this.ball.x;
    let wallY = ballY;
    
    if (this.ball.x <= RINK.minX + RINK.puckRadius) {
      wallX = RINK.minX; 
    } else if (this.ball.x >= RINK.maxX - RINK.puckRadius) {
      wallX = RINK.maxX; 
    }
    
    if (ballY <= RINK.topGoalY + RINK.puckRadius) {
      wallY = RINK.topGoalY; 
    } else if (ballY >= RINK.bottomGoalY - RINK.puckRadius) {
      wallY = RINK.bottomGoalY; 
    }
    
    const sparkCount = Math.min(8 + Math.floor(speedIncrease / 50), 20); 
    let effectColor = 0xffaa00; 
    
    if (speedIncrease > 400) {
      effectColor = 0xff0000; 
    } else if (speedIncrease > 250) {
      effectColor = 0xff4444; 
    } else if (speedIncrease > 150) {
      effectColor = 0xffaa00; 
    }
    
    for (let i = 0; i < sparkCount; i++) {
      const angle = (i / sparkCount) * Math.PI * 2;
      const distance = 30 + Math.random() * 50 + (speedIncrease / 10); 
      
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
    
    if (speedIncrease > 300) {
      this.cameras.main.shake(150, 0.025); 
    } else if (speedIncrease > 150) {
      this.cameras.main.shake(100, 0.02); 
    } else if (newSpeed > 1000) {
      this.cameras.main.shake(80, 0.015); 
    }
  }

  private showSlidingHelpButton() {
    if (this.slidingHelpShown || this.slidingHelpButton) return;
    
    this.slidingHelpShown = true;
    
    this.pauseGame();
    
    const darkOverlay = this.add.rectangle(UI_CONFIG.CENTER_X, UI_CONFIG.SCREEN_HEIGHT / 2, UI_CONFIG.SCREEN_WIDTH, UI_CONFIG.SCREEN_HEIGHT, 0x000000, 0.5);
    darkOverlay.setDepth(90); 
    
    this.slidingHelpButton = this.add.container(-400, RINK.centerY);
    this.slidingHelpButton.setDepth(100); 
    this.slidingHelpButton.setScale(1.5); 
    
    const buttonBg = this.add.rectangle(0, 0, 400, 200, 0x483d99, 0);
    
    const helpIcon = this.add.image(0, 0,"help-icon");
    helpIcon.setScale(0.3);
    helpIcon.setOrigin(0.5, 0.5);
    
    const pulseEffect = this.add.circle(0, 0, 45, 0x00ffff, 0.3);
    
    this.slidingHelpButton.add([pulseEffect, buttonBg, helpIcon]);
    
    this.slidingHelpButton.setSize(400, 200);
    this.slidingHelpButton.setInteractive({
      useHandCursor: true  
    });
    
    this.slidingHelpButton.on('pointerdown', () => {
      
      this.resumeGame();
      
      this.enterMiniGame();
    });
    
    this.slidingHelpButton.on('pointerover', () => {
    });
    
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
    
    const bgClickArea = this.add.rectangle(UI_CONFIG.CENTER_X, UI_CONFIG.SCREEN_HEIGHT / 2, UI_CONFIG.SCREEN_WIDTH, UI_CONFIG.SCREEN_HEIGHT, 0x000000, 0.01);
    bgClickArea.setInteractive();
    bgClickArea.setDepth(95); 
    bgClickArea.on('pointerdown', () => {
      
      const warningText = this.add.text(RINK.centerX, RINK.centerY + 100, 'YOU MUST ENTER THE MINI-GAME!', {
        fontFamily: 'Commando',
        fontSize: '28px',
        color: '#ff0000',
        stroke: '#000000',
        strokeThickness: 4
      });
      warningText.setOrigin(0.5, 0.5);
      warningText.setDepth(110);
      
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
    
    this.tweens.add({
      targets: this.slidingHelpButton,
      x: RINK.centerX - 250, 
      duration: 800,
      ease: 'Back.easeOut',
      onComplete: () => {
        
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
    if (this.gamePaused) return; 
    
    this.gamePaused = true;
    
    this.storedBallVelocityX = this.ball.body!.velocity.x;
    this.storedBallVelocityY = this.ball.body!.velocity.y;
    
    this.ball.body!.stop();
    
    if (this.timerEvent) {
      this.timerEvent.paused = true;
    }
    
  }
  
  private resumeGame() {
    if (!this.gamePaused) return; 
    
    this.gamePaused = false;
    
    (this.ball.body as Phaser.Physics.Arcade.Body).setVelocity(this.storedBallVelocityX, this.storedBallVelocityY);
    
    if (this.timerEvent) {
      this.timerEvent.paused = false;
    }
    
  }

  private enterMiniGame() {
    
    this.miniGameUsed = true;
    
    this.saveGameState();
    
    const darkOverlay = this.children.list.find(
      child => child instanceof Phaser.GameObjects.Rectangle && 
      child.depth === 90 && 
      child.fillAlpha === 0.5
    );
    
    if (darkOverlay) {
      darkOverlay.destroy();
    }
    
    const bgClickArea = this.children.list.find(
      child => child instanceof Phaser.GameObjects.Rectangle && 
      child.depth === 95 && 
      child.fillAlpha === 0.01
    );
    
    if (bgClickArea) {
      bgClickArea.destroy();
    }
    
    if (this.slidingHelpButton) {
      this.slidingHelpButton.destroy();
      this.slidingHelpButton = undefined;
    }
    
    this.scene.start('MatchingMiniGame');
  }

  private saveGameState() {
    
    const currentTimerColor = this.timerText.style.color as string || '#ffffff';
    
    this.savedGameState = {
      
      rightHealth: this.rightHealth,
      leftHealth: this.leftHealth,
      gameTimer: this.gameTimer,
      gameStarted: this.gameStarted,
      countdownActive: this.countdownActive,
      countdownValue: this.countdownValue,
      
      ballX: this.ball.x,
      ballY: this.ball.y,
      ballVelocityX: this.ball.body!.velocity.x,
      ballVelocityY: this.ball.body!.velocity.y,
      
      paddleLeftX: this.paddleLeft.x,
      paddleLeftY: this.paddleLeft.y,
      paddleRightX: this.paddleRight.x,
      paddleRightY: this.paddleRight.y,
      
      botDifficulty: this.botDifficulty,
      botState: this.botState,
      
      inputMode: this.inputMode,
      paddleLeftTargetX: this.paddleLeftTargetX,
      paddleLeftTargetY: this.paddleLeftTargetY,
      
      timerColor: currentTimerColor,
      
      miniGameUsed: this.miniGameUsed,
      
      puckFireActive: this.puckFireActive,
      
      selectedCharacter: this.selectedCharacter,
      characterName: this.characterName,
      characterBackground: this.characterBackground
    };
    
  }
  
  private restoreGameState(miniGameSuccess: boolean) {
    if (!this.savedGameState) {
      return;
    }
    
    const state = this.savedGameState;
    
    this.selectedCharacter = state.selectedCharacter;
    this.characterName = state.characterName;
    this.characterBackground = state.characterBackground;
    
    this.rightHealth = state.rightHealth;
    this.leftHealth = state.leftHealth;
    this.gameTimer = state.gameTimer;
    this.gameStarted = state.gameStarted;
    this.countdownActive = state.countdownActive;
    this.countdownValue = state.countdownValue;
    
    if (miniGameSuccess) {
      this.gameTimer += 15; 
      
    } else {
      
      this.puckFireActive = state.puckFireActive;
    }
    
    this.gamePaused = false;
    this.slidingHelpShown = false;
    if (this.slidingHelpButton) {
      this.slidingHelpButton.destroy();
      this.slidingHelpButton = undefined;
    }
    
    this.playAreaBottom = 1280;
    this.playAreaCenter = 640;
    
    this.statsAreaCenter = 1600;

    this.physics.world.setBounds(0, 0, 1080, 1280);
    this.physics.world.setBoundsCollision(true, true, true, true);

    if (this.characterBackground) {
      this.playingAreaBackground = this.add.image(540, this.playAreaCenter, this.characterBackground)
        
        .setDisplaySize(1080, 1280) 
        .setDepth(0);   
    } else {
      
      this.playingAreaBackground = this.add.rectangle(540, this.playAreaCenter, 1080, 1280,  0xffffff, 0);
    }
    
    // const modalBossKey = this.selectedCharacter === 'boss1' ? 'stats-boss1' : 'stats-boss2';
    
    // // Check if texture exists before creating image
    // if (this.textures && this.textures.exists(modalBossKey)) {
    //   this.statsBackground = this.add.image(540, this.statsAreaCenter, modalBossKey)
    //     .setDisplaySize(1080, 640)
    //     .setOrigin(0.5, 0.5)
    //     .setDepth(1);
    // } else {
    //   // Create a placeholder rectangle if texture isn't ready
    //   this.statsBackground = this.add.rectangle(540, this.statsAreaCenter, 1080, 640, 0x222222)
    //     .setDepth(1);
      
    //   // Try to load the texture after a delay
    //   this.time.delayedCall(100, () => {
    //     if (this.textures && this.textures.exists(modalBossKey)) {
    //       this.statsBackground.destroy();
    //       this.statsBackground = this.add.image(540, this.statsAreaCenter, modalBossKey)
    //         .setDisplaySize(1080, 640)
    //         .setOrigin(0.5, 0.5)
    //         .setDepth(1);
    //     }
    //   });
    // }

    const statsBoss = this.selectedCharacter === 'boss1' ? 'stats-boss1' : 'stats-boss2';
    
    // Check if texture exists before creating image
    if (this.textures && this.textures.exists(statsBoss)) {
      this.statsBackground = this.add.image(UI_CONFIG.CENTER_X, this.statsAreaCenter, statsBoss);
      this.statsBackground.setDisplaySize(UI_CONFIG.SCREEN_WIDTH, UI_CONFIG.STATS_BG_HEIGHT);
      this.statsBackground.setOrigin(0.5, 0.5);
      this.statsBackground.setDepth(DEPTHS.UI_ELEMENTS);
    } else {
      // Create a placeholder rectangle if texture isn't ready
      this.statsBackground = this.add.rectangle(UI_CONFIG.CENTER_X, this.statsAreaCenter, UI_CONFIG.SCREEN_WIDTH, UI_CONFIG.STATS_BG_HEIGHT, 0x222222);
      this.statsBackground.setDepth(DEPTHS.UI_ELEMENTS);
      
      // Try to load the texture after a delay
      this.time.delayedCall(100, () => {
        if (this.textures && this.textures.exists(statsBoss)) {
          this.statsBackground.destroy();
          this.statsBackground = this.add.image(UI_CONFIG.CENTER_X, this.statsAreaCenter, statsBoss);
          this.statsBackground.setDisplaySize(UI_CONFIG.SCREEN_WIDTH, UI_CONFIG.STATS_BG_HEIGHT);
          this.statsBackground.setOrigin(0.5, 0.5);
          this.statsBackground.setDepth(DEPTHS.UI_ELEMENTS);
        }
      });
    }

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
      color: miniGameSuccess ? '#00ff00' : state.timerColor, 
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
    this.isRedDragging = false;
    this.touchControlsSetup = false;

    this.ball = this.physics.add.sprite(state.ballX, state.ballY, 'puck')
      .setScale(0.5)
      .setOrigin(0.5, 0.5) 
      .setCircle(RINK.puckRadius, (this.textures.get('puck').get(0).width / 2) - RINK.puckRadius, 
                                 (this.textures.get('puck').get(0).height / 2) - RINK.puckRadius) 
      .setBounce(1.0)
      .setCollideWorldBounds(true)
      .setMaxVelocity(this.MAX_BALL_SPEED);

    this.ball.setVelocity(state.ballVelocityX, state.ballVelocityY);
    this.ball.setDamping(true).setDrag(0.002);

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

    const characterFrames = ['boss1', 'boss2'];
    const characterTextures = ['boss-field1', 'boss-field2'];
    const characterIndex = characterFrames.indexOf(this.selectedCharacter);
    const rightPaddleTexture = characterIndex !== -1 ? characterTextures[characterIndex] : 'boss-field1';
    
    this.paddleRight = this.physics.add.sprite(state.paddleRightX, state.paddleRightY, rightPaddleTexture)
      .setScale(1)
      .setOrigin(0.5, 0.5) 
      .setImmovable(true);
      
    this.paddleLeft = this.physics.add.sprite(state.paddleLeftX, state.paddleLeftY, 'blue-paddle')
      .setScale(1)
      .setOrigin(0.5, 0.5) 
      .setImmovable(true);

    const bossTexture = this.textures.get(rightPaddleTexture);
    const bossFrame = bossTexture.get(0);

    const circleRadius = 35;
    
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

    this.ball.setPosition(RINK.centerX, RINK.centerY);
    this.ball.setVelocity(0, 0);

    const blueStartX = RINK.centerX;
    const blueStartY = RINK.playerMinY + 100;
    const redStartX = RINK.centerX;
    const redStartY = RINK.botMaxY - 100;

    this.paddleLeft.setPosition(blueStartX, blueStartY);
    this.paddleRight.setPosition(redStartX, redStartY);

    this.paddleLeftTargetX = blueStartX;
    this.paddleLeftTargetY = blueStartY;

    this.paddleLeftPrevX = blueStartX;
    this.paddleLeftPrevY = blueStartY;
    this.paddleRightPrevX = redStartX;
    this.paddleRightPrevY = redStartY;

    this.puckhit = { play: () => {}, isPlaying: false } as any;
    this.goal = { play: () => {}, isPlaying: false } as any;
    this.wall = { play: () => {}, isPlaying: false } as any;
    this.cheer = { play: () => {}, stop: () => {}, isPlaying: false } as any;
    this.music = { play: () => {}, stop: () => {}, pause: () => {}, isPlaying: false } as any;

    this.inputMode = state.inputMode as 'none' | 'keyboard' | 'touch' | 'drag' | 'gamepad';
    this.paddleLeftTargetX = state.paddleLeftTargetX;
    this.paddleLeftTargetY = state.paddleLeftTargetY;
    
    this.miniGameUsed = state.miniGameUsed;

    this.input.keyboard?.on('keydown-ESC', () => {
      
      if (this.slidingHelpButton && this.gamePaused) {
        
        const warningText = this.add.text(RINK.centerX, RINK.centerY + 100, 'YOU MUST ENTER THE MINI-GAME!', {
          fontFamily: 'Commando',
          fontSize: '28px',
          color: '#ff0000',
          stroke: '#000000',
          strokeThickness: 4
        });
        warningText.setOrigin(0.5, 0.5);
        warningText.setDepth(110);
        
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
      
      this.scene.start('MainMenu');
    });

    this.input.keyboard?.on('keydown-R', () => {
      if (this.timerEvent) {
        this.timerEvent.destroy();
        this.timerEvent = undefined;
      }
      this.input.removeAllListeners();
      this.touchControlsSetup = false;
      this.scene.restart();
    });

    this.input.keyboard?.on('keydown-T', () => {
      this.gameTimer = 10;
      this.timerText.setText(this.formatTime(this.gameTimer));
      this.timerText.setColor('#ff4444');
    });

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
    
    this.input.keyboard?.on('keydown-F', () => {
      if (this.puckFireActive) {
        this.removeFireEffect();
      } else {
        this.activateFireEffect();
      }
    });

    this.setupTouchControls();
    this.updateHealthBars();
    
    this.setBotDifficulty('hard');
    this.botState = state.botState;

    this.gameStarted = false;
    this.countdownActive = false;
    this.countdownValue = 3;
    
    this.time.delayedCall(500, () => {
      this.startCountdown();
    });
    
    if (miniGameSuccess) {
      
      this.activateFireEffect();
    } else if (this.puckFireActive) {
      
      this.activateFireEffect();
    }

    this.savedGameState = undefined;
  }
  
  private activateFireEffect() {
    
    this.puckFireActive = true;
    
    if (this.fireEffectGraphics) {
      this.fireEffectGraphics.destroy();
    }
    
    this.fireEffectGraphics = this.add.graphics();
    this.fireEffectGraphics.setDepth(6); 
    
  }
  
  private updateFireEffect() {
    if (!this.puckFireActive || !this.ball || !this.fireEffectGraphics) return;
    const ballY = this.ball.y;
    const ballSpeed = this.ball.body!.velocity.length();
    const currentTime = this.time.now;
    
    this.fireEffectGraphics.clear();
    
    const particleCount = Math.min(8, 4 + Math.floor(ballSpeed / 200)); 
    const fireRadius = RINK.puckRadius * 1.2; 
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + (currentTime * 0.01); 
      const distance = fireRadius + Math.sin(currentTime * 0.01 + i) * 8; 
      
      const particleX = this.ball.x + Math.cos(angle) * distance;
      const particleY = ballY + Math.sin(angle) * distance;
      
      const colors = [0xff0000, 0xff4400, 0xff8800, 0xffaa00, 0xffdd00];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const baseSize = 3 + Math.random() * 3;
      const speedMultiplier = 1 + (ballSpeed / 1000);
      const particleSize = baseSize * speedMultiplier;
      
      this.fireEffectGraphics.fillStyle(color, 0.7 + Math.random() * 0.3);
      this.fireEffectGraphics.fillCircle(particleX, particleY, particleSize);
      
      if (ballSpeed > 800) {
        this.fireEffectGraphics.fillStyle(0xffff00, 0.3);
        this.fireEffectGraphics.fillCircle(particleX, particleY, particleSize * 1.5);
      }
    }
    
    if (ballSpeed > 600) {
      this.fireEffectGraphics.fillStyle(0xffffff, 0.6);
      this.fireEffectGraphics.fillCircle(this.ball.x, ballY, RINK.puckRadius * 0.8);
      
      this.fireEffectGraphics.fillStyle(0xffff00, 0.8);
      this.fireEffectGraphics.fillCircle(this.ball.x, ballY, RINK.puckRadius * 0.6);
    }
    
    if (ballSpeed > 400) {
      
      const trailParticle = this.add.circle(
        this.ball.x + (Math.random() - 0.5) * RINK.puckRadius,
        ballY + (Math.random() - 0.5) * RINK.puckRadius,
        2 + Math.random() * 3,
        0xff4400,
        0.8
      );
      trailParticle.setDepth(5);
      
      this.fireParticles.push(trailParticle);
      
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
      
      if (this.fireParticles.length > 20) {
        const oldestParticle = this.fireParticles.shift();
        if (oldestParticle) {
          oldestParticle.destroy();
        }
      }
    }
  }
  
  private removeFireEffect() {
    
    this.puckFireActive = false;
    
    if (this.fireEffectGraphics) {
      this.fireEffectGraphics.destroy();
      this.fireEffectGraphics = undefined;
    }
    
    this.fireParticles.forEach(particle => particle.destroy());
    this.fireParticles = [];
    
  }
  
  private createFireGoalEffect() {
    
    const goalX = RINK.centerX;
    const goalY = RINK.topGoalY;
    
    const fireExplosion = this.add.circle(goalX, goalY, 100, 0xff0000, 0.8);
    fireExplosion.setDepth(15);
    
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
    
    const fireGoalText = this.add.text(RINK.centerX, RINK.centerY - 150, '🔥 FIRE GOAL! 🔥', {
      fontFamily: 'Commando',
      fontSize: '64px',
      color: '#ff0000',
      stroke: '#ffff00',
      strokeThickness: 4
    });
    fireGoalText.setOrigin(0.5, 0.5);
    fireGoalText.setDepth(16);
    
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
    
    const flashOverlay = this.add.rectangle(UI_CONFIG.CENTER_X, UI_CONFIG.SCREEN_HEIGHT / 2, UI_CONFIG.SCREEN_WIDTH, UI_CONFIG.SCREEN_HEIGHT, 0xff4400, 0.4);
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
    
    this.cameras.main.shake(400, 0.03);
    
  }

  private updateBossAnimation(state: 'defend' | 'attack' | 'wait' | 'recover') {
    if (!this.paddleRight) return;
    
    switch (state) {
      case 'attack':
        
        this.paddleRight.setScale(1.1); 
        this.paddleRight.setTint(0xff9999); 
        break;
        
      case 'defend':
        
        this.paddleRight.setScale(1.0);
        this.paddleRight.setTint(0xaaaaff); 
        break;
        
      case 'wait':
        
        this.paddleRight.setScale(0.9); 
        this.paddleRight.clearTint();
        break;
        
      case 'recover':
        
        this.paddleRight.setScale(1.0);
        this.paddleRight.setTint(0xffcc44); 
        break;
    }
    
    if (false && !this.tweens.isTweening(this.paddleRight)) {
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

  private playBossTaunt(type: 'pathetic' | 'weak' | 'average' | 'powerful' | 'enraged' | 'godlike') {
    if (!this.paddleRight) return;
    
    const bubbleX = this.paddleRight.x;
    const bubbleY = this.paddleRight.y - 70;
    
    const tauntText = BOSS_TAUNTS[type];
    
    const bubble = this.add.graphics();
    bubble.fillStyle(0xffffff, 0.9);
    bubble.lineStyle(4, 0x000000, 1);
    bubble.fillRoundedRect(bubbleX - 100, bubbleY - 30, 200, 60, 10);
    bubble.strokeRoundedRect(bubbleX - 100, bubbleY - 30, 200, 60, 10);
    
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
    
    const text = this.add.text(bubbleX, bubbleY, tauntText, {
      fontFamily: 'Commando',
      fontSize: '18px',
      color: '#000000',
      align: 'center'
    });
    text.setOrigin(0.5, 0.5);
    text.setDepth(21);
    
    this.paddleRight.setScale(1.2);  
    
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

    const leftStickX = this.gamepad.leftStick.x;
    const leftStickY = this.gamepad.leftStick.y;
    
    const dpadLeft = this.gamepad.left;
    const dpadRight = this.gamepad.right;
    const dpadUp = this.gamepad.up;
    const dpadDown = this.gamepad.down;
    
    const aButton = this.gamepad.A;
    const bButton = this.gamepad.B;
    const xButton = this.gamepad.X;
    const yButton = this.gamepad.Y;
    
    return (
      Math.abs(leftStickX) > this.gamepadThreshold ||
      Math.abs(leftStickY) > this.gamepadThreshold ||
      dpadLeft || dpadRight || dpadUp || dpadDown ||
      aButton || bButton || xButton || yButton
    );
  }

  private handleGamepadInput() {
    if (!this.gamepadConnected || !this.gamepad) return;

    const maxGamepadSpeed = 12; 
    let inputX = 0;
    let inputY = 0;
    
    if (Math.abs(this.gamepad.leftStick.x) > this.gamepadDeadzone) {
      inputX = this.gamepad.leftStick.x;
    }
    
    if (Math.abs(this.gamepad.leftStick.y) > this.gamepadDeadzone) {
      inputY = this.gamepad.leftStick.y;
    }
    
    if (this.gamepad.left) inputX -= 1;
    if (this.gamepad.right) inputX += 1;
    if (this.gamepad.up) inputY -= 1;
    if (this.gamepad.down) inputY += 1;
    
    if (inputX !== 0) {
      this.gamepadVelocityX += inputX * this.gamepadAcceleration;
      this.gamepadVelocityX = Math.max(-maxGamepadSpeed, Math.min(maxGamepadSpeed, this.gamepadVelocityX));
    } else {
      this.gamepadVelocityX *= this.gamepadDamping; 
      if (Math.abs(this.gamepadVelocityX) < 0.1) this.gamepadVelocityX = 0;
    }
    
    if (inputY !== 0) {
      this.gamepadVelocityY += inputY * this.gamepadAcceleration;
      this.gamepadVelocityY = Math.max(-maxGamepadSpeed, Math.min(maxGamepadSpeed, this.gamepadVelocityY));
    } else {
      this.gamepadVelocityY *= this.gamepadDamping; 
      if (Math.abs(this.gamepadVelocityY) < 0.1) this.gamepadVelocityY = 0;
    }
    
    this.paddleLeftTargetX = this.paddleLeft.x + this.gamepadVelocityX;
    this.paddleLeftTargetY = this.paddleLeft.y + this.gamepadVelocityY;
    
    this.lastInputTime = this.time.now;
  }

    private getSelectedCharacter(): void {
    
    const savedCharacter = localStorage.getItem('selectedCharacter');
    
    if (savedCharacter) {
      this.selectedCharacter = savedCharacter;
    } else {
      // Set default character if none is saved
      this.selectedCharacter = 'boss1';
    }
      
    const characterNames = ['Lady Delayna', 'Phantom Tax'];
    const characterFrames = ['boss1', 'boss2'];
    const characterTextures = ['boss-field1', 'boss-field2'];
    const characterBackgrounds = ['boss-bg1', 'boss-bg2'];
    const characterIndex = characterFrames.indexOf(this.selectedCharacter);
      
      if (characterIndex !== -1) {
        this.characterName = characterNames[characterIndex];
        this.characterBackground = characterBackgrounds[characterIndex];
        
        if(this.paddleRight && this.paddleRight.scene) {
          const paddleTexture = characterTextures[characterIndex];
          // Defer texture setting if textures aren't ready yet
          if(this.textures && this.textures.exists(paddleTexture)) {
            try {
              this.paddleRight.setTexture(paddleTexture);
            } catch (error) {
              console.warn('Failed to set paddle texture:', error);
            }
          } else {
            // Try again after a short delay
            this.time.delayedCall(100, () => {
              if(this.paddleRight && this.paddleRight.scene && this.textures && this.textures.exists(paddleTexture)) {
                try {
                  this.paddleRight.setTexture(paddleTexture);
                } catch (error) {
                  console.warn('Failed to set paddle texture (delayed):', error);
                }
              }
            });
          }
        }
        
        if(this.playingAreaBackground) {
          this.playingAreaBackground.destroy();
          
          const bgImage = this.add.image(540, this.playAreaCenter, this.characterBackground)
            .setAlpha(1)  
            .setDisplaySize(1080, 1280) 
            .setDepth(-1);   
            
          this.playingAreaBackground = bgImage;
          
        }
      }
    
    if (this.redHealthLabel) {
      this.redHealthLabel.setText(this.characterName);
    }
  }

  private showEndGameModal(isRedWinner: boolean, winnerText: string): void {
    
    const overlay = this.add.rectangle(UI_CONFIG.CENTER_X, UI_CONFIG.SCREEN_HEIGHT / 2, UI_CONFIG.SCREEN_WIDTH, UI_CONFIG.SCREEN_HEIGHT, 0x000000, 0.8);
    overlay.setDepth(100);
    
    const modalContainer = this.add.container(UI_CONFIG.CENTER_X, UI_CONFIG.SCREEN_HEIGHT / 2);
    modalContainer.setDepth(101);
    
    const modalBossKey = this.selectedCharacter === 'boss1' ? 'modal-boss1' : 'modal-boss2';
    const bossImage = this.add.image(0, -200, modalBossKey);
    bossImage.setScale(0.5); 
    
    this.win = this.add.text(0, 100, winnerText, {
      fontFamily: 'Commando',
      fontSize: '80px',
      color: '#4da6ff',  
      stroke: '#000000',
      strokeThickness: 6
    });
    this.win.setOrigin(0.5, 0.5);
    
    const blueGoals = Math.floor((100 - this.rightHealth) / 10);
    const redGoals = Math.floor((100 - this.leftHealth) / 10);
    
    const scoreContainer = this.add.container(0, 200);
    
    const blueScoreText = this.add.text(-40, 0, `${blueGoals}`, {
      fontFamily: 'Commando',
      fontSize: '64px',
      color: !isRedWinner ? '#4da6ff' : '#ffffff',  
      stroke: '#000000',
      strokeThickness: 6
    });
    blueScoreText.setOrigin(1, 0.5);
    
    const colonText = this.add.text(0, 0, ':', {
      fontFamily: 'Commando',
      fontSize: '64px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    });
    colonText.setOrigin(0.5, 0.5);
    
    const redScoreText = this.add.text(40, 0, `${redGoals}`, {
      fontFamily: 'Commando',
      fontSize: '64px',
      color: isRedWinner ? '#ff4d4d' : '#ffffff',  
      stroke: '#000000',
      strokeThickness: 6
    });
    redScoreText.setOrigin(0, 0.5);
    
    scoreContainer.add([blueScoreText, colonText, redScoreText]);
    
    const victoryMessage = this.add.text(0, 280, isRedWinner ? 'The Boss Triumphs!' : 'Hero Saves the Day!', {
      fontFamily: 'Commando',
      fontSize: '36px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    victoryMessage.setOrigin(0.5, 0.5);
    
    this.gameRestart = this.add.text(0, 350, 'Click to Restart Game', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '40px',
      color: 'white',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 20, y: 10 },
      align: 'center'
    });
    this.gameRestart.setOrigin(0.5, 0.5);
    this.gameRestart.setInteractive();
    
    const nextButton = this.add.text(0, 450, 'NEXT', {
      fontFamily: 'Commando',
      fontSize: '48px',
      color: '#FFD700',
      backgroundColor: 'rgba(0,0,0,0.8)',
      padding: { x: 40, y: 15 },
      stroke: '#000000',
      strokeThickness: 4
    });
    nextButton.setOrigin(0.5, 0.5);
    nextButton.setInteractive();
    
    nextButton.on('pointerover', () => {
      nextButton.setScale(1.1);
      nextButton.setColor('#FFFF00');
    });
    
    nextButton.on('pointerout', () => {
      nextButton.setScale(1);
      nextButton.setColor('#FFD700');
    });
    
    nextButton.on('pointerdown', () => {
      
      this.scene.start('CharacterSelect');
    });
    
    modalContainer.add([bossImage, this.win, scoreContainer, victoryMessage, this.gameRestart, nextButton]);
    
    modalContainer.setScale(0);
    this.tweens.add({
      targets: modalContainer,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut'
    });
    
    this.gameRestart.once('pointerdown', () => {
      if (this.cheer && this.cheer.isPlaying) this.cheer.stop();
      
      // Use centralized cleanup
      this.cleanupForRestart();
      
      // Restart the scene
      this.scene.restart();
    });
  }
}