import { fullScreen } from "../utils/screen.js";
import { pointerOver, pointerOut, pointerBack } from "../utils/buttons.js";
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
        
        // Bindings
        fullScreen.call(this);
        this.pointerBack = pointerBack.bind(this);
    }

    create() {

        // REALTIME       

        // Check room default
        this.roomSceneSelected = '0';

        this.game.socket.emit("getPlayersRoom", { roomName: this.roomSceneSelected });

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

        this.game.socket.on('playerConnectedClient', (player) => {
            if (!this.sceneStopped)
                console.log(player + ' has joined');
        });

        this.game.socket.on('playerDisconnectedClient', (playerName) => {
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

        this.game.socket.on('getCountdownClient', (obj) => {
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
        this.add.bitmapText(this.game.config.width / 2, 180, 'iceicebaby', this.game.playerName, 40).setOrigin(0.5);
        this.add.bitmapText(250, 300, 'iceicebaby', "Create room", 40).setOrigin(0.5);
        this.add.bitmapText(260, 330, 'atarismooth', "(Coming soon)", 22).setOrigin(0.5);

        this.add.bitmapText(750, 300, 'iceicebaby', "Choose a room", 40).setOrigin(0.5);

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
        pointerOver(joinBtn);
        pointerOut(joinBtn);

        let joinTxt = this.add.bitmapText(830, 400, 'iceicebaby', 'Join', 34).setOrigin(0.5);

        joinBtn.on('pointerup', () => {
            if (!this.roomPlayerSelected) {
                // It will improve
                this.roomPlayerSelected = "0";
                joinTxt.setText("Leave");
                this.game.socket.emit("joinedRoom", { roomName: this.roomPlayerSelected, playerName: this.game.playerName });
            } else {
                this.game.socket.emit("quitRoom", { roomName: this.roomPlayerSelected, playerName: this.game.playerName });
                this.roomPlayerSelected = "";
                joinTxt.setText("Join");
            }
        });

        this.add.bitmapText(1100, 300, 'iceicebaby', "Players", 40).setOrigin(0.5);

        this.playBtn = this.add.image(1130, 650, 'button').setOrigin(0.5).setInteractive({ cursor: 'pointer' });
        this.playBtn.visible = false;
        pointerOver(this.playBtn);
        pointerOut(this.playBtn);

        this.playTxt = this.add.bitmapText(1130, 650, 'iceicebaby', 'Play', 34).setOrigin(0.5);
        this.playTxt.visible = false;

        this.playBtn.on('pointerup', () => {
            if (this.playersGrp.children.entries.length > 1 && this.playersGrp.children.entries.length <= 4) {
                this.game.socket.emit("setCountdown", { roomName: this.roomPlayerSelected });
                this.sceneStopped = true;
                this.scene.sleep("match.settings");
                this.scene.start('lobby', { roomName: this.roomPlayerSelected });
            }
        });

        // back 
        this.pointerBack(() => {
            this.game.socket.emit("quitRoom", { roomName: this.roomPlayerSelected, playerName: this.game.playerName });
            this.roomPlayerSelected = "";
            joinTxt.setText("Join");
            this.sceneStopped = true;
            this.scene.sleep("menu");
            this.scene.start('title');
        });
        // back    
        // BACKGROUND AND CONTROLS

        // GROUPS AND PLAYERS
        this.playersGrp = this.add.group();
        this.playersNameTxtGrp = this.add.group();
        // GROUPS AND PLAYER
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

