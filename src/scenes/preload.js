export default class Preload extends Phaser.Scene {

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
        this.load.spritesheet('fire', 'assets/images/fire.png', { frameWidth: 50, frameHeight: 50 });
        this.load.spritesheet('dude', 'assets/images/dude.png', { frameWidth: 48, frameHeight: 56 });
        // Json
        this.load.tilemapTiledJSON('map', 'assets/images/tileMap.json');
        // HTML files
        this.load.html('roomNameForm', 'assets/html/room.name.form.html');

        let progressBar = this.add.graphics();
        let progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect((this.game.config.width / 2) - (320 / 2), (this.game.config.height / 2) - (50 / 2), 320, 50);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        let loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '28px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        let percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '28px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        let assetText = this.make.text({
            x: width / 2,
            y: height / 2 + 50,
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
            progressBar.fillRect((width / 2) - (300 / 2), (height / 2) - (30 / 2), 300 * value, 30);
        });

        this.load.on('fileprogress', (file) => {
            assetText.setText('Loading asset: ' + file.key);
        });

        this.load.on('complete', () => {
            this.add.image(width / 2, height / 2, 'logo');
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
    }
}
