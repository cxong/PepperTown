import Enemy from './Enemy';

export default class Slime extends Enemy {
    constructor(config) {
        super(config);
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.anims.play('slime/rundown');
        this.killAt = 0;
    }

    update(time, delta) {
        // If it's not activated, then just skip the update method (see Enemy.js)
        if (!this.activated()) {
            return;
        }
        if (this.killAt !== 0) {
            // The killtimer is set, keep the flat Goomba then kill it for good.
            this.body.setVelocityX(0);
            this.killAt -= delta;
            if (this.killAt < 0) {
                this.kill();
            }
            return;
        }

        this.scene.physics.world.overlap(this, this.scene.mario, this.hurtPC);
    }

    die(enemy, pc) {
        enemy.alpha = 0.2;
        enemy.killAt = 500;
    }
}
