import Phaser from "phaser";

const BASE_SEQUENCE = ['first-aid', 'pills', 'tube-med'];

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
  private isRandomizing = false;
  private isAnimating = false;
  
  private targetSequence: string[] = [];
  
  private sequenceDisplay!: Phaser.GameObjects.Container;
  private cart: Phaser.GameObjects.Image;
  
  constructor() {
    super({ key: 'MatchingMiniGame' });
  }

  create() {
    this.cleanup();
    
    this.medicalItems = [];
    this.currentStep = 0;
    this.gameCompleted = false;
    
    this.targetSequence = this.shuffleArray([...BASE_SEQUENCE]);

    this.add.image(540, 1280, 'bg-matching-game').setScale(0.5);
    this.add.image(540, 230, 'bg-matching-top').setScale(0.5);
    this.add.image(540, 1820, 'bg-matching-bottom').setScale(0.5);
    
    this.cart = this.add.image(-100, 1600, 'cart').setScale(0.5)

    this.createMedicalSequenceDisplay();
    
    this.sequenceDisplay.setAlpha(0);
    
    this.tweens.add({
      targets: this.cart,
      x: 540,
      duration: 1000,
      ease: 'Back.easeOut',
      delay: 1000,
      onComplete: () => {
        this.tweens.add({
          targets: this.sequenceDisplay,
          alpha: 1,
          scale: { from: 1.5, to: 1.8 },
          duration: 500,
          ease: 'Back.easeOut'
        });
      }
    })
    
    this.createMedicalCabinetItems();
    
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ESC', () => {
        const warningText = this.add.text(540, 400, 'YOU MUST COMPLETE THE MINI-GAME!', {
          fontFamily: 'Commando',
          fontSize: '28px',
          color: '#ff0000',
          stroke: '#000000',
          strokeThickness: 4
        });
        warningText.setOrigin(0.5, 0.5);
        
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
    if (this.tweens) {
      this.tweens.killAll();
    }
    
    if (this.medicalItems) {
      this.medicalItems.forEach(item => {
        if (item && item.icon) {
          this.tweens.killTweensOf(item.icon);
        }
      });
    }
    
    this.medicalItems = [];
    this.targetSequence = [];
    
    this.isRandomizing = false;
    this.isAnimating = false;
    
    if (this.input.keyboard) {
      this.input.keyboard.removeAllListeners();
    }
  }
  
  private createMedicalSequenceDisplay() {
    this.sequenceDisplay = this.add.container(540, 240).setScale(1.8)
    
    this.targetSequence.forEach((symbol, index) => {
      const x = (index - 1) * 180;
      
      const symbolImage = this.add.image(x, 0, symbol).setScale(0.2);
      symbolImage.setOrigin(0.5, 0.5);
      
      this.sequenceDisplay.add([symbolImage]);
    });
  }
  
  private createMedicalCabinetItems() {
    const shelfPositions = [
      { y: 700, level: 0 },
      { y: 1120, level: 1 }
    ];
    
    const availableSymbols = [...MEDICAL_SYMBOLS];
    const selectedSymbols: string[] = [];
    
    this.targetSequence.forEach(symbol => {
      selectedSymbols.push(symbol);
      const index = availableSymbols.indexOf(symbol);
      if (index > -1) {
        availableSymbols.splice(index, 1);
      }
    });
    
    while (selectedSymbols.length < 6 && availableSymbols.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableSymbols.length);
      const randomSymbol = availableSymbols[randomIndex];
      selectedSymbols.push(randomSymbol);
      availableSymbols.splice(randomIndex, 1);
    }
    
    const finalSymbols = this.shuffleArray(selectedSymbols);
    
    let itemIndex = 0;
    shelfPositions.forEach((shelf, shelfIndex) => {
      for (let i = 0; i < 3; i++) {
        const x =  i * 300 + 240;
        const y = shelf.y;
        
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
        
        itemIcon.on('pointerdown', () => {
          this.handleMedicalItemClick(medicalItem);
        });
        
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
    
    if (!this.targetSequence || this.targetSequence.length === 0) {
      return;
    }
    
    if (this.currentStep < 0 || this.currentStep >= this.targetSequence.length) {
      return;
    }
    
    this.isAnimating = true;
    item.isAnimating = true;
    
    if (item.symbol === this.targetSequence[this.currentStep]) {
      
      this.tweens.add({
        targets: item.icon,
        scaleX: 0.6,
        scaleY: 0.6,
        duration: 200,
        yoyo: true,
        ease: 'Back.easeOut',
        onComplete: () => {
          item.isAnimating = false;
          this.time.delayedCall(100, () => {
            this.isAnimating = false;
          });
        }
      });
      
      this.createMedicalSparkles(item.sprite.x, item.sprite.y);
      
      this.currentStep++;
      
      try {
        this.updateMedicalProgress();
      } catch (error) {
      }
      
      if (this.currentStep >= this.targetSequence.length) {
        this.time.delayedCall(500, () => {
          this.exitMiniGame(true);
        });
      } else {
        this.isRandomizing = true;
        
        this.time.delayedCall(800, () => {
          try {
            this.randomizeAllMedicalItems();
          } catch (error) {
            this.isRandomizing = false;
          }
        });
      }
    } else {
      item.sprite.setTint(0xff4757);
      
      this.tweens.add({
        targets: item.icon,
        scaleX: 0.6,
        scaleY: 0.6,
        duration: 200,
        yoyo: true,
        ease: 'Back.easeOut',
        onComplete: () => {
          item.isAnimating = false;
        }
      });
      
      const originalX = item.icon.x;
      
      this.tweens.add({
        targets: item.icon,
        x: originalX + 5,
        duration: 50,
        yoyo: true,
        repeat: 3,
        ease: 'Power2',
        onComplete: () => {
          item.icon.x = originalX;
        }
      });
      
      this.time.delayedCall(800, () => {
        item.sprite.clearTint();
        
        this.isRandomizing = true;
        this.isAnimating = false;
        
        try {
          this.resetMedicalSequence();
        } catch (error) {
          this.isRandomizing = false;
        }
      });
    }
  }
  
  private createMedicalSparkles(x: number, y: number) {
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
    if (this.gameCompleted) return;
    
    if (!this.targetSequence || this.targetSequence.length === 0) {
      this.isRandomizing = false;
      return;
    }
    
    if (!this.medicalItems || this.medicalItems.length === 0) {
      this.isRandomizing = false;
      return;
    }
    
    this.medicalItems.forEach(item => {
      if (item && item.icon) {
        this.tweens.killTweensOf(item.icon);
      }
    });
    
    this.isAnimating = true;
    
    this.medicalItems.forEach(item => {
      if (item && item.sprite) {
        item.isClicked = false;
        item.isAnimating = false;
        item.sprite.clearTint();
      }
    });
    
    const positions: { x: number, y: number }[] = [];
    this.medicalItems.forEach(item => {
      positions.push({ x: item.icon.x, y: item.icon.y });
    });
    
    const shuffledPositions = this.shuffleArray([...positions]);
    
    this.medicalItems.forEach((item, index) => {
      if (!item || !item.sprite || !item.icon) {
        return;
      }
      
      const newPos = shuffledPositions[index];
      
      this.tweens.add({
        targets: item.icon,
        x: newPos.x,
        y: newPos.y,
        duration: 500,
        ease: 'Power2.inOut',
        delay: index * 50,
        onStart: () => {
          item.isAnimating = true;
        },
        onComplete: () => {
          item.isAnimating = false;
        }
      });
    });
    
    this.time.delayedCall(800, () => {
      this.isRandomizing = false;
      this.isAnimating = false;
    });
  }
  
  private updateMedicalProgress() {
    if (!this.targetSequence || this.targetSequence.length === 0) {
      return;
    }
    
    if (!this.sequenceDisplay) {
      return;
    }
    
    try {
      this.sequenceDisplay.removeAll(true);
      
      this.targetSequence.forEach((symbol, index) => {
        const x = (index - 1) * 180;
        const isCurrentStep = index === this.currentStep;
        const isCompleted = index < this.currentStep;
        
        const symbolImage = this.add.image(x, 0, symbol).setScale(0.2);
        symbolImage.setOrigin(0.5, 0.5);
        
        if (isCompleted) {
          symbolImage.setTint(0x4ecdc4);
        } else if (isCurrentStep) {
          symbolImage.setTint(0xffe066);
          
          this.tweens.add({
            targets: symbolImage,
            scaleX: 0.24,
            scaleY: 0.24,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
        } else {
          symbolImage.clearTint();
        }
        
        const stepText = this.add.text(x, -50, `${index + 1}`, {
          fontFamily: 'Commando',
          fontSize: '18px',
          color: isCurrentStep ? '#ff6b00' : '#8a6ba8',
          backgroundColor: isCurrentStep ? '#ffffff' : 'transparent',
          padding: { x: 6, y: 3 }
        });
        stepText.setOrigin(0.5, 0.5);
        
        this.sequenceDisplay.add([symbolImage, stepText]);
      });
    } catch (error) {
    }
  }
  
  private resetMedicalSequence() {
    try {
      if (!this.medicalItems || this.medicalItems.length === 0) {
        return;
      }
      
      this.currentStep = 0;
      
      this.targetSequence = this.shuffleArray([...BASE_SEQUENCE]);
      
      this.updateMedicalProgress();
      
      this.time.delayedCall(200, () => {
        try {
          this.randomizeAllMedicalItems();
        } catch (error) {
        }
      });
      
    } catch (error) {
    }
  }
  
  private exitMiniGame(success: boolean) {
    if (this.gameCompleted) return;
    
    this.gameCompleted = true;
    
    try {
      if (success) {
        const overlay = this.add.rectangle(540, 960, 1080, 1920, 0x000000, 0.8);
        overlay.setDepth(1000);
        
        const victoryContainer = this.add.container(540, 960);
        victoryContainer.setDepth(1001);
        
        const victoryText = this.add.text(0, -100, 'VICTORY!', {
          fontFamily: 'Commando',
          fontSize: '72px',
          color: '#FFD700',
          stroke: '#000000',
          strokeThickness: 6
        });
        victoryText.setOrigin(0.5, 0.5);
        
        const successText = this.add.text(0, 0, 'PERFECT SEQUENCE!', {
          fontFamily: 'Commando',
          fontSize: '42px',
          color: '#00FF00',
          stroke: '#000000',
          strokeThickness: 4
        });
        successText.setOrigin(0.5, 0.5);
        
        const bonusText = this.add.text(0, 80, '+15 SECONDS BONUS', {
          fontFamily: 'Commando',
          fontSize: '36px',
          color: '#FFFFFF',
          stroke: '#000000',
          strokeThickness: 4
        });
        bonusText.setOrigin(0.5, 0.5);
        
        victoryContainer.add([victoryText, successText, bonusText]);
        
        victoryContainer.setScale(0);
        this.tweens.add({
          targets: victoryContainer,
          scale: 1,
          duration: 500,
          ease: 'Back.easeOut'
        });
        
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 * i) / 8;
          const distance = 200;
          const sparkle = this.add.text(
            distance * Math.cos(angle),
            -100 + distance * Math.sin(angle),
            '✨',
            { fontSize: '48px' }
          );
          sparkle.setOrigin(0.5, 0.5);
          victoryContainer.add(sparkle);
          
          this.tweens.add({
            targets: sparkle,
            scale: { from: 0, to: 1.5 },
            alpha: { from: 1, to: 0 },
            duration: 1000,
            ease: 'Power2',
            repeat: -1
          });
        }
        
        this.time.delayedCall(1000, () => {
          this.tweens.add({
            targets: [overlay, victoryContainer],
            alpha: 0,
            duration: 500,
            onComplete: () => {
              try {
                this.cleanup();
                
                this.scene.start('AirHockey', { 
                  miniGameResult: success,
                  resumeGame: true 
                });
              } catch (error) {
                this.scene.start('AirHockey');
              }
            }
          });
        });
        
      } else {
        const resultText = 'NO BONUS';
        const resultColor = '#ff4444';
        
        const result = this.add.text(540, 640, resultText, {
          fontFamily: 'Commando',
          fontSize: '36px',
          color: resultColor,
          stroke: '#000000',
          strokeThickness: 4
        });
        result.setOrigin(0.5, 0.5);
        
        this.tweens.add({
          targets: result,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 300,
          yoyo: true,
          ease: 'Back.easeOut',
          onComplete: () => {
            try {
              this.cleanup();
              
              this.scene.start('AirHockey', { 
                miniGameResult: success,
                resumeGame: true 
              });
            } catch (error) {
              this.scene.start('AirHockey');
            }
          }
        });
      }
    } catch (error) {
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
    this.cleanup();
  }
}