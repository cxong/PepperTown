import Dialog from "./dialog";

const ALPHA_PERIOD = 500;
const ALPHA_MIN = 0.2;

export default class BuyButton extends Phaser.GameObjects.Sprite {
    constructor(scene, group, x, y, button) {
        super(scene, x, y, 'button');
        scene.add.existing(this);
        this.setScale(1.8, 1.2);

        this.setOrigin(0, 0);

        this.setInteractive({ useHandCursor: true });

        const icon = scene.add.sprite(x + 2, y + 2, 'icons', button.iconFrame);
        icon.setOrigin(0, 0);
        group.add(icon);
        const label = scene.add.bitmapText(x + 18, y + 8, 'font', button.text, 6);
        label.setOrigin(0, 0);
        group.add(label);
        this.effect = button.effect;
    }

    onClick(scene) {
        if (this.disabled) {
            return;
        }
        this.effect(scene);
        this.setFrame(1);
        this.disabled = true;
    }
}
