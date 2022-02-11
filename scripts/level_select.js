import levelData from "./levels.js";

class LevelSelect extends Phaser.Scene {
    constructor() {
        super('select');
    }

    init(data) {

        // attempy to get stored world / level
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

        // loadNum is the number of the world to load
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

    create() { // make menu
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
        this.add.text(400, 88, 'World ' + this.loadNum, titleStyle).setOrigin(0.5);

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

    update() { // escape out of level select
        if (this.keys.esc.isDown) {
            this.scene.stop('select');
            this.scene.start('menu');
        }

    }
}

// makes the tiles for the level buttons
function makeLevels(scene) {
    let worldNum = scene.worldNum;
    let levelNum = scene.levelNum;
    let loadNum = scene.loadNum;
    let levels = levelData[loadNum];
    console.log(levelData)
    console.log(loadNum)
    console.log(levels);

    scene.levelBoxes = [];
    
    // iterate through all levels in world
    for (let i = 0; i < Object.keys(levels).length; i++) {
        let num = i+1;

        // place with modular arithmetic
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
        
        // handle stars and locks
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

            // iterate through all level boxes to determine which was clicker
            for (let i = 0; i < levelSelect.levelBoxes.length; i++) {
                let currentBox = levelSelect.levelBoxes[i];
                let rect = currentBox.getBounds();
                
                // if pointer in bounds of a particular box, open that level
                if (rect.x <= pointer.x && pointer.x <= rect.x+rect.width && 
                    rect.y <= pointer.y && pointer.y <= rect.y+rect.height &&
                    currentBox.available) { // don't open if locked
                        scene.stop('select')
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

// creates menu buttons
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
        scene.start('menu');
    });

    if (leftButton != null) {
        leftButton.setInteractive();
        leftButton.on('pointerdown', function (pointer) {
            let scene = pointer.manager.game.scene;
            scene.stop('select');
            scene.remove('select');
            scene.add('select', LevelSelect, true, {
                loadNum: parseInt(loadNum) - 1
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
                loadNum: parseInt(loadNum) + 1
            });
        });
    }
}

export default LevelSelect;