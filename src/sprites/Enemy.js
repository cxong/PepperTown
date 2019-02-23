/*
Generic enemy class that extends Phaser sprites.
Classes for enemy types extend this class.
*/
var DETECTION_DISTANCE = 50;

export default class Enemy extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y - 16, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.alive = true;

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
            enemy.die(enemy);
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
    }

    findPlayer() {
        if (Phaser.Math.Distance.Between(this.scene.mario.x, this.scene.mario.y, this.x, this.y) < DETECTION_DISTANCE) {
            return this.scene.mario;
        }
        return null;
    }
}
