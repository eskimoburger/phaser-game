// Game state interface for saving/loading
export interface GameState {
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
  botDifficulty: BotDifficulty;
  botState: BotState;
  
  // Input state
  inputMode: string;
  paddleLeftTargetX: number;
  paddleLeftTargetY: number;
  
  // Timer state
  timerColor: string;
  
  // Mini game state
  miniGameUsed: boolean;
  
  // Fire effect state
  puckFireActive: boolean;
}

// Type definitions
export type BotDifficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'extreme' | 'impossible';
export type BotState = 'defend' | 'attack' | 'wait' | 'recover';

// Rink boundaries and zones
export const RINK = {
  minX: 0,
  maxX: 1080,
  playerMinY: 700,    // Blue paddle (player) minimum Y
  playerMaxY: 1075,   // Blue paddle (player) maximum Y
  botMinY: 155,       // Red paddle (bot) minimum Y
  botMaxY: 580,       // Red paddle (bot) maximum Y
  topGoalY: 155,       // Top goal line (when puck top crosses this)
  bottomGoalY: 1125,  // Bottom goal line (when puck bottom crosses this)
  centerX: 540,       // Horizontal center
  centerY: 640,       // Vertical center (between zones)
  puckRadius: 50      // Adjusted puck collision radius to match visual appearance
} as const;

// Game physics constants
export const PHYSICS = {
  // Paddle hit parameters
  PADDLE_HIT_BASE_SPEED_INCREASE: 120,
  PADDLE_HIT_SPEED_MULTIPLIER: 1.03,
  MAX_BALL_SPEED: 2000,
  PADDLE_HIT_ANGLE_INFLUENCE_DEGREES: 25,
  
  // Ball speed management
  MIN_BALL_SPEED_THRESHOLD: 400,
  BALL_BOOST_SPEED: 950,
  
  // Wall collision parameters
  WALL_HIT_SPEED_BOOST: 200,
  WALL_HIT_SPEED_MULTIPLIER: 1.08,
  WALL_HIT_MAX_BOOST: 600
} as const;

// Bot AI configuration
export const BOT_CONFIG = {
  // Base parameters
  DEFAULT_DIFFICULTY: 'medium' as BotDifficulty,
  DEFAULT_STATE: 'defend' as BotState,
  
  // Movement parameters
  BASE_REACTION_DELAY: 0,
  MAX_REACTION_DELAY: 3,
  SMOOTHNESS: 0.08,
  EMERGENCY_SMOOTHNESS: 0.15,
  
  // Difficulty settings
  DIFFICULTIES: {
    beginner: {
      maxSpeed: 6,
      predictionAccuracy: 0.3,
      errorMargin: 50,
      attackThreshold: 0.3,
      lookAheadFrames: 10,
      strategicThinking: 0.1,
      cornerPrediction: 0.1,
      counterAttackChance: 0.1
    },
    easy: {
      maxSpeed: 8,
      predictionAccuracy: 0.5,
      errorMargin: 35,
      attackThreshold: 0.4,
      lookAheadFrames: 15,
      strategicThinking: 0.2,
      cornerPrediction: 0.15,
      counterAttackChance: 0.2
    },
    medium: {
      maxSpeed: 12,
      predictionAccuracy: 0.7,
      errorMargin: 20,
      attackThreshold: 0.6,
      lookAheadFrames: 30,
      strategicThinking: 0.5,
      cornerPrediction: 0.3,
      counterAttackChance: 0.4
    },
    hard: {
      maxSpeed: 16,
      predictionAccuracy: 0.85,
      errorMargin: 10,
      attackThreshold: 0.75,
      lookAheadFrames: 45,
      strategicThinking: 0.7,
      cornerPrediction: 0.5,
      counterAttackChance: 0.6
    },
    extreme: {
      maxSpeed: 20,
      predictionAccuracy: 0.95,
      errorMargin: 5,
      attackThreshold: 0.9,
      lookAheadFrames: 60,
      strategicThinking: 0.9,
      cornerPrediction: 0.8,
      counterAttackChance: 0.8
    },
    impossible: {
      maxSpeed: 25,
      predictionAccuracy: 0.99,
      errorMargin: 2,
      attackThreshold: 0.95,
      lookAheadFrames: 90,
      strategicThinking: 0.99,
      cornerPrediction: 0.95,
      counterAttackChance: 0.95
    }
  }
} as const;