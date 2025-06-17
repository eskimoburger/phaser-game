import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig';
import { Boot } from '../game/scenes/Boot';
import { GameOver } from '../game/scenes/GameOver';
import { Game as MainGame } from '../game/scenes/Game';
import { Preloader } from '../game/scenes/Preloader';
import { CharacterSelect } from '../game/scenes/CharacterSelect';
import { MainMenu } from '../game/scenes/MainMenu';
import { Tutorial } from '../game/scenes/Tutorial';
import AirHockey from '../game/scenes/AirHockey';
// import AirHockeyRefactored from '../game/scenes/AirHockeyRefactored';
import MatchingMiniGame from '../game/scenes/MatchingMiniGame';

const scenes = [
    Boot,
    Preloader,
    MainMenu,
    Tutorial,
    CharacterSelect,
    MainGame,
    GameOver,
    AirHockey,
    // AirHockeyRefactored,
    MatchingMiniGame
];

const StartGame = (parent: string) => {
    return new Phaser.Game({
        ...gameConfig,
        parent,
        scene: scenes
    });
};

export default StartGame;