import { MainMenu } from "./MainMenu";
import { Scene, Game } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    // //  We loaded this image in our Boot Scene, so we can display it here
    // this.add.image(1080, 1920, 'background');
    // //  A simple progress bar. This is the outline of the bar.
    // this.add.rectangle(1080, 1920, 468, 32).setStrokeStyle(1, 0xffffff);
    // //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    // const bar = this.add.rectangle(1080-230, 1920, 4, 28, 0xffffff);
    // //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    // this.load.on('progress', (progress: number) => {
    //     //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
    //     bar.width = 4 + (460 * progress);
    // });
  }

  preload() {
    //  Load the assets for the game - Replace with your own assets
    this.load.setPath("assets");
    // load the background image BG-Mainpage.png
    this.load.image("background", "BG-Mainpage.png");
    this.load.image("logo", "logo.png");
    this.load.image("start-button", "start-button.png");
    this.load.image("back-button", "back-button.png");
    this.load.image("confirm-button", "confirm-button.png");

    this.load.image("devsmith", "devsmith-logo.png");
    this.load.image("boss-battle", "boss-battle-logo.png");

    // Load character assets
    this.load.image("boss1", "characters/boss-1.png");
    this.load.image("boss2", "characters/boss-2.png");

    this.load.image("bg-boss-1", "bg-boss-1.png");
    this.load.image("bg-boss-2", "bg-boss-2.png");

    this.load.image("shadow", "shadow.png");

    this.load.image("loading-boss1", "loading-boss-1.svg");
    this.load.image("loading-boss2", "loading-boss-2.svg");
    
    // Load modal boss images
    this.load.image("modal-boss1", "modal-boss1.png");
    this.load.image("modal-boss2", "modal-boss2.png");

    this.load.spritesheet("ghost", "sprites/ghost.png", {
      frameWidth: 1024,
      frameHeight: 1024,
    });

    this.load.image("bg-matching-top", "matching-game/bg-top.png");
    this.load.image("bg-matching-game", "matching-game/bg.png");
    this.load.image("bg-matching-bottom", "matching-game/bg-bottom.png");
    this.load.image("ambulance", "matching-game/ambulance.png");
    this.load.image("bandage", "matching-game/bandage.png");
    this.load.image("pills", "matching-game/pills.png");
    this.load.image("first-aid", "matching-game/first-aid.png");
    this.load.image("monitor", "matching-game/monitor.png");
    this.load.image("tube-med", "matching-game/tube-med.png");
    this.load.image("cart", "matching-game/cart.png");

    this.load.image("help-icon", "help-icon.png");
    this.load.image("prev-button", "prev-button.png");
    this.load.image("next-button", "next-button.png");
    this.load.image("next-large-button", "next-large-button.png");
    this.load.image("next-modal-boss1", "next-modal-boss1.png");
    this.load.image("next-modal-boss2", "next-modal-boss2.png");

    // Load tutorial images
    this.load.image("tutorial-1", "tuitorial/htp1.png");
    this.load.image("tutorial-2", "tuitorial/htp2.png");
    this.load.image("tutorial-3", "tuitorial/htp3.png");
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    // this.scene.start('MainMenu');
    this.scene.start("MainMenu");
  }
}
