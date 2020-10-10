import { fullScreen } from "../utils/screen.js";
import { pointerOver, pointerOut } from "../utils/buttons.js";
import { validateUsername } from "../utils/validations.js";
export default class Title extends Phaser.Scene {

    constructor() {
        super({ key: "title" })
    }

    preload() {
        this.sceneStopped = false;
        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;
        // Bindings
        fullScreen.call(this);
    }

    create() {

        // BACKGROUND ELEMENTS
        this.add.image(640, 360, 'background');
        this.add.bitmapText(620, 100, 'iceicebaby', 'BLASTER X', 70);
        this.add.image(300, 350, 'robot');

        const helpBtn = this.add.image(900, 500, 'button').setInteractive({ cursor: 'pointer' });
        helpBtn.disabled = false;
        pointerOver(helpBtn);
        pointerOut(helpBtn);
        this.add.bitmapText(860, 483, 'iceicebaby', 'HELP', 38);
        helpBtn.on('pointerup', () => {
            if (!helpBtn.disabled)
                this.scene.start('help');
        });

        const playBtn = this.add.image(900, 400, 'button').setInteractive({ cursor: 'pointer' });
        playBtn.disabled = false;
        pointerOver(playBtn);
        pointerOut(playBtn);
        this.add.bitmapText(860, 383, 'iceicebaby', 'PLAY', 38);
        playBtn.on('pointerup', () => {
            if (!playBtn.disabled) {

                playBtn.disabled = true;
                helpBtn.disabled = true;

                const rectBackground = this.add.rectangle(this.width / 2, this.height / 2, this.width, this.height, 0x000);
                rectBackground.alpha = 0.7;

                const windowLogin = this.add.image(this.width / 2, this.height / 2, 'window1');
                windowLogin.setScale(3, 2);

                this.add.bitmapText(this.width / 2, this.height / 2 - 150, 'atarismooth', 'JOIN', 22).setOrigin(0.5);

                this.add.dom(this.width / 2, this.height / 2 - 20).createFromCache('form').setOrigin(0.5);
                const input = document.getElementById('input-custom');
                input.placeholder = "Enter a username";
                const errorTxt = this.add.bitmapText(this.width / 2, this.height / 2 + 30, 'atarismooth', '', 16).setOrigin(0.5);

                const createBtn = this.add.image(this.width / 2, this.height / 2 + 80, 'button').setInteractive({ cursor: 'pointer' }).setOrigin(0.5);
                pointerOver(createBtn);
                pointerOut(createBtn);
                this.add.bitmapText(this.width / 2, this.height / 2 + 80, 'atarismooth', 'CREATE', 22).setOrigin(0.5);

                createBtn.on('pointerup', () => {
                    errorTxt.text = validateUsername(input);
                    if (!errorTxt.text) {
                        this.game.socket.emit("newPlayer", { playerName: input.value.trim(), slugNameGame: this.game.config.gameTitle });
                        this.sceneStopped = true;
                        // this.scene.sleep("title");
                        // this.scene.start('menu');
                    }
                });
            }
        });
    }
}
