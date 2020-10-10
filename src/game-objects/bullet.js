// import phaser from 'phaser'
// class Bullet extends phaser.Physics.Arcade.Sprite {
//     constructor(scene, x, y) {
//         super(scene, x, y, 'bullet1');
//     }

//     fire(x, y) {
//         this.body.reset(x, y);

//         this.setActive(true);
//         this.setVisible(true);

//         this.setVelocityY(-300);
//     }

//     preUpdate(time, delta) {
//         super.preUpdate(time, delta);

//         if (this.y <= -32) {
//             this.setActive(false);
//             this.setVisible(false);
//         }
//     }
// }

// class BulletsGroup extends phaser.Physics.Arcade.Group {
//     constructor(scene) {
//         super(scene.physics.world, scene);

//         this.createMultiple({
//             frameQuantity: 5,
//             key: 'bullet',
//             active: false,
//             visible: false,
//             classType: Bullet
//         });
//     }

//     fireBullet(x, y) {
//         let bullet = this.getFirstDead(false);

//         if (bullet) {
//             bullet.fire(x, y);
//         }
//     }
// }

// export default BulletsGroup;

import phaser from 'phaser'
let Bullet = new phaser.Class({

    Extends: phaser.GameObjects.Sprite,

    initialize:
        function Bullet(scene) {
            phaser.GameObjects.Sprite.call(this, scene, 0, 0, 'bullet1');
            this.speed = phaser.Math.GetSpeed(800, 1);
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