export default function makeAnimations(scene) {
    let config = {};

    // Jump, Stand and Turn: one frame each
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

    // ALL MARIO ANIMATIONS DONE

    config = {
        key: 'goomba',
        frames: scene.anims.generateFrameNames('mario-sprites', {
            prefix: 'goomba/walk',
            start: 1,
            end: 2
        }),
        frameRate: 5,
        repeat: -1,
        repeatDelay: 0
    };
    scene.anims.create(config);
    config = {
        key: 'goombaFlat',
        frames: [{
            key: 'mario-sprites',
            frame: 'goomba/flat'
        }]
    };
    scene.anims.create(config);
    config = {
        key: 'turtle',
        frames: scene.anims.generateFrameNames('mario-sprites', {
            prefix: 'turtle/turtle',
            end: 1
        }),
        frameRate: 5,
        repeat: -1,
        repeatDelay: 0
    };

    scene.anims.create(config);
    config = {
        key: 'mario/climb',
        frames: scene.anims.generateFrameNames('mario-sprites', {
            prefix: 'mario/climb',
            end: 1
        }),
        frameRate: 5,
        repeat: -1,
        repeatDelay: 0
    };
    scene.anims.create(config);
    config = {
        key: 'mario/climbSuper',
        frames: scene.anims.generateFrameNames('mario-sprites', {
            prefix: 'mario/climbSuper',
            end: 1
        }),
        frameRate: 5,
        repeat: -1,
        repeatDelay: 0
    };

    scene.anims.create(config);

    config = {
        key: 'flag',
        frames: [{
            key: 'mario-sprites',
            frame: 'flag'
        }],
        repeat: -1
    };
    scene.anims.create(config);

    config = {
        key: 'turtleShell',
        frames: [{
            frame: 'turtle/shell',
            key: 'mario-sprites'
        }]
    };

    scene.anims.create(config);

    config = {
        key: 'mushroom',
        frames: [{
            frame: 'powerup/super',
            key: 'mario-sprites'
        }]

    };
    scene.anims.create(config);

    config = {
        key: 'coin',
        frames: scene.anims.generateFrameNames('mario-sprites', {
            prefix: 'coin/spin',
            start: 1,
            end: 4
        }),
        frameRate: 30,
        repeat: -1,
        repeatDelay: 0
    };
    scene.anims.create(config);

    config = {
        key: '1up',
        frames: [{
            frame: 'powerup/1up',
            key: 'mario-sprites'
        }]
    };
    scene.anims.create(config);

    config = {
        key: 'flower',
        frames: scene.anims.generateFrameNames('mario-sprites', {
            prefix: 'powerup/flower',
            start: 1,
            end: 4
        }),
        frameRate: 30,
        repeat: -1,
        repeatDelay: 0
    };
    scene.anims.create(config);

    config = {
        key: 'star',
        frames: scene.anims.generateFrameNames('mario-sprites', {
            prefix: 'powerup/star',
            start: 1,
            end: 4
        }),
        frameRate: 30,
        repeat: -1,
        repeatDelay: 0
    };
    scene.anims.create(config);
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
        key: 'fireFly',
        frames: scene.anims.generateFrameNames('mario-sprites', {
            prefix: 'fire/fly',
            start: 1,
            end: 4
        }),
        frameRate: 10,
        repeat: -1,
        repeatDelay: 0
    };
    scene.anims.create(config);

    config = {
        key: 'fireExplode',
        frames: scene.anims.generateFrameNames('mario-sprites', {
            prefix: 'fire/explode',
            start: 1,
            end: 3
        }),
        frameRate: 30,
        repeat: 0,
        repeatDelay: 0
    };

    scene.anims.create(config);
}
