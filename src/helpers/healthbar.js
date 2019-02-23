export default class HealthBar extends Phaser.GameObjects.Sprite {
    constructor(scene, owner) {
        super(scene, owner.x, owner.y, 'bar-back');
        scene.add.existing(this);

        this.barFront = new Phaser.GameObjects.Sprite(scene, owner.x, owner.y, 'bar-front');
        scene.add.existing(this.barFront);

        this.owner = owner;
    }

    update() {
        this.depth = this.y + 32;
        this.barFront.depth = this.y + 32;
        this.x = this.owner.x;
        this.y = this.owner.y - 12;
        const scale = Math.max(this.owner.health.value / this.owner.health.max, 0);
        if (scale >= 1) {
            this.alpha = 0;
            this.barFront.alpha = 0;
        } else {
            this.alpha = 1;
            this.barFront.alpha = 1;
            this.barFront.x = this.owner.x - (1 - scale) * 7;
            this.barFront.y = this.owner.y - 12;
            this.barFront.setScale(scale, 1);
        }
    }
}
