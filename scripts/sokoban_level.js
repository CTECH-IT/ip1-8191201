let tileWidth = 25;
let tileHeight = 18;

class SokobanLevel extends Phaser.Scene {

    constructor(name, box_locations, wall_locations, player_start) {
        super(name)
        this.box_locations = box_locations
        this.wall_locations = wall_locations
        this.player_start = player_start
    }

    preload() {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('box', 'assets/box.png');
        this.load.image('wall', 'assets/wall.png');
        this.load.spritesheet('ninja', 
            'assets/ninjasprite.png',
            { frameWidth: 32, frameHeight: 32 , margin: 2, spacing: 2}
        );
    }

    create() {
        this.add.image(400, 300, 'sky');

        let box_config = {
            collideWorldBounds: true
        }

        this.worldMap = Array.from(Array(tileWidth), () => new Array(tileHeight))
        let worldMap = this.worldMap
    
        this.boxes = this.physics.add.group(box_config);
        let boxes = this.boxes
        let box_locations = this.box_locations;

        this.walls = this.physics.add.group(box_config)
        let walls = this.walls
        let wall_locations = this.wall_locations
    
        makeBoxes(worldMap, boxes, box_locations, 'box')
        makeBoxes(worldMap, walls, wall_locations, 'wall')
    
        this.player = this.physics.add.sprite(this.player_start[0]*32+16, this.player_start[1]*32+16, 'ninja');
        let player = this.player
    
        player.setBounce(0);
        player.setCollideWorldBounds(true);
        player.body.setSize(20, 20, true);
        player.body.setOffset(6, 12)
        this.physics.add.collider(player, boxes, playerBoxCallback, playerBoxProcessCallback)
        this.physics.add.collider(player, walls)
        this.physics.add.collider(boxes, boxes)
        this.physics.add.collider(boxes, walls)
    
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
        let keys = this.input.keyboard.addKeys({ up: 'W', left: 'A', down: 'S', right: 'D' });
        let move = false;
        let player = this.player;
    
        let m = {
            left: cursors.left.isDown || keys.left.isDown,
            right: cursors.right.isDown || keys.right.isDown,
            up: cursors.up.isDown || keys.up.isDown,
            down: cursors.down.isDown || keys.down.isDown,
        }
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
    
        if (m.up && !m.horiz)
        {
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
    }
}

function makeBoxes(worldMap, group, locations, key) {
    for(let i = 0; i < locations.length; i++) {
        let coords = locations[i]
        if (coords.length == 2) {
            let b = group.create(coords[0]*32 + 16, coords[1]*32 + 16, key);
            b.setImmovable(true);
            b.tileX = coords[0];
            b.tileY = coords[1];
            b.isMoving = false;
            if (worldMap[coords[0]][coords[1]] != null) {
                throw new EvalError('object already exists at location')
            }
            worldMap[coords[0]][coords[1]] = b;
        } else if (coords.length == 4) {
            let x_min = Math.min(coords[0], coords[2])
            let x_max = Math.max(coords[0], coords[2])
            let y_min = Math.min(coords[1], coords[3])
            let y_max = Math.max(coords[1], coords[3])
            for (let x = x_min; x <= x_max;  x++) {
                for (let y = y_min; y <= y_max; y++) {
                    let b = group.create(x*32 + 16, y*32 + 16, key)
                    b.setImmovable(true);
                    b.tileX = x;
                    b.tileY = y;
                    b.isMoving = false;
                    if (worldMap[x][y] != null) {
                        throw new EvalError('object already exists at location')
                    }
                    worldMap[x][y] = b;
                }
            }
        }
    }
}

function playerBoxCallback(player, box) {
    let map = box.scene.worldMap
    let toMove = box
    if(player.body.touching.up) {
        toMove = search(box, 0, -1, map)
        if(toMove == null) {
            return;
        }
        for (let n = 0; n < toMove.length; n++) {
            let b = toMove[n]
            map[b.tileX][b.tileY] = null
            b.tileY -= 1
        }
        
    } else if(player.body.touching.down) {
        toMove = search(box, 0, 1, map)
        if(toMove == null) {
            return;
        }
        for (let n = 0; n < toMove.length; n++) {
            let b = toMove[n]
            map[b.tileX][b.tileY] = null
            b.tileY += 1
        }
        
    } else if(player.body.touching.left) {
        toMove = search(box, -1, 0, map)
        if(toMove == null) {
            return;
        }
        for (let n = 0; n < toMove.length; n++) {
            let b = toMove[n]
            map[b.tileX][b.tileY] = null
            b.tileX -= 1
        }
        
    } else if(player.body.touching.right) {
        toMove = search(box, 1, 0, map)
        if(toMove == null) {
            return;
        }
        for (let n = 0; n < toMove.length; n++) {
            let b = toMove[n]
            map[b.tileX][b.tileY] = null
            b.tileX += 1
        }
        
    } else {
        return
    }
    for (let i = 0; i < toMove.length; i++) {
        let b = toMove[i]
        map[b.tileX][b.tileY] = b
        b.isMoving = true;

        b.scene.tweens.add({
            targets: b,
            x: b.tileX*32 + 16,
            y: b.tileY*32 + 16,
            duration: 100,
            ease: 'Power2',
            onComplete: function (tween, targets) {
                for (let i = 0; i < targets.length; i++) {
                    targets[i].isMoving = false
                }
            }
        });
    }
}

function playerBoxProcessCallback(player, box) {
    if (!box.isMoving) {
        return true
    } else {
        return false
    }
}

function coordsIn(coords, group) {
    let objs = group.children.entries;
    for (let i = 0; i < objs.length; i++) {
        if(objs[i].tileX == coords[0] && objs[i].tileY == coords[1]) {
            return true;
        }
    }
    return false;
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
        let result = new Array()
        if (dy == 0) {
            if (dx == -1) {
                for (let i = box.tileX; i > x; i--) {
                    result.push(worldMap[i][y])
                }
            } else if (dx == 1) {
                for (let i = box.tileX; i < x; i++) {
                    result.push(worldMap[i][y])
                }
            }
        } else if (dx == 0) {
            if (dy == -1) {
                for (let j = box.tileY; j > y; j--) {
                    result.push(worldMap[x][j])
                }
            } else if (dy == 1) {
                for (let j = box.tileY; j < y; j++) {
                    result.push(worldMap[x][j])
                }
            }
        }
        console.log(result)
        return result;
    }
}

export default SokobanLevel;