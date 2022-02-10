import SokobanLevel from "./sokoban_level.js";
import Menu from "./menu.js"

var score = 0;
var scoreText;

let tileWidth = 25;
let tileHeight = 18;

let level = new SokobanLevel();
let menu = new Menu();

let config = {
    type: Phaser.AUTO,
    width: tileWidth*32,
    height: tileHeight*32,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            forceX: true
        }
    },
    scene: [menu, level]
}

let game = new Phaser.Game(config)