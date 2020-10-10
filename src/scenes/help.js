import { fullScreen } from "../utils/screen.js";
import { pointerBack } from "../utils/buttons.js";

export default class Help extends Phaser.Scene {

    constructor() {
        super({ key: "help" })
    }

    preload() {
        // Bindings
        fullScreen.call(this);
        this.pointerBack = pointerBack.bind(this);
    }

    create() {
        // BACKGROUND ELEMENTS
        this.add.image(640, 360, 'background');
        this.add.bitmapText(this.game.config.width / 2, this.game.config.height / 2, 'iceicebaby', "Press F11 key for full screen", 38).setOrigin(0.5);
        // back 
        this.pointerBack(() => {
            this.sceneStopped = true;
            this.scene.start('title');
        });
        // back
        // BACKGROUND ELEMENTS
    }
}
