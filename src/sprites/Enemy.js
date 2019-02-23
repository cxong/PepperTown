/*
Generic enemy class that extends Phaser sprites.
Classes for enemy types extend this class.
*/

export default class Enemy extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y - 16, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.alive = true;

        // start still and wait until needed
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.body.allowGravity = false;

        // know about Mario
        this.mario = this.scene.mario;

        this.body.setSize(16, 16);
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
            enemy.die(enemy, pc);
            enemy.scene.updateScore(100);
            enemy.scene.sound.playAudioSprite('sfx', 'smb_stomp');
        }
    }

    starKilled() {
        // Killed by a star or hit from below with a block, later on also fire
        if (!this.alive) {
            return;
        }
        this.body.velocity.x = 0;
        this.body.velocity.y = -200;
        this.alive = false;
        this.flipY = true;
        this.scene.sound.playAudioSprite('sfx', 'smb_stomp');
        this.scene.updateScore(100);
    }

    kill() {
        // Forget about this enemy
        this.scene.enemyGroup.remove(this);
        this.destroy();
    }
}
