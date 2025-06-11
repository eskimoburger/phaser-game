import Phaser from "phaser";

// Base sequence symbols that will be shuffled each game - medical themed
const BASE_SEQUENCE = ['first-aid', 'pills', 'tube-med'];

// Medical-themed symbols for the cabinet items
const MEDICAL_SYMBOLS = ['first-aid', 'pills', 'tube-med', 'ambulance', 'bandage', 'monitor'];

interface MedicalItem {
  sprite: Phaser.GameObjects.Image;
  icon: Phaser.GameObjects.Image;
  symbol: string;
  isClicked: boolean;
  isAnimating: boolean;
  index: number;
  shelfLevel: number;
}

export default class MatchingMiniGame extends Phaser.Scene {
  private medicalItems: MedicalItem[] = [];
  private currentStep = 0;
  private gameCompleted = false;
  private isRandomizing = false; // Flag to prevent clicking during randomization
  private isAnimating = false; // Flag to prevent overlapping animations
  
  // Shuffled sequence for this game
  private targetSequence: string[] = [];
  
  // UI elements
  private miniGameTitle!: Phaser.GameObjects.Text;
  private miniGameText!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;
  private sequenceDisplay!: Phaser.GameObjects.Container;
  private cabinetContainer!: Phaser.GameObjects.Container;

  private background: Phaser.GameObjects.Image;
  private backgroundTop: Phaser.GameObjects.Image;
  private backgroundBottom: Phaser.GameObjects.Image;
  private cart: Phaser.GameObjects.Image;
  
  constructor() {
    super({ key: 'MatchingMiniGame' });
  }

