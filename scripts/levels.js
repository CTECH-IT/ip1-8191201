let levelData = {
    1: {
        1: {
            boxLocations: [
                [3, 1],
                [3, 3],
                [4, 2],
                [2, 2]
            ],
            wallLocations: [
                [0, 0, 6, 0],
                [0, 1, 0, 3],
                [0, 4, 6, 4],
                [6, 1, 6, 3]
            ],
            goalLocations: [
                [1, 1],
                [5, 1],
                [1, 3],
                [5, 3]
            ],
            playerStart: [3, 2],
            shift: [9, 7]
        },
        2: {
            boxLocations: [
                [5, 1],
                [5, 2],
                [2, 2],
                [2, 3]
            ],
            wallLocations: [
                [0, 0, 7, 0],
                [0, 1, 0, 3],
                [0, 4, 7, 4],
                [7, 1, 7, 3]
            ],
            goalLocations: [
                [3, 1],
                [4, 1],
                [3, 3],
                [4, 3]
            ],
            playerStart: [3, 2],
            shift: [8, 6]
        },
        3: {
            boxLocations: [
                [4, 2],
                [4, 4],
                [3, 3],
                [5, 3]
            ],
            wallLocations: [
                [1, 0, 1, 2],
                [0, 2, 0, 5],
                [1, 5, 1, 6],
                [2, 0, 7, 0],
                [2, 6, 7, 6],
                [7, 1, 7, 5]
            ],
            goalLocations: [
                [3, 2],
                [5, 2],
                [3, 4],
                [5, 4]
            ],
            playerStart: [1, 3],
            shift: [8, 5]
        }
    }
}

export default levelData