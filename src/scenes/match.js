import { fullScreen } from "../utils/screen.js";
import { pointerOver, pointerOut, pointerBack } from "../utils/buttons.js";
import Bullet from '../game-objects/bullet.js'
import CONST from '../constant.js'

export default class Match extends Phaser.Scene {

    // Vars
    boundsScene = { x: 1408, y: 1024 };
    quarterScreenW = (this.boundsScene.x - 128) / 4;
    sceneStopped = false;
    delayMS = 200;
    delay = 200; //constant     
    oneSecondMS = 1000;
    countdown = 0;
    mainCamera = null;
    cursors = null;
    gameOver = true;
    deceleration = .95;
    playersGrp = null;
    playersScoreGrp = null;
    coinsGrp = null;
    bombsGrp = null;
    bulletsGrp = null;
    platformsGrp = null;

    constructor() {
        super({ key: "match" })
    }

    init(data) {
        this.roomName = data.roomName;
    }

    preload() {
        // Bindings
        fullScreen.call(this);
        this.pointerBack = pointerBack.bind(this);
    }

    create() {

        // REALTIME
        this.game.socket.emit("setPlayerStatus", { roomName: this.roomName, playerName: this.game.playerName, status: "playing" });
        this.game.socket.emit("getRoom", { roomName: this.roomName });

        this.game.socket.on('startGameClient', (room) => {
            console.log("entra startGameClient")
        });

        this.game.socket.on('currentRoomClient', (room) => {
            if (!this.sceneStopped) {
                let playersPosScene = [];
                if (room.players && room.players.length > 0) {
                    let i = 1;
                    room.players.forEach((player) => {
                        if (player.status === "waiting" || player.status === "playing") {
                            playersPosScene.push({ posScene: i, name: player.name })
                        }
                        i++;
                    });
                }

                this.renderPlayers(playersPosScene);
                this.renderGameObjects({ coins: room.items.coins, update: false });
            }
        });

        this.game.socket.on('renderGameObjectsClient', (obj) => {
            if (!this.sceneStopped) {
                this.renderGameObjects(obj);
            }
        });

        this.game.socket.on('newPlayerPosScene', (obj) => {
            if (!this.sceneStopped) {
                // fix timer countdown
                this.countdown = obj.countdown;
                this.timerTxt.setText(parseInt((obj.countdown / 1000)));
                if (this.playersGrp.children.entries.length > 0) {
                    this.playersGrp.children.each((player) => {
                        if (player.name === obj.player.playerName) {
                            player.action = obj.player.action;
                            player.maxSpeedX = obj.player.maxSpeedX;

                            // if (!player.action.isJumping) {
                            //     player.x = obj.player.posX;
                            //     player.y = obj.player.posY;
                            // } else if (player.action.isJumping) {
                            player.newPosX = obj.player.posX;
                            // }

                        }
                    });
                }
            }
        });
        // REALTIME

        // BACKGROUND AND HUD
        this.bgLayer0 = this.add.image(0, 0, 'layer0-bg-match').setOrigin(0);
        this.bgLayer0.setScrollFactor(0);
        this.bgLayer1 = this.add.tileSprite(0, 0, this.game.config.width, this.game.config.height, 'layer1-bg-match').setOrigin(0, 0);
        this.bgLayer1.setScrollFactor(0);

        // hud
        this.timerTxt = this.add.bitmapText(this.game.config.width / 2, 100, 'atarismooth', "", 32).setOrigin(0, 0);
        this.timerTxt.setScrollFactor(0);
        // hud

        // map
        this.map = this.make.tilemap({ key: 'map' });
        this.tileSet = this.map.addTilesetImage('tileSet', 'tileSetImg');
        this.tileMap = this.map.createDynamicLayer('staticObjects', this.tileSet, 0, 0);
        // map

        // back
        this.pointerBack(() => {
            if (this.playersGrp.children.entries && this.playersGrp.children.entries.length > 0)
                this.playersGrp.children.each((player) => {
                    if (player.name === this.game.playerName) {
                        this.playersGrp.remove(player, true, true);
                    }
                });

            if (this.playersScoreGrp.children.entries && this.playersScoreGrp.children.entries.length > 0)
                this.playersScoreGrp.children.each((playersScore) => {
                    if (playersScore.name === this.game.playerName) {
                        this.playersScoreGrp.remove(playersScore, true, true);
                    }
                });

            this.game.socket.emit("quitLobby", { roomName: this.roomName, playerName: this.game.playerName });
            this.sceneStopped = true;
            this.scene.sleep("match");
            this.scene.start('match.settings', { socket: this.game.socket });
        });
        // back
        // BACKGROUND AND HUD

        // GROUPS AND PLAYERS
        this.playersGrp = this.physics.add.group();
        this.playersScoreGrp = this.add.group();
        this.coinsGrp = this.physics.add.group();
        this.bombsGrp = this.physics.add.group();
        this.bulletsGrp = this.physics.add.group({
            classType: Bullet,
            runChildUpdate: true,
            allowGravity: false
        });
        this.platformsGrp = this.physics.add.staticGroup();

        //create collisions for the tileMap
        const mapCollitions = [
            { x: 1 * 32, y: 1 * 32, scaleX: 42, scaleY: 1 },
            { x: 1 * 32, y: 24 * 32, scaleX: 42, scaleY: 1 },
            { x: 1 * 32, y: 2 * 32, scaleX: 1, scaleY: 22 },
            { x: 42 * 32, y: 2 * 32, scaleX: 1, scaleY: 22 },
            { x: 2 * 32, y: 20 * 32, scaleX: 5, scaleY: 1 },
            { x: 37 * 32, y: 20 * 32, scaleX: 5, scaleY: 1 },
            { x: 21 * 32, y: 20 * 32, scaleX: 2, scaleY: 1 },
            { x: 10 * 32, y: 16 * 32, scaleX: 6, scaleY: 1 },
            { x: 28 * 32, y: 16 * 32, scaleX: 6, scaleY: 1 },
            { x: 5 * 32, y: 12 * 32, scaleX: 5, scaleY: 1 },
            { x: 20 * 32, y: 12 * 32, scaleX: 4, scaleY: 1 },
            { x: 34 * 32, y: 12 * 32, scaleX: 5, scaleY: 1 },
            { x: 12 * 32, y: 8 * 32, scaleX: 5, scaleY: 1 },
            { x: 27 * 32, y: 8 * 32, scaleX: 5, scaleY: 1 }
        ];

        for (let i = 0; i < mapCollitions.length; i++) {
            let platform = this.platformsGrp.create(mapCollitions[i].x, mapCollitions[i].y, "platform").setOrigin(0);
            platform.scaleX = mapCollitions[i].scaleX;
            platform.scaleY = mapCollitions[i].scaleY;
            platform.visible = false;
            platform.refreshBody();
        }
        //create collisions for the tileMap
        // GROUPS AND PLAYERS

        // EVENTS AND TRIGGERS
        this.cursors = this.input.keyboard.createCursorKeys();

        const keyUp = this.input.keyboard.addKey('up');
        const keyLeft = this.input.keyboard.addKey('left');
        const keyRight = this.input.keyboard.addKey('right');
        const keyDown = this.input.keyboard.addKey('down');

        keyDown.on('down', () => {
            this.playersGrp.children.each((player) => {
                if (!player.gameOver && player.name === this.game.playerName && player.delayFire <= 0) {
                    this.game.socket.emit("renderGameObjects", { action: "playerShot", roomName: this.roomName, posX: player.x, posY: player.y, playerName: this.game.playerName, flipX: player.flipX });
                    player.delayFire = 200;

                }
            });
        });

        keyLeft.on('down', () => {
            this.playersGrp.children.each((player) => {
                if (!player.gameOver && player.name === this.game.playerName) {
                    player.action.isLeft = true;
                    this.game.socket.emit("setPlayerPosScene", { roomName: this.roomName, posX: player.x, posY: player.y, playerName: this.game.playerName, action: player.action, maxSpeedX: player.maxSpeedX });
                }
            });
        });

        keyLeft.on('up', () => {
            this.playersGrp.children.each((player) => {
                if (!player.gameOver && player.name === this.game.playerName) {
                    player.action.isLeft = false;
                    this.game.socket.emit("setPlayerPosScene", { roomName: this.roomName, posX: player.x, posY: player.y, playerName: this.game.playerName, action: player.action, maxSpeedX: player.maxSpeedX });
                }
            });
        });

        keyRight.on('down', () => {
            this.playersGrp.children.each((player) => {
                if (!player.gameOver && player.name === this.game.playerName) {
                    player.action.isRight = true;
                    this.game.socket.emit("setPlayerPosScene", { roomName: this.roomName, posX: player.x, posY: player.y, playerName: this.game.playerName, action: player.action, maxSpeedX: player.maxSpeedX });
                }
            });
        });

        keyRight.on('up', () => {
            this.playersGrp.children.each((player) => {
                if (!player.gameOver && player.name === this.game.playerName) {
                    player.action.isRight = false;
                    this.game.socket.emit("setPlayerPosScene", { roomName: this.roomName, posX: player.x, posY: player.y, playerName: this.game.playerName, action: player.action, maxSpeedX: player.maxSpeedX });
                }
            });
        });

        keyUp.on('up', () => {
            this.playersGrp.children.each((player) => {
                if (!player.gameOver && player.name === this.game.playerName) {
                    player.action.isJumping = false;
                    this.game.socket.emit("setPlayerPosScene", { roomName: this.roomName, posX: player.x, posY: player.y, playerName: this.game.playerName, action: player.action, maxSpeedX: player.maxSpeedX });
                }
            });
        });

        //  Collisions
        this.physics.add.collider(this.playersGrp, this.platformsGrp);
        this.physics.add.collider(this.coinsGrp, this.platformsGrp);
        this.physics.add.collider(this.bombsGrp, this.platformsGrp);

        this.physics.add.overlap(this.playersGrp, this.coinsGrp, this.collectCoin, null, this);
        this.physics.add.overlap(this.playersGrp, this.bombsGrp, this.hitBomb, null, this);
        this.physics.add.overlap(this.bulletsGrp, this.platformsGrp, this.destroyBullet, null, this);
        this.physics.add.overlap(this.bulletsGrp, this.playersGrp, this.hitPlayer, null, this);
        this.physics.add.overlap(this.coinsGrp, this.coinsGrp, this.overlapCoin, null, this);
        // EVENTS AND TRIGGERS

        // fight banner
        let fightTxt = this.add.bitmapText(this.game.config.width / 2, this.game.config.height / 2, 'iceicebaby', 'FIGHT!', 100).setOrigin(.5);
        fightTxt.setScrollFactor(0);

        this.tweens.add({
            targets: fightTxt,
            alpha: 0,
            duration: 5000
        }, this);
    }

