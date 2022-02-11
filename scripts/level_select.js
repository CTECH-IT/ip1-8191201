import levelData from "./levels.js";

class LevelSelect extends Phaser.Scene {
    constructor() {
        super('select');
    }

    init(data) {
        let storedWorld = localStorage.getItem('world');
        if (storedWorld == null) {
            this.worldNum = 1;
        } else if (isNaN(storedWorld)) {
            this.worldNum = 1;
        } else {
            this.worldNum = parseInt(storedWorld);
        }

        let storedLevel = localStorage.getItem('level');
        if (storedLevel == null) {
            this.levelNum = 1;
        } else if (isNaN(storedLevel)) {
            this.levelNum = 1;
        } else {
            this.levelNum = parseInt(storedLevel);
        }

        this.loadNum = data.loadNum;

    }

    preload() {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('world', 'assets/world.png');
        this.load.image('levelBox', 'assets/level_box.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('grayStar', 'assets/gray_star.png');
        this.load.image('lock', 'assets/lock.png');
        this.load.image('mainMenu', 'assets/main_menu.png');
        this.load.image('leftButton', 'assets/left_arrow.png');
        this.load.image('rightButton', 'assets/right_arrow.png');
    }

    create() {
        this.add.image(400, 288, 'sky');
        this.add.image(400, 88, 'world');
        this.mainMenu = this.add.image(400, 508, 'mainMenu');
        let titleStyle = {
            color: 'black',
            fontFamily: 'monospace',
            fontSize: '60px',
            boundsAlignH: 'center',
            boundsAlignV: 'middle'
        }
        this.add.text(400, 88, 'World ' + this.worldNum, titleStyle).setOrigin(0.5);

        if (this.loadNum > 1) {
            this.leftButton = this.add.image(200, 508, 'leftButton');
        }
        let maxWorld = Math.max(...Object.keys(levelData).map(Number));
        if (this.loadNum < maxWorld) {
            this.rightButton = this.add.image(600, 508, 'rightButton');
        }

        makeLevels(this);
        createInteractives(this);

        this.keys = this.input.keyboard.addKeys({ esc: 'ESC' });
    }

    update() {
        if (this.keys.esc.isDown) {
            this.scene.start('menu');
        }

    }
}

function makeLevels(scene) {
    let worldNum = scene.worldNum;
    let levelNum = scene.levelNum;
    let loadNum = scene.loadNum;
    let levels = levelData[loadNum];

    scene.levelBoxes = [];
    
    for (let i = 0; i < Object.keys(levels).length; i++) {
        let num = i+1;

        let x = 400 + (i%5-2) * 100;
        let y = 258 + (i-i%5)/5*100;

        let box = scene.add.image(x, y, 'levelBox');
        box.worldNum = loadNum;
        box.levelNum = num;
        let style = {
            color: 'black',
            fontFamily: 'monospace',
            fontSize: '32px',
            boundsAlignH: 'center',
            boundsAlignV: 'middle'
        }
        scene.add.text(x, y-17, num, style).setOrigin(0.5);
        console.log(worldNum)
        console.log(loadNum)
        console.log(num)
        
        console.log(levelNum)
        if (loadNum < worldNum) {
            scene.add.image(x, y+14, 'star');
            box.available = true;
        } else if (loadNum > worldNum) {
            scene.add.image(x, y+14, 'lock');
            box.available = false;
            console.log(box);
        } else {
            scene.add.image(x, y+14, num < levelNum ? 'star': num == levelNum ? 'grayStar' : 'lock');
            box.available = num < levelNum ? true: num == levelNum ? true : false;
        }

        box.setInteractive();
        box.on('pointerdown', function (pointer) {
            let scene = pointer.manager.game.scene;
            let levelSelect = scene.keys['select']

            for (let i = 0; i < levelSelect.levelBoxes.length; i++) {
                let currentBox = levelSelect.levelBoxes[i];
                let rect = currentBox.getBounds();
                console.log(currentBox);
                if (rect.x <= pointer.x && pointer.x <= rect.x+rect.width && 
                    rect.y <= pointer.y && pointer.y <= rect.y+rect.height &&
                    currentBox.available) {
                    scene.start('level', {
                        world: currentBox.worldNum,
                        level: currentBox.levelNum
                    });
                    break;
                }
            }
        })

        scene.levelBoxes.push(box);
    }
}

function createInteractives(scene) {
    let mainMenu = scene.mainMenu;
    let leftButton = scene.leftButton;
    let rightButton = scene.rightButton;
    let loadNum = scene.loadNum;

    mainMenu.setInteractive();
    mainMenu.on('pointerdown', function (pointer) {
        let scene = pointer.manager.game.scene;
        console.log(scene);
        scene.stop('select');
        scene.launch('menu');
    });

    if (leftButton != null) {
        leftButton.setInteractive();
        leftButton.on('pointerdown', function (pointer) {
            let scene = pointer.manager.game.scene;
            scene.stop('select');
            scene.remove('select');
            scene.add('select', LevelSelect, true, {
                loadNum: loadNum - 1
            });
        });
    }

    if (rightButton != null) {
        rightButton.setInteractive();
        rightButton.on('pointerdown', function (pointer) {
            let scene = pointer.manager.game.scene;
            scene.stop('select');
            scene.remove('select');
            scene.add('select', LevelSelect, true, {
                loadNum: loadNum + 1
            });
        });
    }
}

export default LevelSelect;