  create() {
    console.log('MatchingMiniGame: Scene created');
    
    // Clean up any existing state to prevent memory leaks
    this.cleanup();
    
    // Reset game state
    this.medicalItems = [];
    this.currentStep = 0;
    this.gameCompleted = false;
    
    // Generate shuffled sequence for this game
    this.targetSequence = this.shuffleArray([...BASE_SEQUENCE]);
    console.log('MatchingMiniGame: Target sequence:', this.targetSequence);
    
    // Create medical cabinet background
    // this.createMedicalCabinet();

    this.background = this.add.image(540, 1280, 'bg-matching-game').setScale(0.5)
    this.backgroundTop = this.add.image(540, 230, 'bg-matching-top').setScale(0.5)
    this.backgroundBottom = this.add.image(540, 1820, 'bg-matching-bottom').setScale(0.5)
    
    this.cart = this.add.image(-100, 1600, 'cart').setScale(0.5)

    // Create sequence display container with medical theme
    this.createMedicalSequenceDisplay();
    
    // Initially hide the sequence display until cart is in position
    this.sequenceDisplay.setAlpha(0);
    
    // Animate cart sliding to center
    this.tweens.add({
      targets: this.cart,
      x: 540, // Move to center x position
      duration: 1000,
      ease: 'Back.easeOut',
      delay: 1000, // Small delay before animation starts
      onComplete: () => {
        // Show the sequence display with an animation when cart reaches center
        this.tweens.add({
          targets: this.sequenceDisplay,
          alpha: 1,
          scale: { from: 1.5, to: 1.8 },
          duration: 500,
          ease: 'Back.easeOut'
        });
      }
    })

    // Create title
    // this.miniGameTitle = this.add.text(540, 100, 'MEDICAL SEQUENCE', {
    //   fontFamily: 'Commando',
    //   fontSize: '38px',
    //   color: '#ff6b9d',
    //   stroke: '#000000',
    //   strokeThickness: 3
    // });
    // this.miniGameTitle.setOrigin(0.5, 0.5);
    
    // Create prescription notes at the top (like in reference image)
    // this.createPrescriptionNotes();
    
    // Create sequence display container with medical theme
    // this.createMedicalSequenceDisplay();
    
    // Create instructions
    // this.miniGameText = this.add.text(540, 280, 'Find the medical items in the correct order!', {
    //   fontFamily: 'Commando',
    //   fontSize: '20px',
    //   color: '#ffffff',
    //   align: 'center'
    // });
    // this.miniGameText.setOrigin(0.5, 0.5);
    
    // Create the medical cabinet with items
    this.createMedicalCabinetItems();
    
    // Create progress indicator
    // this.progressText = this.add.text(540, 950, `Item: ${this.currentStep + 1}/${this.targetSequence.length}`, {
    //   fontFamily: 'Commando',
    //   fontSize: '22px',
    //   color: '#4ecdc4'
    // });
    // this.progressText.setOrigin(0.5, 0.5);
    
    // Add escape option
    // const escapeText = this.add.text(540, 1100, 'Press ESC to return without bonus', {
    //   fontFamily: 'Commando',
    //   fontSize: '16px',
    //   color: '#888888'
    // });
    // escapeText.setOrigin(0.5, 0.5);
    
    // No escape allowed - must complete the mini-game
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ESC', () => {
        console.log('MatchingMiniGame: ESC pressed - but escape is not allowed');
        
        // Show warning message
        const warningText = this.add.text(540, 400, 'YOU MUST COMPLETE THE MINI-GAME!', {
          fontFamily: 'Commando',
          fontSize: '28px',
          color: '#ff0000',
          stroke: '#000000',
          strokeThickness: 4
        });
        warningText.setOrigin(0.5, 0.5);
        
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
    }
  }
  
  private cleanup() {
    // Clean up any existing tweens
    if (this.tweens) {
      this.tweens.killAll();
    }
    
    // Kill animations on medical items specifically
    if (this.medicalItems) {
      this.medicalItems.forEach(item => {
        if (item && item.icon) {
          this.tweens.killTweensOf(item.icon);
        }
      });
    }
    
    // Reset arrays
    this.medicalItems = [];
    this.targetSequence = [];
    
    // Reset flags
    this.isRandomizing = false;
    this.isAnimating = false;
    
    // Clean up keyboard events
    if (this.input.keyboard) {
      this.input.keyboard.removeAllListeners();
    }
  }
  
  private createMedicalCabinet() {
    // Create purple gradient background similar to reference image
    const bg = this.add.rectangle(540, 640, 1080, 1280, 0x2a1a4a, 1);
    
    // Create cabinet frame
    const cabinetFrame = this.add.rectangle(540, 650, 480, 600, 0x3d2b5f, 1);
    cabinetFrame.setStrokeStyle(4, 0x5a4078, 1);
    
    // Create cabinet interior
    const cabinetInterior = this.add.rectangle(540, 650, 460, 580, 0x4a3266, 1);
    
    // Create horizontal shelves (3 shelves like in reference)
    const shelfY = [450, 590, 730]; // Three shelf levels
    shelfY.forEach(y => {
      // Main shelf
      const shelf = this.add.rectangle(540, y, 440, 12, 0x5a4078, 1);
      shelf.setStrokeStyle(2, 0x6b4d85, 1);
      
      // Shelf shadow/depth
      const shelfShadow = this.add.rectangle(540, y + 3, 440, 8, 0x2a1a4a, 0.7);
    });
    
    // Create vertical dividers for shelves (2 columns per shelf)
    shelfY.forEach(y => {
      const divider = this.add.rectangle(540, y - 60, 4, 120, 0x5a4078, 1);
    });
    
    // Add cabinet handles/details
    const leftHandle = this.add.circle(350, 420, 8, 0x8a6ba8, 1);
    const rightHandle = this.add.circle(730, 420, 8, 0x8a6ba8, 1);
  }
  
  private createPrescriptionNotes() {
    // Create prescription note papers at the top (like in reference image)
    const notePositions = [
      { x: 420, y: 150, rotation: -0.1 },
      { x: 540, y: 140, rotation: 0.05 },
      { x: 660, y: 145, rotation: -0.05 }
    ];
    
    notePositions.forEach((pos, index) => {
      // Note paper background
      const note = this.add.rectangle(pos.x, pos.y, 120, 80, 0xe8dff5, 1);
      note.setStrokeStyle(1, 0xc8b9d9, 1);
      note.setRotation(pos.rotation);
      
      // Note lines
      for (let i = 0; i < 4; i++) {
        const line = this.add.rectangle(pos.x, pos.y - 20 + i * 12, 100, 1, 0xd4c5e0, 1);
        line.setRotation(pos.rotation);
      }
      
      // Push pin
      const pin = this.add.circle(pos.x, pos.y - 35, 6, 0x4ecdc4, 1);
      pin.setStrokeStyle(2, 0x3ba99c, 1);
    });
  }
  
  private createMedicalSequenceDisplay() {
    // Create prescription pad background for sequence display
    // const sequenceBg = this.add.rectangle(540, 220, 360, 70, 0xe8dff5, 0.95);
    // sequenceBg.setStrokeStyle(2, 0xc8b9d9, 1);
    
    // Create title for sequence
    // const sequenceTitle = this.add.text(540, 195, 'PRESCRIPTION ORDER', {
    //   fontFamily: 'Commando',
    //   fontSize: '16px',
    //   color: '#8a6ba8'
    // });
    // sequenceTitle.setOrigin(0.5, 0.5);
    
    // Create container for sequence symbols - centered at x=540
    this.sequenceDisplay = this.add.container(540, 240).setScale(1.8)
    
    // Add the sequence symbols with medical styling
    this.targetSequence.forEach((symbol, index) => {
      const x = (index - 1) * 180; // 180px spacing, centered
      
      // Create pill bottle/medical container for each symbol
    //   const containerBg = this.add.rectangle(x, 0, 100, 100, 0xffffff, 1);
    //   containerBg.setStrokeStyle(4, 0x8a6ba8, 1);
      
      // Create the symbol
      const symbolImage = this.add.image(x, 0, symbol).setScale(0.2);
      symbolImage.setOrigin(0.5, 0.5);
      
      // Create step number label
    //   const stepLabel = this.add.text(x, -30, `${index + 1}`, {
    //     fontFamily: 'Commando',
    //     fontSize: '12px',
    //     color: '#8a6ba8',
    //     backgroundColor: '#ffffff',
    //     padding: { x: 4, y: 2 }
    //   });
    //   stepLabel.setOrigin(0.5, 0.5);
      
      // Add to container
      this.sequenceDisplay.add([
        
        // containerBg, 
        symbolImage, 
        
        // stepLabel
    
    ]);
    });
  }
  
  private createMedicalCabinetItems() {
    // Create medical items on 2 shelves, 3 items per shelf (6 total)
    const shelfPositions = [
      { y: 700, level: 0 }, // Top shelf
      { y: 1120, level: 1 }  // Bottom shelf (480 + 215)
    ];
    
    // Create 6 medical items with smart symbol distribution
    const availableSymbols = [...MEDICAL_SYMBOLS];
    const shuffledSymbols: string[] = [];
    
    // Ensure the target sequence symbols are included
    this.targetSequence.forEach(symbol => {
      shuffledSymbols.push(symbol);
    });
    
    // Fill remaining slots with random medical symbols
    while (shuffledSymbols.length < 6) {
      const randomSymbol = availableSymbols[Math.floor(Math.random() * availableSymbols.length)];
      shuffledSymbols.push(randomSymbol);
    }
    
    // Shuffle the final array
    const finalSymbols = this.shuffleArray(shuffledSymbols);
    
    // Create 6 medical items (3 per shelf)
    let itemIndex = 0;
    shelfPositions.forEach((shelf, shelfIndex) => {
      for (let i = 0; i < 3; i++) {
        const x =  i * 300 + 240; // Centered: 360, 540, 720
        const y = shelf.y;
        
        // Medical item symbol (now interactive itself)
        const itemIcon = this.add.image(x, y, finalSymbols[itemIndex]).setScale(0.5);
        itemIcon.setOrigin(0.5, 0.5);
        itemIcon.setInteractive();
        
        const medicalItem: MedicalItem = {
          sprite: itemIcon,
          icon: itemIcon,
          symbol: finalSymbols[itemIndex],
          isClicked: false,
          isAnimating: false,
          index: itemIndex,
          shelfLevel: shelfIndex
        };
        
        this.medicalItems.push(medicalItem);
        
        // Item click handler
        itemIcon.on('pointerdown', () => {
          this.handleMedicalItemClick(medicalItem);
        });
        
        // Item hover effect
        itemIcon.on('pointerover', () => {
          if (!medicalItem.isClicked) {
            itemIcon.setTint(0x7ba3d9);
          }
        });
        
        itemIcon.on('pointerout', () => {
          if (!medicalItem.isClicked) {
            itemIcon.clearTint();
          }
        });
        
        itemIndex++;
      }
    });
  }
  
  private handleMedicalItemClick(item: MedicalItem) {
    if (this.gameCompleted || this.isRandomizing || this.isAnimating || item.isAnimating) {
      return;
    }
    
    // Safety check: ensure targetSequence is valid
    if (!this.targetSequence || this.targetSequence.length === 0) {
      console.error('MatchingMiniGame: Invalid target sequence');
      return;
    }
    
    // Safety check: ensure currentStep is within bounds
    if (this.currentStep < 0 || this.currentStep >= this.targetSequence.length) {
      console.error('MatchingMiniGame: Invalid current step:', this.currentStep);
      return;
    }
    
    // Set animating flag to prevent further clicks
    this.isAnimating = true;
    item.isAnimating = true;
    
    // Check if the clicked item is correct for current step
    if (item.symbol === this.targetSequence[this.currentStep]) {
      // Correct! Move to next step
      
      // Brief success animation
      this.tweens.add({
        targets: item.icon,
        scaleX: 0.6, // From 0.5 to 0.6
        scaleY: 0.6,
        duration: 200,
        yoyo: true,
        ease: 'Back.easeOut',
        onComplete: () => {
          // Animation completed, allow next interaction after a small delay
          item.isAnimating = false;
          this.time.delayedCall(100, () => {
            this.isAnimating = false;
          });
        }
      });
      
      // Add sparkle effect for successful selection
      this.createMedicalSparkles(item.sprite.x, item.sprite.y);
      
      this.currentStep++;
      
      // Safety check before updating progress
      try {
        this.updateMedicalProgress();
      } catch (error) {
        console.error('MatchingMiniGame: Error updating progress:', error);
      }
      
      // Check if sequence is complete
      if (this.currentStep >= this.targetSequence.length) {
        this.time.delayedCall(500, () => {
          this.exitMiniGame(true);
        });
      } else {
        // Disable clicking before randomization starts
        this.isRandomizing = true;
        
        // Add visual feedback that randomization is coming
        if (this.progressText) {
          this.tweens.add({
            targets: this.progressText,
            alpha: 0.5,
            duration: 200,
            yoyo: true,
            repeat: 3,
            ease: 'Sine.easeInOut'
          });
        }
        
        // Randomize items after correct click too
        this.time.delayedCall(800, () => {
          try {
            this.randomizeAllMedicalItems();
          } catch (error) {
            console.error('MatchingMiniGame: Error randomizing items after correct click:', error);
            // Reset flag if error occurs
            this.isRandomizing = false;
          }
        });
      }
    } else {
      // Incorrect! Show red briefly then reset everything
      item.sprite.setTint(0xff4757); // Bright red for error
      
      // Add error animation
      this.tweens.add({
        targets: item.icon,
        scaleX: 0.6, // From 0.5 to 0.6
        scaleY: 0.6,
        duration: 200,
        yoyo: true,
        ease: 'Back.easeOut',
        onComplete: () => {
          item.isAnimating = false;
        }
      });
      
      // Store original position for shake animation
      const originalX = item.icon.x;
      
      // Add error shake effect
      this.tweens.add({
        targets: item.icon,
        x: originalX + 5,
        duration: 50,
        yoyo: true,
        repeat: 3,
        ease: 'Power2',
        onComplete: () => {
          // Reset position to original
          item.icon.x = originalX;
        }
      });
      
      // Keep red color for a moment then reset everything
      this.time.delayedCall(800, () => {
        // Reset color
        item.sprite.clearTint();
        
        // Disable clicking before sequence reset and reset animation flag
        this.isRandomizing = true;
        this.isAnimating = false;
        
        // Add visual feedback that reset is happening
        if (this.progressText) {
          this.tweens.add({
            targets: this.progressText,
            alpha: 0.3,
            duration: 300,
            yoyo: true,
            repeat: 2,
            ease: 'Sine.easeInOut'
          });
        }
        
        // Reset sequence - user must start over with new randomized items
        try {
          this.resetMedicalSequence();
        } catch (error) {
          console.error('MatchingMiniGame: Error resetting sequence:', error);
          // Reset flag if error occurs
          this.isRandomizing = false;
        }
      });
    }
  }
  
  private createMedicalSparkles(x: number, y: number) {
    // Create medical-themed sparkle effect
    const sparkleSymbols = ['✨', '💫', '⭐', '🌟'];
    
    for (let i = 0; i < 3; i++) {
      const sparkle = this.add.text(
        x + (Math.random() - 0.5) * 40, 
        y + (Math.random() - 0.5) * 40, 
        sparkleSymbols[Math.floor(Math.random() * sparkleSymbols.length)], 
        {
          fontSize: '16px'
        }
      );
      sparkle.setOrigin(0.5, 0.5);
      
      this.tweens.add({
        targets: sparkle,
        y: sparkle.y - 30,
        alpha: 0,
        scale: 1.5,
        duration: 600 + Math.random() * 400,
        ease: 'Sine.easeOut',
        onComplete: () => {
          if (sparkle && sparkle.destroy) {
            sparkle.destroy();
          }
        }
      });
    }
  }
  
  private randomizeAllMedicalItems() {
    // Don't randomize if game is completed
    if (this.gameCompleted) return;
    
    // Safety checks
    if (!this.targetSequence || this.targetSequence.length === 0) {
      console.error('MatchingMiniGame: Cannot randomize - invalid target sequence');
      this.isRandomizing = false;
      return;
    }
    
    if (!this.medicalItems || this.medicalItems.length === 0) {
      console.error('MatchingMiniGame: Cannot randomize - no items available');
      this.isRandomizing = false;
      return;
    }
    
    // Kill any existing animations to prevent conflicts
    this.medicalItems.forEach(item => {
      if (item && item.icon) {
        this.tweens.killTweensOf(item.icon);
      }
    });
    
    // Set animating flag during randomization
    this.isAnimating = true;
    
    // Get remaining target symbols needed
    const remainingTargetSymbols = this.targetSequence.slice(this.currentStep);
    console.log('MatchingMiniGame: Randomizing with remaining targets:', remainingTargetSymbols);
    
    // Reset all items
    this.medicalItems.forEach(item => {
      if (item && item.sprite) {
        item.isClicked = false;
        item.isAnimating = false;
        item.sprite.clearTint();
      }
    });
    
    // Create a new set of symbols ensuring remaining target symbols are included
    const newSymbols: string[] = [];
    
    // First, add all remaining target symbols
    remainingTargetSymbols.forEach(symbol => {
      newSymbols.push(symbol);
    });
    
    // Fill remaining slots with random medical symbols
    while (newSymbols.length < 6) {
      const randomSymbol = MEDICAL_SYMBOLS[Math.floor(Math.random() * MEDICAL_SYMBOLS.length)];
      newSymbols.push(randomSymbol);
    }
    
    // Shuffle the symbols
    const shuffledSymbols = this.shuffleArray(newSymbols);
    
    // Apply new symbols to items with animation
    this.medicalItems.forEach((item, index) => {
      if (!item || !item.sprite || !item.icon) {
        return;
      }
      
      this.time.delayedCall(index * 80, () => {
        // Animate symbol change
        this.tweens.add({
          targets: item.icon,
          scaleX: 0.1,
          scaleY: 0.1,
          duration: 150,
          ease: 'Back.easeIn',
          onComplete: () => {
            try {
              // Change the symbol
              item.symbol = shuffledSymbols[index];
              item.icon.setTexture(shuffledSymbols[index]);
              item.isClicked = false;
              
              // Ensure default color
              item.sprite.clearTint();
              
              // Scale back up to normal image size
              this.tweens.add({
                targets: item.icon,
                scaleX: 0.5,
                scaleY: 0.5,
                duration: 200,
                ease: 'Back.easeOut'
              });
            } catch (error) {
              console.error('MatchingMiniGame: Error updating item:', error);
            }
          }
        });
      });
    });
    
    // Reset randomizing flag after all animations complete
    // Since flag was set earlier, we only need to wait for the randomization animations
    // Time: (last item delay) + (animation duration) + (scale back duration) + buffer
    // = (5 * 80) + 150 + 200 + 50 = 800ms
    this.time.delayedCall(800, () => {
      this.isRandomizing = false;
      this.isAnimating = false;
    });
  }
  
  private updateMedicalProgress() {
    // Safety checks
    if (!this.targetSequence || this.targetSequence.length === 0) {
      console.error('MatchingMiniGame: Cannot update progress - invalid target sequence');
      return;
    }
    
    if (!this.sequenceDisplay) {
      console.error('MatchingMiniGame: Sequence display not available');
      return;
    }
    
    try {
      // Update progress text only if it exists
      if (this.progressText) {
        this.progressText.setText(`Item: ${this.currentStep + 1}/${this.targetSequence.length}`);
      }
      
      // Update sequence display to highlight current step
      this.sequenceDisplay.removeAll(true);
      
      this.targetSequence.forEach((symbol, index) => {
        const x = (index - 1) * 180; // 180px spacing, centered
        const isCurrentStep = index === this.currentStep;
        const isCompleted = index < this.currentStep;
        
        // Create the symbol image
        const symbolImage = this.add.image(x, 0, symbol).setScale(0.2);
        symbolImage.setOrigin(0.5, 0.5);
        
        // Add tint based on status
        if (isCompleted) {
          symbolImage.setTint(0x4ecdc4); // Teal tint for completed
        } else if (isCurrentStep) {
          symbolImage.setTint(0xffe066); // Yellow tint for current
          
          // Add pulsing animation for current step
          this.tweens.add({
            targets: symbolImage,
            scaleX: 0.24, // From 0.2 to 0.24
            scaleY: 0.24,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
        } else {
          symbolImage.clearTint(); // No tint for pending items
        }
        
        // Create step indicator
        const stepText = this.add.text(x, -50, `${index + 1}`, {
          fontFamily: 'Commando',
          fontSize: '18px',
          color: isCurrentStep ? '#ff6b00' : '#8a6ba8',
          backgroundColor: isCurrentStep ? '#ffffff' : 'transparent',
          padding: { x: 6, y: 3 }
        });
        stepText.setOrigin(0.5, 0.5);
        
        // Add to container
        this.sequenceDisplay.add([symbolImage, stepText]);
      });
    } catch (error) {
      console.error('MatchingMiniGame: Error updating progress display:', error);
    }
  }
  
  private resetMedicalSequence() {
    try {
      // Safety check for items array
      if (!this.medicalItems || this.medicalItems.length === 0) {
        console.error('MatchingMiniGame: Cannot reset sequence - no items available');
        return;
      }
      
      // Reset step counter
      this.currentStep = 0;
      
      // Generate new shuffled sequence
      this.targetSequence = this.shuffleArray([...BASE_SEQUENCE]);
      console.log('MatchingMiniGame: New target sequence:', this.targetSequence);
      
      // Update progress display
      this.updateMedicalProgress();
      
      // Randomize all items for a fresh start (use the full randomization method)
      this.time.delayedCall(200, () => {
        try {
          this.randomizeAllMedicalItems();
        } catch (error) {
          console.error('MatchingMiniGame: Error randomizing items after reset:', error);
        }
      });
      
      console.log('MatchingMiniGame: Sequence reset - new items generated');
    } catch (error) {
      console.error('MatchingMiniGame: Error in resetMedicalSequence:', error);
    }
  }
  
  private exitMiniGame(success: boolean) {
    if (this.gameCompleted) return;
    
    this.gameCompleted = true;
    
    console.log(`MatchingMiniGame: Exiting with success: ${success}`);
    
    try {
      // Show result briefly
      let resultText: string;
      let resultColor: string;
      
      if (success) {
        resultText = 'SUCCESS! +15 SECONDS!';
        resultColor = '#00ff00';
      } else {
        resultText = 'NO BONUS';
        resultColor = '#ff4444';
      }
      
      const result = this.add.text(540, 640, resultText, {
        fontFamily: 'Commando',
        fontSize: '36px',
        color: resultColor,
        stroke: '#000000',
        strokeThickness: 4
      });
      result.setOrigin(0.5, 0.5);
      
      // Animate result and transition back
      this.tweens.add({
        targets: result,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 300,
        yoyo: true,
        ease: 'Back.easeOut',
        onComplete: () => {
          try {
            // Clean up before transition
            this.cleanup();
            
            // Transition back to AirHockey scene with result
            this.scene.start('AirHockey', { 
              miniGameResult: success,
              resumeGame: true 
            });
          } catch (error) {
            console.error('MatchingMiniGame: Error during scene transition:', error);
            // Fallback: just transition without data
            this.scene.start('AirHockey');
          }
        }
      });
    } catch (error) {
      console.error('MatchingMiniGame: Error in exitMiniGame:', error);
      // Fallback: directly transition to main game
      this.scene.start('AirHockey');
    }
  }
  
  private shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  destroy() {
    // Clean up when scene is destroyed
    this.cleanup();
  }
} 