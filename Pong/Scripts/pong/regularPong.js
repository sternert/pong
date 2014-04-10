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
    context.arc(xPos, yPos, 10, 0, 2 * Math.PI, false);
    context.fill();
}

var drawPaddles = function (leftYPos, leftHalfSize, rightYPos, rightHalfSize) {
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(3, leftYPos - leftHalfSize);
    context.lineTo(3, leftYPos + leftHalfSize);
    context.stroke();
    context.beginPath();
    context.moveTo(tableWidth - 3, rightYPos - rightHalfSize);
    context.lineTo(tableWidth - 3, rightYPos + rightHalfSize);
    context.stroke();

}

Game.update = function () {

}

Game.draw = function () {
    clearCanvas();
    drawWalls();
    drawBall(40, 100);
    drawPaddles(50, 20, 250, 20);
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

var keyDownHandler = function (event) {
    switch (event.keyCode) {
        // key code for up arrow
        case 38:
            console.log('up arrow key pressed!');
            break;

            // key code for down arrow
        case 40:
            console.log('down arrow key pressed!');
            break;
    }
}

function keyUpHandler(event) {
    switch (event.keyCode) {
        // key code for up arrow
        case 38:
            console.log('up arrow key released!');
            break;

            // key code for down arrow
        case 40:
            console.log('down arrow key released!');
            break;
    }
}

Game._intervalId = setInterval(Game.run, 1000 / Game.fps);
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);