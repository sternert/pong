var canvasWidth = 600;
var canvasHeight = 400;
var tableWidth = 600;
var tableHeight = 380;

var Game = new Object();

var canvas = document.getElementById("regularPongCanvas");
var context = canvas.getContext("2d");

var currentFps = $("#fps");
var possibleFps = $("#possibleFps");

var prevTime = Date.now();
var possibleTimeSum = 0.0;
var frames = 0;

var playerDirection = 0;
var aiDirection = 0;
var playerPaddleY = 200;
var aiPaddleY = 200;
var playerSpeed = 2;
var aiSpeed = 2;
var playerPaddleHalfSize = 20;
var aiPaddleHalfSize = 60;

var updateFps = function () {
    var currentTime = Date.now();
    ms = currentTime - prevTime;
    frames++;

    if (currentTime > prevTime + 1000) { // One second since last update
        var fps = Math.round((frames * 1000) / (currentTime - prevTime));

        var timePerLogicUpdate = possibleTimeSum / frames;
        var possible = 1.0 / timePerLogicUpdate;
        currentFps.html("" + fps);
        possibleFps.html("" + possible);

        prevTime = currentTime;
        frames = 0;
        possibleTimeSum = 0.0;
    }
}

var clearCanvas = function () {
    context.fillStyle = "#000";
    context.lineWidth = 1;
    context.strokeStyle = '#000';
    context.clearRect(0, 0, 600, 400);
}

var drawWalls = function () {
    context.lineWidth = 10;
    context.beginPath();
    context.moveTo(0, 5);
    context.lineTo(600, 5);
    context.stroke();
    context.beginPath();
    context.moveTo(0, 395);
    context.lineTo(600, 395);
    context.stroke();
    context.lineWidth = 1;
}

var drawBall = function (xPos, yPos) {
    context.beginPath();
    context.arc(xPos, yPos, 20, 0, 2 * Math.PI, false);
    context.fill();
}

var drawPaddles = function (leftYPos, leftHalfSize, rightYPos, rightHalfSize) {
    context.lineWidth = 5;
    context.strokeStyle = '#B00';
    context.beginPath();
    context.moveTo(3, leftYPos - leftHalfSize);
    context.lineTo(3, leftYPos + leftHalfSize);
    context.stroke();
    context.strokeStyle = '#00B';
    context.beginPath();
    context.moveTo(tableWidth - 3, rightYPos - rightHalfSize);
    context.lineTo(tableWidth - 3, rightYPos + rightHalfSize);
    context.stroke();
    context.strokeStyle = '#000';
}

var moveAi = function () {
    if (aiDirection == 0) {
        aiDirection = Math.random() < 0.5 ? -1 : 1;
    }
    var currentY = aiPaddleY + aiDirection * aiSpeed;
    if (currentY - aiPaddleHalfSize < 10) {
        currentY = aiPaddleHalfSize + 10;
        aiDirection = 1;
    } else if (currentY + aiPaddleHalfSize > tableHeight + 10) {
        currentY = tableHeight - aiPaddleHalfSize + 10;
        aiDirection = -1;
    }
    aiPaddleY = currentY;
}

var movePlayer = function () {
    var currentY = playerPaddleY;
    if (playerDirection != 0) {
        currentY = currentY + playerDirection * playerSpeed;
        if (currentY - playerPaddleHalfSize < 10) {
            currentY = playerPaddleHalfSize + 10;
        } else if (currentY + playerPaddleHalfSize > tableHeight + 10) {
            currentY = tableHeight - playerPaddleHalfSize + 10;
        }
    }
    playerPaddleY = currentY;
}

var movePaddles = function () {
    movePlayer();
    moveAi();
}

var moveBall = function () {

}

var calculateOutcome = function () {

}

Game.update = function () {
    movePaddles();
    moveBall();
    calculateOutcome();
}

Game.draw = function () {
    clearCanvas();
    drawWalls();
    drawBall(40, playerPaddleY);
    drawPaddles(playerPaddleY, playerPaddleHalfSize, aiPaddleY, aiPaddleHalfSize);
}

Game.fps = 90;

Game.run = function () {
    var start = Date.now();
    Game.update();
    Game.draw();
    var time = Date.now() - start;
    possibleTimeSum += time / 1000;

    updateFps();
};

var isRunning = false;

var startGame = function () {
    Game._intervalId = setInterval(Game.run, 1000 / Game.fps);
    console.log("Game started!");
    isRunning = true;
}

var stopGame = function () {
    clearInterval(Game._intervalId);
    console.log("Game stopped!");
    isRunning = false;
}

var keyDownHandler = function (event) {
    switch (event.keyCode) {
        // key code for up arrow
        case 38:
            //console.log('up arrow key pressed!');
            playerDirection = -1;
            break;
        // key code for down arrow
        case 40:
            //console.log('down arrow key pressed!');
            playerDirection = 1;
            break;
    }
}

function keyUpHandler(event) {
    switch (event.keyCode) {
        // key code for Enter key
        case 13: 
            if (isRunning) {
                stopGame();
            } else {
                startGame();
            }
            break;
        // key code for up arrow
        case 38:
            //console.log('up arrow key released!');
            playerDirection = 0;
            break;
        // key code for down arrow
        case 40:
            //console.log('down arrow key released!');
            playerDirection = 0;
            break;
    }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);