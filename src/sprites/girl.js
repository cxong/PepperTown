var SPEED = 50;
var START_X = 16 * 6;
var WAS_HURT = 1000;

export default class Girl extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.dir = 'down';
        this.body.setSize(16, 16);
        this.body.offset.set(0, 16);

        this.wasHurt = -1;
        this.flashToggle = false;
        this.anims.play('stand' + this.dir);
        this.health = {
            max: 10,
            value: 10
        };
        this.type = 'mario';
        this.fireCoolDown = 0;

        this.ai = {
            state: 'running'
        };
    }

    update(keys, time, delta) {
        // Don't do updates while dead
        if (this.health.value < 1) {
            return;
        }

        this.fireCoolDown -= delta;

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
            left: keys.left.isDown || this.scene.touchControls.left,
            right: keys.right.isDown || this.scene.touchControls.right,
            up: keys.up.isDown || this.scene.touchControls.up,
            down: keys.down.isDown || this.scene.touchControls.down,
            fire: keys.fire.isDown
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
                } else {
                    // TODO: face target
                    input.fire = true;
                    // TODO: no target, go to running
                }
                break;
            case 'resting':
                if (this.health.value < this.health.max) {
                    this.dir = 'down';
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

        anim += this.dir;
        if (this.anims.currentAnim.key !== anim && !this.scene.physics.world.isPaused) {
            this.anims.play(anim);
        }

        if (input.down && this.body.velocity.x < 100) {
            this.bending = true;
        }

        this.physicsCheck = true;
    }

    hurtBy(enemy) {
        if (this.health.value < 1) {
            return;
        }
        if (this.wasHurt < 1) {
            this.health.value--;
            if (this.health.value < 1) {
                this.die();
            } else {
                this.wasHurt = WAS_HURT;
            }
        }
    }

    die() {
        this.scene.sound.playAudioSprite('sfx', 'smb_mariodie');
    }

    setRoomBounds(rooms) {
        rooms.forEach(
            (room) => {
                if (this.x >= room.x && this.x <= (room.x + room.width)) {
                    let cam = this.scene.cameras.main;
                    let layer = this.scene.groundLayer;
                    cam.setBounds(room.x, 0, room.width * layer.scaleX, layer.height * layer.scaleY);
                    this.scene.cameras.main.setBackgroundColor(room.sky);
                }
            }
        );
    }
}
