class Menu extends Phaser.Scene {
    constructor() {
        super('menu');
    }

    init() {

    }

    preload() {

    }

    create() {

        this.scene.start('level', {
            world: 'test',
            level: 1
        });
    }

    update() {

    }
}

export default Menu;