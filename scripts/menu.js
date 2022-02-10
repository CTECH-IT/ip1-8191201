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
            world: 1,
            level: 2
        });
    }

    update() {

    }
}

export default Menu;