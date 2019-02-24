import Enemy from './Enemy';
import Wham from '../sprites/wham';

const SPEED = 30;
var LOST_DISTANCE = 70;

export default class Slime extends Enemy {
    constructor(config) {
        super(config);
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.anims.play('slime/rundown');
        this.killAt = 0;
    }

    update(time, delta) {
        this.depth = this.y;
        this.health.bar.update();

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
                    this.animPlay('slime/rundown');
                }
                break;
            case 'fighting':
                if (!this.ai.target || this.ai.target.health.value <= 0) {
                    this.ai.state = 'idle';
                } else {
                    let vel = new Phaser.Geom.Point(this.ai.target.body.x - this.body.x, this.ai.target.body.y - this.body.y);
                    if (Phaser.Geom.Point.GetMagnitude(vel) < 5) {
                        this.body.setVelocity(0, 0);
                    } else if (Phaser.Geom.Point.GetMagnitude(vel) > LOST_DISTANCE) {
                        this.ai.state = 'idle';
                    } else {
                        vel = Phaser.Geom.Point.SetMagnitude(vel, SPEED);
                        this.body.setVelocity(vel.x, vel.y);
                        if (Math.abs(vel.x) > Math.abs(vel.y)) {
                            if (vel.x > 0) {
                                this.animPlay('slime/runright');
                            } else {
                                this.animPlay('slime/runleft');
                            }
                        } else {
                            if (vel.y > 0) {
                                this.animPlay('slime/rundown');
                            } else {
                                this.animPlay('slime/runup');
                            }
                        }
                    }
                }
                break;
        }

        this.scene.girlGroup.children.entries.forEach(girl => {
            this.scene.physics.world.overlap(this, girl, this.hurtPC);
        })
    }

    animPlay(key) {
        if (this.anims.currentAnim.key !== key) {
            this.anims.play(key);
        }
    }

    die(enemy, damage, soundKey) {
        this.scene.playSoundBank(soundKey, 0.5);
        this.health.value -= damage;
        this.scene.coinGroup.add(new Wham(this.scene, this.x, this.y, 'break', 'break'));
        if (this.health.value <= 0) {
            this.alive = false;
            enemy.scene.onKill(enemy.health.max, enemy.x, enemy.y);
            enemy.alpha = 0.2;
            enemy.killAt = 500;
        }
    }
}
