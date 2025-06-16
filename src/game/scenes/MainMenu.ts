import { Scene, GameObjects } from "phaser";

export class MainMenu extends Scene {
  background: GameObjects.Image;
  devsmithLogo: GameObjects.Image;
  bossBattleLogo: GameObjects.Image;
  title: GameObjects.Text;
  playButton: GameObjects.Image;
  fullscreenButton: GameObjects.Image;
  fullscreenText: GameObjects.Text;
  loadingText: GameObjects.Text;
  loadingBar: GameObjects.Graphics;
  buttonWidth: number = 480;
  buttonHeight: number = 135;
  isLoading: boolean = false;
  loadingProgress: number = 0;
  ghost: GameObjects.Sprite;

  constructor() {
    super("MainMenu");
  }

  create() {
    // Reset all loading states when scene is created
    this.isLoading = false;
    this.loadingProgress = 0;

    // Add the background image
    this.background = this.add.image(0, 0, "background").setOrigin(0, 0);

    this.devsmithLogo = this.add.image(540, 100, "devsmith").setOrigin(0.5);

    this.bossBattleLogo = this.add
      .image(540, 600, "boss-battle")
      .setOrigin(0.5);

    // Add fullscreen button in top-right corner following the reference pattern
    this.fullscreenButton = this.add
      .image(1080 - 16, 920, "start-button")
      .setOrigin(1, 0)
      .setDisplaySize(64, 64)
      .setInteractive({ useHandCursor: true });

    // Add fullscreen icon text
    this.fullscreenText = this.add
      .text(1080 - 16 - 32, 920, "⛶", {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#FFFFFF",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    // Fullscreen button click handler following reference pattern
    this.fullscreenButton.on('pointerup', () => {
      if (this.scale.isFullscreen) {
        this.fullscreenText.setText("⛶");
        this.scale.stopFullscreen();
      } else {
        this.fullscreenText.setText("⛷");
        this.scale.startFullscreen();
      }
    });

    // F key handler following reference pattern
    const FKey = this.input.keyboard!.addKey('F');
    FKey.on('down', () => {
      if (this.scale.isFullscreen) {
        this.fullscreenText.setText("⛶");
        this.scale.stopFullscreen();
      } else {
        this.fullscreenText.setText("⛷");
        this.scale.startFullscreen();
      }
    });



    // Add Air Hockey access text
    this.add
      .text(540, 1400, 'Press "H" for Air Hockey', {
        fontFamily: "Arial",
        fontSize: "32px",
        color: "#FFFFFF",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Add keyboard input for Air Hockey
    this.input.keyboard!.on("keydown-H", () => {
      this.scene.start("AirHockey");
    });

    this.playButton = this.add
      .image(540, 1790, "start-button")
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setAlpha(1)
      .setVisible(true);

    // Create loading text (hidden initially)
    this.loadingText = this.add
      .text(540, 1750, "LOADING", {
        fontFamily: "Commando",
        fontSize: "80px",
        color: "#FFFFFF",
        fontStyle: "normal",
        letterSpacing: 2.8,
        stroke: "#000000",
        strokeThickness: 12,
        shadow: { offsetX: 8, offsetY: 8, color: "#000000", fill: true },
      })
      .setOrigin(0.5)
      .setVisible(false);

    // Create loading bar (hidden initially)
    this.loadingBar = this.add.graphics().setVisible(false);

    // Adjust the size of the button image
    this.playButton.setDisplaySize(this.buttonWidth, this.buttonHeight);

    // Add hover effect
    this.playButton.on("pointerover", () => {
      if (!this.isLoading) {
        this.playButton.setDisplaySize(
          this.buttonWidth * 1.05,
          this.buttonHeight * 1.05
        );
        this.playButton.setTint(0xf0f0f0); // Slightly lighter
      }
    });

    this.playButton.on("pointerout", () => {
      if (!this.isLoading) {
        this.playButton.setDisplaySize(this.buttonWidth, this.buttonHeight);
        this.playButton.clearTint();
      }
    });

    // Enhanced click/touch animation with fake loading
    this.playButton.on("pointerdown", () => {
      if (!this.isLoading) {
        // Flash effect
        this.playButton.setTint(0xbbbbbb); // Darker on press

        // Pulse animation using display size instead of scale
        const smallerWidth = this.buttonWidth * 0.95;
        const smallerHeight = this.buttonHeight * 0.95;

        // Create custom tween for display size
        this.tweens.add({
          targets: this.playButton,
          displayWidth: {
            from: this.buttonWidth,
            to: smallerWidth,
            duration: 100,
            yoyo: true,
          },
          displayHeight: {
            from: this.buttonHeight,
            to: smallerHeight,
            duration: 100,
            yoyo: true,
          },
          onComplete: () => {
            // Start fake loading instead of directly switching scenes
            this.startFakeLoading();
          },
        });
      }
    });
  }

  startFakeLoading() {
    // Set loading state
    this.isLoading = true;
    this.loadingProgress = 0;

    // Position the loading text above the loading bar
    this.loadingText.setPosition(540, 1600);

    // Hide button, show loading elements with a small fade transition
    this.tweens.add({
      targets: this.playButton,
      alpha: 0,
      duration: 100,
      onComplete: () => {
        this.playButton.setVisible(false);
        this.loadingText.setVisible(true);
        this.loadingBar.setVisible(true);

        // Create a sequence of tweens for the loading progress
        // First tween: Fast progress to 85%
        this.tweens.add({
          targets: this,
          loadingProgress: 85,
          duration: 1000,
          ease: "Sine.easeIn",
          onUpdate: () => {
            this.updateLoadingBar();
          },
          onComplete: () => {
            // Second tween: Slower progress from 85% to 100%
            this.tweens.add({
              targets: this,
              loadingProgress: 100.5, // Slightly over 100% to ensure proper fill
              duration: 500,
              ease: "Sine.easeOut",
              onUpdate: () => {
                this.updateLoadingBar();
              },
              onComplete: () => {
                // Add a small delay when 100% is reached before switching scenes
                this.time.delayedCall(500, () => {
                  this.scene.start("CharacterSelect");
                });
              },
            });
          },
        });
      },
    });
  }

  updateLoadingBar() {
    this.loadingBar.clear();

    // Bar dimensions
    const barWidth = this.buttonWidth;
    const barHeight = 85;
    const barX = 540 - barWidth / 2;
    const barY = 1650;
    const skewAmount = barHeight * 0.1; // Smaller skew to match the image
    const borderWidth = 3.5; // Border width

    // Calculate progress width precisely
    const maxFillWidth = barWidth - borderWidth;
    let progressWidth = (this.loadingProgress / 100) * maxFillWidth;

    // When almost complete, set to exact max width
    if (this.loadingProgress >= 99.5) {
      progressWidth = maxFillWidth;
    }

    // First draw the border as a parallelogram stroke - match the image
    const borderPoints = [
      new Phaser.Math.Vector2(barX, barY), // Top left (0 0)
      new Phaser.Math.Vector2(barX + barWidth, barY), // Top right (100% 0)
      new Phaser.Math.Vector2(barX + barWidth - skewAmount, barY + barHeight), // Bottom right (skewed)
      new Phaser.Math.Vector2(barX - skewAmount, barY + barHeight), // Bottom left (skewed)
    ];

    // Draw border with a glowing white effect
    this.loadingBar.lineStyle(borderWidth, 0x000000, 1);
    this.loadingBar.strokePoints(borderPoints, true, true);

    // Add a slight glow to the border (outer line)
    this.loadingBar.lineStyle(borderWidth / 2, 0xffffff, 0.3);
    this.loadingBar.strokePoints(borderPoints, true, true);

    // Draw background as parallelogram (dark purple like in the image)
    this.loadingBar.fillStyle(0x1a0d40, 1);

    // Create parallelogram points - matching the image
    const backgroundPoints = [
      new Phaser.Math.Vector2(barX, barY), // Top left (0 0)
      new Phaser.Math.Vector2(barX + barWidth, barY), // Top right (100% 0)
      new Phaser.Math.Vector2(barX + barWidth - skewAmount, barY + barHeight), // Bottom right (skewed)
      new Phaser.Math.Vector2(barX - skewAmount, barY + barHeight), // Bottom left (skewed)
    ];

    this.loadingBar.fillPoints(backgroundPoints, true);

    // Draw progress fill as parallelogram (bright purple/blue like in the image)
    if (progressWidth > 0) {
      this.loadingBar.fillStyle(0x4a90e2, 1); // Bright blue color

      // Calculate the skewed progress points
      const progressSkew = (progressWidth / barWidth) * skewAmount;
      const progressPoints = [
        new Phaser.Math.Vector2(barX, barY), // Top left (0 0)
        new Phaser.Math.Vector2(barX + progressWidth, barY), // Top right (progress% 0)
        new Phaser.Math.Vector2(
          barX + progressWidth - progressSkew,
          barY + barHeight
        ), // Bottom right (skewed)
        new Phaser.Math.Vector2(barX - skewAmount, barY + barHeight), // Bottom left (skewed)
      ];

      this.loadingBar.fillPoints(progressPoints, true);

      // Add a bright highlight on top of the progress bar
      this.loadingBar.fillStyle(0x6bb6ff, 0.7); // Lighter blue highlight
      const highlightHeight = 8;
      const highlightPoints = [
        new Phaser.Math.Vector2(barX, barY), // Top left
        new Phaser.Math.Vector2(barX + progressWidth, barY), // Top right
        new Phaser.Math.Vector2(
          barX + progressWidth - (progressSkew * highlightHeight) / barHeight,
          barY + highlightHeight
        ), // Bottom right (less skewed)
        new Phaser.Math.Vector2(
          barX - (skewAmount * highlightHeight) / barHeight,
          barY + highlightHeight
        ), // Bottom left (less skewed)
      ];

      this.loadingBar.fillPoints(highlightPoints, true);
    }
  }

  createRoundedRectMask(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: { tl: number; tr: number; bl: number; br: number }
  ) {
    const shape = this.add.graphics();
    shape.fillStyle(0xffffff);
    shape.beginPath();

    // Start from top-left corner (after the radius)
    shape.moveTo(x + radius.tl, y);

    // Top edge and top-right corner
    shape.lineTo(x + width - radius.tr, y);
    if (radius.tr > 0) {
      shape.arc(
        x + width - radius.tr,
        y + radius.tr,
        radius.tr,
        -Math.PI / 2,
        0
      );
    }

    // Right edge and bottom-right corner
    shape.lineTo(x + width, y + height - radius.br);
    if (radius.br > 0) {
      shape.arc(
        x + width - radius.br,
        y + height - radius.br,
        radius.br,
        0,
        Math.PI / 2
      );
    }

    // Bottom edge and bottom-left corner
    shape.lineTo(x + radius.bl, y + height);
    if (radius.bl > 0) {
      shape.arc(
        x + radius.bl,
        y + height - radius.bl,
        radius.bl,
        Math.PI / 2,
        Math.PI
      );
    }

    // Left edge and top-left corner
    shape.lineTo(x, y + radius.tl);
    if (radius.tl > 0) {
      shape.arc(x + radius.tl, y + radius.tl, radius.tl, Math.PI, -Math.PI / 2);
    }

    shape.closePath();
    shape.fillPath();

    return shape.createGeometryMask();
  }
}
