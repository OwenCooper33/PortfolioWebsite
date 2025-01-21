const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const BLOCK_SIZE = 30;
const ROWS = 20;
const COLS = 10;
const COLORS = ["red", "green", "blue", "cyan", "magenta", "yellow", "orange"];
const SHAPES = [
    [[1, 1, 1], [0, 1, 0]], // T-shape
    [[1, 1], [1, 1]],       // O-shape
    [[1, 1, 1, 1]],         // I-shape
    [[1, 1, 0], [0, 1, 1]], // S-shape
    [[0, 1, 1], [1, 1, 0]], // Z-shape
    [[1, 1, 1], [1, 0, 0]], // L-shape
    [[1, 1, 1], [0, 0, 1]], // J-shape
];

let grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
let currentShape = getRandomShape();
let nextShape = getRandomShape();
let shapeX = Math.floor(COLS / 2) - 1;
let shapeY = 0;
let gameOver = false;

function getRandomShape() {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    return { shape, color };
}

function drawGrid() {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (grid[y][x]) {
                ctx.fillStyle = grid[y][x];
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
            ctx.strokeStyle = "white";
            ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
    }
}

function drawShape({ shape, color }, offsetX, offsetY) {
    ctx.fillStyle = color;
    shape.forEach((row, dy) => {
        row.forEach((cell, dx) => {
            if (cell) {
                ctx.fillRect((offsetX + dx) * BLOCK_SIZE, (offsetY + dy) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
}

function canMove(shape, offsetX, offsetY) {
    return shape.every((row, dy) =>
        row.every((cell, dx) => {
            if (!cell) return true;
            const newX = offsetX + dx;
            const newY = offsetY + dy;
            return newX >= 0 && newX < COLS && newY < ROWS && (!grid[newY] || !grid[newY][newX]);
        })
    );
}

function lockShape({ shape, color }, offsetX, offsetY) {
    shape.forEach((row, dy) => {
        row.forEach((cell, dx) => {
            if (cell) {
                grid[offsetY + dy][offsetX + dx] = color;
            }
        });
    });
}

function clearLines() {
    grid = grid.filter(row => row.some(cell => !cell));
    while (grid.length < ROWS) {
        grid.unshift(Array(COLS).fill(null));
    }
}

function rotateShape(shape) {
    return shape[0].map((_, colIndex) => shape.map(row => row[colIndex]).reverse());
}

function update() {
    if (canMove(currentShape.shape, shapeX, shapeY + 1)) {
        shapeY++;
    } else {
        lockShape(currentShape, shapeX, shapeY);
        clearLines();
        currentShape = nextShape;
        nextShape = getRandomShape();
        shapeX = Math.floor(COLS / 2) - 1;
        shapeY = 0;

        if (!canMove(currentShape.shape, shapeX, shapeY)) {
            gameOver = true;
        }
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawShape(currentShape, shapeX, shapeY);
}

function gameLoop() {
    if (!gameOver) {
        update();
        render();
        setTimeout(gameLoop, 500);
    } else {
        alert("Game Over!");
    }
}

document.addEventListener("keydown", event => {
    if (gameOver) return;

    if (event.key === "ArrowLeft" && canMove(currentShape.shape, shapeX - 1, shapeY)) {
        shapeX--;
    } else if (event.key === "ArrowRight" && canMove(currentShape.shape, shapeX + 1, shapeY)) {
        shapeX++;
    } else if (event.key === "ArrowDown" && canMove(currentShape.shape, shapeX, shapeY + 1)) {
        shapeY++;
    } else if (event.key === "ArrowUp") {
        const rotatedShape = rotateShape(currentShape.shape);
        if (canMove(rotatedShape, shapeX, shapeY)) {
            currentShape.shape = rotatedShape;
        }
    }
});

gameLoop();
