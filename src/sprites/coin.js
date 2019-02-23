export default class Coin extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, isSmall) {
        y -= 24;
        x += Math.random() * 8 - 4;
        y += Math.random() * 8 - 4;
        super(scene, x, y, 'coin');
        scene.add.existing(this);
        this.depth = y + 999;
        this.play(isSmall ? 'coin-small' : 'coin');

        this.on('animationcomplete', () => {
            this.destroy();
        }, this);
    }
}
