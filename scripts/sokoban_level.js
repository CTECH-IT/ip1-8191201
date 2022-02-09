let tileWidth = 25;
let tileHeight = 18;

class SokobanLevel extends Phaser.Scene {

    constructor(name, box_locations, wall_locations, goal_locations, player_start) {
        super(name);
        this.box_locations = box_locations;
        this.wall_locations = wall_locations;
        this.goal_locations = goal_locations;
        this.player_start = player_start;

        this.completed = false;
    }

    preload() {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('floor', 'assets/floor.png');
        this.load.image('box', 'assets/box.png');
        this.load.image('wall', 'assets/wall_red.png');
        this.load.image('goal', 'assets/goal.png');
        this.load.image('goal_overlay', 'assets/goal_overlay.png');
        this.load.spritesheet('ninja',
            'assets/ninjasprite.png',
            { frameWidth: 32, frameHeight: 32, margin: 2, spacing: 2 }
        );
    }

    create() {
        this.add.image(400, 288, 'floor');

        let box_config = {
            collideWorldBounds: true
        };

        this.worldMap = Array.from(Array(tileWidth), () => new Array(tileHeight));
        let worldMap = this.worldMap;

        this.boxes = this.physics.add.group(box_config);
        let boxes = this.boxes;
        let box_locations = this.box_locations;

        this.walls = this.physics.add.group(box_config);
        let walls = this.walls;
        let wall_locations = this.wall_locations;

        this.goals = this.physics.add.group(box_config);
        this.goal_overlays = this.physics.add.group(box_config);
        let goals = this.goals;
        let goal_overlays = this.goal_overlays;
        let goal_locations = this.goal_locations;
        makeGoals(worldMap, goals, goal_locations, 'goal');

        makeBoxes(worldMap, boxes, box_locations, 'box');
        makeBoxes(worldMap, walls, wall_locations, 'wall');

        makeOverlays(goal_overlays, goal_locations, 'goal_overlay');

        this.player = this.physics.add.sprite(this.player_start[0] * 32 + 16, this.player_start[1] * 32 + 16, 'ninja');
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
    }

    update() {
        let cursors = this.input.keyboard.createCursorKeys();
        let keys = this.input.keyboard.addKeys({ up: 'W', left: 'A', down: 'S', right: 'D', reset: 'R' });
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
            alert('yay');
            levelCompleteHandler();
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
                throw new EvalError('object already exists at location');
            }
            worldMap[coords[0]][coords[1]] = b;
        } else if (coords.length == 4) {
            let x_min = Math.min(coords[0], coords[2]);
            let x_max = Math.max(coords[0], coords[2]);
            let y_min = Math.min(coords[1], coords[3]);
            let y_max = Math.max(coords[1], coords[3]);
            for (let x = x_min; x <= x_max; x++) {
                for (let y = y_min; y <= y_max; y++) {
                    let b = group.create(x * 32 + 16, y * 32 + 16, key);
                    b.setImmovable(true);
                    b.tileX = x;
                    b.tileY = y;
                    b.isMoving = false;
                    if (worldMap[x][y] != null) {
                        throw new EvalError('object already exists at location');
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
            let x_min = Math.min(coords[0], coords[2]);
            let x_max = Math.max(coords[0], coords[2]);
            let y_min = Math.min(coords[1], coords[3]);
            let y_max = Math.max(coords[1], coords[3]);
            for (let x = x_min; x <= x_max; x++) {
                for (let y = y_min; y <= y_max; y++) {
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
            let x_min = Math.min(coords[0], coords[2]);
            let x_max = Math.max(coords[0], coords[2]);
            let y_min = Math.min(coords[1], coords[3]);
            let y_max = Math.max(coords[1], coords[3]);
            for (let x = x_min; x <= x_max; x++) {
                for (let y = y_min; y <= y_max; y++) {
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

    let x_diff = Math.abs(player.body.center.x - box.body.center.x);
    let y_diff = Math.abs(player.body.center.y - box.body.center.y);

    for (let i = 0; i < boxes.length; i++) {
        if (boxes[i].isMoving) {
            return;
        }
    }

    if (player.body.touching.up) {
        if (player.body.center.x < box.body.center.x) {
            if (map[box.tileX - 1][box.tileY] != null) {
                if (map[box.tileX - 1][box.tileY].texture.key == 'box') {
                    if (x_diff > 16) {
                        return playerBoxCallback(player, map[box.tileX - 1][box.tileY]);
                    }
                }
            }
        } else if (player.body.center.x > box.body.center.x) {
            if (map[box.tileX + 1][box.tileY] != null) {
                if (map[box.tileX + 1][box.tileY].texture.key == 'box') {
                    if (x_diff > 16) {
                        return playerBoxCallback(player, map[box.tileX + 1][box.tileY]);
                    }
                }
            }
        }
        toMove = search(box, 0, -1, map);
        if (toMove == null) {
            return;
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
                    if (x_diff > 16) {
                        return playerBoxCallback(player, map[box.tileX - 1][box.tileY]);
                    }
                }
            }
        } else {
            if (map[box.tileX + 1][box.tileY] != null) {
                if (map[box.tileX + 1][box.tileY].texture.key == 'box') {
                    if (x_diff > 16) {
                        return playerBoxCallback(player, map[box.tileX + 1][box.tileY]);
                    }
                }
            }
        }
        toMove = search(box, 0, 1, map);
        if (toMove == null) {
            return;
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
                    if (y_diff > 16) {
                        return playerBoxCallback(player, map[box.tileX][box.tileY - 1]);
                    }
                }
            }
        } else {
            if (map[box.tileX][box.tileY + 1] != null) {
                if (map[box.tileX][box.tileY + 1].texture.key == 'box') {
                    if (y_diff > 16) {
                        return playerBoxCallback(player, map[box.tileX][box.tileY + 1]);
                    }
                }
            }
        }
        toMove = search(box, -1, 0, map);
        if (toMove == null) {
            return;
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
                    if (y_diff > 16) {
                        return playerBoxCallback(player, map[box.tileX][box.tileY - 1]);
                    }
                }
            }
        } else {
            if (map[box.tileX][box.tileY + 1] != null) {
                if (map[box.tileX][box.tileY + 1].texture.key == 'box') {
                    if (y_diff > 16) {
                        return playerBoxCallback(player, map[box.tileX][box.tileY + 1]);
                    }
                }
            }
        }
        toMove = search(box, 1, 0, map);
        if (toMove == null) {
            return;
        }
        for (let n = 0; n < toMove.length; n++) {
            let b = toMove[n];
            map[b.tileX][b.tileY] = null;
            b.tileX += 1;
        }

    } else {
        return;
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

function levelCompleteHandler() {
}

export default SokobanLevel;