import phaser from 'phaser'
export default class Lobby extends phaser.Scene {

    constructor() {
        super({ key: "lobby" })
    }

    init(data) {
        this.roomName = data.roomName;
        this.socket = data.socket;
    }

    preload() {        
        this.playersGrp = null;
        this.playersNameTxtGrp = null;
        this.posXPlayersAux = 0;
        this.countdownDelay = 500;
        this.delay = 500; //constant
        this.sceneStopped = false;
    }

    create() {

        // REALTIME        
        this.socket.emit("setPlayerStatus", { roomName: this.roomName, playerName: this.game.user.sub, status: "waiting" });
        this.socket.emit("getPlayersRoom", { roomName: this.roomName, playerName: this.game.user.sub });

        this.socket.on('startGameClient', (players) => {
            console.log(players)
            if (players && players.length > 1) {
                this.timeTxt.setText('GET READY!');
                this.time.addEvent({
                    delay: 2000,
                    callback: () => {
                        this.sceneStopped = true;
                        this.scene.sleep("looby");
                        this.scene.start("match", { roomName: this.roomName, socket: this.socket });
                    },
                    loop: false
                });
            } else {
                this.timeTxt.setText("Time Out!");
                this.time.addEvent({
                    delay: 500,
                    callback: () => {
                        this.socket.emit("quitLobby", { roomName: this.roomName, playerName: this.game.user.sub });
                        this.sceneStopped = true;
                        this.scene.sleep("looby");
                        this.scene.start('match.settings', { socket: this.socket });
                    },
                    loop: false
                });
            }
        });

        this.socket.on('currentPlayersClient', (obj) => {
            if (!this.sceneStopped) {
                if (this.playersGrp.children.entries.length > 0)
                    this.playersGrp.children.each((player) => {
                        this.playersGrp.remove(player, true, true);
                    });
                if (this.playersNameTxtGrp.children.entries.length > 0)
                    this.playersNameTxtGrp.children.each((playerNameTxt) => {
                        this.playersNameTxtGrp.remove(playerNameTxt, true, true);
                    });

                let posX = 0;
                if (obj.playersList.length > 0) {
                    obj.playersList.forEach((playerObj) => {
                        if (playerObj.status === "waiting") {
                            let playerNameTxt = this.add.bitmapText(((this.game.config.width / 4) / 2) + posX, 450, 'iceicebaby', playerObj.name, 32).setOrigin(0.5);
                            let player = this.add.sprite(((this.game.config.width / 4) / 2) + posX, 550, 'dude');
                            player.setScale(2, 2); /// if number is negative its fliped                            
                            player.name = playerObj.name;
                            playerNameTxt.name = playerObj.name;
                            this.playersGrp.add(player);
                            this.playersNameTxtGrp.add(playerNameTxt);
                            posX += this.game.config.width / 4;
                        }
                    });
                }
            }
        });

        this.socket.on('getCountdownClient', (obj) => {
            if (!this.sceneStopped && obj.sceneCountdown === "lobby") {
                this.timeTxt.setText(parseInt((obj.countdown / 1000)));
            }
        });

        this.socket.on('playerDisconnected', (playerName) => {
            console.log(playerName + "has disconected");
            if (!this.sceneStopped) {
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
            }
        });
        // REALTIME 

        // BACKGROUND ELEMENTS
        this.add.image(640, 360, 'background');
        this.add.bitmapText(this.game.config.width / 2, 200, 'iceicebaby', 'Wating for opponents...', 50).setOrigin(0.5);
        this.timeTxt = this.add.bitmapText(this.game.config.width / 2, 300, 'atarismooth', "", 32).setOrigin(0.5);
        // BACKGROUND ELEMENTS

        // GROUPS AND PLAYERS
        this.playersGrp = this.add.group();
        this.playersNameTxtGrp = this.add.group();
        // GROUPS AND PLAYERS

        // BACK 
        let backBtn = this.add.image(50, 50, 'back').setInteractive({ cursor: 'pointer' });
        backBtn.on('pointerover', function () {
            this.setTint(0xff0000);
        });
        backBtn.on('pointerout', function () {
            this.clearTint();
        });
        backBtn.on('pointerup', () => {
            if (this.playersGrp.children.entries && this.playersGrp.children.entries.length > 0)
                this.playersGrp.children.each((player) => {
                    if (player.name === this.game.user.sub) {
                        this.playersGrp.remove(player, true, true);
                    }
                });
            if (this.playersGrp.children.entries && this.playersNameTxtGrp.children.entries.length > 0)
                this.playersNameTxtGrp.children.each((playerNameTxt) => {
                    if (playerNameTxt.name === this.game.user.sub) {
                        this.playersNameTxtGrp.remove(playerNameTxt, true, true);
                    }
                });

            this.socket.emit("quitLobby", { roomName: this.roomName, playerName: this.game.user.sub });
            this.sceneStopped = true;
            this.scene.sleep("looby");
            this.scene.start('match.settings', { socket: this.socket });
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

    update(time, delta) {
        this.countdownDelay -= delta;
        if (this.countdownDelay < 0) {
            this.countdownDelay = this.delay;
            this.socket.emit("getCountdown", { roomName: this.roomName });
        }
    }
}

