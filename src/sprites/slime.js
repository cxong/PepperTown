import Enemy from './Enemy';

const SPEED = 30;

export default class Slime extends Enemy {
    constructor(config) {
        super(config);
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.anims.play('slime/rundown');
        this.killAt = 0;
    }

    update(time, delta) {
        if (this.killAt !== 0) {
            // The killtimer is set, keep the flat Goomba then kill it for good.
            this.body.setVelocityX(0);
            this.killAt -= delta;
            if (this.killAt < 0) {
                this.kill();
            }
            return;
        }
        // If it's not activated, then just skip the update method (see Enemy.js)
        if (!this.activated()) {
            this.body.setVelocity(0, 0);
            return;
        }

        switch (this.ai.state) {
            case 'idle':
                const target = this.findPlayer();
                if (target) {
                    this.ai.state = 'fighting';
                    this.ai.target = target;
                } else {
                    this.body.setVelocity(0, 0);
                }
                break;
            case 'fighting':
                if (!this.ai.target || this.ai.target.health.value < 1) {
                    this.ai.state = 'idle';
                } else {
                    let vel = new Phaser.Geom.Point(this.ai.target.x - this.x, this.ai.target.y - this.y);
                    if (Phaser.Geom.Point.GetMagnitude(vel) < 5) {
                        this.body.setVelocity(0, 0);
                    } else {
                        vel = Phaser.Geom.Point.SetMagnitude(vel, SPEED);
                        this.body.setVelocity(vel.x, vel.y);
                    }
                }
                break;
        }

        this.scene.physics.world.overlap(this, this.scene.mario, this.hurtPC);
    }

    die(enemy) {
        this.alive = false;
        enemy.scene.updateScore(100);
        enemy.alpha = 0.2;
        enemy.killAt = 500;
    }
}
