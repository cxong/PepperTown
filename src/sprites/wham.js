export default class Wham extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, key, anim) {
        super(scene, x, y, key);
        scene.add.existing(this);
        this.depth = y + 999;
        this.play(anim);

        this.on('animationcomplete', () => {
            this.destroy();
        }, this);
    }
}
