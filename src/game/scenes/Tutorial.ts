import { Scene, GameObjects } from "phaser";

export class Tutorial extends Scene {
  background: GameObjects.Rectangle;
  backButton: GameObjects.Image;
  nextButton: GameObjects.Image;
  prevButton: GameObjects.Image;
  tutorialImage: GameObjects.Image;
  pageText: GameObjects.Text;
  
  // Tutorial images from the tuitorial folder
  tutorialImages: string[] = ['tutorial-1', 'tutorial-2', 'tutorial-3'];
  currentPage: number = 0;
  totalPages: number = 3;
  
  // Touch gestures
  private touchStartX: number = 0;
  private touchStartTime: number = 0;
  private readonly SWIPE_THRESHOLD = 50;
  private readonly SWIPE_TIME_THRESHOLD = 300;
  private readonly IS_TOUCH_DEVICE = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  constructor() {
    super("Tutorial");
  }

  create() {
    // Always start with first tutorial image (htp1)
    this.currentPage = 0;

    // Add black background
    this.background = this.add.rectangle(0, 0, 1080, 1920, 0x000000).setOrigin(0, 0);

    // Back button in top-left corner
    this.backButton = this.add.image(80, 100, "back-button")
      .setOrigin(0.5)
      .setScale(0.8)
      .setDepth(10)
      .setInteractive({ useHandCursor: true });

    this.setupButtonInteraction(this.backButton, 0.8, 0.85, 0.75, () => {
      this.scene.start("MainMenu");
    });

    // Tutorial image - same size as background (full screen)
    this.tutorialImage = this.add.image(0, 0, this.tutorialImages[this.currentPage])
      .setOrigin(0, 0)
      .setDisplaySize(1080, 1920) // Same size as background
      .setDepth(5); // Lower depth so UI elements appear on top

    // Page indicator at bottom
    this.pageText = this.add.text(540, 1820, `${this.currentPage + 1} / ${this.totalPages}`, {
      fontFamily: "Commando",
      fontSize: "40px",
      color: "#FFFFFF",
      stroke: "#000000",
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(10);

    // Previous button (left side, smaller and positioned better)
    this.prevButton = this.add.image(80, 960, "prev-button")
      .setOrigin(0.5)
      .setScale(0.6)
      .setDepth(10)
      .setInteractive({ useHandCursor: true });

    // Next button (right side, smaller and positioned better)  
    this.nextButton = this.add.image(1000, 960, "next-button")
      .setOrigin(0.5)
      .setScale(0.6)
      .setDepth(10)
      .setInteractive({ useHandCursor: true });

    this.setupButtonInteraction(this.prevButton, 0.6, 0.65, 0.55, () => {
      this.previousPage();
    });

    this.setupButtonInteraction(this.nextButton, 0.6, 0.65, 0.55, () => {
      this.nextPage();
    });

    // Update button visibility
    this.updateButtonVisibility();

    // Setup touch/swipe controls for mobile
    if (this.IS_TOUCH_DEVICE) {
      this.setupSwipeControls();
    }

    // Keyboard controls
    this.input.keyboard!.on('keydown-LEFT', () => {
      this.previousPage();
    });

    this.input.keyboard!.on('keydown-RIGHT', () => {
      this.nextPage();
    });

    this.input.keyboard!.on('keydown-ESC', () => {
      this.scene.start("MainMenu");
    });
  }

  setupButtonInteraction(
    button: GameObjects.Image, 
    normalScale: number = 0.8,
    hoverScale: number = 0.85,
    clickScale: number = 0.75,
    onClick?: () => void
  ) {
    button.setInteractive({ useHandCursor: true });
    
    if (this.IS_TOUCH_DEVICE) {
      button.on('pointerdown', () => {
        button.setScale(normalScale * 1.1);
        this.tweens.add({
          targets: button,
          angle: 2,
          duration: 40,
          yoyo: true,
          ease: 'Sine.easeOut'
        });
        
        this.tweens.add({
          targets: button,
          scale: normalScale,
          duration: 80,
          onComplete: () => {
            if (onClick) onClick();
          }
        });
      });
    } else {
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
          duration: 100,
          onComplete: () => {
            if (onClick) onClick();
          }
        });
      });
    }
    
    return button;
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.updateTutorialDisplay();
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updateTutorialDisplay();
    }
  }



  updateTutorialDisplay() {
    // Fade out current image
    this.tweens.add({
      targets: this.tutorialImage,
      alpha: 0,
      duration: 150,
      onComplete: () => {
        // Change image
        this.tutorialImage.setTexture(this.tutorialImages[this.currentPage]);
        
        // Set full screen size (same as background)
        this.tutorialImage.setDisplaySize(1080, 1920);
        
        // Fade in new image
        this.tweens.add({
          targets: this.tutorialImage,
          alpha: 1,
          duration: 150
        });
      }
    });

    // Update page text
    this.pageText.setText(`${this.currentPage + 1} / ${this.totalPages}`);
    
    // Update button visibility
    this.updateButtonVisibility();
  }

  updateButtonVisibility() {
    // Show/hide previous button
    this.prevButton.setVisible(this.currentPage > 0);
    this.prevButton.setAlpha(this.currentPage > 0 ? 1 : 0.3);
    
    // Show/hide next button
    this.nextButton.setVisible(this.currentPage < this.totalPages - 1);
    this.nextButton.setAlpha(this.currentPage < this.totalPages - 1 ? 1 : 0.3);
  }

  setupSwipeControls() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.touchStartX = pointer.x;
      this.touchStartTime = Date.now();
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      const touchEndX = pointer.x;
      const touchEndTime = Date.now();
      const deltaX = touchEndX - this.touchStartX;
      const deltaTime = touchEndTime - this.touchStartTime;

      if (deltaTime < this.SWIPE_TIME_THRESHOLD && Math.abs(deltaX) > this.SWIPE_THRESHOLD) {
        if (deltaX > 0) {
          // Swipe right - previous page
          this.previousPage();
        } else {
          // Swipe left - next page
          this.nextPage();
        }
      }
    });
  }
} 