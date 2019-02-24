import HealthBar from '../helpers/healthbar.js';
import Wham from '../sprites/wham';

const SPEED = 50;
const RETURN_SPEED_MULT = 2;
const START_X = 16 * 6;
const WAS_HURT = 1000;
const FIRE_COOLDOWN = 500;
const HEAL_COOLDOWN = 500;
const HEAL_RATE = 1;

export default class Girl extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        this.key = config.key;
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.dir = 'down';
        this.body.setSize(16, 16);
        this.body.offset.set(4, 16);

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
        this.healCooldown = 0;

        this.ai = {
            state: 'running'
        };
        this.scene = config.scene;
    }

    animPlay(anim) {
        const animKey = this.key + anim + this.dir;
        if (!this.anims.currentAnim ||
            (this.anims.currentAnim.key !== animKey && !this.scene.physics.world.isPaused)) {
            this.anims.play(animKey);
        }
    }

    maxHP() {
        return this.health.max * this.scene.hpFactor;
    }

    update(keys, time, delta) {
        this.depth = this.y;
        this.fireCoolDown -= delta;
        this.healCooldown -= delta;
        this.health.bar.update();

        if (this.wasHurt > 0) {
            this.wasHurt -= delta;
            this.flashToggle = !this.flashToggle;
            this.alpha = this.flashToggle ? 0.2 : 1;
            if (this.wasHurt <= 0) {
                this.alpha = 1;
            }
        }
        if (this.scene.attractMode) {
            return;
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
                if (this.health.value <= 0 || this.x > 25 * 16) {
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
                if (this.health.value <= 0) {
                    this.ai.state = 'returning';
                } else if (!this.ai.target || !this.ai.target.active) {
                    this.ai.state = 'running';
                } else {
                    // face target
                    const vel = new Phaser.Geom.Point(this.ai.target.body.x - this.body.x, this.ai.target.body.y - this.body.y);
                    if (Math.abs(vel.x) > Math.abs(vel.y)) {
                        this.dir = vel.x > 0 ? 'right' : 'left';
                    } else {
                        this.dir = vel.y > 0 ? 'down' : 'up';
                    }
                    input.fire = true;
                }
                break;
            case 'resting':
                if (this.health.value < this.maxHP()) {
                    this.dir = 'down';
                    if (this.healCooldown < 1) {
                        this.onHeal();
                    }
                } else {
                    this.ai.state = 'running';
                }
                break;
        }
        if (this.ai.state !== 'returning') {
            this.health.value = Math.min(this.maxHP(), this.health.value + this.scene.regen * delta / 1000);
        }

        this.body.setVelocityX(0);
        this.body.setVelocityY(0);
        const speed = SPEED * (this.ai.state === 'returning' ? RETURN_SPEED_MULT * this.scene.returnSpeed : 1) * this.scene.speedMultiplier;
        if (input.left) {
            this.body.setVelocityX(-speed);
            this.dir = 'left';
        } else if (input.right) {
            this.body.setVelocityX(speed);
            this.dir = 'right';
        } else if (input.down) {
            this.body.setVelocityY(speed);
            this.dir = 'down';
        } else if (input.up) {
            this.body.setVelocityY(-speed);
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

    onHeal() {
        const healValue = HEAL_RATE;
        this.health.value += healValue;
        this.healCooldown = HEAL_COOLDOWN / this.scene.healFactor;
        this.scene.setCash(this.scene.cash.value + healValue, this.x, this.y);
    }

    hurtBy(enemy) {
        if (this.health.value <= 0) {
            return false;
        }
        if (this.wasHurt < 1) {
            this.health.value -= enemy.damage * this.scene.defenseFactor;
            this.wasHurt = WAS_HURT;
            this.scene.playSoundBank('hit', 0.25);
            this.scene.coinGroup.add(new Wham(this.scene, this.x, this.y, 'splash', 'splash'));
        }
        this.ai.state = 'fighting';
        this.ai.target = enemy;
        if (this.fireCoolDown < 1) {
            this.fireCoolDown = FIRE_COOLDOWN / this.scene.attackSpeed;
            return true;
        }
        return false;
    }
}
