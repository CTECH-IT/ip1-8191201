import levelData from "./levels.js";

let tileWidth = 25;
let tileHeight = 18;

class SokobanLevel extends Phaser.Scene {

    constructor() {
        super('level');
    }

    init(data) {

        // retrieve level data for object placement
        this.worldNum = data.world;
        this.levelNum = data.level;
        let level = levelData[this.worldNum][this.levelNum];

        // store data for later usage
        this.boxLocations = level.boxLocations;
        this.wallLocations = level.wallLocations;
        this.goalLocations = level.goalLocations;
        this.playerStart = level.playerStart;
        this.shift = level.shift;
        this.ninja = localStorage.getItem('ninja');
        if (this.ninja == null) {
            this.ninja = 'blackninja';
        }
    }

    preload() { // load all sprites
        for (let i = 0; i < Math.max(...Object.keys(levelData).map(Number)); i++) {
            let num = i+1;
            this.load.image('floor' + num, 'assets/worlds/' + num + '/floor.png');
            this.load.image('box' + num, 'assets/worlds/' + num + '/box.png');
            this.load.image('wall' + num, 'assets/worlds/' + num + '/wall.png');
            this.load.image('goal' + num, 'assets/worlds/' + num + '/goal.png');
            this.load.image('goalOverlay' + num, 'assets/worlds/' + num + '/goal_overlay.png');    
        }
        this.load.image('floorGrid', 'assets/floor_grid.png');
        this.load.image('whiteOverlay', 'assets/white_overlay_50.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('pauseMenu', 'assets/pause_menu.png');
        this.load.image('levelSelect', 'assets/level_select.png');
        this.load.image('leftButton', 'assets/left_arrow.png');
        this.load.image('rightButton', 'assets/right_arrow.png');
        
        ninjas = ['blackninja', 'redninja', 'greenninja', 'grayninja', 'blueninja', 'amogus'];
        for (let i = 0; i < ninjas.length; i++) {
            let ninja = ninjas[i];
            this.load.spritesheet(ninja,
                'assets/ninjas/' + ninja + '.png',
                { frameWidth: 32, frameHeight: 32, margin: 2, spacing: 2 }
            );
        }
    }

    create() {
        this.ninja = localStorage.getItem('ninja');
        if (this.ninja == null) {
            this.ninja = 'blackninja';
        }
        
        this.add.image(400, 288, 'floor' + this.worldNum);
        this.add.image(400, 288, 'floorGrid');

        let boxConfig = {
            collideWorldBounds: true
        };

        // 2d array to store object locations
        this.worldMap = Array.from(Array(tileWidth), () => new Array(tileHeight));
        let worldMap = this.worldMap;

        // initiate physics groups and coordinate data for boxes, walls, goals, and goal overlays
        this.boxes = this.physics.add.group(boxConfig);
        let boxes = this.boxes;
        let boxLocations = this.boxLocations;

        this.walls = this.physics.add.group(boxConfig);
        let walls = this.walls;
        let wallLocations = this.wallLocations;

        this.goals = this.physics.add.group(boxConfig);
        this.goalOverlays = this.physics.add.group(boxConfig);
        let goals = this.goals;
        let goalOverlays = this.goalOverlays;
        let goalLocations = this.goalLocations;

        let shift = this.shift;

        // make objects in the correct order; display overlays over boxes but under player
        make(worldMap, goals, goalLocations, shift, 'goal' + this.worldNum);
        make(worldMap, boxes, boxLocations, shift, 'box' + this.worldNum);
        make(worldMap, walls, wallLocations, shift, 'wall' + this.worldNum);
        make(worldMap, goalOverlays, goalLocations, shift, 'goalOverlay' + this.worldNum);

        // create player sprite and define bounding box & properties
        this.player = this.physics.add.sprite((this.playerStart[0] + shift[0]) * 32 + 16, (this.playerStart[1] + shift[1]) * 32 + 16, this.ninja);
        let player = this.player;
        player.setBounce(0);
        player.setCollideWorldBounds(true);
        player.body.setSize(18, 16, true);
        player.body.setOffset(7, 12);
        player.moveHistory = []; // track move direction history for better handling of arrow controls

        // colliders handle collisions between objects
        // special case for player-box collisions to handle grid-based movement
        this.physics.add.collider(player, boxes, playerBoxCallback);
        this.physics.add.collider(player, walls);
        this.physics.add.collider(boxes, boxes);
        this.physics.add.collider(boxes, walls);

        // create animations
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers(this.ninja, { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers(this.ninja, { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers(this.ninja, { start: 8, end: 11 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers(this.ninja, { start: 12, end: 15 }),
            frameRate: 10,
            repeat: -1
        });

        // create input listeners
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({ up: 'W', left: 'A', down: 'S', right: 'D', reset: 'R', esc: 'ESC' });
    }

    update() {
        let cursors = this.cursors;
        let keys = this.keys;
        let player = this.player;
        let moveHistory = player.moveHistory;
        let dirs = ['up', 'down', 'left', 'right'];

        // update move history by iterating through possible directions
        for (let i = 0; i < dirs.length; i++) {
            let d = dirs[i];
            if (cursors[d].isDown || keys[d].isDown) { // if corresponding key is down, push direction to array
                if (moveHistory.indexOf(d) == -1) {
                    moveHistory.push(d);
                }
            } else { // if corresponding key is not down, remove direction from history
                let ind = moveHistory.indexOf(d);
                if (ind >= 0) {
                    moveHistory.splice(ind, 1);
                }
            }
        }

        // access the most recent move direction
        let dir = moveHistory[moveHistory.length - 1];

        // directional movement
        if (dir != undefined) {
            let x = dir == 'left' ? -1 : dir == 'right' ? 1 : 0;
            let y = dir == 'up' ? -1 : dir == 'down' ? 1 : 0;
            player.setVelocityX(x * 100);
            player.setVelocityY(y * 100);
            player.anims.play(dir, true);
        } else {
            player.setVelocityX(0);
            player.setVelocityY(0);
            player.anims.stop();
        }

        // restart and exit to menu keybinds
        if (keys.reset.isDown) {
            this.scene.restart();
        }
        if (keys.esc.isDown) {
            this.scene.stop('level');
            this.scene.start('select', {
                loadNum: this.worldNum
            });
        }
    }
}

// make a single object at location (adj by shift)
function makeObject(worldMap, group, x, y, shift, key) {
    x = x + shift[0];
    y = y + shift[1];

    let b = group.create((x) * 32 + 16, (y) * 32 + 16, key);
    b.setImmovable(true);
    b.tileX = x;
    b.tileY = y;

    if (!key.includes('goalOverlay')) {
        if (worldMap[x][y] != null) {
            throw new EvalError('object already exists at location: (' + x + ', ' + y + ')' + key + worldMap[coords[0] + shift[0]][coords[1] + shift[1]].texture.key);
        }
    }
    if (key.includes('box') || key.includes('wall')) {
        worldMap[x][y] = b;
    }
    if (key.includes('box')) {
        b.isMoving = false;
    }
}

// make all objects using array of locations
function make(worldMap, group, locations, shift, key) {
    for (let i = 0; i < locations.length; i++) {
        let coords = locations[i];
        if (coords.length == 2) {
            makeObject(worldMap, group, ...coords, shift, key);
        } else if (coords.length == 4) {
            let xMin = Math.min(coords[0], coords[2]);
            let xMax = Math.max(coords[0], coords[2]);
            let yMin = Math.min(coords[1], coords[3]);
            let yMax = Math.max(coords[1], coords[3]);
            for (let x = xMin; x <= xMax; x++) {
                for (let y = yMin; y <= yMax; y++) {
                    makeObject(worldMap, group, x, y, shift, key);
                }
            }
        }
    }
}

function handlePlayerBoxCollision(player, box, worldMap, dx, dy) {
    let x_diff = (player.body.center.x - box.body.center.x) * Math.abs(dy);
    let y_diff = (player.body.center.y - box.body.center.y) * Math.abs(dx);
    let signed_x = Math.sign(x_diff);
    let signed_y = Math.sign(y_diff);

    // we only handle the case where exactly one of dx and dy are nonzero
    if ((dx == 0 && dy == 0) || (dx != 0 && dy != 0)) {
        return;
    }

    // if the player is closer to a neighboring tile, check collisions on that tile first
    let neighborTile = worldMap[box.tileX + signed_x][box.tileY + signed_y];
    if (neighborTile != null && Math.max(x_diff, y_diff) > 16) {
        return playerBoxCallback(player, neighborTile);
    }

    // find the tiles that should be moved, if null stop handling collision
    let toMove = search(box, dx, dy, worldMap);
    if (toMove == null) {
        return;
    }

    // adjust coordinates to new coordinates for each tile in toMove
    for (let n = 0; n < toMove.length; n++) {
        let b = toMove[n];
        worldMap[b.tileX][b.tileY] = null;
        b.tileX += dx;
        b.tileY += dy;
    }
    return toMove;
}

// function is called upon collision between player and a box
function playerBoxCallback(player, box) {
    let map = box.scene.worldMap;
    let boxes = box.scene.boxes.children.entries;

    // if any boxes are moving, do not process collision (handles double touch)
    for (let i = 0; i < boxes.length; i++) {
        if (boxes[i].isMoving) {
            return;
        }
    }

    // collide player and box, and store resulting array of tiles to move
    let dx = player.body.touching.left ? -1 : player.body.touching.right ? 1 : 0;
    let dy = player.body.touching.up ? -1 : player.body.touching.down ? 1 : 0;
    let toMove = handlePlayerBoxCollision(player, box, map, dx, dy);
    if (toMove == null) {
        return;
    }

    // move all the necessary tiles to the updated grid position in worldMap and visually
    for (let i = 0; i < toMove.length; i++) {
        let b = toMove[i];
        map[b.tileX][b.tileY] = b;
        b.isMoving = true;

        b.scene.tweens.add({
            targets: b,
            x: b.tileX * 32 + 16,
            y: b.tileY * 32 + 16,
            duration: 100,
            ease: 'Power2',
            onComplete: function (tween, targets) {
                let sokobanLevel = tween.parent.scene;

                for (let i = 0; i < targets.length; i++) {
                    targets[i].isMoving = false;
                }

                // iterate through goals, check for level complete
                let goals = sokobanLevel.goals.children.entries;
                let complete = true;
                for (let i = 0; i < goals.length; i++) {
                    let goal = goals[i];
                    let worldTile = sokobanLevel.worldMap[goal.tileX][goal.tileY];
                    if (worldTile == null) { // if no object is located at goal coords, level is not complete
                        complete = false;
                        break;
                    } else if (!worldTile.texture.key.includes('box')) { // goals must have a box in that location
                        complete = false;
                        break;
                    } else if (worldTile.isMoving == true) { // don't complete until all boxes are done moving
                        complete = false;
                        break;
                    }
                }

                // run levelCompleteHandler once upon completion
                if (complete) {
                    levelCompleteHandler(sokobanLevel);
                }
            }
        });
    }
}

// searches, starting from box and moving in dx, dy direction, for a chunk of boxes that can be moved
function search(box, dx, dy, worldMap) {
    let x = box.tileX;
    let y = box.tileY;

    while (0 <= x && x < tileWidth && 0 <= y && y < tileHeight) {
        if (worldMap[x][y] == null) { // if there's an empty space, we are done searching
            break;
        }
        if (!worldMap[x][y].texture.key.includes('box')) { // if there's a non-box in the way
            break;
        }
        x += dx;
        y += dy;
    }

    if (x < 0 || y < 0 || x >= tileWidth || y >= tileHeight) { // searched all the way to world bounds -> no movable boxes
        return null;
    } else if (worldMap[x][y] != null) { // no empty space for boxes to move into
        return null;
    } else { // succesfully found movable boxes, gather in an array to return
        let result = new Array();
        if (dy == 0) {
            for (let i = box.tileX; i != x; i += dx) {
                result.push(worldMap[i][y]);
            }
        } else if (dx == 0) {
            for (let j = box.tileY; j != y; j += dy) {
                result.push(worldMap[x][j]);
            }
        }
        return result;
    }
}

// function called once upon level completion
function levelCompleteHandler(scene) {

    // calculate and store previous / next level
    let worldNum = parseInt(scene.worldNum);
    let levelNum = parseInt(scene.levelNum);

    let previous = null;
    if (levelNum > 1) {
        previous = {
            world: worldNum,
            level: levelNum - 1
        };
    } else if (worldNum > 1) {
        let prevWorld = Object.keys(levelData[worldNum - 1]);

        previous = {
            world: worldNum - 1,
            level: Math.max(...Object.keys(levelData[worldNum - 1]).map(Number))
        };
    }

    let next = null;
    let maxLevel = Math.max(...Object.keys(levelData[worldNum]).map(Number));
    if (levelNum < maxLevel) {
        next = {
            world: worldNum,
            level: levelNum + 1
        };
    } else if (levelNum == maxLevel) {
        next = {
            world: worldNum + 1,
            level: 1
        };
    }

    // if the next level exists and comes after the locally stored level, store that instead
    let storedWorld = localStorage.getItem('world');
    let storedLevel = localStorage.getItem('level');
    if (next != null) {
        if (next.world > storedWorld) {
            localStorage.setItem('world', next.world);
            localStorage.setItem('level', next.level);
        } else if (next.level > storedLevel) {
            localStorage.setItem('world', next.world);
            localStorage.setItem('level', next.level);
        }
    }

    // add overlay and menu
    scene.add.image(400, 288, 'whiteOverlay');
    scene.add.image(400, 288, 'pauseMenu');
    let textStyle = {
        color: 'black',
        fontFamily: 'monospace',
        fontSize: '32px',
        boundsAlignH: 'center',
        boundsAlignV: 'middle'
    };
    let levelName = scene.add.text(400, 288 - 80, 'World ' + scene.worldNum + ': Level ' + scene.levelNum, textStyle).setOrigin(0.5);
    scene.add.text(400, 288 - 40, 'Complete!', textStyle).setOrigin(0.5);

    // give it a lil sparkle w/ a twirly star
    let star = scene.add.image(400, 288, 'star');
    star.alpha = 0;
    scene.tweens.add({
        targets: star,
        alpha: 1,
        angle: 360,
        duration: 2000,
        ease: 'Power2',
        onComplete: function (tween, targets) {
            for (let i = 0; i < targets.length; i++) {
                targets[i].isMoving = false;
            }
        }
    });

    // left arrow button to move to the previous level
    if (scene.levelNum > 1 || scene.worldNum > 1) {
        let left = scene.add.image(400 - 100, 288 + 80, 'leftButton');
        left.setInteractive();
        left.on('pointerdown', function (pointer) {
            let scene = pointer.manager.game.scene;
            let sokobanLevel = scene.keys['level'];

            scene.stop('level');
            scene.remove('level');
            scene.add('level', SokobanLevel, true, previous);
        });
    }

    // right arrow button to move to the next level
    let maxWorld = Math.max(...Object.keys(levelData).map(Number));
    if (scene.levelNum < Math.max(...Object.keys(levelData[maxWorld]).map(Number)) || scene.worldNum < maxWorld) {
        let right = scene.add.image(400 + 100, 288 + 80, 'rightButton');
        right.setInteractive();
        right.on('pointerdown', function (pointer) {
            let scene = pointer.manager.game.scene;
            let sokobanLevel = scene.keys['level'];

            scene.stop('level');
            scene.remove('level');
            scene.add('level', SokobanLevel, true, next);
        });
    }

    // level select button
    let select = scene.add.image(400, 288 + 180, 'levelSelect');
    select.setInteractive();
    select.on('pointerdown', function (pointer) {
        let scene = pointer.manager.game.scene;
        let sokobanLevel = scene.keys['level'];
        let worldNum = sokobanLevel.worldNum;

        scene.stop('level');
        scene.start('select', {
            loadNum: worldNum
        });
    });
}

export default SokobanLevel;
