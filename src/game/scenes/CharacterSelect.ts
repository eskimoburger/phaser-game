import { Scene, GameObjects } from "phaser";

export class CharacterSelect extends Scene {
  background: GameObjects.Image;
  title: GameObjects.Text;
  backButton: GameObjects.Image;
  character: GameObjects.Image;
  characterNames: string[] = ['Lady Delayna', 'Phantom Tax'];
  characterFrames: string[] = ['boss1', 'boss2'];
  backgroundFrames: string[] = ['bg-boss-1', 'bg-boss-2'];
  currentIndex: number = 0;
  confirmButton: GameObjects.Image;
  nextButton: GameObjects.Image;
  prevButton: GameObjects.Image;
  characterText: GameObjects.Text;
  bgEffects: GameObjects.Container;
  characterDescription: GameObjects.Text;
  characterBaseY: number = 1000; // Store the base Y position
  boss: GameObjects.Sprite;
  devsmithLogo: GameObjects.Image;
  shadow: GameObjects.Image;
  // Character data
  private readonly CHARACTER_DESCRIPTIONS: string[] = [
    "A mighty warrior skilled in close combat.\nHigh defense and strong melee attacks.",
    "A powerful spellcaster with arcane knowledge.\nDeals massive damage from a distance.",
    "A nimble marksman with deadly accuracy.\nRapid attacks and high mobility."
  ];
  
  // Placeholder colors for missing character textures
  private readonly CHARACTER_PLACEHOLDER_COLORS: number[] = [0xFF0000, 0x00FF00, 0x0000FF];
  
  // Button animation constants
  private readonly BUTTON_SCALE_NORMAL = 0.8;
  private readonly BUTTON_SCALE_HOVER = 0.85;
  private readonly BUTTON_SCALE_CLICK = 0.75;
  private readonly BUTTON_ANIM_DURATION = 100;
  
  // Character transition constants
  private readonly CHARACTER_FADE_DURATION = 150;
  private readonly CHARACTER_BOUNCE_DELAY = 300;
  private readonly CHARACTER_BOUNCE_HEIGHT = 20;
  private readonly CHARACTER_BOUNCE_DURATION = 150;
  
  // Confirm button constants
  private readonly CONFIRM_BUTTON_NORMAL_SCALE = 1;
  private readonly CONFIRM_BUTTON_HOVER_SCALE = 1;
  private readonly CONFIRM_BUTTON_CLICK_SCALE = 1.1;
  private readonly CONFIRM_BUTTON_NORMAL_Y = 1700;
  private readonly CONFIRM_BUTTON_HOVER_Y = 1690;
  private readonly CONFIRM_BUTTON_CLICK_Y = 1710;
  private readonly CONFIRM_BUTTON_ANIM_DURATION = 100;
  private readonly CONFIRM_BUTTON_CLICK_DURATION = 50;
  private readonly CAMERA_FLASH_DURATION = 300;
  private readonly SCENE_CHANGE_DELAY = 350;
  
  // Touch device optimization
  private readonly TOUCH_BUTTON_FEEDBACK_DURATION = 80;
  private readonly TOUCH_BUTTON_SCALE_BOOST = 1.1;
  private readonly IS_TOUCH_DEVICE = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Touch gestures
  private touchStartX: number = 0;
  private touchStartTime: number = 0;
  private readonly SWIPE_THRESHOLD = 50;
  private readonly SWIPE_TIME_THRESHOLD = 300;
  
  // Performance settings
  private readonly MOBILE_SCALE_QUALITY = 'LINEAR'; // 'LINEAR' or 'NEAREST'
  private readonly MOBILE_ROUNDPIXELS = true;
  
  constructor() {
    super("CharacterSelect");
  }
  preload() {

    this.load.image('next-button', 'assets/next-button.png');
    this.load.image('prev-button', 'assets/prev-button.png');
    this.load.image("confirm-button", "assets/confirm-button.png");
    // this.load.spritesheet('boss_walk', 'assets/data/Idle+Walk_Boos_1.png', { frameWidth: 1024, frameHeight: 1024 });
  }

