import levelData from "./levels.js"

class Menu extends Phaser.Scene {
    constructor() {
        super('menu');
    }

    init() {

    }

    preload() {

    }

    create() {

        this.scene.start('level', levelData[1][2]);
    }

    update() {

    }
}

export default Menu;