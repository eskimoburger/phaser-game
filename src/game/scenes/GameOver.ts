import { Scene } from 'phaser';

export class GameOver extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameover_text : Phaser.GameObjects.Text;

    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        this.camera = this.cameras.main
        this.camera.setBackgroundColor(0xff0000);

        this.background = this.add.image(0, 0, 'background').setOrigin(0, 0);
        this.background.setAlpha(0.5);

        this.gameover_text = this.add.text(540, 960, 'Game Over', {
            fontFamily: 'Commando',
            fontSize: '140px',
            color: '#FFF',
            fontStyle: 'normal',
            letterSpacing: 2.8,
            stroke: '#232323',
            strokeThickness: 7,
            shadow: { offsetY: 17, color: '#000', fill: true },
            align: 'center'
        });
        this.gameover_text.setOrigin(0.5);

        this.input.once('pointerdown', () => {

            this.scene.start('MainMenu');

        });
    }
}
