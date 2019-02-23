import HealthBar from '../helpers/healthbar.js';

var DETECTION_DISTANCE = 50;

export default class Enemy extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y - 16, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.alive = true;
        this.health = {
            max: 2,
            value: 2,
            bar: new HealthBar(config.scene, this)
        };

        // start still and wait until needed
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.body.allowGravity = false;

        this.body.setSize(16, 16);

        this.ai = {
            state: 'idle'
        };
    }

    activated() {
        // Method to check if an enemy is activated, the enemy will stay put
        // until activated so that starting positions is correct
        if (!this.alive) {
            if (this.y > 240) {
                this.kill();
            }
            return false;
        }
        return true;
    }

    hurtPC(enemy, pc) {
        if (pc.hurtBy(enemy)) {
            enemy.die(enemy, enemy.scene.damageFactor);
            enemy.scene.sound.playAudioSprite('sfx', 'smb_stomp');
        }
    }

    starKilled() {
        // Killed by a star or hit from below with a block, later on also fire
        if (!this.alive) {
            return;
        }
        this.die(this);
        this.scene.sound.playAudioSprite('sfx', 'smb_stomp');
    }

    kill() {
        // Forget about this enemy
        this.scene.enemyGroup.remove(this);
        this.destroy();
        this.health.bar.destroy();
        this.health.bar.barFront.destroy();
    }

    findPlayer() {
        let minDistance = -1;
        let closestGirl = null;
        this.scene.girlGroup.children.entries.forEach(girl => {
            const distance = Phaser.Math.Distance.Between(girl.x, girl.y, this.x, this.y);
            if (distance > DETECTION_DISTANCE) {
                return;
            }
            if (girl.health.value < 1) {
                return;
            }
            if (closestGirl === null || minDistance > distance) {
                minDistance = distance;
                closestGirl = girl;
            }
        })
        return closestGirl;
    }
}
