import SokobanLevel from "./sokoban_level.js";

var score = 0;
var scoreText;

let tileWidth = 25;
let tileHeight = 18;

let config = {
    type: Phaser.AUTO,
    width: tileWidth*32,
    height: tileHeight*32,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            forceX: true
        }
    },
    scene: [new SokobanLevel('level1', [
        [6, 6, 10, 10]
    ], [
        [0, 0, 24, 0],
        [0, 17, 24, 17],
        [0, 1, 0, 16],
        [24, 1, 24, 16],
    ], [
        [1, 1],
        [1, 16],
        [23, 16],
        [23, 1],
        [15, 4]
    ], [3, 2])]
}

let game = new Phaser.Game(config)