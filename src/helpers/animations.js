export default function makeAnimations(scene) {
    let config = {};

    ['up', 'right', 'down', 'left'].forEach(
        (dir, index) => {
            config = {
                key: 'run' + dir,
                frames: scene.anims.generateFrameNames('pepper', {
                    frames: [0, 1, 2, 1].map(x => x + index * 7)
                }),
                frameRate: 10,
                repeat: -1,
                repeatDelay: 0
            };
            scene.anims.create(config);

            config.key = 'stand' + dir;
            config.frames = scene.anims.generateFrameNames('pepper', {
                start: index * 7 + 1,
                end: index * 7 + 1
            });
            scene.anims.create(config);
        }
    );

    const CHARACTERS_STRIDE = 12;
    const CHARACTERS_STRIDE_Y = 4;
    ['down', 'left', 'right', 'up'].forEach(
        (dir, index) => {
            config = {
                key: 'slime/run' + dir,
                frames: scene.anims.generateFrameNames('characters', {
                    frames: [0, 1, 2, 1].map(x => x + (index + CHARACTERS_STRIDE_Y * 1) * CHARACTERS_STRIDE)
                }),
                frameRate: 5,
                repeat: -1,
                repeatDelay: 0
            };
            scene.anims.create(config);

            config.key = 'slime/stand' + dir;
            config.frames = scene.anims.generateFrameNames('characters', {
                start: (index + CHARACTERS_STRIDE_Y * 1) * CHARACTERS_STRIDE + 1,
                end: (index + CHARACTERS_STRIDE_Y * 1) * CHARACTERS_STRIDE + 1
            });
            scene.anims.create(config);
        }
    );

    config = {
        key: 'dpad',
        frames: [{
            frame: 'controller/dpad',
            key: 'mario-sprites'
        }]
    };
    scene.anims.create(config);
    config = {
        key: 'button',
        frames: [{
            frame: 'controller/button',
            key: 'mario-sprites'
        }]
    };
    scene.anims.create(config);
}
