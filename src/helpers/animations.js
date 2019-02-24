export default function makeAnimations(scene) {
    let config = {};

    ['pepper', 'coriander', 'saffron', 'shichimi'].forEach(girl => {
        ['up', 'right', 'down', 'left'].forEach(
            (dir, index) => {
                config = {
                    key: girl + 'run' + dir,
                    frames: scene.anims.generateFrameNames(girl, {
                        frames: [0, 1, 2, 1].map(x => x + index * 3)
                    }),
                    frameRate: 10,
                    repeat: -1,
                    repeatDelay: 0
                };
                scene.anims.create(config);

                config.key = girl + 'stand' + dir;
                config.frames = scene.anims.generateFrameNames(girl, {
                    start: index * 3 + 1,
                    end: index * 3 + 1
                });
                scene.anims.create(config);
            }
        );
    });

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
    config = {
        key: 'coin',
        frames: scene.anims.generateFrameNames('coin', {
            start: 8,
            end: 15
        }),
        frameRate: 10
    };
    scene.anims.create(config);
    config = {
        key: 'coin-small',
        frames: scene.anims.generateFrameNames('coin', {
            start: 24,
            end: 32
        }),
        frameRate: 10
    };
    scene.anims.create(config);
    config = {
        key: 'splash',
        frames: scene.anims.generateFrameNames('splash', {
            start: 0,
            end: 4
        }),
        frameRate: 30
    };
    scene.anims.create(config);
    config = {
        key: 'break',
        frames: scene.anims.generateFrameNames('break', {
            start: 0,
            end: 4
        }),
        frameRate: 30
    };
    scene.anims.create(config);
}
