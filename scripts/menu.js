let ninjas = ['blackninja', 'redninja', 'greenninja', 'grayninja', 'blueninja', 'amogus'];

class Menu extends Phaser.Scene {
    constructor() {
        super('menu');
    }

    init(data) {
        let storedNinja = localStorage.getItem('ninja');
        if (storedNinja == null) {
            this.ninja = 'blackninja';
        } else if (ninjas.indexOf(storedNinja) == -1) {
            this.ninja = 'blackninja';
        } else {
            this.ninja = storedNinja;
        }
    }

    preload() {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('title', 'assets/title.png');
        this.load.image('levelSelect', 'assets/level_select.png');
        this.load.image('credits', 'assets/credits.png');
        this.load.image('characterSelect', 'assets/character_select.png');
        this.load.image('play', 'assets/play.png');

        // load all ninja sprites
        ninjas = ['blackninja', 'redninja', 'greenninja', 'grayninja', 'blueninja', 'amogus'];
        for (let i = 0; i < ninjas.length; i++) {
            let ninja = ninjas[i]
            this.load.spritesheet(ninja,
                'assets/ninjas/' + ninja + '.png',
                { frameWidth: 32, frameHeight: 32, margin: 2, spacing: 2 }
            );
        }
    }

    create() {
        this.add.image(400, 288, 'sky');

        // create all buttons and stuff invisible
        let title = this.add.image(400, 288, 'title');
        title.alpha = 0;

        this.levelSelect = this.add.image(400, 338, 'levelSelect');
        this.levelSelect.alpha = 0;

        this.credits = this.add.image(400, 238, 'credits');
        this.credits.alpha = 0;

        this.playButton = this.add.image(400, 438, 'play');
        this.playButton.alpha = 0;

        this.charDisplay = this.add.sprite(665, 318, this.ninja);
        this.charDisplay.alpha = 0;

        this.charSelect = this.add.sprite(665, 358, 'characterSelect');
        this.charSelect.alpha = 0;

        // create anims for all ninjas
        for (let i = 0; i < ninjas.length; i++) {
            let ninja = ninjas[i];
            this.anims.create({
                key: ninja,
                frames: this.anims.generateFrameNumbers(ninja, { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1
            });
        }
        this.charDisplay.anims.play(this.ninja);

        // animation sequence for main menu
        this.tweens.add({
            targets: title,
            alpha: 1,
            angle: 720,
            y: 88,
            duration: 1000,
            ease: 'Power0',
            onComplete: function (tween, targets) {
                let scene = tween.parent.scene;
                tween.parent.add({
                    targets: [scene.levelSelect, scene.credits, scene.playButton, scene.charDisplay, scene.charSelect],
                    alpha: 1,
                    duration: 500,
                    ease: 'Power0',
                    onComplete: function (tween, targets) {

                        // make buttons interactable
                        createInteractives(tween.parent.scene);
                    }
                })
            }
        });
    }

    update() {

    }
}

// sets up interactivity for each button
function createInteractives(scene) {
    let levelSelect = scene.levelSelect;
    let credits = scene.credits;
    let playButton = scene.playButton;
    let charSelect = scene.charSelect;

    // cycle through possible ninjas and save/select from local storage
    charSelect.setInteractive();
    charSelect.on('pointerdown', function (pointer) {
        let scene = pointer.manager.game.scene;
        let menu = scene.keys['menu'];

        let ind = ninjas.indexOf(menu.ninja);
        ind += 1;
        ind %= ninjas.length;
        menu.ninja = ninjas[ind];

        menu.charDisplay.setTexture(menu.ninja);
        menu.charDisplay.anims.play(menu.ninja);

        localStorage.setItem('ninja', menu.ninja)
    });

    // hehe
    credits.setInteractive();
    credits.on('pointerdown', function (pointer) {
        window.open('https://michaelyhuang.com', '_blank');
    });

    // play from stored world/level
    playButton.setInteractive();
    playButton.on('pointerdown', function (pointer) {
        let scene = pointer.manager.game.scene;
        let menu = scene.keys['menu'];
        let storedWorld = localStorage.getItem('world');
        let storedLevel = localStorage.getItem('level');
        let loadWorld = null;
        let loadLevel = null;

        if (storedWorld == null || storedLevel == null) {
            loadWorld = 1;
            loadLevel = 1;
        } else if (isNaN(storedWorld) || isNaN(storedLevel)) {
            loadWorld = 1;
            loadLevel = 1;
        } else {
            loadWorld = storedWorld;
            loadLevel = storedLevel;
        }

        scene.stop('menu')
        scene.start('level', {
            world: loadWorld,
            level: loadLevel
        });

        localStorage.setItem('world', loadWorld);
        localStorage.setItem('level', loadLevel);
    });

    // go to level select
    levelSelect.setInteractive();
    levelSelect.on('pointerdown', function (pointer) {
        let scene = pointer.manager.game.scene;
        scene.stop('menu')
        scene.start('select', {
            loadNum: localStorage.getItem('world')
        });
    });
}

export default Menu;