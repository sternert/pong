FpsWriter = function () {
    var currentFps = $("#fps");
    var possibleFps = $("#possibleFps");

    var prevTime = Date.now();
    this.possibleTimeSum = 0.0;
    var frames = 0;

    this.updateFps = function () {
        var currentTime = Date.now();
        ms = currentTime - prevTime;
        frames++;

        if (currentTime > prevTime + 1000) { // One second since last update
            var fps = Math.round((frames * 1000) / (currentTime - prevTime));

            var timePerLogicUpdate = this.possibleTimeSum / frames;
            var possible = 1.0 / timePerLogicUpdate;
            currentFps.html("" + fps);
            possibleFps.html("" + possible);

            prevTime = currentTime;
            frames = 0;
            this.possibleTimeSum = 0.0;
        }
    }
}

Wall = function () {
    this.positionY = 0;
    this.size = 20;

    this.draw = function (table) {
        table.context.lineWidth = this.size;
        table.context.beginPath();
        table.context.moveTo(0, this.positionY);
        table.context.lineTo(table.canvasWidth, this.positionY);
        table.context.stroke();
    }
}

Ball = function () {
    this.direction = [0, 0];
    this.position = [0, 0];
    this.speed = 2;
    this.size = 10;
    this.reachedEnd = 0;

    this.setStart = function (posX, posY) {
        this.position = [posX, posY];
        var angle = Math.random() * Math.PI * 2;
        this.direction = [Math.cos(angle), Math.sin(angle)];
    }
    this.draw = function (table) {
        table.context.beginPath();
        table.context.arc(this.position[0], this.position[1], this.size, 0, 2 * Math.PI, false);
        table.context.fill();
    }

    this.update = function (table, walls, paddles) {
        this.position[0] += this.direction[0] * this.speed;
        this.position[1] += this.direction[1] * this.speed;
        // Collision against walls
        if (this.position[1] < this.size + walls[0].size) {
            this.position[1] = (this.size + walls[0].size) +
                (this.size + walls[0].size - this.position[1]);
            this.direction[1] *= -1;
        } else if (this.position[1] > table.canvasHeight - walls[1].size - this.size) {
            this.position[1] = (table.canvasHeight - walls[1].size - this.size) +
                (table.canvasHeight - walls[1].size - this.size - this.position[1]);
            this.direction[1] *= -1;
        }

        // Collision against Paddles
        if (this.position[0] < this.size + paddles[0].width) { // At Player edge
            if (this.position[1] < paddles[0].positionY + paddles[0].halfLength && this.position[1] > paddles[0].positionY - paddles[0].halfLength) {
                this.position[0] = (this.size + paddles[0].width) +
                (this.size + paddles[0].width - this.position[0]);
                this.direction[0] *= -1;
            }
        } else if (this.position[0] > table.canvasWidth - this.size - paddles[1].width) { // At AI edge
            if (this.position[1] < paddles[1].positionY + paddles[1].halfLength) {
                if (this.position[1] > paddles[1].positionY - paddles[1].halfLength) {
                    this.position[0] = (table.canvasWidth - paddles[1].width - this.size) +
                        (table.canvasWidth - paddles[1].width - this.size - this.position[0]);
                    this.direction[0] *= -1;
                }
            }
        }

        // Reaching end walls
        if (this.position[0] < this.size) { // At left edge
            this.direction[0] = 0;
            this.direction[1] = 0;
            this.reachedEnd = -1;
        } else if (this.position[0] > table.canvasWidth - this.size) { // At right edge
            this.direction[0] = 0;
            this.direction[1] = 0;
            this.reachedEnd = 1;
        }
    }
}

