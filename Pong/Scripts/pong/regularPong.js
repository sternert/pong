
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            return window.setTimeout(callback, 1000 / 60);
        };
})();

function Vec2(x, y) {
    this.x = x;
    this.y = y;
    this.getLength = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    this.normalize = function () {
        var length = this.getLength();
        this.x = this.x / length;
        this.y = this.y / length;
    };
    this.getAngle = function () {
        return Math.acos( this.x / this.getLength());
    };
}

Wall = function (positionY, size) {
    this.size = size;
    this.positionY = positionY;

    this.draw = function (table) {
        table.context.lineWidth = size;
        table.context.beginPath();
        table.context.moveTo(0, positionY);
        table.context.lineTo(table.canvasWidth, positionY);
        table.context.stroke();
    }
}

Ball = function () {
    this.direction = new Vec2(1, 0);
    this.position = new Vec2(0, 0);
    this.speed = 4.0;
    this.velocity = new Vec2(this.speed * this.direction.x, this.speed * this.direction.y);
    this.size = 10;
    this.reachedEnd = 0;
    this.bounces = 0;

    this.updateVelocity = function () {
        this.velocity.x = this.speed * this.direction.x;
        this.velocity.y = this.speed * this.direction.y;
    }

    this.setStart = function (posX, posY) {
        this.position.x = posX;
        this.position.y = posY;
        var angle = Math.random(); // Distribute only in one radian, first quarter to the right, second to the right
        if (angle > 0.5) { // second quarter modified to go opposite the first
            angle += 0.5;
        }
        angle -= 0.25; // Should be distributed from the middle of the board'
        angle *= Math.PI;
        this.direction.x = Math.cos(angle);
        this.direction.y = Math.sin(angle);
        this.direction.normalize();
        this.updateVelocity();
        var angleNew = this.direction.getAngle();
        this.bounces = 0;
    }
    this.draw = function (table) {
        table.context.beginPath();
        table.context.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI, false);
        table.context.fill();
    }

    this.update = function (table, walls, paddles) {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        // Collision against walls
        if (this.position.y < this.size + walls[0].size) {
            this.position.y = (this.size + walls[0].size) +
                (this.size + walls[0].size - this.position.y);
            this.direction.y *= -1;
            this.updateVelocity();
        } else if (this.position.y > table.canvasHeight - walls[1].size - this.size) {
            this.position.y = (table.canvasHeight - walls[1].size - this.size) +
                (table.canvasHeight - walls[1].size - this.size - this.position.y);
            this.direction.y *= -1;
            this.updateVelocity();
        }

        // Collision against Paddles
        if (this.position.x < this.size + paddles[0].width) { // At Player edge
            var offset = paddles[0].positionY - this.position.y;
            if (Math.abs(offset) < paddles[0].halfLength + this.size) {
                this.position.x = (this.size + paddles[0].width) +
                (this.size + paddles[0].width - this.position.x);
                this.direction.x *= -1;
                this.direction.y += (paddles[0].speed * paddles[0].direction) / 5;
                this.direction.normalize();
                this.updateVelocity();
                this.bounces++;
            }
        } else if (this.position.x > table.canvasWidth - this.size - paddles[1].width) { // At AI edge
            var offset = paddles[1].positionY - this.position.y;
            if (Math.abs(offset) < paddles[1].halfLength + this.size) {
                if (this.position.y > paddles[1].positionY - paddles[1].halfLength) {
                    this.position.x = (table.canvasWidth - paddles[1].width - this.size) +
                        (table.canvasWidth - paddles[1].width - this.size - this.position.x);
                    this.direction.x *= -1;
                    this.direction.y += (paddles[1].speed * paddles[1].direction) / 5;
                    this.direction.normalize();
                    this.updateVelocity();
                    this.bounces++;
                }
            }
        }

        // Reaching end walls
        if (this.position.x < this.size) { // At left edge
            this.direction.x = 0;
            this.direction.y = 0;
            this.velocity.x = 0;
            this.velocity.y = 0;
            this.reachedEnd = -1;
        } else if (this.position.x > table.canvasWidth - this.size) { // At right edge
            this.direction.x = 0;
            this.direction.y = 0;
            this.velocity.x = 0;
            this.velocity.y = 0;
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
    this.speed = 6.0;
    this.halfLength = 40;
    this.width = 10;
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

    this.update = function (table, walls, ball) {
        var currentY = this.positionY + this.direction * this.speed;
        if (currentY - this.halfLength < walls[0].size) {
            currentY = this.halfLength + walls[0].size;
        } else if (currentY + this.halfLength > table.canvasHeight - walls[1].size) {
            currentY = table.canvasHeight - this.halfLength - walls[1].size;
        }
        this.positionY = currentY;
        if (this.isAi) {
            var offset = ball.position.y - currentY;
            if (Math.abs(offset) > this.halfLength / 2) {
                this.direction = offset / Math.abs(offset);
            } else {
                this.direction = 0;
            }
        }
    }
};

Menu = function () {
    this.currentMenu = "main";
    
    this.draw = function (table, bounces) {
        table.context.globalAlpha = 0.2;
        table.context.fillRect(0, 0, table.canvasWidth, table.canvasHeight);
        table.context.globalAlpha = 1;

        if (this.currentMenu === "main") {
            table.context.font = "60px Georgia";
            table.context.textAlign = 'center';
            table.context.fillText("PONG IT!", table.canvasWidth / 2, table.canvasHeight / 4);
            table.context.font = "20px Georgia";
            table.context.fillText("Press Enter to Start new game", table.canvasWidth / 2, table.canvasHeight / 3);
            table.context.font = "15px Georgia";
            table.context.fillText("W & S or UP & DOWN to move", table.canvasWidth / 2, table.canvasHeight / 3 + 30);
            table.context.fillText("'P' to pause", table.canvasWidth / 2, table.canvasHeight / 2 + 50);
            table.context.fillText("'F' to show fps", table.canvasWidth / 2, table.canvasHeight / 2 + 50 + 20);
            table.context.fillText("'M' to toggle menu", table.canvasWidth / 2, table.canvasHeight / 2 + 50 + 40);
            table.context.fillText("Different play modes:", table.canvasWidth / 2, table.canvasHeight / 2 + 50 + 40 + 20);
            table.context.font = "10px Georgia";
            table.context.fillText("'1': Control left paddle, play against slow AI", table.canvasWidth / 2, table.canvasHeight / 2 + 50 + 40 + 35);
            table.context.fillText("'2': Control left paddle, play against fast AI", table.canvasWidth / 2, table.canvasHeight / 2 + 50 + 40 + 50);
            table.context.fillText("'3': Control left paddle, lose against AI", table.canvasWidth / 2, table.canvasHeight / 2 + 50 + 40 + 65);
            table.context.fillText("'4': Control both paddles, reach as far as you can", table.canvasWidth / 2, table.canvasHeight / 2 + 50 + 40 + 80);
        } else if (this.currentMenu === "score-player-player") {
            table.context.font = "50px Georgia";
            table.context.textAlign = 'center';
            table.context.fillText("Congratulations!", table.canvasWidth / 2, table.canvasHeight / 4);
            table.context.font = "15px Georgia";
            table.context.fillText("You reached " + bounces + " bounces solo", table.canvasWidth / 2, table.canvasHeight / 3 + 30);
            table.context.fillText("Press Enter to start a new game", table.canvasWidth / 2, table.canvasHeight / 2 + 50);
        } else if (this.currentMenu === "score-ai-win") {
            table.context.font = "40px Georgia";
            table.context.textAlign = 'center';
            table.context.fillText("I'm so sorry! You lost against AI", table.canvasWidth / 2, table.canvasHeight / 4);
            table.context.font = "15px Georgia";
            table.context.fillText("You reached " + bounces + " bounces", table.canvasWidth / 2, table.canvasHeight / 3 + 30);
            table.context.fillText("Press Enter to start a new game", table.canvasWidth / 2, table.canvasHeight / 2 + 50);
        } else if (this.currentMenu === "score-player-win") {
            table.context.font = "40px Georgia";
            table.context.textAlign = 'center';
            table.context.fillText("Congratulations!", table.canvasWidth / 2, table.canvasHeight / 4);
            table.context.font = "15px Georgia";
            table.context.fillText("You reached " + bounces + " bounces and WON against AI", table.canvasWidth / 2, table.canvasHeight / 3 + 30);
            table.context.fillText("Press Enter to start a new game", table.canvasWidth / 2, table.canvasHeight / 2 + 50);
        }
    };
};

Game = function (gameName) {
    var table = null;
    var player = null;
    var ai = null;
    var walls = [null, null];
    var ball = null;
    var paddles = [null, null];
    var fps = 60;
    var isRunning = false;
    var speedUpdateCounter = 0;
    var isMenuShowing = false;
    var isFpsShowing = false;
    var menu = null;
    var fpsmeter = null;
    var playMode = 1;

    menu = new Menu();
    fpsmeter = new FPSMeter({ decimals: 0, graph: true, theme: 'transparent', left: '5px' });
    fpsmeter.hide();

    var initGame = function () {
        table = new Table();

        player = new Paddle("Player");
        player.positionX = player.width / 2;
        if (playMode === 4) {
            ai = new Paddle("AI", false);
        } else {
            ai = new Paddle("AI", true);
            ai.speed = 5.0 * playMode;
        }
        ai.positionX = table.canvasWidth - ai.width / 2;
        paddles[0] = player;
        paddles[1] = ai;
        walls[0] = new Wall(10, 20); // Position half of size so all of it shows on canvas
        walls[1] = new Wall(table.canvasHeight - 10, 20);
        ball = new Ball();
        ball.setStart(table.canvasWidth / 2, table.canvasHeight / 2);
        document.addEventListener("keydown", keyDownHandler, false);
        document.addEventListener("keyup", keyUpHandler, false);
        document.addEventListener("keypress", menuHandler, false);
    }

    this.initGamePublic = function () {
        initGame();
    }

    var update = function () {
        if (isRunning) {
            player.update(table, walls, ball);
            ai.update(table, walls, ball);
            ball.update(table, walls, paddles);

            updateSpeedOfBall();
            checkVictoryConditions();
        }
    }
    var draw = function () {
        table.clearCanvas();
        walls[0].draw(table);
        walls[1].draw(table);
        ball.draw(table);
        player.draw(table);
        ai.draw(table);
        if (isMenuShowing) {
            menu.draw(table, ball.bounces);
        }
    }

    var checkVictoryConditions = function () {
        if (ball.reachedEnd != 0) {
            ball.reachedEnd = 0;
            stopGame();
            if (playMode === 4) {
                menu.currentMenu = "score-player-player";
            } else if (ball.reachedEnd > 0) {
                menu.currentMenu = "score-player-win";
            } else {
                menu.currentMenu = "score-ai-win";
            }
            isMenuShowing = true;
        }
    }

    var updateSpeedOfBall = function () {
        if (speedUpdateCounter > fps * 5) {
            speedUpdateCounter = 0;
            ball.speed *= 1.1;
            console.log("Ball speed increase! Current: " + ball.speed);
        } else {
            speedUpdateCounter++;
        }
    }


    var startGame = function () {
        function frame() {
            fpsmeter.tickStart();
            update();
            draw();
            if (isRunning) {
                requestAnimationFrame(frame);
            }
            fpsmeter.tick();
        }

        console.log("Game started!");
        isRunning = true;
        requestAnimationFrame(frame);
    }

    var stopGame = function () {
        isRunning = false;
    }

    var keyDownHandler = function (event) {
        switch (event.keyCode) {
            // key code for up arrow
            case 38:
                //console.log('up arrow key pressed!');
                player.direction = -1;
                if (playMode === 4) {
                    ai.direction = -1;
                }
                break;
                // key code for down arrow
            case 40:
                //console.log('down arrow key pressed!');
                player.direction = 1;
                if (playMode === 4) {
                    ai.direction = 1;
                }
                break;
        }
    }

    var keyUpHandler = function (event) {
        switch (event.keyCode) {
                // key code for up arrow
            case 38:
                // key code for down arrow
            case 40:
                player.direction = 0;
                if (playMode === 4) {
                    ai.direction = 0;
                }
                break;
        }
    }

    var menuHandler = function (event) {
        var charCode = (typeof event.which == "number") ? event.which : event.keyCode;
        console.log("KeyPress = " + charCode);
        switch (event.keyCode) {
            // key code for up arrow
            case 38:
                if (isMenuShowing) {
                    console.log('up arrow key pressed!');
                }
                break;
                // key code for down arrow
            case 40:
                if (isMenuShowing) {
                    console.log('down arrow key pressed!');
                }
                break;
            case 49:
                playMode = 1;
                break;
            case 50:
                playMode = 2;
                break;
            case 51:
                playMode = 3;
                break;
            case 52:
                playMode = 4;
                break;
            case 77:
            case 109:
                toggleMenu();
                initGame();
                break;
            case 70:
            case 102:
                if (isFpsShowing) {
                    fpsmeter.hide();
                    isFpsShowing = false;
                } else {
                    fpsmeter.show();
                    isFpsShowing = true;
                }
                break;
                // key code for Enter key
            case 13:
            case 80:
            case 112:
                if (isMenuShowing) {
                    toggleMenu();
                    initGame();
                }
                if (isRunning) {
                    stopGame();
                } else {
                    startGame();
                }
                break;
        }
    };

    var toggleMenu = function (isScoreMenu) {
        if (isMenuShowing) { // Show game instead.
            //draw();
            isMenuShowing = false;
        } else if (isScoreMenu) { // Show score menu
            isMenuShowing = true;
            //draw();
            //menu.draw(table, ball.bounces);
        } else { // Show regular menu
            isMenuShowing = true;
            //draw();
            //menu.draw(table);
        };
    }

    this.toggleMenuPublic = function () {
        toggleMenu();
        draw();
    };
}

var pongGame = new Game("Regular Pong");
pongGame.initGamePublic();
pongGame.toggleMenuPublic();