import levelData from "./levels.js";

let tileWidth = 25;
let tileHeight = 18;

class SokobanLevel extends Phaser.Scene {

    constructor() {
        super('level');

        this.completed = false;
    }

    init(nums) {
        this.worldNum = nums.world;
        this.levelNum = nums.level;
        let data = levelData[nums.world][nums.level];

        this.boxLocations = data.boxLocations;
        this.wallLocations = data.wallLocations;
        this.goalLocations = data.goalLocations;
        this.playerStart = data.playerStart;
    }

    preload() {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('floor', 'assets/floor.png');
        this.load.image('box', 'assets/box.png');
        this.load.image('wall', 'assets/wall_red.png');
        this.load.image('goal', 'assets/goal.png');
        this.load.image('goalOverlay', 'assets/goal_overlay.png');
        this.load.image('whiteOverlay', 'assets/white_overlay_50.png');
        this.load.image('pauseMenu', 'assets/pause_menu.png');
        this.load.image('leftButton', 'assets/left_arrow.png');
        this.load.image('rightButton', 'assets/right_arrow.png');
        this.load.spritesheet('ninja',
            'assets/ninjasprite.png',
            { frameWidth: 32, frameHeight: 32, margin: 2, spacing: 2 }
        );
    }

    create() {
        this.add.image(400, 288, 'floor');

        let boxConfig = {
            collideWorldBounds: true
        };

        this.worldMap = Array.from(Array(tileWidth), () => new Array(tileHeight));
        let worldMap = this.worldMap;

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
        makeGoals(worldMap, goals, goalLocations, 'goal');

        makeBoxes(worldMap, boxes, boxLocations, 'box');
        makeBoxes(worldMap, walls, wallLocations, 'wall');

        makeOverlays(goalOverlays, goalLocations, 'goalOverlay');

        this.player = this.physics.add.sprite(this.playerStart[0] * 32 + 16, this.playerStart[1] * 32 + 16, 'ninja');
        let player = this.player;

        player.setBounce(0);
        player.setCollideWorldBounds(true);
        player.body.setSize(18, 16, true);
        player.body.setOffset(7, 12);
        this.physics.add.collider(player, boxes, playerBoxCallback, playerBoxProcessCallback);
        this.physics.add.collider(player, walls);
        this.physics.add.collider(boxes, boxes);
        this.physics.add.collider(boxes, walls);

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('ninja', { start: 0, end: 0 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('ninja', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('ninja', { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('ninja', { start: 8, end: 11 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('ninja', { start: 12, end: 15 }),
            frameRate: 10,
            repeat: -1
        });


        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({ up: 'W', left: 'A', down: 'S', right: 'D', reset: 'R' });
    }

    update() {
        let cursors = this.cursors;
        let keys = this.keys;
        let move = false;
        let player = this.player;

        let m = {
            left: cursors.left.isDown || keys.left.isDown,
            right: cursors.right.isDown || keys.right.isDown,
            up: cursors.up.isDown || keys.up.isDown,
            down: cursors.down.isDown || keys.down.isDown,
        };
        m.horiz = m.left || m.right;
        m.vert = m.up || m.down;
        m.move = m.horiz || m.vert;

        if (m.left && !m.vert) {
            player.setVelocityX(-100);
            player.anims.play('left', true);
            move = true;
        }
        else if (m.right && !m.vert) {
            player.setVelocityX(100);
            player.anims.play('right', true);
            move = true;
        }
        else {
            player.setVelocityX(0);
        }

        if (m.up && !m.horiz) {
            player.setVelocityY(-100);
            player.anims.play('up', true);
            move = true;
        }
        else if (m.down && !m.horiz) {
            player.setVelocityY(100);
            player.anims.play('down', true);
            move = true;
        }
        else {
            player.setVelocityY(0);
        }

        if (!m.move || m.horiz && m.vert) {
            player.anims.stop();
        }

        if (keys.reset.isDown) {
            this.scene.restart();
        }

        let goals = this.goals.children.entries;
        let complete = true;

        for (let i = 0; i < goals.length; i++) {
            let goal = goals[i];
            let worldTile = this.worldMap[goal.tileX][goal.tileY];
            if (worldTile == null) {
                complete = false;
                break;
            } else if (worldTile.texture.key != 'box') {
                complete = false;
                break;
            } else if (worldTile.isMoving == true) {
                complete = false;
                break;
            }
        }

        if (complete && !this.completed) {
            this.completed = true;
            levelCompleteHandler(this);
        }
    }
}

function makeBoxes(worldMap, group, locations, key) {
    for (let i = 0; i < locations.length; i++) {
        let coords = locations[i];
        if (coords.length == 2) {
            let b = group.create(coords[0] * 32 + 16, coords[1] * 32 + 16, key);
            b.setImmovable(true);
            b.tileX = coords[0];
            b.tileY = coords[1];
            b.isMoving = false;
            if (worldMap[coords[0]][coords[1]] != null) {
                throw new EvalError('object already exists at location: (' + coords[0] + ', ' + coords[1] + ')');
            }
            worldMap[coords[0]][coords[1]] = b;
        } else if (coords.length == 4) {
            let xMin = Math.min(coords[0], coords[2]);
            let xMax = Math.max(coords[0], coords[2]);
            let yMin = Math.min(coords[1], coords[3]);
            let yMax = Math.max(coords[1], coords[3]);
            for (let x = xMin; x <= xMax; x++) {
                for (let y = yMin; y <= yMax; y++) {
                    let b = group.create(x * 32 + 16, y * 32 + 16, key);
                    b.setImmovable(true);
                    b.tileX = x;
                    b.tileY = y;
                    b.isMoving = false;
                    if (worldMap[x][y] != null) {
                        throw new EvalError('object already exists at location: (' + x + ', ' + y + ')');
                    }
                    worldMap[x][y] = b;
                }
            }
        }
    }
}

function makeGoals(worldMap, group, locations, key) {
    for (let i = 0; i < locations.length; i++) {
        let coords = locations[i];
        if (coords.length == 2) {
            let b = group.create(coords[0] * 32 + 16, coords[1] * 32 + 16, key);
            b.setImmovable(true);
            b.tileX = coords[0];
            b.tileY = coords[1];
            if (worldMap[coords[0]][coords[1]] != null) {
                throw new EvalError('object already exists at location');
            }
        } else if (coords.length == 4) {
            let xMin = Math.min(coords[0], coords[2]);
            let xMax = Math.max(coords[0], coords[2]);
            let yMin = Math.min(coords[1], coords[3]);
            let yMax = Math.max(coords[1], coords[3]);
            for (let x = xMin; x <= xMax; x++) {
                for (let y = yMin; y <= yMax; y++) {
                    let b = group.create(x * 32 + 16, y * 32 + 16, key);
                    b.setImmovable(true);
                    b.tileX = x;
                    b.tileY = y;
                    if (worldMap[x][y] != null) {
                        throw new EvalError('object already exists at location');
                    }
                }
            }
        }
    }
}

function makeOverlays(group, locations, key) {
    for (let i = 0; i < locations.length; i++) {
        let coords = locations[i];
        if (coords.length == 2) {
            let b = group.create(coords[0] * 32 + 16, coords[1] * 32 + 16, key);
            b.setImmovable(true);
            b.tileX = coords[0];
            b.tileY = coords[1];
        } else if (coords.length == 4) {
            let xMin = Math.min(coords[0], coords[2]);
            let xMax = Math.max(coords[0], coords[2]);
            let yMin = Math.min(coords[1], coords[3]);
            let yMax = Math.max(coords[1], coords[3]);
            for (let x = xMin; x <= xMax; x++) {
                for (let y = yMin; y <= yMax; y++) {
                    let b = group.create(x * 32 + 16, y * 32 + 16, key);
                    b.setImmovable(true);
                    b.tileX = x;
                    b.tileY = y;
                }
            }
        }
    }
}

function playerBoxCallback(player, box) {
    let map = box.scene.worldMap;
    let toMove = box;
    let boxes = box.scene.boxes.children.entries;

    let xDiff = Math.abs(player.body.center.x - box.body.center.x);
    let yDiff = Math.abs(player.body.center.y - box.body.center.y);

    for (let i = 0; i < boxes.length; i++) {
        if (boxes[i].isMoving) {
            return false;
        }
    }

    if (player.body.touching.up) {
        if (player.body.center.x < box.body.center.x) {
            if (map[box.tileX - 1][box.tileY] != null) {
                if (map[box.tileX - 1][box.tileY].texture.key == 'box') {
                    if (xDiff > 16) {
                        if (playerBoxCallback(player, map[box.tileX - 1][box.tileY])) {
                            return true;
                        }
                    }
                }
            }
        } else if (player.body.center.x > box.body.center.x) {
            if (map[box.tileX + 1][box.tileY] != null) {
                if (map[box.tileX + 1][box.tileY].texture.key == 'box') {
                    if (xDiff > 16) {
                        if (playerBoxCallback(player, map[box.tileX + 1][box.tileY])) {
                            return true;
                        }
                    }
                }
            }
        }
        toMove = search(box, 0, -1, map);
        if (toMove == null) {
            return false;
        }
        for (let n = 0; n < toMove.length; n++) {
            let b = toMove[n];
            map[b.tileX][b.tileY] = null;
            b.tileY -= 1;
        }

    } else if (player.body.touching.down) {
        if (player.body.center.x < box.body.center.x) {
            if (map[box.tileX - 1][box.tileY] != null) {
                if (map[box.tileX - 1][box.tileY].texture.key == 'box') {
                    if (xDiff > 16) {
                        if (playerBoxCallback(player, map[box.tileX - 1][box.tileY])) {
                            return true;
                        }
                    }
                }
            }
        } else if (player.body.center.x > box.body.center.x) {
            if (map[box.tileX + 1][box.tileY] != null) {
                if (map[box.tileX + 1][box.tileY].texture.key == 'box') {
                    if (xDiff > 16) {
                        if (playerBoxCallback(player, map[box.tileX + 1][box.tileY])) {
                            return true;
                        }
                    }
                }
            }
        }
        toMove = search(box, 0, 1, map);
        if (toMove == null) {
            return false;
        }
        for (let n = 0; n < toMove.length; n++) {
            let b = toMove[n];
            map[b.tileX][b.tileY] = null;
            b.tileY += 1;
        }

    } else if (player.body.touching.left) {
        if (player.body.center.y < box.body.center.y) {
            if (map[box.tileX][box.tileY - 1] != null) {
                if (map[box.tileX][box.tileY - 1].texture.key == 'box') {
                    if (yDiff > 16) {
                        if (playerBoxCallback(player, map[box.tileX][box.tileY - 1])) {
                            return true;
                        }
                    }
                }
            }
        } else {
            if (map[box.tileX][box.tileY + 1] != null) {
                if (map[box.tileX][box.tileY + 1].texture.key == 'box') {
                    if (yDiff > 16) {
                        if (playerBoxCallback(player, map[box.tileX][box.tileY + 1])) {
                            return true;
                        }
                    }
                }
            }
        }
        toMove = search(box, -1, 0, map);
        if (toMove == null) {
            return false;
        }
        for (let n = 0; n < toMove.length; n++) {
            let b = toMove[n];
            map[b.tileX][b.tileY] = null;
            b.tileX -= 1;
        }

    } else if (player.body.touching.right) {
        if (player.body.center.y < box.body.center.y) {
            if (map[box.tileX][box.tileY - 1] != null) {
                if (map[box.tileX][box.tileY - 1].texture.key == 'box') {
                    if (yDiff > 16) {
                        if (playerBoxCallback(player, map[box.tileX][box.tileY - 1])) {
                            return true;
                        }
                    }
                }
            }
        } else {
            if (map[box.tileX][box.tileY + 1] != null) {
                if (map[box.tileX][box.tileY + 1].texture.key == 'box') {
                    if (yDiff > 16) {
                        if (playerBoxCallback(player, map[box.tileX][box.tileY + 1])) {
                            return true;
                        }
                    }
                }
            }
        }
        toMove = search(box, 1, 0, map);
        if (toMove == null) {
            return false;
        }
        for (let n = 0; n < toMove.length; n++) {
            let b = toMove[n];
            map[b.tileX][b.tileY] = null;
            b.tileX += 1;
        }

    } else {
        return false;
    }
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
                for (let i = 0; i < targets.length; i++) {
                    targets[i].isMoving = false;
                }
            }
        });
    }
    return true;
}

function playerBoxProcessCallback(player, box) {
    return !box.isMoving;
}

function search(box, dx, dy, worldMap) {
    let x = box.tileX;
    let y = box.tileY;

    while (0 <= x && x < tileWidth && 0 <= y && y < tileHeight) {
        if (worldMap[x][y] == null) {
            break;
        }
        if (worldMap[x][y].texture.key != 'box') {
            break;
        }
        x += dx;
        y += dy;
    }

    if (x < 0 || y < 0 || x >= tileWidth || y >= tileHeight) {
        return null;
    } else if (worldMap[x][y] != null) {
        return null;
    } else {
        let result = new Array();
        if (dy == 0) {
            if (dx == -1) {
                for (let i = box.tileX; i > x; i--) {
                    result.push(worldMap[i][y]);
                }
            } else if (dx == 1) {
                for (let i = box.tileX; i < x; i++) {
                    result.push(worldMap[i][y]);
                }
            }
        } else if (dx == 0) {
            if (dy == -1) {
                for (let j = box.tileY; j > y; j--) {
                    result.push(worldMap[x][j]);
                }
            } else if (dy == 1) {
                for (let j = box.tileY; j < y; j++) {
                    result.push(worldMap[x][j]);
                }
            }
        }
        return result;
    }
}

function levelCompleteHandler(scene) {
    scene.input.keyboard.destroy();
    scene.add.image(400, 288, 'whiteOverlay');
    scene.add.image(400, 288, 'pauseMenu');
    let textStyle = {
        color: 'black',
        font: 'Arial',
        boundsAlignH: 'center',
        boundsAlignV: 'middle'
    }
    let text = scene.add.text(400, 288 - 80, 'World ' + scene.worldNum + ': Level ' + scene.levelNum, textStyle).setOrigin(0.5);
    scene.add.text(400, 288 - 50, 'Complete!', textStyle).setOrigin(0.5);
    console.log(text);
    let left = scene.add.image(400 - 100, 288 + 80, 'leftButton');
    let right = scene.add.image(400 + 100, 288 + 80, 'rightButton');
}

export default SokobanLevel;