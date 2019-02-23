import HealthBar from '../helpers/healthbar.js';

const SPEED = 50;
const START_X = 16 * 6;
const WAS_HURT = 1000;
const FIRE_COOLDOWN = 500;
const HEAL_RATE = 2;

export default class Girl extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        this.key = config.key;
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.dir = 'down';
        this.body.setSize(16, 16);
        this.body.offset.set(0, 16);

        this.wasHurt = -1;
        this.flashToggle = false;
        this.animPlay('stand');
        this.health = {
            max: 5,
            value: 5,
            bar: new HealthBar(config.scene, this)
        };
        this.type = 'mario';
        this.fireCoolDown = 0;

        this.ai = {
            state: 'running'
        };
    }

    animPlay(anim) {
        const animKey = this.key + anim + this.dir;
        if (!this.anims.currentAnim ||
            (this.anims.currentAnim.key !== animKey && !this.scene.physics.world.isPaused)) {
            this.anims.play(animKey);
        }
    }

    update(keys, time, delta) {
        this.fireCoolDown -= delta;

        this.health.bar.update();

        //this.scene.physics.world.collide(this, this.scene.groundLayer, this.scene.tileCollision);

        if (this.wasHurt > 0) {
            this.wasHurt -= delta;
            this.flashToggle = !this.flashToggle;
            this.alpha = this.flashToggle ? 0.2 : 1;
            if (this.wasHurt <= 0) {
                this.alpha = 1;
            }
        }

        let input = {
            left: false,
            right: false,
            up: false,
            down: false,
            fire: false
        };
        switch (this.ai.state) {
            case 'running':
                // TODO: detect enemies, fighting
                if (this.health.value < 1) {
                    this.ai.state = 'returning';
                } else {
                    input.right = true;
                }
                break;
            case 'returning':
                if (this.x > START_X) {
                    input.left = true;
                } else {
                    this.ai.state = 'resting';
                }
                break;
            case 'fighting':
                if (this.health.value < 1) {
                    this.ai.state = 'returning';
                } else if (!this.ai.target || !this.ai.target.active) {
                    this.ai.state = 'running';
                } else {
                    // TODO: face target
                    input.fire = true;
                }
                break;
            case 'resting':
                if (this.health.value < this.health.max) {
                    this.dir = 'down';
                    this.health.value += HEAL_RATE * delta / 1000;
                } else {
                    this.ai.state = 'running';
                }
                break;
        }

        this.body.setVelocityX(0);
        this.body.setVelocityY(0);
        if (input.left) {
            this.body.setVelocityX(-SPEED);
            this.dir = 'left';
        } else if (input.right) {
            this.body.setVelocityX(SPEED);
            this.dir = 'right';
        } else if (input.down) {
            this.body.setVelocityY(SPEED);
            this.dir = 'down';
        } else if (input.up) {
            this.body.setVelocityY(-SPEED);
            this.dir = 'up';
        }

        let anim = null;
        if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
            anim = 'run';
        } else {
            anim = 'stand';
        }

        this.animPlay(anim);

        if (input.down && this.body.velocity.x < 100) {
            this.bending = true;
        }

        this.physicsCheck = true;
    }

    hurtBy(enemy) {
        if (this.health.value < 1) {
            return false;
        }
        if (this.wasHurt < 1) {
            this.health.value--;
            this.wasHurt = WAS_HURT;
        }
        this.ai.state = 'fighting';
        this.ai.target = enemy;
        if (this.fireCoolDown < 1) {
            this.fireCoolDown = FIRE_COOLDOWN;
            return true;
        }
        return false;
    }
}
