let Bullet = new Phaser.Class({

    Extends: Phaser.GameObjects.Sprite,

    initialize:
        function Bullet(scene) {
            Phaser.GameObjects.Sprite.call(this, scene, 0, 0, 'bullet1');
            this.speed = Phaser.Math.GetSpeed(800, 1);
            this.playerFlipX = false;
        },

    fire: function (x, y, flipX) {
        this.playerFlipX = flipX;
        this.setPosition(x - 20, y);
        this.setActive(true);
        this.setVisible(true);
    },

    update: function (time, delta) {
        if (this.playerFlipX)
            this.x -= this.speed * delta;
        else
            this.x += this.speed * delta;
    }

});

export default Bullet;