// src/scenes/LoadingAnimationScene.ts
import Phaser from 'phaser';

// --- Configuration Constants ---

// Scene
const SCENE_BACKGROUND_COLOR = 0x000000; // Black background

// Loading Text
const TEXT_CONTENT = "LOADING";
const TEXT_FONT_FAMILY = "'Arial Black', Arial, sans-serif";
const TEXT_FONT_SIZE = '64px';
const TEXT_COLOR_FILL_HEX = '#FFFFFF';
const TEXT_COLOR_STROKE_HEX = '#000000';
const TEXT_STROKE_THICKNESS = 2;
const TEXT_SHADOW_OFFSET_X = 6;
const TEXT_SHADOW_OFFSET_Y = 6;
const TEXT_COLOR_SHADOW_HEX = '#000000';
const TEXT_CONTAINER_SKEW_X_DEGREES = -10;

// Progress Bar
const PROGRESS_BAR_WIDTH_SCALE = 0.6;
const PROGRESS_BAR_MAX_WIDTH_PX = 448;
const PROGRESS_BAR_HEIGHT_PX = 48;
const PROGRESS_BAR_BORDER_RADIUS = 10;
const PROGRESS_BAR_BORDER_THICKNESS = 2;
const PROGRESS_BAR_CONTAINER_SKEW_X_DEGREES = -10;

// Progress Bar Colors
const COLOR_PROGRESS_BAR_BACKGROUND_HEX = '#1e1b4b';
const COLOR_PROGRESS_BAR_BORDER_HEX = '#000000';
const COLOR_PROGRESS_FILL_TOP_HEX = '#22d3ee';
const COLOR_PROGRESS_FILL_BOTTOM_HEX = '#0891b2';
const COLOR_REFLECTION_TOP_HEX = '#a5f3fc';
const COLOR_REFLECTION_BOTTOM_HEX = '#06b6d4';
const REFLECTION_WIDTH_PX = 12;
const REFLECTION_OPACITY = 0.5;

// Animation Timing
const VISUAL_UPDATE_INTERVAL_MS = 30; // How often to update the visual of the progress bar (e.g., for ~30-60 FPS feel)
const MAX_PROGRESS_VALUE = 100;       // Target progress percentage
const FAKE_LOADING_DURATION_MS = 3000; // Total duration for the fake loading (e.g., 3 seconds)
const DELAY_BEFORE_TRANSITION_MS = 250; // Small delay after loading finishes before transitioning

// Layout
const GAP_BETWEEN_TEXT_AND_PROGRESS_BAR = 40;

export class LoadingAnimationScene extends Phaser.Scene {
    private currentProgress: number = 0;
    private progressUpdateTimer!: Phaser.Time.TimerEvent;
    private loadingStartTime!: number; // To track when the fake loading started

    private progressBarFillGraphics!: Phaser.GameObjects.Graphics;
    private actualProgressBarInnerWidth!: number;
    private actualProgressBarInnerHeight!: number;
    private actualProgressBarWidth!: number;

    constructor() {
        super({ key: 'LoadingAnimationScene' });
    }

    preload() {
        // Asset loading can still happen here if needed for subsequent scenes.
        // This fake loading animation will run independently.
    }

    create() {
        this.initializeUI();
    }

    private initializeUI() {
        this.cameras.main.setBackgroundColor(SCENE_BACKGROUND_COLOR);
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;
        const centerX = gameWidth / 2;

        // Calculate vertical positioning for elements
        const textHeightApproximation = parseInt(TEXT_FONT_SIZE) + TEXT_SHADOW_OFFSET_Y;
        const totalContentHeight = textHeightApproximation + GAP_BETWEEN_TEXT_AND_PROGRESS_BAR + PROGRESS_BAR_HEIGHT_PX;
        const contentStartY = (gameHeight - totalContentHeight) / 2;

        const textElementY = contentStartY + textHeightApproximation / 2;
        const progressBarY = contentStartY + textHeightApproximation + GAP_BETWEEN_TEXT_AND_PROGRESS_BAR + PROGRESS_BAR_HEIGHT_PX / 2;

        this.createTextElements(centerX, textElementY);
        this.createProgressBarElements(centerX, progressBarY);

        // Start fake loading process
        this.currentProgress = 0;
        this.loadingStartTime = this.time.now; // Record the start time using Phaser's game time
        this.updateProgressBarFill(); // Draw initial state (0%)

        this.progressUpdateTimer = this.time.addEvent({
            delay: VISUAL_UPDATE_INTERVAL_MS,    // How frequently to update the progress bar visuals
            callback: this.updateFakeLoadingProgress, // New callback for time-based progress
            callbackScope: this,
            loop: true,
        });
    }