    renderGameObjects(obj) {
        if (obj) {
            if (obj.update) {
                if (obj.action === "collectCoin") {
                    this.coinsGrp.children.each((coin) => {
                        if (coin.name === obj.coin.name) {
                            coin.destroy();
                        }
                    });
                    this.playersGrp.children.each((player) => {
                        if (player.name === obj.playerName) {
                            player.coins = obj.playerCoins;
                        }
                    });
                    this.playersScoreGrp.children.each((playerScore) => {
                        if (playerScore.name === obj.playerName) {
                            playerScore.setText(playerScore.text.split(':')[0] + ": " + obj.playerCoins);
                        }
                    });
                } else if (obj.action === "createBoom") {
                    let bomb = this.bombsGrp.create(obj.posX, 200, 'bomb');
                    bomb.setSize(24, 24);
                    bomb.setBounce(1);
                    bomb.setVelocity(obj.velocityX, 20);
                    bomb.allowGravity = false;
                } else if (obj.action === "playerShot") {
                    let bullet = this.bulletsGrp.get();
                    if (bullet) {
                        bullet.body.setSize(10, 10);
                        bullet.fire(obj.posX, obj.posY, obj.flipX);
                        bullet.anims.play(CONST.ANIM.SHOOT + "-bullet1");
                        bullet.owner = obj.playerName;
                        bullet.collided = false;
                    }
                } else if (obj.action === "hitPlayer") {
                    this.playersGrp.children.each((player) => {
                        if (player.name === obj.playerName) {
                            player.delayDamage = 500;
                            player.setTint(0xff0000);
                        }
                    });
                    if (obj.playerCoins >= 0) {
                        this.playersScoreGrp.children.each((playerScore) => {
                            if (playerScore.name === obj.playerName) {
                                playerScore.setText(playerScore.text.split(':')[0] + ": " + obj.playerCoins);
                            }
                        });
                    }
                    if (obj.coin) {
                        let coin = this.physics.add.sprite(obj.playerX, obj.playerY - 20, 'coin')
                        coin.name = obj.coin.name;
                        coin.owner = null;
                        coin.setActive(false);
                        coin.setVisible(false);
                        coin.isVisible = true;
                        coin.setBounceY(1);
                        coin.maxSpeedX = 100;
                        coin.bounceY = 1;
                        this.time.addEvent({
                            delay: 50,
                            callback: () => {
                                coin.setBounceY(1);
                                coin.setVelocityY(-400);
                                if (obj.playerFlipX)
                                    coin.setVelocityX(-100);
                                else if (!obj.playerFlipX)
                                    coin.setVelocityX(100);
                                coin.setActive(true);
                                coin.setVisible(true);
                            },
                            loop: false
                        });
                        coin.body.setSize(18, 24);
                        coin.anims.play(CONST.ANIM.ROTATE + "-coin");
                        this.coinsGrp.add(coin);
                    }
                }
            } else {
                obj.coins.forEach(item => {
                    if (item.isVisible) {
                        let coin = this.physics.add.sprite(item.x, item.y, 'coin');
                        coin.name = item.name;
                        coin.isVisible = true;
                        coin.owner = null;
                        coin.anims.play(CONST.ANIM.ROTATE + "-coin");
                        coin.body.setSize(18, 24);
                        this.coinsGrp.add(coin);
                    }
                });
                this.coinsGrp.children.iterate((coin) => {
                    coin.setBounceY(.6);
                });
            }
        }
    }