Table = function () {
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    this.context = null;

    this.initTable = function () {
        var canvasTag = $("#regularPongCanvas");
        this.canvasWidth = canvasTag.width();
        this.canvasHeight = canvasTag.height();
        this.context = canvasTag[0].getContext("2d");
    }

    this.clearCanvas = function () {
        this.context.fillStyle = "#000";
        this.context.lineWidth = 1;
        this.context.strokeStyle = '#000';
        this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    this.initTable();
    this.clearCanvas();
}

Paddle = function (paddleName, isAi) {
    this.name = paddleName;
    this.direction = 0;
    this.positionY = 200;
    this.positionX = 200;
    this.speed = 1;
    this.halfLength = 40;
    this.width = 20;
    this.isAi = isAi;

    this.toString = function () {
        return
        "Paddle: " + this.name +
        ", speed = " + this.speed * this.direction +
        ", positionY = " + this.positionY +
        ", size = " + this.halfLength;
    }

    this.getSpeed = function () {
        return this.speed * this.direction;
    }

    this.draw = function (table) {
        table.context.lineWidth = this.width;
        table.context.strokeStyle = '#000';
        table.context.beginPath();
        table.context.moveTo(this.positionX, this.positionY - this.halfLength);
        table.context.lineTo(this.positionX, this.positionY + this.halfLength);
        table.context.stroke();
    }

    this.update = function (table, walls) {
        var currentY = this.positionY + this.direction * this.speed;
        if (currentY - this.halfLength < walls[0].size) {
            currentY = this.halfLength + walls[0].size;
            if (this.isAi) {
                this.direction *= -1;
            }
        } else if (currentY + this.halfLength > table.canvasHeight - walls[1].size) {
            currentY = table.canvasHeight - this.halfLength - walls[1].size;
            if (this.isAi) {
                this.direction *= -1;
            }
        }
        this.positionY = currentY;
    }
}

Game = function (gameName) {
    var table = null;
    var player = null;
    var ai = null;
    var fpsWriter = null;
    var walls = [null, null];
    var ball = null;
    var paddles = [null, null];
    var fps = 200;
    var isRunning = false;

    var initGame = function () {
        table = new Table();

        player = new Paddle("Player");
        //player.positionX = player.width / 2;
        player.positionX = table.canvasWidth - player.width / 2;
        ai = new Paddle("AI", true);
        ai.positionX = ai.width / 2;
        //ai.positionX = table.canvasWidth - ai.width / 2;
        ai.direction = Math.random() < 0.5 ? -1 : 1; // Sets a beginning random direction for AI
        paddles[1] = player;
        paddles[0] = ai;
        fpsWriter = new FpsWriter();
        walls[0] = new Wall();
        walls[0].positionY = walls[0].size / 2;
        walls[1] = new Wall();
        walls[1].positionY = table.canvasHeight - walls[1].size / 2;
        ball = new Ball();
        ball.setStart(table.canvasWidth / 2, table.canvasHeight / 2);

        document.addEventListener("keydown", keyDownHandler, false);
        document.addEventListener("keyup", keyUpHandler, false);
    }

    this.initGamePublic = function () {
        initGame();
    }

    var update = function () {
        player.update(table, walls);
        ai.update(table, walls);
        ball.update(table, walls, paddles);
    }
    var draw = function () {
        table.clearCanvas();
        walls[0].draw(table);
        walls[1].draw(table);
        ball.draw(table);
        player.draw(table);
        ai.draw(table);
    }

    var checkVictoryConditions = function () {
        if (ball.reachedEnd != 0) {
            if (ball.reachedEnd > 0) {
                console.log("Left player wins!");
            } else {
                console.log("Right player wins!");
            }
            stopGame();
            initGame();
        }
    }

    var run = function () {
        var start = Date.now();
        update();
        draw();
        var time = Date.now() - start;
        fpsWriter.possibleTimeSum += time / 1000;
        fpsWriter.updateFps();

        checkVictoryConditions();
    }

    var startGame = function () {
        this._intervalId = setInterval(run, 1000 / fps);
        console.log("Game started!");
        isRunning = true;
    }

    var stopGame = function () {
        clearInterval(this._intervalId);
        console.log("Game stopped!");
        isRunning = false;
    }

    var keyDownHandler = function (event) {
        switch (event.keyCode) {
            // key code for up arrow
            case 38:
                //console.log('up arrow key pressed!');
                player.direction = -1;
                break;
                // key code for down arrow
            case 40:
                //console.log('down arrow key pressed!');
                player.direction = 1;
                break;
        }
    }

    var keyUpHandler = function (event) {
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
                // key code for down arrow
            case 40:
                player.direction = 0;
                break;
        }
    }
}

var pongGame = new Game("Regular Pong");
pongGame.initGamePublic();