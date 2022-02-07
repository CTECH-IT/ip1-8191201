var score = 0;
var scoreText;

let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            forceX: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

let game = new Phaser.Game(config)

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
    
    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    platforms.create(600, 400, 'ground')
    platforms.create(50, 250, 'ground')
    platforms.create(750, 220, 'ground')

    box_config = {
        collideWorldBounds: true,
        dragX: 1000,
        dragY: 1000,
    }

    boxes = this.physics.add.group(box_config);

    boxes.create(500, 100, 'box')

    boxes.create(100, 200, 'box')
    boxes.create(150, 500, 'box')
    boxes.create(200, 200, 'box')



    player = this.physics.add.sprite(100, 450, 'ninja');

    player.setBounce(0);
    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(player, boxes)
    this.physics.add.collider(boxes, platforms)
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
    //boxes.setVelocityX(0);
    //boxes.setVelocityY(0);

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