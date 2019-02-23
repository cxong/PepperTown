import Girl from '../sprites/girl';
import Slime from '../sprites/slime';
import Fire from '../sprites/Fire';
import SelectFrame from '../helpers/selectframe';
import Dialog from '../helpers/dialog';
import BuyButton from '../helpers/buybutton';

const CAMERA_PAN = 10;
const TOTAL_SLIMES = 5000;  // must kill this many to end

class GameScene extends Phaser.Scene {
    constructor(test) {
        super({
            key: 'GameScene'
        });
    }

    preload() {
    }

    create() {
        // Add and play the music
        this.music = this.sound.add('overworld');
        this.music.play({
            loop: true
        });

        // Add the map + bind the tileset
        this.map = this.make.tilemap({
            key: 'map'
        });
        this.tileset = this.map.addTilesetImage('basictiles', 'basictiles');
        this.tilesetEnemies = this.map.addTilesetImage('characters', 'characters');

        // Dynamic layer because we want breakable and animated tiles
        this.groundLayer = this.map.createDynamicLayer('world', this.tileset, 0, 0);
        this.groundLayer2 = this.map.createDynamicLayer('world2', this.tileset, 0, 0);

        // Probably not the correct way of doing this:
        this.physics.world.bounds.width = this.groundLayer.width;

        // Set collision by property
        this.groundLayer.setCollisionByProperty({
            collide: true
        });

        // This group contains all enemies for collision and calling update-methods
        this.enemyGroup = this.add.group();
        this.enemiesKilled = 0;

        this.girlGroup = this.add.group();

        this.keys = {
            fire: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP)
        };

        this.createHUD();

        // Mute music while in attract mode
        if (this.attractMode) {
            this.music.volume = 0;
        }

        // If the game ended while physics was disabled
        this.physics.world.resume();

        ['pepper', 'coriander', 'saffron', 'shichimi'].forEach((girl, index) => {
            this.girlGroup.add(new Girl({
                scene: this,
                key: girl,
                x: 16 * 6,
                y: this.sys.game.config.height * 0.5 + ((index - 2) * 32)
            }));
        });

        this.cameras.main.roundPixels = true;

        this.fireballs = this.add.group({
            classType: Fire,
            maxSize: 10,
            runChildUpdate: false // Due to https://github.com/photonstorm/phaser/issues/3724
        });

        // Global effects
        this.speedMultiplier = 1;
    }

    update(time, delta) {
        Array.from(this.fireballs.children.entries).forEach(
            (fireball) => {
                fireball.update(time, delta);
            });

        if (this.physics.world.isPaused) {
            return;
        }

        // Spawn slimes
        const idealSlimes = Math.min(Math.round(this.enemiesKilled * 0.02) + 20, this.left.pts);
        while (this.enemyGroup.getLength() < idealSlimes) {
            this.enemyGroup.add(new Slime({
                scene: this,
                key: 'characters',
                x: (Math.random() * 20 + 10) * 16,
                y: (Math.random() * 10 + 2) * 16
            }));
        }

        let input = {
            left: this.keys.left.isDown,
            right: this.keys.right.isDown,
            up: this.keys.up.isDown,
            down: this.keys.down.isDown,
            fire: this.keys.fire.isDown
        };
        if (input.left) {
            this.cameras.main.scrollX -= CAMERA_PAN;
        }
        if (input.right) {
            this.cameras.main.scrollX += CAMERA_PAN;
        }

        this.girlGroup.children.entries.forEach(
            sprite => { sprite.update(this.keys, time, delta); }
        );

        this.shops.children.entries.forEach(
            sprite => { sprite.update(delta); }
        );

        // Run the update method of all enemies
        this.enemyGroup.children.entries.forEach(
            (sprite) => {
                sprite.update(time, delta);
            }
        );
    }

    tileCollision(sprite, tile) {
        if (sprite.type === 'mario') {
        }

        // If it's Mario and the body isn't blocked up it can't hit question marks or break bricks
        // Otherwise Mario will break bricks he touch from the side while moving up.
        if (sprite.type === 'mario' && !sprite.body.blocked.up) {
            return;
        }

        // If the tile has a callback, lets fire it
        if (tile.properties.callback) {
            switch (tile.properties.callback) {
                default:
                    sprite.scene.sound.playAudioSprite('sfx', 'smb_bump');
                    break;
            }
        } else {
            sprite.scene.sound.playAudioSprite('sfx', 'smb_bump');
        }
    }

    onKill() {
        this.setLeft(this.left.pts - 1);
        this.enemiesKilled++;
        this.setCash(this.cash.value + 10);
    }

    setLeft(left) {
        this.left.pts = left;
        this.left.textObject.setText(('' + this.left.pts).padStart(4, '0'));
    }

    setCash(value) {
        this.cash.value = value;
        this.cash.textObject.setText(('' + this.cash.value).padStart(6, '0'));
    }

    createHUD() {
        const hud = this.add.bitmapText(5 * 8, 8, 'font', 'CASH                       LEFT', 8);
        hud.setScrollFactor(0, 0);
        this.left = {
            pts: TOTAL_SLIMES,
            textObject: this.add.bitmapText(36 * 8, 16, 'font', '000000', 8)
        };
        this.setLeft(TOTAL_SLIMES);
        this.left.textObject.setScrollFactor(0, 0);
        this.cash = {
            textObject: this.add.bitmapText(5 * 8, 16, 'font', '0', 8),
            value: 0
        };
        this.setCash(0);
        this.cash.textObject.setScrollFactor(0, 0);

        if (this.attractMode) {
            hud.alpha = 0;
            this.cash.textObject.alpha = 0;
            this.left.textObject.alpha = 0;
        }

        // Add selection frames for the shops
        this.shops = this.add.group();

        this.magicShop = this.shops.add(new SelectFrame(this, 0, 0, 4 * 16, 3 * 16, 'portrait-magic', 'MAGIC SHOP', []));
        this.armorShop = this.shops.add(new SelectFrame(this, 1 * 16, 3 * 16, 4 * 16, 3 * 16, 'portrait-armor', 'ARMOR SHOP', [
            {iconFrame: 7 + 10 * 13, text: 'SPEED 1', effect: s => s.speedMultiplier = 1.2}
        ]));
        this.itemShop = this.shops.add(new SelectFrame(this, 0, 7 * 16, 4 * 16, 3 * 16, 'portrait-item', 'ITEM SHOP', []));
        this.weaponShop = this.shops.add(new SelectFrame(this, 0, 11 * 16, 5 * 16, 3 * 16, 'portrait-weapon', 'WEAPON SHOP', []));

        this.input.on('pointerdown', (event, gameObjects) => {
            let clickedDialog = false;
            let selectFrame = null;
            if (gameObjects.length > 0) {
                if (gameObjects[0] instanceof SelectFrame) {
                    selectFrame = gameObjects[0];
                } else if (gameObjects[0] instanceof BuyButton) {
                    clickedDialog = true;
                    gameObjects[0].onClick(this);
                } else {
                    clickedDialog = true;
                }
            }
            if (!clickedDialog) {
                this.hideDialog();
            }
            if (selectFrame) {
                selectFrame.onClick(this);
            }
        });
        this.input.on('pointerover', (event, gameObjects) => {
            gameObjects[0].hovered = true;
        });
        this.input.on('pointerout', (event, gameObjects) => {
            gameObjects[0].hovered = false;
        });
    }

    hideDialog() {
        if (this.dialog) {
            this.dialog.hide();
            this.dialog = null;
        }
    }
}

export default GameScene;
