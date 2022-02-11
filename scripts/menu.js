class Menu extends Phaser.Scene {
    constructor() {
        super('menu');
    }

    init(data) {
        this.ninja = 'blackninja';
    }

    preload() {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('title', 'assets/title.png');
        this.load.image('levelSelect', 'assets/level_select.png');
        this.load.image('credits', 'assets/credits.png');
        this.load.image('characterSelect', 'assets/character_select.png');
        this.load.image('play', 'assets/play.png');

        this.ninjas = ['blackninja', 'redninja', 'greenninja', 'grayninja', 'blueninja', 'amogus'];
        for (let i = 0; i < this.ninjas.length; i++) {
            let ninja = this.ninjas[i]
            this.load.spritesheet(ninja,
                'assets/ninjas/' + ninja + '.png',
                { frameWidth: 32, frameHeight: 32, margin: 2, spacing: 2 }
            );
        }
    }

    create() {
        this.add.image(400, 288, 'sky');
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

        for (let i = 0; i < this.ninjas.length; i++) {
            let ninja = this.ninjas[i];
            this.anims.create({
                key: ninja,
                frames: this.anims.generateFrameNumbers(ninja, { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1
            });
        }

        this.charDisplay.anims.play(this.ninja);

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
                    duration: 1000,
                    ease: 'Power0',
                    onComplete: function (tween, targets) {
                        createInteractives(tween.parent.scene);
                    }
                })
            }
        });

        /*
        this.scene.start('level', {
            world: 1,
            level: 1,
            ninja: 'amogus'
        });*/
    }

    update() {

    }
}

function createInteractives(scene) {
    let levelSelect = scene.levelSelect;
    let levelEditor = scene.levelEditor;
    let playButton = scene.playButton;
    let charDisplay = scene.charDisplay;
    let charSelect = scene.charSelect;

    charSelect.setInteractive();
    charSelect.on('pointerdown', function (pointer) {
        let scene = pointer.manager.game.scene;
        let menu = scene.keys['menu'];

        let ind = menu.ninjas.indexOf(menu.ninja);
        ind += 1;
        ind %= menu.ninjas.length;
        menu.ninja = menu.ninjas[ind];

        menu.charDisplay.setTexture(menu.ninja);
        menu.charDisplay.anims.play(menu.ninja);
    });
}

export default Menu;