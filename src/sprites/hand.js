export default class Hand extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'hand');
        scene.add.existing(this);
        this.depth = y + 999;

        this.blink = 500;
    }

    update(delta) {
        this.blink -= delta;
        if (this.blink < 0) {
            this.alpha = this.alpha === 1 ? 0 : 1;
            this.blink = 500;
        }
    }
}
