import makeAnimations from '../helpers/animations';

class BootScene extends Phaser.Scene {
    constructor(test) {
        super({
            key: 'BootScene'
        });
    }
    preload() {
        const progress = this.add.graphics();

        // Register a load progress event to show a load bar
        this.load.on('progress', (value) => {
            progress.clear();
            progress.fillStyle(0xffffff, 1);
            progress.fillRect(0, this.sys.game.config.height / 2, this.sys.game.config.width * value, 60);
        });

        // Register a load complete event to launch the title screen when all files are loaded
        this.load.on('complete', () => {
            // prepare all animations, defined in a separate file
            makeAnimations(this);
            progress.destroy();
            this.scene.start('TitleScene');
        });

        // Tilemap with a lot of objects and tile-properties tricks
        this.load.tilemapTiledJSON('map', 'assets/tilemaps/map.json');

        // I load the tiles as a spritesheet so I can use it for both sprites and tiles,
        // Normally you should load it as an image.
        this.load.spritesheet('tiles', 'assets/images/super-mario.png', {
            frameWidth: 16,
            frameHeight: 16,
            spacing: 2
        });
        this.load.spritesheet('basictiles', 'assets/images/basictiles.png', {
            frameWidth: 16,
            frameHeight: 16,
            spacing: 0
        });

        // Spritesheets with fixed sizes. Should be replaced with atlas:
        this.load.spritesheet('mario', 'assets/images/mario-sprites.png', {
            frameWidth: 16,
            frameHeight: 32
        });
        ['pepper', 'coriander', 'saffron', 'shichimi'].forEach(girl => {
            this.load.spritesheet(girl, 'assets/images/' + girl + '.png', {
                frameWidth: 24,
                frameHeight: 32
            });
        });
        this.load.spritesheet('characters', 'assets/images/characters.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet('button', 'assets/images/button.png', {
            frameWidth: 64,
            frameHeight: 16
        });
        this.load.spritesheet('icons', 'assets/images/roguelikeitems.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet('coin', 'assets/images/sCoin.png', {
            frameWidth: 15,
            frameHeight: 15,
            spacing: 1
        });
        this.load.spritesheet('break', 'assets/images/break01.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.spritesheet('splash', 'assets/images/splash04.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        this.load.image('bar-back', 'assets/images/bar-back.png');
        this.load.image('bar-front', 'assets/images/bar-front.png');
        this.load.image('select-frame', 'assets/images/select-frame.png');
        this.load.image('dialog-back', 'assets/images/dialog-back.png');
        ['magic', 'item', 'armor', 'weapon'].forEach(shop => {
            const key = 'portrait-' + shop;
            this.load.image(key, 'assets/images/' + key + '.png');
        })

        // Beginning of an atlas to replace the spritesheets above. Always use spriteatlases. I use TexturePacker to prepare them.
        // Check rawAssets folder for the TexturePacker project I use to prepare these files.
        this.load.atlas('mario-sprites', 'assets/mario-sprites.png', 'assets/mario-sprites.json');

        // Music to play. It's not properly edited for an continous loop, but game play experience isn't really the aim of this repository either.
        this.load.audio('overworld', [
            'assets/music/overworld.ogg',
            'assets/music/overworld.mp3'
        ]);

        // Sound effects in a audioSprite.
        this.load.audioSprite('sfx', 'assets/audio/sfx.json', [
            'assets/audio/sfx.ogg',
            'assets/audio/sfx.mp3'
        ], {
            instances: 4
        });
        this.load.audio('coins', [
            'assets/audio/coins.ogg',
            'assets/audio/coins.mp3'
        ]);
        this.load.audio('hit', [
            'assets/audio/hit.ogg',
            'assets/audio/hit.mp3'
        ]);
        this.load.audio('hit2', [
            'assets/audio/hit2.ogg',
            'assets/audio/hit2.mp3'
        ]);
        this.load.audio('buy', [
            'assets/audio/buy.ogg',
            'assets/audio/buy.mp3'
        ]);
        this.load.audio('cursor', [
            'assets/audio/cursor.ogg',
            'assets/audio/cursor.mp3'
        ]);
        this.load.audio('close', [
            'assets/audio/close.ogg',
            'assets/audio/close.mp3'
        ]);
        this.load.audio('confirm', [
            'assets/audio/confirm.ogg',
            'assets/audio/confirm.mp3'
        ]);

        this.load.bitmapFont('font', 'assets/fonts/font.png', 'assets/fonts/font.fnt');
    }
}

export default BootScene;
