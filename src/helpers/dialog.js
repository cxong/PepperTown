import BuyButton from "./buybutton";

export default class Dialog extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, width, height, portrait, title, buttons) {
        super(scene, x, y, 'dialog-back');
        scene.add.existing(this);

        this.setOrigin(0, 0);
        this.setScale(width / 64, height / 64);
        this.alpha = 0;
        this.depth = 99999;

        this.setInteractive();

        // Add child elements
        this.elements = scene.add.group();
        this.elements.add(scene.add.bitmapText(x + 16, y + 16, 'font', title, 8));
        this.elements.add(scene.add.sprite(x + width - 42, y + height - 47, portrait));
        buttons.forEach((button, index) => {
            this.elements.add(new BuyButton(scene, this.elements, x + 16, y + 32 + index * 24, button));
        });
        this.hide();
    }

    show(scene) {
        this.alpha = 1;
        this.elements.children.entries.forEach(child => {
            child.alpha = 1;
            child.depth = 999999;
        });
        scene.dialog = this;
    }

    hide() {
        this.alpha = 0;
        this.elements.children.entries.forEach(child => {
            child.alpha = 0;
        });
    }
}