    renderPlayers(playersPosScene) {
        playersPosScene.forEach(obj => {
            let player = this.physics.add.sprite((this.quarterScreenW * obj.posScene) - (this.quarterScreenW / 2) + 64, 608, 'dude');
            player.name = obj.name;
            player.gameOver = false;
            player.posScene = obj.posScene;
            player.maxSpeedX = 400;
            player.coins = 0;
            player.delayFire = 0;
            player.delayDamage = -1; // 0 or greater player get damaged
            player.setSize(28, 56);
            player.action = {
                isLeft: false,
                isRight: false,
                isJumping: false,
                onJump: false
            };
            player.anims.play(CONST.ANIM.IDLE + "-dude");
            this.playersGrp.add(player);
            let playerScore = this.add.bitmapText(((this.quarterScreenW * obj.posScene) - this.quarterScreenW + 50), 20, 'atarismooth', 'P' + player.posScene + ': 0', 40).setOrigin(0).setScrollFactor(0);
            playerScore.name = player.name;
            this.playersScoreGrp.add(playerScore);
            if (player.name === this.game.playerName) {
                // main camera
                this.mainCamera = this.cameras.main.startFollow(player, true, 1, .1, 0, 160);
                this.mainCamera.setBounds(0, 0, this.boundsScene.x, this.boundsScene.y);
                // main camera
                this.gameOver = false;
            }

        });
    }

