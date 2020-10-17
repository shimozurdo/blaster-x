import { fullScreen } from "../utils/screen.js";
import { pointerBack } from "../utils/buttons.js";
export default class Lobby extends Phaser.Scene {

    // Vars
    width;
    height;
    playersGrp;
    playersGrp;
    playersNameTxtGrp;
    countdownDelay = 500;
    sceneStopped = false;
    delay = 500;
    roomName;
    timeTxt;

    constructor() {
        super({ key: "lobby" })
    }

    init(data) {
        this.roomName = data.roomName;
    }

    preload() {

        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;
        // Bindings
        fullScreen.call(this);
        this.pointerBack = pointerBack.bind(this);
    }

    create() {

        // REALTIME        
        this.game.socket.emit("setPlayerStatus", { roomName: this.roomName, playerName: this.game.playerName, status: "waiting" });
        this.game.socket.emit("getPlayersRoom", { roomName: this.roomName, playerName: this.game.playerName });

        this.game.socket.on('startGameClient', (players) => {
            console.log(players)
            if (players && players.length > 1) {
                this.timeTxt.setText('GET READY!');
                this.time.addEvent({
                    delay: 2000,
                    callback: () => {
                        this.sceneStopped = true;
                        this.scene.sleep("looby");
                        this.scene.start("match", { roomName: this.roomName });
                    },
                    loop: false
                });
            } else {
                this.timeTxt.setText("Time Out!");
                this.time.addEvent({
                    delay: 500,
                    callback: () => {
                        this.game.socket.emit("quitLobby", { roomName: this.roomName, playerName: this.game.playerName });
                        this.sceneStopped = true;
                        this.scene.sleep("looby");
                        this.scene.start('menu');
                    },
                    loop: false
                });
            }
        });

        this.game.socket.on('currentPlayersClient', (obj) => {
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
                            let playerNameTxt = this.add.bitmapText(((this.width / 4) / 2) + posX, 450, 'iceicebaby', playerObj.name, 32).setOrigin(0.5);
                            let player = this.add.sprite(((this.width / 4) / 2) + posX, 550, 'dude');
                            player.setScale(2, 2); /// if number is negative its fliped                            
                            player.name = playerObj.name;
                            playerNameTxt.name = playerObj.name;
                            this.playersGrp.add(player);
                            this.playersNameTxtGrp.add(playerNameTxt);
                            posX += this.width / 4;
                        }
                    });
                }
            }
        });

        this.game.socket.on('getCountdownClient', (obj) => {
            if (!this.sceneStopped && obj.sceneCountdown === "lobby") {
                this.timeTxt.setText(parseInt((obj.countdown / 1000)));
            }
        });

        this.game.socket.on('playerDisconnected', (playerName) => {
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

        // BACKGROUND
        this.add.image(640, 360, 'background');
        this.add.bitmapText(this.width / 2, 200, 'iceicebaby', 'Wating for opponents...', 50).setOrigin(0.5);
        this.timeTxt = this.add.bitmapText(this.width / 2, 300, 'atarismooth', "", 32).setOrigin(0.5);
        // back
        this.pointerBack(() => {
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

            this.game.socket.emit("quitLobby", { roomName: this.roomName, playerName: this.game.playerName });
            this.sceneStopped = true;
            this.scene.sleep("looby");
            this.scene.start('menu');
        });
        // back
        // BACKGROUND

        // GROUPS AND PLAYERS
        this.playersGrp = this.add.group();
        this.playersNameTxtGrp = this.add.group();
        // GROUPS AND PLAYERS
    }

    update(time, delta) {
        this.countdownDelay -= delta;
        if (this.countdownDelay < 0) {
            this.countdownDelay = this.delay;
            this.game.socket.emit("getCountdown", { roomName: this.roomName });
        }
    }
}