    private createTextElements(x: number, y: number): void {
        const textContainer = this.add.container(x, y);
        const shadowTextStyle = { fontFamily: TEXT_FONT_FAMILY, fontSize: TEXT_FONT_SIZE, color: TEXT_COLOR_SHADOW_HEX, fontStyle: '900' };
        const shadowText = this.add.text(TEXT_SHADOW_OFFSET_X, TEXT_SHADOW_OFFSET_Y, TEXT_CONTENT, shadowTextStyle).setOrigin(0.5, 0.5);
        const mainTextStyle = { fontFamily: TEXT_FONT_FAMILY, fontSize: TEXT_FONT_SIZE, color: TEXT_COLOR_FILL_HEX, stroke: TEXT_COLOR_STROKE_HEX, strokeThickness: TEXT_STROKE_THICKNESS, fontStyle: '900' };
        const mainText = this.add.text(0, 0, TEXT_CONTENT, mainTextStyle).setOrigin(0.5, 0.5);
        textContainer.add([shadowText, mainText]);
        
        // Apply skew manually using rotation and position adjustments to simulate skew effect
        const skewInRadians = Phaser.Math.DegToRad(TEXT_CONTAINER_SKEW_X_DEGREES);
        shadowText.x += shadowText.y * Math.tan(skewInRadians);
        mainText.x += mainText.y * Math.tan(skewInRadians);
    }

    private createProgressBarElements(x: number, y: number): void {
        this.actualProgressBarWidth = Math.min(this.scale.width * PROGRESS_BAR_WIDTH_SCALE, PROGRESS_BAR_MAX_WIDTH_PX);
        const progressBarContainer = this.add.container(x, y);
        
        // Apply skew effect manually 
        const skewAmount = PROGRESS_BAR_HEIGHT_PX * Math.tan(Phaser.Math.DegToRad(PROGRESS_BAR_CONTAINER_SKEW_X_DEGREES));
        
        const bgAndBorderGraphics = this.add.graphics();
        progressBarContainer.add(bgAndBorderGraphics);
        
        // Draw a parallelogram instead of a rectangle to create skew effect
        const points = [
            new Phaser.Math.Vector2(-this.actualProgressBarWidth / 2, -PROGRESS_BAR_HEIGHT_PX / 2),
            new Phaser.Math.Vector2(this.actualProgressBarWidth / 2, -PROGRESS_BAR_HEIGHT_PX / 2),
            new Phaser.Math.Vector2(this.actualProgressBarWidth / 2 - skewAmount, PROGRESS_BAR_HEIGHT_PX / 2),
            new Phaser.Math.Vector2(-this.actualProgressBarWidth / 2 - skewAmount, PROGRESS_BAR_HEIGHT_PX / 2)
        ];
        
        bgAndBorderGraphics.fillStyle(Phaser.Display.Color.HexStringToColor(COLOR_PROGRESS_BAR_BACKGROUND_HEX).color);
        bgAndBorderGraphics.fillPoints(points, true);
        bgAndBorderGraphics.lineStyle(PROGRESS_BAR_BORDER_THICKNESS, Phaser.Display.Color.HexStringToColor(COLOR_PROGRESS_BAR_BORDER_HEX).color);
        bgAndBorderGraphics.strokePoints(points, true);
        
        this.actualProgressBarInnerWidth = this.actualProgressBarWidth - PROGRESS_BAR_BORDER_THICKNESS * 2;
        this.actualProgressBarInnerHeight = PROGRESS_BAR_HEIGHT_PX - PROGRESS_BAR_BORDER_THICKNESS * 2;
        const innerRadius = Math.max(0, PROGRESS_BAR_BORDER_RADIUS - PROGRESS_BAR_BORDER_THICKNESS);
        this.progressBarFillGraphics = this.add.graphics();
        this.progressBarFillGraphics.x = -this.actualProgressBarInnerWidth / 2;
        this.progressBarFillGraphics.y = -this.actualProgressBarInnerHeight / 2;
        progressBarContainer.add(this.progressBarFillGraphics);
        const maskGraphics = this.add.graphics();
        maskGraphics.setPosition(0, 0);
        progressBarContainer.add(maskGraphics);
        
        // Draw a parallelogram mask
        const innerSkewAmount = innerRadius * Math.tan(Phaser.Math.DegToRad(PROGRESS_BAR_CONTAINER_SKEW_X_DEGREES));
        const maskPoints = [
            new Phaser.Math.Vector2(-this.actualProgressBarInnerWidth / 2, -this.actualProgressBarInnerHeight / 2),
            new Phaser.Math.Vector2(this.actualProgressBarInnerWidth / 2, -this.actualProgressBarInnerHeight / 2),
            new Phaser.Math.Vector2(this.actualProgressBarInnerWidth / 2 - innerSkewAmount, this.actualProgressBarInnerHeight / 2),
            new Phaser.Math.Vector2(-this.actualProgressBarInnerWidth / 2 - innerSkewAmount, this.actualProgressBarInnerHeight / 2)
        ];
        
        maskGraphics.fillPoints(maskPoints, true);
        maskGraphics.visible = false;
        this.progressBarFillGraphics.setMask(maskGraphics.createGeometryMask());
    }

