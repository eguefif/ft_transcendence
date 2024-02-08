var board = document.getElementById("board");
var ctx =  board.getContext("2d");
let counter1 = document.getElementById("player1_score");
let counter2 = document.getElementById("player2_score");
let counterState1 = Number(counter1.innerText);
let counterState2 = Number(counter2.innerText);

var game_active = false;
const player1 = 1;
const player2 = 2;
const paddle_margin_x = 15;
const paddle_margin_y = 10
const paddle_speed = 3;
var lastPlayerToScore = player1;

class Vector {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
    norm(){
        var mag = Math.sqrt((this.x * this.x) + (this.y * this.y));
        
        if (mag != 0)
        {
            this.x /= mag;
            this.y /= mag;
        }
    }
}

class Paddle {
    constructor(player)
    {
        this.y = board.height / 2;
        this.halfPaddleHeight = 30;
        this.top = this.y + this.halfPaddleHeight;
        this.bottom = this.y - this.halfPaddleHeight;
        this.move_up = false;
        this.move_down = false;
        if (player == player1)//ASSUMING THERE ARE 2 PLAYERS
            this.x = paddle_margin_x;
        else if (player == player2)
            this.x = board.width - paddle_margin_x;
    }

    draw(){
        ctx.moveTo(this.x, this.top);
        ctx.lineTo(this.x, this.bottom);
        ctx.stroke();
    }

    move(){
        if (this.top >= board.height - paddle_margin_y)
            this.move_down = false;
        else if (this.bottom <= paddle_margin_y)
            this.move_up = false;

        if (this.move_up)
            this.y -= paddle_speed;
        else if (this.move_down)
            this.y += paddle_speed;
        
        this.top = this.y + this.halfPaddleHeight;
        this.bottom = this.y - this.halfPaddleHeight;
    }
    loop(){
        this.move();
        this.draw();
    }

}

//MOST COLLISION LOGIC IS IN HERE
class Ball {

    constructor(x, y, radius, speed, dir, paddle1, paddle2){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.dir = dir;
        this.dir.norm();
        this.paddle_1 = paddle_1;
        this.paddle_2 = paddle_2;
    }
    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.stroke();
    }
    move(){
        this.x += this.speed * this.dir.x;
        this.y += this.speed * this.dir.y;
    }
    checkCollision(){
        if (this.x >= board.width - this.radius) //GOAL COLLISION
        {
            this.speed = 0;
            counter1.innerText = ++counterState1;
            lastPlayerToScore = player1;
            game_active = false;
        }
        else if (this.x <= 0 + this.radius) //GOAL COLLISION
        {
            this.speed = 0;
            counter2.innerText = ++counterState2;
            lastPlayerToScore = player2;
            game_active = false;
        }
        //WALL COLLISION
        if (this.y <= this.radius || this.y >= board.height - this.radius)
            this.dir.y *= -1;
        //PADDLE COLLISION
        if (((this.x <= paddle_margin_x + this.radius) && (this.y < this.paddle_1.top + this.radius) && (this.y  > this.paddle_1.bottom  - this.radius))
                || ((this.x >= board.width - paddle_margin_x - this.radius) && (this.y  < this.paddle_2.top  + this.radius) && (this.y  > this.paddle_2.bottom  - this.radius)))
            this.dir.x *= -1;
    }
    loop(){
        this.checkCollision();
        this.move();
        this.draw();
    }
    follow_loser_paddle(){
        if (lastPlayerToScore == player1)
        {
            this.x = this.paddle_2.x - (2 * this.radius);
            this.y = this.paddle_2.y;
        }
        if (lastPlayerToScore == player2)
        {
            this.x = this.paddle_1.x + (2 * this.radius);
            this.y = this.paddle_1.y;
        }
    }
    inactive_loop(){
        this.follow_loser_paddle();
        this.draw();
    }

}

document.addEventListener("keydown", (e) => {
    if (e.key == 'ArrowDown')
        paddle_2.move_down = true;
    else if (e.key == 'ArrowUp') 
        paddle_2.move_up = true;
});
document.addEventListener("keyup", (e) => {
    if (e.key == 'ArrowDown')
        paddle_2.move_down = false;
    else if (e.key == 'ArrowUp') 
        paddle_2.move_up = false;
});

document.addEventListener("keydown", (e) => {
    if (e.code == 'KeyS')
        paddle_1.move_down = true;
    else if (e.code == 'KeyW') 
        paddle_1.move_up = true;
});
document.addEventListener("keyup", (e) => {
    if (e.code == 'KeyS')
        paddle_1.move_down = false;
    else if (e.code == 'KeyW') 
        paddle_1.move_up = false;
});
document.addEventListener("keyup", (e) => {
    if (e.code == 'Space' && !game_active)
        play();
});

function gameloop(){
    ctx.clearRect(0,0,board.width, board.height);
    if (game_active)
    {
        ball.loop();
        paddle_1.loop();
        paddle_2.loop();
    }
    else
    {
        // ball.inactive_loop();
        paddle_1.loop();
        paddle_2.loop();

    }
    window.requestAnimationFrame(gameloop);
}

function play(){
    var start_decalage = board.width / 4;
    var dir = new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);
    if (dir.x > 0)
        start_decalage *= -1;
    dir.x = Math.min(dir.x, 0.5);
    ball = new Ball(board.width / 2 + start_decalage, board.height / 2, 10, 6, dir, paddle_1, paddle_2);
    game_active = true;
}

var paddle_1 = new Paddle(player1);
var paddle_2 = new Paddle(player2);
paddle_1.draw();
paddle_2.draw();

var animation = window.requestAnimationFrame(gameloop);