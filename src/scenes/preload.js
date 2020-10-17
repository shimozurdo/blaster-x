import { createAnimation } from "../utils/scenes.js"
import CONST from '../constant.js'

export default class Preload extends Phaser.Scene {

    // Vars
    width;
    height;

    constructor() {
        super({ key: "preload" })
    }

    preload() {
        // Fonts
        this.load.bitmapFont('iceicebaby', 'assets/fonts/iceicebaby.png', 'assets/fonts/iceicebaby.xml');
        this.load.bitmapFont('atarismooth', 'assets/fonts/atari-smooth.png', 'assets/fonts/atari-smooth.xml');
        // Images
        this.load.image('logo', 'assets/images/logow.png');
        this.load.image('background', 'assets/images/background.png');
        this.load.image('back', 'assets/images/back.png');
        this.load.image('window1', 'assets/images/window1.png');
        this.load.image('robot', 'assets/images/robot.png');
        this.load.image('button', 'assets/images/button.png');
        this.load.image('gumbot', 'assets/images/gumbot.png');
        this.load.image('button', 'assets/images/button.png');
        this.load.image('alert', 'assets/images/alert.png');
        this.load.image('guest', 'assets/images/guest.png');
        this.load.image('platform', 'assets/images/platform.png');
        this.load.image('tileSetImg', 'assets/images/tileSet.png');
        this.load.image('layer0-bg-match', 'assets/images/layer0-bg-match.png');
        this.load.image('layer1-bg-match', 'assets/images/layer1-bg-match.png');
        this.load.image('bomb', 'assets/images/bomb.png');
        // Sprite sheets
        this.load.spritesheet('coin', 'assets/images/coin.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('bullet1', 'assets/images/bullet1.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('fire-loading', 'assets/images/fire-loading.png', { frameWidth: 50, frameHeight: 50 });
        this.load.spritesheet('dude', 'assets/images/dude.png', { frameWidth: 48, frameHeight: 56 });
        // Json
        this.load.tilemapTiledJSON('map', 'assets/images/tileMap.json');
        // HTML files
        this.load.html('form', 'assets/html/form.html');

        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;

        let progressBar = this.add.graphics();
        let progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect((this.width / 2) - (320 / 2), (this.height / 2) - (50 / 2), 320, 50);

        let loadingText = this.make.text({
            x: this.width / 2,
            y: this.height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '28px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        let percentText = this.make.text({
            x: this.width / 2,
            y: this.height / 2 - 5,
            text: '0%',
            style: {
                font: '28px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        let assetText = this.make.text({
            x: this.width / 2,
            y: this.height / 2 + 50,
            text: '',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        assetText.setOrigin(0.5, 0.5);

        this.load.on('progress', (value) => {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect((this.width / 2) - (300 / 2), (this.height / 2) - (30 / 2), 300 * value, 30);
        });

        this.load.on('fileprogress', (file) => {
            assetText.setText('Loading asset: ' + file.key);
        });

        this.load.on('complete', () => {
            this.add.image(this.width / 2, this.height / 2, 'logo');
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();

            this.time.addEvent({
                delay: 2000,
                callback: () => {
                    this.sceneStopped = true;
                    this.scene.sleep("preload");
                    this.scene.start("title");
                },
                loop: false
            });
        });

        //binding actions to thins scene
        this.createAnimation = createAnimation.bind(this);
    }

    create() {
        // ANIMATIONS       
        this.createAnimation(CONST.ANIM.ROTATE + "-fire-loading", "fire-loading", 0, 7, 10, -1);
        this.createAnimation(CONST.ANIM.ROTATE + "-coin", 'coin', 0, 3, 6, -1, true);
        this.createAnimation(CONST.ANIM.RUN + "-dude", 'dude', 1, 4, 15, -1);
        this.createAnimation(CONST.ANIM.IDLE + "-dude", 'dude', 0, 0);
        this.createAnimation(CONST.ANIM.JUMP + "-dude", 'dude', 4, 4);
        this.createAnimation(CONST.ANIM.SHOOT + "-bullet1", 'bullet1', 0, 2, 15, -1);  
        // ANIMATIONS
    }
}
