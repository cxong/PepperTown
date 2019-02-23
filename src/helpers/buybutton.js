import Dialog from "./dialog";

const ALPHA_PERIOD = 500;
const ALPHA_MIN = 0.2;

export default class BuyButton extends Phaser.GameObjects.Sprite {
    constructor(scene, group, x, y, buttons) {
        super(scene, x, y, 'button');
        this.scene = scene;
        scene.add.existing(this);
        this.setScale(1.8, 1.2);

        this.setOrigin(0, 0);

        this.setInteractive({ useHandCursor: true });
        this.group = group;
        this.buttons = buttons;

        this.buttonIdx = 0;
        this.setButton();
    }

    setButton() {
        const button = this.buttons[this.buttonIdx];
        if (!button) {
            this.disable();
            return;
        }
        if (this.icon) {
            this.icon.destroy();
        }
        this.icon = this.scene.add.sprite(this.x + 2, this.y + 2, 'icons', button.iconFrame);
        this.icon.setOrigin(0, 0);
        this.icon.depth = 999999;
        this.group.add(this.icon);
        if (this.label) {
            this.label.destroy();
        }
        this.label = this.scene.add.bitmapText(this.x + 18, this.y + 8, 'font', button.text + '  $' + button.cost, 6);
        this.label.setOrigin(0, 0);
        this.label.depth = 999999;
        this.group.add(this.label);
        this.effect = button.effect;
        this.cost = button.cost;
    }

    onClick(scene) {
        if (this.disabled) {
            return;
        }
        if (this.scene.cash.value < this.cost) {
            return;
        }
        this.effect(scene);
        this.scene.setCash(this.scene.cash.value - this.cost);
        this.buttonIdx++;
        this.setButton();
    }

    disable() {
        this.setFrame(1);
        this.disabled = true;
    }
}