  /**
   * Sets up button interaction with touch screen optimizations
   */
  setupButtonInteraction(
    button: GameObjects.Image, 
    normalScale: number = this.BUTTON_SCALE_NORMAL,
    hoverScale: number = this.BUTTON_SCALE_HOVER,
    clickScale: number = this.BUTTON_SCALE_CLICK,
    onClick?: () => void
  ) {
    button.setInteractive({ useHandCursor: true });
    
    // Enhanced feedback for touch screens
    if (this.IS_TOUCH_DEVICE) {
      // Touch devices need faster and more noticeable feedback
      button.on('pointerdown', () => {
        // More dramatic scale change for better feedback
        button.setScale(normalScale * this.TOUCH_BUTTON_SCALE_BOOST);
        // Add a subtle rotation for physical feedback feel
        this.tweens.add({
          targets: button,
          angle: 2,
          duration: this.TOUCH_BUTTON_FEEDBACK_DURATION / 2,
          yoyo: true,
          ease: 'Sine.easeOut'
        });
        
        // Quick visual feedback
        this.tweens.add({
          targets: button,
          scale: normalScale,
          duration: this.TOUCH_BUTTON_FEEDBACK_DURATION,
          onComplete: () => {
            if (onClick) onClick();
          }
        });
      });
    } else {
      // Desktop device interactions
      button.on('pointerover', () => {
        button.setScale(hoverScale);
      });
      
      button.on('pointerout', () => {
        button.setScale(normalScale);
      });
      
      button.on('pointerdown', () => {
        button.setScale(clickScale);
        this.tweens.add({
          targets: button,
          scale: hoverScale,
          duration: this.BUTTON_ANIM_DURATION,
          onComplete: () => {
            if (onClick) onClick();
          }
        });
      });
    }
    
    return button;
  }

