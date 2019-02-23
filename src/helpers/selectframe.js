const ALPHA_PERIOD = 500;
const ALPHA_MIN = 0.2;

export default class SelectFrame extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, width, height) {
        super(scene, x, y, 'select-frame');
        scene.add.existing(this);

        this.setOrigin(0, 0);
        this.setScale(width / 64, height / 64);
        this.alpha = 0.5;
        this.hovered = false;
        this.alphaCounter = 0;
        this.depth = 99999;
        
        this.setInteractive({ useHandCursor: true });
    }

    update(delta) {
        this.alphaCounter += delta;
        this.alphaCounter %= ALPHA_PERIOD;
        if (this.hovered) {
            if (this.alphaCounter < ALPHA_PERIOD * 0.5) {
                this.alpha = ALPHA_MIN + Phaser.Math.Easing.Linear(this.alphaCounter / (ALPHA_PERIOD * 0.5)) * (1 - ALPHA_MIN);
            } else {
                this.alpha = ALPHA_MIN + Phaser.Math.Easing.Linear((ALPHA_PERIOD - this.alphaCounter) / (ALPHA_PERIOD * 0.5)) * (1 - ALPHA_MIN);
            }
        } else {
            this.alpha = 0.2;
        }
    }
}
