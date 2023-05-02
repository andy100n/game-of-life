/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

const CANVAS_HEIGHT = canvas.height = screen.height;
const CANVAS_WIDTH = canvas.width = screen.width;

const refineDegree = 6; // multiples of 96
const rectSize = 96 / refineDegree;
const maxTime = 10;

var rectangles = [];
var grid = new Array(CANVAS_HEIGHT / rectSize);
for (let i = 0; i < CANVAS_HEIGHT / rectSize; i++) {
    grid[i] = new Array(CANVAS_WIDTH / rectSize);
}

class Rectangle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
};

function fitCoord(c) {
    return Math.floor(c / rectSize);
}

addEventListener("mousedown", (event) => {
    let curPos = [fitCoord(event.clientX), fitCoord(event.clientY)]

    if (grid[curPos[1]][curPos[0]] != 1) {
        grid[curPos[1]][curPos[0]] = 1;
        rectangles.push(new Rectangle(curPos[0], curPos[1]));
        ctx.fillRect(curPos[0] * rectSize, curPos[1] * rectSize, rectSize, rectSize)
    }
    else {
        grid[curPos[1]][curPos[0]] = null;
        rectangles.forEach(r => {
            if (r.x == curPos[0] && r.y == curPos[1]) {
                rectangles.splice(rectangles.indexOf(r), 1);
                return;
            }
        });
        ctx.clearRect(curPos[0] * rectSize, curPos[1] * rectSize, rectSize, rectSize);
    }
});

var notRunning = true;
addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        notRunning = notRunning ? false : true;
        run();
    }
});

function checkCell(x, y) {
    let livingCellsCounter = 0;

    for (let i = parseInt(y - 1); i <= parseInt(y + 1); i++) {
        for (let j = parseInt(x - 1); j <= parseInt(x + 1); j++) {
            if (!(i == y && j == x)) {
                livingCellsCounter += Number(grid[i][j] == 1);

                if(livingCellsCounter > 3){
                    i = y+2;
                    j = x+2;
                }
            }
        }
    }

    if (grid[y][x] == 1 && (livingCellsCounter <= 1 || livingCellsCounter > 3)) {
        return true;
    }
    else if (grid[y][x] != 1 && livingCellsCounter == 3) {
        return true;
    }
    return false;
}

grid[2][2] = 1;
checkCell(1,2);


var changed = [];
var checked = [];
var time = 0;

function run() {
    if (notRunning) {
        return;
    }
    if (time > maxTime) {
        rectangles.forEach(r => {

            let y = r.y;
            let x = r.x;
            let presentChecked = false;
            for (let i = y - 1; i <= y + 1; i++) {
                for (let j = x - 1; j <= x + 1; j++) {
                    checked.forEach(c => {
                        if (c.x == j && c.y == i) {
                            presentChecked = true;
                            return;
                        }
                    });
                    if (presentChecked) {
                        presentChecked = false;
                        continue;
                    }

                    if (checkCell(j, i)) {
                        changed.push(new Rectangle(j, i));
                    }

                    checked.push(new Rectangle(j, i));
                }
            }
        });

        var presentChanged = false; // false for push, true for remove       
        changed.forEach(c => {
            rectangles.forEach(r => {
                if (r.x == c.x && r.y == c.y) {

                    rectangles.splice(rectangles.indexOf(r), 1);
                    ctx.clearRect(r.x * rectSize, r.y * rectSize, rectSize, rectSize);
                    grid[c.y][c.x] = null;

                    presentChanged = true;
                    return;
                }
            })
            if (!presentChanged) {
                rectangles.push(c);
                ctx.fillRect(c.x * rectSize, c.y * rectSize, rectSize, rectSize);
                grid[c.y][c.x] = 1;
            }
            presentChanged = false;
        });

        changed = [];
        checked = [];
        time = 0;
    }

    time++;
    requestAnimationFrame(run);
};