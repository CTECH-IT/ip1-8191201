import SokobanLevel from "./sokoban_level.js";

var score = 0;
var scoreText;

let tileWidth = 25;
let tileHeight = 18;

let config = {
    type: Phaser.AUTO,
    width: tileWidth*32,
    height: tileHeight*32,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            forceX: true
        }
    },
    scene: [new SokobanLevel('level1', [
        [10, 6, 10, 9]
    ], [
        [5, 5, 15, 5],
        [15, 6, 15, 9],
        [5, 10, 15, 10],
        [5, 6, 5, 9],
    ], [6, 6])]
}

let game = new Phaser.Game(config)


/*
function preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('box', 'assets/box.png');
    this.load.spritesheet('dude', 
        'assets/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );
    this.load.spritesheet('ninja', 
        'assets/ninjasprite.png',
        { frameWidth: 32, frameHeight: 32 , margin: 2, spacing: 2}
    );
}

function create() {
    this.add.image(400, 300, 'sky');

    box_config = {
        collideWorldBounds: true
    }

    boxes = this.physics.add.group(box_config);
    locations = [
        [10, 0, 10, 18]
    ]

    make(boxes, locations, 'box')

    player = this.physics.add.sprite(100, 450, 'ninja');

    player.setBounce(0);
    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, boxes, playerBoxCallback, playerBoxProcessCallback)
    this.physics.add.collider(boxes, boxes)

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

function update() {
    cursors = this.input.keyboard.createCursorKeys();
    keys = this.input.keyboard.addKeys({ up: 'W', left: 'A', down: 'S', right: 'D' });
    move = false;

    m = {
        left: cursors.left.isDown || keys.left.isDown,
        right: cursors.right.isDown || keys.right.isDown,
        up: cursors.up.isDown || keys.up.isDown,
        down: cursors.down.isDown || keys.down.isDown,
    }
    m.horiz = m.left || m.right;
    m.vert = m.up || m.down;
    m.move = m.horiz || m.vert;

    if (m.left && !m.vert) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
        move = true;
    }
    else if (m.right && !m.vert) {
        player.setVelocityX(160);
        player.anims.play('right', true);
        move = true;
    }
    else {
        player.setVelocityX(0);
    }

    if (m.up && !m.horiz)
    {
        player.setVelocityY(-160);
        player.anims.play('up', true);
        move = true;
    }
    else if (m.down && !m.horiz) {
        player.setVelocityY(160);
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

function make(group, locations, key) {
    for(let i = 0; i < locations.length; i++) {
        let coords = locations[i]
        if (coords.length == 2) {
            b = group.create(coords[0]*32 + 16, coords[1]*32 + 16, key);
            b.setImmovable(true);
            b.tileX = coords[0];
            b.tileY = coords[1];
            b.isMoving = false;
        } else if (coords.length == 4) {
            let x_min = Math.min(coords[0], coords[2])
            let x_max = Math.max(coords[0], coords[2])
            let y_min = Math.min(coords[1], coords[3])
            let y_max = Math.max(coords[1], coords[3])
            for (let x = x_min; x <= x_max;  x++) {
                for (let y = y_min; y <= y_max; y++) {
                    b = group.create(x*32 + 16, y*32 + 16, key)
                    b.setImmovable(true);
                    b.tileX = x;
                    b.tileY = y;
                    b.isMoving = false;
                }
            }
        }
    }
}

function playerBoxCallback(player, box) {
    if(player.body.touching.up && !coordsIn([box.tileX, box.tileY-1], boxes) && box.tileY-1 >= 0) {
        box.tileY -= 1
        
    } else if(player.body.touching.down && !coordsIn([box.tileX, box.tileY+1], boxes) && box.tileY+1 <= tileHeight) {
        box.tileY += 1
        
    } else if(player.body.touching.left && !coordsIn([box.tileX-1, box.tileY], boxes) && box.tileX-1 >= 0) {
        box.tileX -= 1
        
    } else if(player.body.touching.right && !coordsIn([box.tileX+1, box.tileY], boxes) && box.tileX+1 <= tileWidth) {
        box.tileX += 1
        
    } else {
        return
    }
    box.isMoving = true;
    box.scene.tweens.add({
        targets: box,
        x: box.tileX*32 + 16,
        y: box.tileY*32 + 16,
        duration: 100,
        ease: 'Power2',
        onComplete: function (tween, targets) {
            for (let i = 0; i < targets.length; i++) {
                targets[i].isMoving = false
            }
        }
    });
}

function playerBoxProcessCallback(player, box) {
    if (!box.isMoving) {
        return true
    } else {
        return false
    }
}

function coordsIn(coords, group) {
    objs = group.children.entries;
    for (let i = 0; i < objs.length; i++) {
        if(objs[i].tileX == coords[0] && objs[i].tileY == coords[1]) {
            return true;
        }
    }
    return false;
}*/