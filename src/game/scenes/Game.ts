import { Scene } from 'phaser';

export class Game extends Scene
{
    // camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    loadingScreen: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;
    character: Phaser.GameObjects.Image;
    selectedCharacter: string;
    countdownText: Phaser.GameObjects.Text;
    countdownTime: number;
    countdownEvent: Phaser.Time.TimerEvent;
    characterBG: Phaser.GameObjects.Image;
    constructor ()
    {
        super('Game');
    }

    create ()
    {
        // this.camera = this.cameras.main;
        // this.camera.setBackgroundColor(0x00ff00);


        this.selectedCharacter = localStorage.getItem('selectedCharacter') || 'knight';
        this.characterBG = this.add.image(0, 0, `loading-${this.selectedCharacter}`).setOrigin(0);

        // this.loadingScreen = this.add.image(0, 0, 'loading-screen-1').setOrigin(0);


        // Get selected character from localStorage

        // console.log(`loading-${this.selectedCharacter}`);
        
        // Display the selected character

        
        // If the character texture doesn't exist, create a placeholder
        if (!this.textures.exists(this.selectedCharacter)) {
            const colors: Record<string, number> = {
                'knight': 0xFF0000,
                'mage': 0x00FF00,
                'archer': 0x0000FF
            };
            const graphics = this.add.graphics();
            graphics.fillStyle(colors[this.selectedCharacter] || 0xFFFFFF, 1);
            graphics.fillRect(240, 284, 200, 300);
        }

        // this.msg_text = this.add.text(640, 384, `Playing as:\n${this.selectedCharacter.toUpperCase()}!\n\nStarting in...`, {
        //     fontFamily: 'Commando',
        //     fontSize: '100px',
        //     color: '#FFF',
        //     fontStyle: 'normal',
        //     letterSpacing: 2.8,
        //     stroke: '#232323',
        //     strokeThickness: 7,
        //     shadow: { offsetY: 17, color: '#000', fill: true },
        //     align: 'center'
        // });
        // this.msg_text.setOrigin(0.5);

        // Add countdown text
        this.countdownText = this.add.text(1040, 1900, '5', {

            fontFamily: 'Commando',
            fontSize: '210px',
            color: '#FFFFFF',
            fontStyle: "normal",
            stroke: '#000000',
            strokeThickness: 5,
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 5, fill: true },
            align: 'center'
        });
        this.countdownText.setOrigin(1).setAngle(-5);
        
        // Initialize countdown
        this.countdownTime = 5;
        
        // Start countdown timer
        this.countdownEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateCountdown,
            callbackScope: this,
            loop: true
        });

        // Remove the tap to continue interaction since we have a countdown now
    }
    
    updateCountdown() {
        this.countdownTime--;
        this.countdownText.setText(this.countdownTime.toString());
        
        if (this.countdownTime <= 1) {
            this.countdownEvent.remove();
            // this.scene.start('GameOver');
        }
    }
}