    collectCoin(player, coin) {
        if (coin.isVisible && player.name === this.game.playerName && player.delayDamage < 0) {
            coin.isVisible = false;
            // console.log("coin ", coin.isVisible)
            this.coinsGrp.remove(coin, true, true);
            this.game.socket.emit("renderGameObjects", { action: "collectCoin", coinName: coin.name, roomName: this.roomName, playerName: player.name });
        }

        // if (this.coinsGrp.countActive(true) === 0) {
        //     // console.log("create coins")
        //     this.game.socket.emit("renderGameObjects", { action: "createCoins", roomName: this.roomName });
        //     this.game.socket.emit("renderGameObjects", { action: "createBoom", roomName: this.roomName, boundsSceneX: this.boundsScene.x });
        // }
    }

    overlapCoin(coin1, coin2) {
        if (coin1.x > coin2.x) {
            coin1.setVelocityX(2);
            coin2.setVelocityX(-2);
        } else {
            coin1.setVelocityX(-2);
            coin2.setVelocityX(2);
        }
    }

    hitBomb(player, bomb) {
        // this.physics.pause();
        // player.setTint(0xff0000);
        // player.anims.play('turn');
        // player.gameOver = true;
    }

    destroyBullet(bullet, platform) {
        bullet.destroy();
    }

