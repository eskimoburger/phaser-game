import { AUTO } from 'phaser';

export const gameConfig: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1080,
    height: 1920,
    parent: 'game-container',
    backgroundColor: 'red',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    }
};