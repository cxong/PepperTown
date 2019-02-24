import Girl from '../sprites/girl';
import Slime from '../sprites/slime';
import SelectFrame from '../helpers/selectframe';
import BuyButton from '../helpers/buybutton';
import Coin from '../sprites/coin';

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
        this.attractMode = this.registry.get('attractMode');

        // Add and play the music
        this.music = this.sound.add('overworld');
        this.sounds = {
            buy: this.sound.add('buy'),
            close: this.sound.add('close'),
            cursor: this.sound.add('cursor'),
            confirm: this.sound.add('confirm')
        };
        if (!this.attractMode) {
            this.sounds.confirm.play();
        }

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

        this.coinGroup = this.add.group();
        /*this.music.play({
            loop: true
        });*/
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

        // Global effects
        this.speedMultiplier = 1;
        this.healFactor = 1;
        this.damageFactor = 1;
        this.returnSpeed = 1;
        this.attackSpeed = 1;
        this.defenseFactor = 1;
        this.regen = 0;
    }

    update(time, delta) {
        if (this.physics.world.isPaused) {
            return;
        }

        // Spawn slimes
        const idealSlimes = Math.min(Math.round(this.enemiesKilled * 0.02) + 20, this.left.pts);
        const slimeHP = this.enemiesKilled * 0.007 + 2;
        while (this.enemyGroup.getLength() < idealSlimes) {
            this.enemyGroup.add(new Slime({
                scene: this,
                key: 'characters',
                x: (Math.random() * 20 + 10) * 16,
                y: (Math.random() * 9 + 4) * 16,
                hp: slimeHP
            }));
        }

        let input = {
            left: this.keys.left.isDown,
            right: this.keys.right.isDown,
            up: this.keys.up.isDown,
            down: this.keys.down.isDown,
            fire: this.keys.fire.isDown
        };

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

    onKill(hp, x, y) {
        this.setLeft(this.left.pts - 1);
        this.enemiesKilled++;
        this.setCash(this.cash.value + Math.round(hp * 5), x, y);
    }

    setLeft(left) {
        this.left.pts = left;
        this.left.textObject.setText(('' + this.left.pts).padStart(4, '0'));
    }

    setCash(value, x, y) {
        const added = value > this.cash.value;
        const isSmall = value - this.cash.value <= 1;
        this.cash.value = value;
        this.cash.textObject.setText(('' + this.cash.value).padStart(6, '0'));
        if (added) {
            this.coinGroup.add(new Coin(this, x, y, isSmall));
            const sound = this.sound.add('coins');
            sound.play();
            if (isSmall) {
                sound.volume = 0.5;
            }
        }
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

        this.magicShop = this.shops.add(new SelectFrame(this, 0, 0, 4 * 16, 3 * 16, 'portrait-magic', 'MAGIC SHOP', [
            [{iconFrame: 9 + 12 * 13, text: 'PORTAL', effect: s => s.returnSpeed = 8, cost: 1500}],
            [{iconFrame: 2 + 1 * 13, text: 'REGEN RING', effect: s => s.regen = 0.5, cost: 2000}]
        ]));
        this.armorShop = this.shops.add(new SelectFrame(this, 1 * 16, 3 * 16, 4 * 16, 3 * 16, 'portrait-armor', 'ARMOR SHOP', [
            [
                {iconFrame: 7 + 10 * 13, text: 'SPEED 1', effect: s => s.speedMultiplier = 1.2, cost: 500},
                {iconFrame: 6 + 10 * 13, text: 'SPEED 2', effect: s => s.speedMultiplier = 1.4, cost: 700},
                {iconFrame: 5 + 10 * 13, text: 'SPEED 3', effect: s => s.speedMultiplier = 1.7, cost: 1000},
                {iconFrame: 9 + 10 * 13, text: 'SPEED 4', effect: s => s.speedMultiplier = 2.5, cost: 1500},
                {iconFrame: 8 + 10 * 13, text: 'SPEED 5', effect: s => s.speedMultiplier = 4, cost: 2500}
            ],
            [
                {iconFrame: 7 + 11 * 13, text: 'DEFENSE 1', effect: s => s.defenseFactor = 0.8, cost: 400},
                {iconFrame: 6 + 11 * 13, text: 'DEFENSE 2', effect: s => s.defenseFactor = 0.7, cost: 600},
                {iconFrame: 5 + 11 * 13, text: 'DEFENSE 3', effect: s => s.defenseFactor = 0.63, cost: 900},
                {iconFrame: 9 + 11 * 13, text: 'DEFENSE 4', effect: s => s.defenseFactor = 0.58, cost: 1100},
                {iconFrame: 8 + 11 * 13, text: 'DEFENSE 5', effect: s => s.defenseFactor = 0.5, cost: 1500}
            ]
        ]));
        this.itemShop = this.shops.add(new SelectFrame(this, 0, 7 * 16, 4 * 16, 3 * 16, 'portrait-item', 'ITEM SHOP', [
            [
                {iconFrame: 1 + 13 * 13, text: 'HERBS 1', effect: s => s.healFactor = 2, cost: 200},
                {iconFrame: 1 + 12 * 13, text: 'HERBS 2', effect: s => s.healFactor = 3, cost: 400},
                {iconFrame: 2 + 13 * 13, text: 'HERBS 3', effect: s => s.healFactor = 5, cost: 750},
                {iconFrame: 2 + 12 * 13, text: 'HERBS 4', effect: s => s.healFactor = 8, cost: 1000},
                {iconFrame: 0 + 12 * 13, text: 'HERBS 5', effect: s => s.healFactor = 13, cost: 1300}
            ]
        ]));
        this.weaponShop = this.shops.add(new SelectFrame(this, 0, 11 * 16, 5 * 16, 3 * 16, 'portrait-weapon', 'WEAPON SHOP', [
            [
                {iconFrame: 0 + 7 * 13, text: 'DAMAGE 1', effect: s => s.damageFactor = 2, cost: 1000},
                {iconFrame: 1 + 7 * 13, text: 'DAMAGE 2', effect: s => s.damageFactor = 3, cost: 1500},
                {iconFrame: 2 + 7 * 13, text: 'DAMAGE 3', effect: s => s.damageFactor = 4, cost: 2000},
                {iconFrame: 3 + 7 * 13, text: 'DAMAGE 4', effect: s => s.damageFactor = 5, cost: 2700},
                {iconFrame: 10 + 7 * 13, text: 'DAMAGE 5', effect: s => s.damageFactor = 6, cost: 4000},
                {iconFrame: 12 + 7 * 13, text: 'DAMAGE 6', effect: s => s.damageFactor = 8, cost: 6000}
            ],
            [
                {iconFrame: 10 + 9 * 13, text: 'ATTK SPD 1', effect: s => s.attackSpeed = 1.5, cost: 800},
                {iconFrame: 10 + 10 * 13, text: 'ATTK SPD 2', effect: s => s.attackSpeed = 3, cost: 2000}
            ]
        ]));

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
            this.sounds.close.play();
        }
    }
}

export default GameScene;
