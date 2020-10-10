export default class Menu extends Phaser.Scene {

    constructor() {
        super({ key: "menu" })
    }

    preload() {
        this.sceneStopped = false;
        this.roomSceneSelected = "";
        this.roomPlayerSelected = "";
        this.playersGrp = null;
        this.playersNameTxtGrp = null;
    }

    create() {

        // REALTIME       

        // Check room default
        this.roomSceneSelected = '0';

        this.socket.emit("getPlayersRoom", { roomName: this.roomSceneSelected });

        this.socket.on('currentPlayersClient', (obj) => {
            console.log(obj.player);
            if (!this.sceneStopped) {
                if (this.playersGrp.children.entries.length > 0)
                    this.playersGrp.children.each((player) => {
                        this.playersGrp.remove(player, true, true);
                    });
                if (this.playersNameTxtGrp.children.entries.length > 0)
                    this.playersNameTxtGrp.children.each((playerNameTxt) => {
                        this.playersNameTxtGrp.remove(playerNameTxt, true, true);
                    });
                let posY = 340;
                if (this.roomSceneSelected === obj.roomName && obj.playersList.length > 0) {
                    obj.playersList.forEach((playerObj) => {
                        let player = this.add.sprite(1050, posY, 'guest');
                        let playerNameTxt = this.add.bitmapText(1150, posY + 10, 'iceicebaby', playerObj.name.substring(0, 6) + '...', 32).setOrigin(0.5);
                        player.setScale(.5);
                        player.name = playerObj.name;
                        playerNameTxt.name = playerObj.name;
                        this.playersGrp.add(player);
                        this.playersNameTxtGrp.add(playerNameTxt);
                        posY += 50;
                    });
                }
            }
        });

        this.socket.on('playerConnectedClient', (player) => {
            if (!this.sceneStopped)
                console.log(player + ' has joined');
        });

        this.socket.on('playerDisconnectedClient', (playerName) => {
            if (!this.sceneStopped) {
                console.log(playerName + "has disconected");
                if (this.playersGrp.children.entries.length > 0)
                    this.playersGrp.children.each((player) => {
                        if (player.name === playerName) {
                            this.playersGrp.remove(player, true, true);
                        }
                    });
                if (this.playersNameTxtGrp.children.entries.length > 0)
                    this.playersNameTxtGrp.children.each((playerNameTxt) => {
                        if (playerNameTxt.name === playerName) {
                            this.playersNameTxtGrp.remove(playerNameTxt, true, true);
                        }
                    });

                let posY = 340;
                this.playersGrp.children.each((player) => {
                    player.setPosition(1050, posY);
                    posY += 50;
                });

                posY = 340;
                this.playersNameTxtGrp.children.each((playerNameTxt) => {
                    playerNameTxt.setPosition(1150, posY);
                    posY += 50;
                });
            }
        });

        this.socket.on('getCountdownClient', (obj) => {
            if (!this.sceneStopped) {
                if (obj.sceneCountdown === "lobby" && this.playersGrp.children.entries.length > 0)
                    this.playTxt.setText("Play(" + parseInt((obj.countdown / 1000)) + ")");
            }
        });

        // REALTIME

        // BACKGROUND AND CONTROLS    
        this.add.image(640, 360, 'background');
        this.add.image(200, 600, 'gumbot');
        this.add.bitmapText(this.game.config.width / 2, 100, 'iceicebaby', "Welcome", 60).setOrigin(0.5);
        this.add.bitmapText(this.game.config.width / 2, 180, 'iceicebaby', this.game.user.sub, 40).setOrigin(0.5);
        this.add.bitmapText(250, 300, 'iceicebaby', "Create room", 40).setOrigin(0.5);
        this.add.bitmapText(260, 330, 'atarismooth', "(Coming soon)", 22).setOrigin(0.5);
        this.add.dom(300, 375).createFromCache('roomNameForm').setOrigin(0.5);
        let enterBtn = this.add.image(224, 435, 'button').setInteractive({ cursor: 'pointer' }).setOrigin(0.5);
        this.add.bitmapText(224, 438, 'iceicebaby', 'Create', 34).setOrigin(0.5);
        this.add.bitmapText(750, 300, 'iceicebaby', "Or Choose a room", 40).setOrigin(0.5);

        enterBtn.on('pointerover', function () {
            this.setTint(0xff0000);
        });

        enterBtn.on('pointerout', function () {
            this.clearTint();
        });

        enterBtn.on('pointerup', () => {
            let text = document.getElementsByName('nameField');
            if (text.length > 0 && text[0].value !== '') {
                this.roomNameTxt = text[0].value;
                this.add.bitmapText(this.game.config.width / 2, 250, 'iceicebaby', this.roomNameTxt, 50).setOrigin(0.5);
            } else {
                this.add.image(500, 350, 'alert');
            }
        });

        let fire = this.add.sprite(570, 390, 'fire').setOrigin(0.5);

        this.anims.create({
            key: 'rotating',
            frames: this.anims.generateFrameNumbers('fire'),
            frameRate: 10,
            repeat: -1
        });

        fire.play('rotating');

        this.add.bitmapText(650, 400, 'iceicebaby', "Main", 35).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        let joinBtn = this.add.image(830, 400, 'button').setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        let joinTxt = this.add.bitmapText(830, 400, 'iceicebaby', 'Join', 34).setOrigin(0.5);

        joinBtn.on('pointerover', function () {
            this.setTint(0xff0000);
        });

        joinBtn.on('pointerout', function () {
            this.clearTint();
        });

        joinBtn.on('pointerup', () => {
            if (!this.roomPlayerSelected) {
                // It will improve
                this.roomPlayerSelected = "0";
                joinTxt.setText("Leave");
                this.socket.emit("joinedRoom", { roomName: this.roomPlayerSelected, playerName: this.game.user.sub });
            } else {
                this.socket.emit("quitRoom", { roomName: this.roomPlayerSelected, playerName: this.game.user.sub });
                this.roomPlayerSelected = "";
                joinTxt.setText("Join");
            }
        });

        this.add.bitmapText(1100, 300, 'iceicebaby', "Players", 40).setOrigin(0.5);

        this.playBtn = this.add.image(1130, 650, 'button').setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        this.playBtn.visible = false;
        this.playTxt = this.add.bitmapText(1130, 650, 'iceicebaby', 'Play', 34).setOrigin(0.5);
        this.playTxt.visible = false;

        this.playBtn.on('pointerover', function () {
            this.setTint(0xff0000);
        });

        this.playBtn.on('pointerout', function () {
            this.clearTint();
        });

        this.playBtn.on('pointerup', () => {
            if (this.playersGrp.children.entries.length > 1 && this.playersGrp.children.entries.length <= 4) {
                this.socket.emit("setCountdown", { roomName: this.roomPlayerSelected });
                this.sceneStopped = true;
                this.scene.sleep("match.settings");
                this.scene.start('lobby', { roomName: this.roomPlayerSelected, socket: this.socket });
            }
        });
        // BACKGROUND AND CONTROLS

        // GROUPS AND PLAYERS
        this.playersGrp = this.add.group();
        this.playersNameTxtGrp = this.add.group();
        // GROUPS AND PLAYERS

        // if (this.sys.game.device.os.desktop) {
        //     console.log("desktop")
        // }
        // else {
        //     console.log("mobile")
        // }

        // BACK 
        let backBtn = this.add.image(50, 50, 'back').setInteractive({ cursor: 'pointer' });
        backBtn.on('pointerover', function () {
            this.setTint(0xff0000);
        });
        backBtn.on('pointerout', function () {
            this.clearTint();
        });
        backBtn.on('pointerup', () => {
            this.socket.emit("quitRoom", { roomName: this.roomPlayerSelected, playerName: this.game.user.sub });
            this.roomPlayerSelected = "";
            joinTxt.setText("Join");
            this.sceneStopped = true;
            this.scene.sleep("match.settings");
            this.scene.start('main.menu');
        });
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

    update() {
        if (this.playersGrp.children.entries.length > 1 && this.roomPlayerSelected === this.roomSceneSelected) {
            this.playBtn.visible = true;
            this.playTxt.visible = true;
        } else {
            this.playBtn.visible = false;
            this.playTxt.visible = false;
            this.playTxt.setText("Play");
        }
    }
}