    hitPlayer(bullet, player) {
        if (!bullet.collided && bullet.owner !== player.name && player.delayDamage < 0) {
            bullet.collided = true;
            if (player.name === this.game.playerName) {
                this.game.socket.emit("renderGameObjects", { action: "hitPlayer", roomName: this.roomName, playerName: player.name, playerX: player.x, playerY: player.y, playerFlipX: bullet.playerFlipX });
            }
        } else if (bullet.collided) {
            bullet.destroy();
        }
    }

    update(time, delta) {
        if (this.gameOver)
            return;

        this.coinsGrp.children.iterate((coin) => {
            if (!coin.bounceY)
                return;
            if (coin.bounceY > 0) {
                coin.setBounceY(coin.bounceY * .7);
            }
            coin.setVelocityX(coin.body.velocity.x * .98);
        });

        // //players connected
        this.playersGrp.children.each((player) => {
            if (player.name === this.game.playerName) {
                if (!player.gameOver) {
                    this.bgLayer1.tilePositionX = this.mainCamera.scrollX * .1;
                    if (this.cursors.left.isDown) {
                        player.action.isLeft = true;
                    }
                    else if (this.cursors.right.isDown) {
                        player.action.isRight = true;
                    } else if (player.body.deltaY() > 0 && player.body.onFloor()) {
                        if (!this.cursors.right.isDown)
                            player.action.isRight = false;
                        if (!this.cursors.left.isDown)
                            player.action.isLeft = false;
                    }

                    if (this.cursors.up.isDown && player.body.onFloor()) {
                        player.action.onJump = true;
                        this.game.socket.emit("setPlayerPosScene", { roomName: this.roomName, posX: player.x, posY: player.y, playerName: this.game.playerName, action: player.action, maxSpeedX: player.maxSpeedX });
                    }

                    this.delayMS -= delta;
                    this.oneSecondMS -= delta;
                    if (this.delayMS < 0) {
                        // console.log("refresh all every .2 second")
                        this.delayMS = this.delay;
                        this.game.socket.emit("setPlayerPosScene", { roomName: this.roomName, posX: player.x, posY: player.y, playerName: this.game.playerName, action: player.action, maxSpeedX: player.maxSpeedX });
                    }
                    // else if (this.oneSecondMS < 0) {
                    //     // console.log("refresh all every second")
                    //     this.oneSecondMS = 1000;
                    //     this.game.socket.emit("setPlayerPosScene", { roomName: this.roomName, posX: player.x, posY: player.y, playerName: this.game.playerName, action: player.action, maxSpeedX: player.maxSpeedX, do: "fixAll" });
                    // }                    
                }
            }

            if (player.action.onJump && player.body.onFloor()) {
                player.setVelocityY(-600);
                player.maxSpeedX = 300;
                player.anims.play(CONST.ANIM.JUMP + "-dude");
            } else if (!player.body.onFloor()) {
                player.action.onJump = false;
                player.action.isJumping = true;
                if (player.action.isLeft) {
                    player.setVelocityX(-(player.maxSpeedX));
                    player.setFlipX(true);
                }
                else if (player.action.isRight) {
                    player.setVelocityX(player.maxSpeedX);
                    player.setFlipX(false);
                } else
                    player.setVelocityX(player.body.velocity.x * this.deceleration);

                if (player.x < player.newPosX) {
                    player.setVelocityX(player.body.velocity.x + (delta * .1));
                } else if (player.x > player.newPosX) {
                    player.setVelocityX(player.body.velocity.x - (delta * .1));
                }

            } else if (player.action.isLeft) {
                player.setVelocityX(-(player.maxSpeedX));
                player.anims.play(CONST.ANIM.RUN + "-dude", true)
                player.setFlipX(true);
            } else if (player.action.isRight) {
                player.setVelocityX(player.maxSpeedX);
                player.anims.play(CONST.ANIM.RUN + "-dude", true)
                player.setFlipX(false);
            } else if (player.body.deltaY() > 0 && player.body.onFloor()) {
                player.setVelocityX(0);
                player.maxSpeedX = 400;
                player.anims.play(CONST.ANIM.IDLE + "-dude");
                player.action.onJump = false;
                player.action.isJumping = false;
            }

            if (player.delayFire >= 0 || player.delayDamage >= 0) {
                player.delayFire -= delta;
                player.delayDamage -= delta;
            } else if (player.isTinted) {
                player.clearTint();
            }
        });
    }
}