    private updateFakeLoadingProgress(): void {
        const elapsedTime = this.time.now - this.loadingStartTime;

        // Calculate progress as a percentage of the total fake loading duration
        let progressPercentage = (elapsedTime / FAKE_LOADING_DURATION_MS) * MAX_PROGRESS_VALUE;

        // Ensure progress does not exceed 100%
        this.currentProgress = Math.min(progressPercentage, MAX_PROGRESS_VALUE);

        this.updateProgressBarFill(); // Update the visual display of the progress bar

        // Check if the fake loading duration has been reached
        if (elapsedTime >= FAKE_LOADING_DURATION_MS || this.currentProgress >= MAX_PROGRESS_VALUE) {
            this.currentProgress = MAX_PROGRESS_VALUE; // Clamp to ensure it hits exactly 100%
            this.updateProgressBarFill(); // Perform one final update to show 100%

            if (this.progressUpdateTimer) {
                this.progressUpdateTimer.destroy(); // Stop the timer
            }

            // Optional: Add a small delay before transitioning to make the completion feel less abrupt
            this.time.delayedCall(DELAY_BEFORE_TRANSITION_MS, () => {
                // console.log("Fake loading complete! Transitioning to next scene...");
                // For example, transition to your main menu or first game scene:
                // this.scene.start('MainMenuScene');
            });
        }
    }

    private updateProgressBarFill(): void {
        if (!this.progressBarFillGraphics) return;
        this.progressBarFillGraphics.clear();
        const fillWidth = this.actualProgressBarInnerWidth * (this.currentProgress / MAX_PROGRESS_VALUE);
        const halfInnerHeight = this.actualProgressBarInnerHeight / 2;
        if (fillWidth <= 0) return;
        this.progressBarFillGraphics.fillStyle(Phaser.Display.Color.HexStringToColor(COLOR_PROGRESS_FILL_TOP_HEX).color);
        this.progressBarFillGraphics.fillRect(0, 0, fillWidth, halfInnerHeight);
        this.progressBarFillGraphics.fillStyle(Phaser.Display.Color.HexStringToColor(COLOR_PROGRESS_FILL_BOTTOM_HEX).color);
        this.progressBarFillGraphics.fillRect(0, halfInnerHeight, fillWidth, halfInnerHeight);
        const reflectionEffectiveWidth = Math.min(REFLECTION_WIDTH_PX, fillWidth);
        this.progressBarFillGraphics.fillStyle(Phaser.Display.Color.HexStringToColor(COLOR_REFLECTION_TOP_HEX).color, REFLECTION_OPACITY);
        this.progressBarFillGraphics.fillRect(fillWidth - reflectionEffectiveWidth, 0, reflectionEffectiveWidth, halfInnerHeight);
        this.progressBarFillGraphics.fillStyle(Phaser.Display.Color.HexStringToColor(COLOR_REFLECTION_BOTTOM_HEX).color, REFLECTION_OPACITY);
        this.progressBarFillGraphics.fillRect(fillWidth - reflectionEffectiveWidth, halfInnerHeight, reflectionEffectiveWidth, halfInnerHeight);
    }
}