  create() {
    // Apply mobile optimizations if needed
    if (this.IS_TOUCH_DEVICE) {
      this.optimizeForMobile();
    }

    // Create the animation


    // Add the background image - character specific
    this.background = this.add.image(0, 0, this.backgroundFrames[this.currentIndex]).setOrigin(0, 0);

    // console.log(this.backgroundFrames[this.currentIndex]);
    
    // If the character-specific background doesn't exist, use default
    // if (!this.textures.exists(this.backgroundFrames[this.currentIndex])) {
    //   this.background.setTexture('background');
    // }

    // Create container for background effects
    this.bgEffects = this.add.container(0, 0);


    this.anims.create({
      key: 'boss_idle_walk',
      frames: this.anims.generateFrameNumbers('boss_walk', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1
    });

    this.devsmithLogo = this.add.image(540, 100, "devsmith").setOrigin(0.5);

    // Add the boss sprite and play animation
    // this.boss = this.add.sprite(540, 750, 'boss_walk')
    //   .setScale(0.5)
    //   .play('boss_idle_walk')
    
    // Add title
    // this.title = this.add.text(540, 200, "SELECT CHARACTER", {
    //   fontFamily: 'Commando',
    //   fontSize: '120px',
    //   color: '#FFFFFF',
    //   fontStyle: 'normal',
    //   letterSpacing: 2.8,
    //   stroke: '#000000',
    //   strokeThickness: 12,
    //   shadow: { offsetX: 8, offsetY: 8, color: '#000000', fill: true }
    // }).setOrigin(0.5);

    // Back button
    
    this.backButton = this.add.image(80, 100, "back-button")
      .setOrigin(0.5)
      .setScale(this.BUTTON_SCALE_NORMAL);
    
    this.setupButtonInteraction(this.backButton, this.BUTTON_SCALE_NORMAL, this.BUTTON_SCALE_HOVER, this.BUTTON_SCALE_CLICK, () => {
      this.scene.start('MainMenu');
    });

    this.shadow = this.add.image(540, this.characterBaseY+380, "shadow").setScale(0.5);
    // Add the character in the center
    this.character = this.add.image(540, this.characterBaseY, this.characterFrames[this.currentIndex])
      .setOrigin(0.5)
      // .setScale(1.5);
      
    // Character name text
    this.characterText = this.add.text(540, 250, this.characterNames[this.currentIndex], {
      fontFamily: 'Commando',
      fontSize: '84px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 10,
      shadow: { offsetX: 6, offsetY: 6, color: '#000000', fill: true }
    }).setOrigin(0.5);
    
    // Character description
    // this.characterDescription = this.add.text(540, 1150, this.CHARACTER_DESCRIPTIONS[this.currentIndex], {
    //   fontFamily: 'Commando',
    //   fontSize: '36px',
    //   color: '#CCCCFF',
    //   stroke: '#000000',
    //   strokeThickness: 4,
    //   shadow: { offsetX: 2, offsetY: 2, color: '#000000', fill: true },
    //   align: 'center'
    // }).setOrigin(0.5);
    
    // If character images don't exist yet, create colored rectangles as placeholders
    if (!this.textures.exists(this.characterFrames[this.currentIndex])) {
      const graphics = this.add.graphics();
      graphics.fillStyle(this.CHARACTER_PLACEHOLDER_COLORS[this.currentIndex], 1);
      graphics.fillRect(540 - 150, this.characterBaseY - 200, 300, 400);
    }

    // Previous button (left arrow)
    this.prevButton = this.add.image(200, 1700, "prev-button")
      .setOrigin(0.5)
      .setScale(this.BUTTON_SCALE_NORMAL);
    
    // Next button (right arrow)
    this.nextButton = this.add.image(880, 1700, "next-button")
      .setOrigin(0.5)
      .setScale(this.BUTTON_SCALE_NORMAL);
    
    // Setup navigation buttons
    this.setupButtonInteraction(this.prevButton, this.BUTTON_SCALE_NORMAL, this.BUTTON_SCALE_HOVER, this.BUTTON_SCALE_CLICK, () => {
      this.changeCharacter(-1);
    });
    
    this.setupButtonInteraction(this.nextButton, this.BUTTON_SCALE_NORMAL, this.BUTTON_SCALE_HOVER, this.BUTTON_SCALE_CLICK, () => {
      this.changeCharacter(1);
    });

    // Confirm button - this one has custom animations
    this.setupConfirmButton();

    // Add selection frame around current character
    // this.add.image(this.character.x, this.character.y, 'select-frame')
    //   .setOrigin(0.5)
    //   .setScale(1.2);
      
    // // Initial background effect
    // this.createBackgroundEffect(this.currentIndex);

    // Setup swipe detection for touch devices
    if (this.IS_TOUCH_DEVICE) {
      this.setupSwipeControls();
    }
  }
  
  // createBackgroundEffect(characterIndex: number) {
  //   // Clear previous effects
  //   this.bgEffects.removeAll(true);
    
  //   switch(characterIndex) {
  //     case 0: // Knight - Sword slashes and armor pieces
  //       this.createKnightBackground();
  //       break;
  //     case 1: // Mage - Magic particles and runes
  //       this.createMageBackground();
  //       break;
  //     case 2: // Archer - Nature-themed elements
  //       this.createArcherBackground();
  //       break;
  //   }
  // }
  
  // createKnightBackground() {
  //   // Add sword slashes
  //   for (let i = 0; i < 5; i++) {
  //     const slash = this.add.graphics();
  //     const x = Phaser.Math.Between(100, 980);
  //     const y = Phaser.Math.Between(400, 1400);
  //     const length = Phaser.Math.Between(100, 200);
  //     const thickness = Phaser.Math.Between(5, 15);
  //     const alpha = Phaser.Math.FloatBetween(0.1, 0.3);
      
  //     slash.lineStyle(thickness, 0xFF0000, alpha);
  //     slash.beginPath();
  //     slash.moveTo(x, y);
  //     slash.lineTo(x + length, y + Phaser.Math.Between(-50, 50));
  //     slash.strokePath();
      
  //     this.bgEffects.add(slash);
  //   }
    
  //   // Add shield shape
  //   const shield = this.add.graphics();
  //   shield.fillStyle(0x880000, 0.2);
  //   shield.fillRoundedRect(440, 350, 200, 300, 20);
  //   shield.lineStyle(5, 0xCCCCCC, 0.3);
  //   shield.strokeRoundedRect(440, 350, 200, 300, 20);
    
  //   // Add cross emblem
  //   shield.lineStyle(10, 0xCCCCCC, 0.3);
  //   shield.beginPath();
  //   shield.moveTo(540, 380);
  //   shield.lineTo(540, 620);
  //   shield.moveTo(470, 500);
  //   shield.lineTo(610, 500);
  //   shield.strokePath();
    
  //   this.bgEffects.add(shield);
    
  //   // Add floating metal particles
  //   for (let i = 0; i < 20; i++) {
  //     const particle = this.add.circle(
  //       Phaser.Math.Between(100, 980),
  //       Phaser.Math.Between(300, 1600),
  //       Phaser.Math.Between(2, 5),
  //       0xCCCCCC,
  //       Phaser.Math.FloatBetween(0.1, 0.4)
  //     );
      
  //     this.bgEffects.add(particle);
      
  //     // Make particles float upward
  //     this.tweens.add({
  //       targets: particle,
  //       y: particle.y - Phaser.Math.Between(100, 300),
  //       alpha: 0,
  //       duration: Phaser.Math.Between(3000, 6000),
  //       delay: Phaser.Math.Between(0, 5000),
  //       repeat: -1
  //     });
  //   }
    
  //   // Add a subtle red overlay
  //   const redOverlay = this.add.rectangle(540, 960, 1080, 1920, 0xFF0000, 0.05);
  //   this.bgEffects.add(redOverlay);
  // }
  
  // createMageBackground() {
  //   // Add magic circles
  //   for (let i = 0; i < 3; i++) {
  //     const circle = this.add.graphics();
  //     const x = Phaser.Math.Between(200, 880);
  //     const y = Phaser.Math.Between(400, 1400);
  //     const radius = Phaser.Math.Between(50, 150);
      
  //     circle.lineStyle(2, 0x00FFFF, 0.3);
  //     circle.strokeCircle(x, y, radius);
      
  //     // Add inner circle
  //     circle.lineStyle(1, 0x00FFFF, 0.2);
  //     circle.strokeCircle(x, y, radius * 0.7);
      
  //     // Add some runes around the circle
  //     for (let j = 0; j < 8; j++) {
  //       const angle = (j / 8) * Math.PI * 2;
  //       const runeX = x + Math.cos(angle) * radius;
  //       const runeY = y + Math.sin(angle) * radius;
        
  //       const rune = this.add.text(runeX, runeY, "*", {
  //         fontFamily: 'Arial',
  //         fontSize: '20px',
  //         color: '#00FFFF'
  //       }).setOrigin(0.5).setAlpha(0.3);
        
  //       this.bgEffects.add(rune);
  //     }
      
  //     this.bgEffects.add(circle);
      
  //     // Rotate the circle
  //     this.tweens.add({
  //       targets: circle,
  //       angle: 360,
  //       duration: Phaser.Math.Between(10000, 20000),
  //       repeat: -1
  //     });
  //   }
    
  //   // Add magic particles
  //   for (let i = 0; i < 40; i++) {
  //     const particle = this.add.circle(
  //       Phaser.Math.Between(100, 980),
  //       Phaser.Math.Between(300, 1600),
  //       Phaser.Math.Between(1, 4),
  //       0x00FFFF,
  //       Phaser.Math.FloatBetween(0.1, 0.4)
  //     );
      
  //     this.bgEffects.add(particle);
      
  //     // Make particles float around
  //     this.tweens.add({
  //       targets: particle,
  //       x: particle.x + Phaser.Math.Between(-100, 100),
  //       y: particle.y + Phaser.Math.Between(-100, 100),
  //       alpha: Phaser.Math.FloatBetween(0.1, 0.6),
  //       duration: Phaser.Math.Between(2000, 5000),
  //       yoyo: true,
  //       repeat: -1
  //     });
  //   }
    
  //   // Add a subtle blue overlay
  //   const blueOverlay = this.add.rectangle(540, 960, 1080, 1920, 0x0000FF, 0.05);
  //   this.bgEffects.add(blueOverlay);
  // }
  
  // createArcherBackground() {
  //   // Add arrow shapes
  //   for (let i = 0; i < 8; i++) {
  //     const arrow = this.add.graphics();
  //     const x = Phaser.Math.Between(100, 980);
  //     const y = Phaser.Math.Between(400, 1400);
  //     const length = Phaser.Math.Between(40, 120);
  //     const angle = Phaser.Math.Between(0, 360);
  //     const alpha = Phaser.Math.FloatBetween(0.1, 0.3);
      
  //     arrow.lineStyle(3, 0x00CC00, alpha);
      
  //     // Draw arrow shaft
  //     const radians = angle * (Math.PI / 180);
  //     const endX = x + Math.cos(radians) * length;
  //     const endY = y + Math.sin(radians) * length;
      
  //     arrow.beginPath();
  //     arrow.moveTo(x, y);
  //     arrow.lineTo(endX, endY);
  //     arrow.strokePath();
      
  //     // Draw arrow head
  //     const headLength = length * 0.2;
  //     const headAngle1 = radians + Math.PI * 0.8;
  //     const headAngle2 = radians - Math.PI * 0.8;
      
  //     arrow.beginPath();
  //     arrow.moveTo(endX, endY);
  //     arrow.lineTo(
  //       endX - Math.cos(headAngle1) * headLength,
  //       endY - Math.sin(headAngle1) * headLength
  //     );
  //     arrow.moveTo(endX, endY);
  //     arrow.lineTo(
  //       endX - Math.cos(headAngle2) * headLength,
  //       endY - Math.sin(headAngle2) * headLength
  //     );
  //     arrow.strokePath();
      
  //     this.bgEffects.add(arrow);
  //   }
    
  //   // Add leaf particles
  //   for (let i = 0; i < 30; i++) {
  //     const leaf = this.add.graphics();
  //     const x = Phaser.Math.Between(100, 980);
  //     const y = Phaser.Math.Between(300, 1600);
  //     const size = Phaser.Math.Between(5, 15);
  //     const alpha = Phaser.Math.FloatBetween(0.1, 0.3);
      
  //     leaf.fillStyle(0x00FF00, alpha);
  //     leaf.beginPath();
  //     leaf.moveTo(x, y - size);
  //     leaf.lineTo(x + size, y);
  //     leaf.lineTo(x, y + size);
  //     leaf.lineTo(x - size, y);
  //     leaf.closePath();
  //     leaf.fillPath();
      
  //     this.bgEffects.add(leaf);
      
  //     // Make leaves float and spin
  //     this.tweens.add({
  //       targets: leaf,
  //       x: leaf.x + Phaser.Math.Between(-100, 100),
  //       y: leaf.y - Phaser.Math.Between(100, 300),
  //       angle: Phaser.Math.Between(180, 720),
  //       alpha: 0,
  //       duration: Phaser.Math.Between(5000, 10000),
  //       delay: Phaser.Math.Between(0, 5000),
  //       repeat: -1
  //     });
  //   }
    
  //   // Add bow shape
  //   const bow = this.add.graphics();
  //   bow.lineStyle(6, 0x805500, 0.3);
  //   bow.beginPath();
  //   bow.arc(300, 750, 200, -0.7, 0.7, false);
  //   bow.strokePath();
    
  //   // Add bowstring
  //   bow.lineStyle(2, 0xFFFFFF, 0.2);
  //   bow.beginPath();
  //   bow.moveTo(300 + Math.cos(-0.7) * 200, 750 + Math.sin(-0.7) * 200);
  //   bow.lineTo(300 + Math.cos(0.7) * 200, 750 + Math.sin(0.7) * 200);
  //   bow.strokePath();
    
  //   this.bgEffects.add(bow);
    
  //   // Add a subtle green overlay
  //   const greenOverlay = this.add.rectangle(540, 960, 1080, 1920, 0x00FF00, 0.05);
  //   this.bgEffects.add(greenOverlay);
  // }

  /**
   * Apply mobile-specific optimizations
   */
  optimizeForMobile() {
    // Set game scale mode for better mobile fit
    this.game.scale.scaleMode = Phaser.Scale.FIT;
    
    // Adjust game settings for mobile performance
    this.cameras.main.roundPixels = this.MOBILE_ROUNDPIXELS;
    
    // Console log for debugging
    console.log('Mobile optimizations applied');
  }
  
  /**
   * Enable/disable background effects based on device capability
   */
  updateBackgroundEffects() {
    if (this.IS_TOUCH_DEVICE) {
      // On mobile, use simpler background effects
      // Disable particle effects or other heavy animations
      this.bgEffects.alpha = 0.5; // Reduce alpha to improve performance
      
      // Reduce the number of particles or effects if they were enabled
    } else {
      // On desktop, use full effects
      this.bgEffects.alpha = 1;
    }
  }
  
  /**
   * Updates character display with transition animations
   */
  updateCharacterDisplay() {
    // Change background image
    this.background.setTexture(this.backgroundFrames[this.currentIndex]);
    
    // If the character-specific background doesn't exist, use default
    if (!this.textures.exists(this.backgroundFrames[this.currentIndex])) {
      this.background.setTexture('background');
    }
    
    // Change character image
    this.character.setTexture(this.characterFrames[this.currentIndex]);
    
    // Update character name
    this.characterText.setText(this.characterNames[this.currentIndex]);
    
    // Update character description
    // this.characterDescription.setText(this.CHARACTER_DESCRIPTIONS[this.currentIndex]);
    
    // If texture doesn't exist, create a placeholder
    if (!this.textures.exists(this.characterFrames[this.currentIndex])) {
      const graphics = this.add.graphics();
      graphics.clear();
      graphics.fillStyle(this.CHARACTER_PLACEHOLDER_COLORS[this.currentIndex], 1);
      graphics.fillRect(540 - 150, this.characterBaseY - 200, 300, 400);
    }
    
    // Apply device-specific optimizations
    this.updateBackgroundEffects();
  }
  
  /**
   * Plays character bounce animation optimized for device type
   */
  playCharacterBounceAnimation() {
    // Shorter delay for touch devices for more responsive feel
    const bounceDelay = this.IS_TOUCH_DEVICE ? 200 : this.CHARACTER_BOUNCE_DELAY;
    
    this.time.delayedCall(bounceDelay, () => {
      this.tweens.add({
        targets: this.character,
        y: this.characterBaseY - this.CHARACTER_BOUNCE_HEIGHT,
        duration: this.IS_TOUCH_DEVICE ? 
          this.CHARACTER_BOUNCE_DURATION * 0.8 : // Slightly faster for touch
          this.CHARACTER_BOUNCE_DURATION,
        yoyo: true,
        ease: 'Sine.easeOut',
        onComplete: () => {
          // Ensure character is reset to exact base position
          this.character.y = this.characterBaseY;
        }
      });
    });
  }

  /**
   * Handles character transitions with optimizations for touch devices
   */
  changeCharacter(direction: number) {
    // Stop any existing tweens on the character to prevent position accumulation
    this.tweens.killTweensOf(this.character);
    
    // Reset the character's position to the base Y
    this.character.y = this.characterBaseY;
    
    // Calculate new index with wrap-around
    this.currentIndex = (this.currentIndex + direction + this.characterFrames.length) % this.characterFrames.length;
    
    // Touch optimized transition - faster fade for better responsiveness
    const fadeDuration = this.IS_TOUCH_DEVICE ? 
      this.CHARACTER_FADE_DURATION * 0.7 : // Faster for touch
      this.CHARACTER_FADE_DURATION;
    
    // Touch device haptic feedback simulation
    if (this.IS_TOUCH_DEVICE) {
      // Visual haptic feedback with a quick camera shake
      this.cameras.main.shake(50, 0.002);
    }
    
    // Transition to new character with fade effect
    this.tweens.add({
      targets: [this.character, this.characterText, this.bgEffects, this.background],
      alpha: 0,
      duration: fadeDuration,
      onComplete: () => {
        this.updateCharacterDisplay();
        
        // Fade back in - faster for touch
        this.tweens.add({
          targets: [this.character, this.characterText, this.bgEffects, this.background],
          alpha: 1,
          duration: fadeDuration,
          ease: 'Sine.easeOut'
        });
      }
    });
    
    // Play character bounce animation
    this.playCharacterBounceAnimation();
  }

  /**
   * Sets up the confirm button with special animations optimized for touch
   */
  setupConfirmButton() {
    this.confirmButton = this.add.image(540, this.CONFIRM_BUTTON_NORMAL_Y, "confirm-button")
      .setOrigin(0.5)
      .setScale(this.CONFIRM_BUTTON_NORMAL_SCALE)
      .setInteractive({ useHandCursor: true });
    
    if (this.IS_TOUCH_DEVICE) {
      // Touch-optimized confirm button
      this.confirmButton.on('pointerdown', () => {
        // Provide immediate visual feedback
        this.confirmButton.setScale(this.CONFIRM_BUTTON_CLICK_SCALE);
        
        // Add a quick bounce effect
        this.tweens.add({
          targets: this.confirmButton,
          y: this.CONFIRM_BUTTON_CLICK_Y,
          duration: this.TOUCH_BUTTON_FEEDBACK_DURATION,
          yoyo: true,
          ease: 'Bounce.easeOut',
          onComplete: () => {
            this.onConfirmCharacter();
          }
        });
      });
    } else {
      // Desktop interactions
      this.confirmButton.on('pointerover', () => {
        this.confirmButton.setScale(this.CONFIRM_BUTTON_HOVER_SCALE);
        this.confirmButton.setTint(0xffffff);
        this.tweens.add({
          targets: this.confirmButton,
          y: this.CONFIRM_BUTTON_HOVER_Y,
          duration: this.CONFIRM_BUTTON_ANIM_DURATION,
          ease: 'Sine.easeOut'
        });
      });
      
      this.confirmButton.on('pointerout', () => {
        this.confirmButton.setScale(this.CONFIRM_BUTTON_NORMAL_SCALE);
        this.confirmButton.setTint(0xffffcc);
        this.tweens.add({
          targets: this.confirmButton,
          y: this.CONFIRM_BUTTON_NORMAL_Y,
          duration: this.CONFIRM_BUTTON_ANIM_DURATION,
          ease: 'Sine.easeOut'
        });
      });
      
      this.confirmButton.on('pointerdown', () => {
        this.confirmButton.setScale(this.CONFIRM_BUTTON_CLICK_SCALE);
        this.tweens.add({
          targets: this.confirmButton,
          y: this.CONFIRM_BUTTON_CLICK_Y,
          duration: this.CONFIRM_BUTTON_CLICK_DURATION,
          yoyo: true,
          onComplete: () => {
            this.onConfirmCharacter();
          }
        });
      });
    }
  }
  
  /**
   * Handles the confirmation of character selection with device-specific feedback
   */
  onConfirmCharacter() {
    // Add device-specific effects
    if (this.IS_TOUCH_DEVICE) {
      // More dramatic effect for touch devices
      this.cameras.main.flash(this.CAMERA_FLASH_DURATION * 0.8, 255, 255, 255, true);
      // Add a quick zoom effect for emphasis
      this.tweens.add({
        targets: this.character,
        scale: this.character.scale * 1.1,
        duration: 100,
        yoyo: true
      });
    } else {
      // Standard effect for desktop
      this.cameras.main.flash(this.CAMERA_FLASH_DURATION, 255, 255, 255, true);
    }
    
    // Save selected character info and start the game
    localStorage.setItem('selectedCharacter', this.characterFrames[this.currentIndex]);
    
    // Adjust delay for device type
    const sceneChangeDelay = this.IS_TOUCH_DEVICE ? 
      this.SCENE_CHANGE_DELAY * 0.8 : 
      this.SCENE_CHANGE_DELAY;
    
    this.time.delayedCall(sceneChangeDelay, () => {
      this.scene.start('Game');
    });
  }

  /**
   * Setup swipe detection for mobile devices
   */
  setupSwipeControls() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.touchStartX = pointer.x;
      this.touchStartTime = Date.now();
    });
    
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      const swipeTime = Date.now() - this.touchStartTime;
      const swipeDistance = pointer.x - this.touchStartX;
      
      // Only process if it's a quick swipe
      if (swipeTime < this.SWIPE_TIME_THRESHOLD) {
        if (swipeDistance > this.SWIPE_THRESHOLD) {
          // Right swipe - previous character
          this.changeCharacter(-1);
        } else if (swipeDistance < -this.SWIPE_THRESHOLD) {
          // Left swipe - next character
          this.changeCharacter(1);
        }
      }
    });
  }
  
  /**
   * Optimize game updates for different devices
   */
  update(time: number, delta: number) {
    // Add touch-specific optimizations
    if (this.IS_TOUCH_DEVICE) {
      // Reduce update frequency for less critical animations
      if (time % 2 === 0) { // Only update every other frame
        // Update any background animations at half rate
      }
    }
  }
} 