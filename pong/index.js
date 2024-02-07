var board = document.getElementById("board");
var ctx =  board.getContext("2d");
const player1 = 1;
const player2 = 2;
const paddle_margin_x = 15;
const paddle_margin_y = 10

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
        // this.height = height;
        // this.width = width;
        this.y = board.height / 2;
        this.paddleHeight = 60;
        this.top = this.y + (this.paddleHeight / 2);
        this.bottom = this.y - (this.paddleHeight / 2);
        this.move_up = false;
        this.move_down = false;
        if (player == player1)
        {
            this.x = paddle_margin_x;
        }
        else if (player == player2)
        {
            this.x = board.width - paddle_margin_x;
        }
    }

    draw(){
        ctx.moveTo(this.x, this.y - this.paddleHeight / 2);
        ctx.lineTo(this.x, this.y + this.paddleHeight / 2);
        ctx.stroke();
    }

    move(){
        if (this.y + (paddle_1.paddleHeight / 2)>= board.height - paddle_margin_y)
            this.move_down = false;
        else if (this.y - (paddle_1.paddleHeight / 2) <= paddle_margin_y)
            this.move_up = false;

        if (this.move_up)
            this.y -= 3;
        if (this.move_down)
            this.y += 3;
        this.top = this.y + (this.paddleHeight / 2);
        this.bottom = this.y - (this.paddleHeight / 2);

    }
    loop(){
        this.move();
        this.draw();
    }

}

class Ball {

    constructor(pos_x, pos_y, size, speed, dir, paddle1, paddle2){
        this.pos_x = pos_x;
        this.pos_y = pos_y;
        this.size = size;
        this.speed = speed;
        this.dir = dir;
        this.dir.norm();
        this.paddle_1 = paddle_1;
        this.paddle_2 = paddle_2;
    }
    draw(){
        ctx.beginPath();
        ctx.arc(this.pos_x, this.pos_y, this.size, 0, 2 * Math.PI);
        ctx.stroke();
    }
    move(){
        // this.dir.norm();
        this.pos_x += this.speed * this.dir.x;
        this.pos_y += this.speed * this.dir.y;
    }
    checkCollision(){
        if (this.pos_x <= this.size || this.pos_x >= board.width - this.size)
            this.speed = 0;
        if (this.pos_y <= this.size || this.pos_y >= board.height - this.size)
            this.dir.y *= -1;
        if (((this.pos_x <= paddle_margin_x + this.size) && (this.pos_y < this.paddle_1.top + this.size) && (this.pos_y  > this.paddle_1.bottom  - this.size))
                || ((this.pos_x >= board.width - paddle_margin_x - this.size) && (this.pos_y  < this.paddle_2.top  + this.size) && (this.pos_y  > this.paddle_2.bottom  - this.size)))
            this.dir.x *= -1;
    }
    loop(){
        this.checkCollision();
        this.move();
        this.draw();
    }
}

function gameloop(){
    ctx.clearRect(0,0,board.width, board.height);
    ball.loop();
    paddle_1.loop();
    paddle_2.loop();
    window.requestAnimationFrame(gameloop);
}

document.addEventListener("keydown", (e) => {
    if (e.key == 'ArrowDown')
        paddle_1.move_down = true;
    else if (e.key == 'ArrowUp') 
        paddle_1.move_up = true;
});
document.addEventListener("keyup", (e) => {
    if (e.key == 'ArrowDown')
        paddle_1.move_down = false;
    else if (e.key == 'ArrowUp') 
        paddle_1.move_up = false;
});

document.addEventListener("keydown", (e) => {
    if (e.code == 'KeyS')
        paddle_2.move_down = true;
    else if (e.code == 'KeyW') 
        paddle_2.move_up = true;
});
document.addEventListener("keyup", (e) => {
    if (e.code == 'KeyS')
        paddle_2.move_down = false;
    else if (e.code == 'KeyW') 
        paddle_2.move_up = false;
});



var paddle_1 = new Paddle(player1);
var paddle_2 = new Paddle(player2);

var dir = new Vector(4532, 7657);
var ball = new Ball(100,270,10,6, dir, paddle_1, paddle_2);

window.requestAnimationFrame(gameloop);

