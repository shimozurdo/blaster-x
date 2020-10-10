export default class Title extends Phaser.Scene {

    constructor() {
        super({ key: "title" })
    }

    preload() {
        this.sceneStopped = false;
    }

    create() {

        // REALTIME
        if (this.game.user && this.game.user.sub) {
            this.add.bitmapText(600, 200, 'iceicebaby', 'welcome ' + this.game.user.sub, 40);
            this.socket = this.game.socketIo;
            this.socket.emit("newPlayer", { playerName: this.game.user.sub, slugNameGame: this.game.slugNameGame });
            this.socket.on('playerConnectedClient', (player) => {
                if (!this.sceneStopped)
                    console.log(player + ' has joined');
            });
        }
        // REALTIME   

        // BACKGROUND ELEMENTS
        this.add.image(640, 360, 'background');
        this.add.bitmapText(620, 100, 'iceicebaby', 'BLASTER X', 70);
        this.add.image(300, 350, 'robot');
        let playBtn = this.add.image(900, 400, 'button').setInteractive({ cursor: 'pointer' });
        this.add.bitmapText(860, 383, 'iceicebaby', 'PLAY', 38);
        let helpBtn = this.add.image(900, 500, 'button').setInteractive({ cursor: 'pointer' });
        this.add.bitmapText(860, 483, 'iceicebaby', 'HELP', 38);
        // BACKGROUND ELEMENTS

        playBtn.on('pointerover', function () {
            this.setTint(0xff0000);
        });

        playBtn.on('pointerout', function () {
            this.clearTint();
        });

        playBtn.on('pointerup', () => {
            this.sceneStopped = true;
            this.scene.sleep("title");
            // this.scene.start('menu', { socket: this.socket });
        });

        helpBtn.on('pointerover', function () {
            this.setTint(0xff0000);
        });

        helpBtn.on('pointerout', function () {
            this.clearTint();
        });

        helpBtn.on('pointerup', () => {
            this.scene.start('help');
        });


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

        // var graphics = this.add.graphics();

        // graphics.lineStyle(4, 0xff00ff, 1);

        // //  Without this the arc will appear closed when stroked
        // graphics.beginPath();

        // // arc (x, y, radius, startAngle, endAngle, anticlockwise)
        // graphics.arc(400, 300, 200, phaser.Math.DegToRad(90), phaser.Math.DegToRad(180), true);
        // graphics.strokePath();
        // graphics.fillCircleShape();
        // //  Uncomment this to close the path before stroking
        // // graphics.closePath();

    }
}
