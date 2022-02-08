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
        [3, 1],
        [3, 3],
        [2, 2],
        [4, 2]
    ], [
        [0, 0, 6, 0],
        [6, 1, 6, 3],
        [0, 4, 6, 4],
        [0, 1, 0, 3],
    ], [3, 2])]
}

let game = new Phaser.Game(config)