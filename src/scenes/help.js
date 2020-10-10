export default class Help extends Phaser.Scene {

    constructor() {
        super({ key: "help" })
    }    

    create() {
        // BACKGROUND ELEMENTS
        this.add.image(640, 360, 'background');
        // BACKGROUND ELEMENTS

        // BACK
        let backBtn = this.add.image(50, 50, 'back').setInteractive({ cursor: 'pointer' });
        backBtn.on('pointerover', function () {
            this.setTint(0xff0000);
        });
        backBtn.on('pointerout', function () {
            this.clearTint();
        });
        backBtn.on('pointerup', () => {
            this.sceneStopped = true;
            this.scene.start('title');
        });
        this.add.bitmapText(this.game.config.width / 2, this.game.config.height / 2, 'iceicebaby', "Press F11 key for full screen", 38).setOrigin(0.5);
        // BACK

        // FULL SCREEN
        this.scale.fullscreenTarget = document.getElementById('game');
        let F11Key = this.input.keyboard.addKey('F11');
        F11Key.on('down', () => {
            if (this.scale.isFullscreen) {
                let element = document.getElementById("game");
                element.classList.add("max-height-game");
                this.scale.stopFullscreen();
            }
            else {
                let element = document.getElementById("game");
                element.classList.remove("max-height-game");
                this.scale.startFullscreen();
            }
        });

        document.addEventListener('fullscreenchange', exitHandler);
        document.addEventListener('webkitfullscreenchange', exitHandler);
        document.addEventListener('mozfullscreenchange', exitHandler);
        document.addEventListener('MSFullscreenChange', exitHandler);

        function exitHandler() {
            if (!document.fullscreenElement && !document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
                let element = document.getElementById("game");
                element.classList.add("max-height-game");
            }
        }
        // FULL SCREEN
    }
}
