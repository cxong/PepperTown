var SPEED = 100;

export default class Mario extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.animSuffix = '';
        this.small();

        // this.animSuffix = 'Super';
        // this.large();

        this.wasHurt = -1;
        this.flashToggle = false;
        this.star = {
            active: false,
            timer: -1,
            step: 0
        };
        this.anims.play('stand');
        this.alive = true;
        this.type = 'mario';
        this.jumpTimer = 0;
        this.jumping = false;
        this.fireCoolDown = 0;
    }

    update(keys, time, delta) {
        // Don't do updates while dead
        if (!this.alive) {
            return;
        }

        this.fireCoolDown -= delta;

        this.scene.physics.world.collide(this, this.scene.groundLayer, this.scene.tileCollision);

        if (this.wasHurt > 0) {
            this.wasHurt -= delta;
            this.flashToggle = !this.flashToggle;
            this.alpha = this.flashToggle ? 0.2 : 1;
            if (this.wasHurt <= 0) {
                this.alpha = 1;
            }
        }

        if (this.star.active) {
            if (this.star.timer < 0) {
                this.star.active = false;
                this.tint = 0xFFFFFF;
            } else {
                this.star.timer -= delta;
                this.star.step = (this.star.step === 5) ? 0 : this.star.step + 1;
                this.tint = [0xFFFFFF, 0xFF0000, 0xFFFFFF, 0x00FF00, 0xFFFFFF, 0x0000FF][this.star.step];
            }
        }

        let input = {
            left: keys.left.isDown || this.scene.touchControls.left,
            right: keys.right.isDown || this.scene.touchControls.right,
            up: keys.up.isDown || this.scene.touchControls.up,
            down: keys.down.isDown || this.scene.touchControls.down,
            jump: keys.jump.isDown || this.scene.touchControls.jump,
            fire: keys.fire.isDown
        };

        if (input.fire && this.animSuffix === 'Fire' && this.fireCoolDown < 0) {
            let fireball = this.scene.fireballs.get(this);
            if (fireball) {
                fireball.fire(this.x, this.y, this.flipX);
                this.fireCoolDown = 300;
            }
        }

        this.jumpTimer -= delta;

        this.body.setVelocityX(0);
        this.body.setVelocityY(0);
        if (input.left) {
            this.body.setVelocityX(-SPEED);
            this.flipX = true;
        } else if (input.right) {
            this.body.setVelocityX(SPEED);
            this.flipX = false;
        } else if (input.down) {
            this.body.setVelocityY(SPEED);
        } else if (input.up) {
            this.body.setVelocityY(-SPEED);
        }

        let anim = null;
        if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
            anim = 'run';
            if ((input.left || input.right) && ((this.body.velocity.x > 0 && this.body.acceleration.x < 0) || (this.body.velocity.x < 0 && this.body.acceleration.x > 0))) {
                anim = 'turn';
            } else if (this.animSuffix !== '' && input.down && !(input.right || input.left)) {
                anim = 'bend';
            }
        } else {
            anim = 'stand';
            if (this.animSuffix !== '' && input.down && !(input.right || input.left)) {
                anim = 'bend';
            }
        }

        anim += this.animSuffix;
        if (this.anims.currentAnim.key !== anim && !this.scene.physics.world.isPaused) {
            this.anims.play(anim);
        }

        if (input.down && this.body.velocity.x < 100) {
            this.bending = true;
        }

        this.physicsCheck = true;
    }

    jump() {
        if (!this.body.blocked.down && !this.jumping) {
            return;
        }

        if (!this.jumping) {
            if (this.animSuffix === '') {
                this.scene.sound.playAudioSprite('sfx', 'smb_jump-small');
            } else {
                this.scene.sound.playAudioSprite('sfx', 'smb_jump-super');
            }
        }
        if (this.body.velocity.y < 0 || this.body.blocked.down) {
            this.body.setVelocityY(-200);
        }
        if (!this.jumping) {
            this.jumpTimer = 300;
        }
        this.jumping = true;
    }

    enemyBounce(enemy) {
        // Force Mario y-position up a bit (on top of the enemy) to avoid getting killed
        // by neigbouring enemy before being able to bounce
        this.body.y = enemy.body.y - this.body.height;
        // TODO: if jump-key is down, add a boost value to jump-velocity to use and init jump for controls to handle.
        this.body.setVelocityY(-150);
    }

    hurtBy(enemy) {
        if (!this.alive) {
            return;
        }
        if (this.star.active) {
            enemy.starKilled(enemy, this);
        } else if (this.wasHurt < 1) {
            this.die();
        }
    }

    small() {
        this.body.setSize(10, 10);
        this.body.offset.set(3, 14);
    }

    large() {
        this.body.setSize(10, 22);
        this.body.offset.set(3, 10);
    }

    die() {
        this.scene.music.pause();
        this.play('death');
        this.scene.sound.playAudioSprite('sfx', 'smb_mariodie');
        this.body.setAcceleration(0);
        this.alive = false;
    }

    setRoomBounds(rooms) {
        rooms.forEach(
            (room) => {
                if (this.x >= room.x && this.x <= (room.x + room.width)) {
                    let cam = this.scene.cameras.main;
                    let layer = this.scene.groundLayer;
                    cam.setBounds(room.x, 0, room.width * layer.scaleX, layer.height * layer.scaleY);
                    this.scene.finishLine.active = (room.x === 0);
                    this.scene.cameras.main.setBackgroundColor(room.sky);
                }
            }
        );
    }
}
