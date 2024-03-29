
import { fetcher } from "../modules/fetcher.js";

export class PassiveController {
	constructor(){
		this.player1Score = undefined
		this.player2Score = undefined
		this.startTimer = 0
		this.winnerMessage = ""
		this.paddle1 = new Paddle("player1", "right")
		this.paddle2 = new Paddle("player2", "left")
		this.ball = new Ball()
		this.running = true
		this.message = ""
		this.stop = false
	}

	cleanup(){
	}

	update (){
		this.ia_update()
		this.move()
		return {
			ball: this.ball,
			paddle1: this.paddle1,
			paddle2: this.paddle2,
			player1Score: this.player1Score,
			player2Score: this.player2Score,
			message: this.message,
			startTimer: this.startTimer,
			player1: "",
			player2: ""
		}
	}

	move() {
		this.paddle1.move(this.ball.dir.y)
		this.paddle2.move(this.ball.dir.y)
		this.ball.move(this.paddle1, this.paddle2)
	}

	ia_update() {
		if (this.ball.y > (this.paddle1.y + this.paddle1.height / 2)) {
			this.paddle1.move_up = false
			this.paddle1.move_down = true
		}
		else {
			this.paddle1.move_up = true
			this.paddle1.move_down = false
		}
		if (this.ball.y > (this.paddle2.y + this.paddle1.height / 2)) {
			this.paddle2.move_up = false
			this.paddle2.move_down = true
		}
		else {
			this.paddle2.move_up = true
			this.paddle2.move_down = false
		}
	}
}

class Ball {
    constructor() {
		this.radius = 1 / 50
		this.x = 0
		this.y = 0
        this.speed = 1 / 120
		this.reset()
    }

    reset() {
        this.x = 1 / 2
        this.y = 1 / 2
		let dirX = Math.random() * 2 - 1
        this.dir = new Vector(Math.random() * 2 - 1, 0.5)
		if (this.dir.x < 0)
			this.dir.x = Math.min(-0.5)
		else
			this.dir.x = Math.max(0.5)
        this.dir.norm()
	}

    move(paddle1, paddle2){
        this.x += this.speed * this.dir.x
        this.y += this.speed * this.dir.y
		this.checkTopWallCollision()
		this.checkPaddleCollision(paddle1, paddle2)
		return this.checkSideWallCollision()
    }

    checkSideWallCollision(){
        if (this.x >= 1 - this.radius)
			return "right"
        else if (this.x <= 0 + this.radius)
			return "left"
		return "none"
    }

	checkTopWallCollision()
	{
		if ((this.y <= this.radius && this.dir.y <= 0) || (this.y >= 1 - this.radius && this.dir.y >= 0))
			this.dir.y *= -1
	}

	checkPaddleCollision(paddle1, paddle2)
	{
		if (this.isCollidingRightPaddle(paddle2))
		{
			this.dir.x = -0.5
			let diff = this.y - ((paddle2.y + paddle2.paddleHeight / 2) + (Math.random() * 0.1 - 0.05))
			this.dir.y = diff * 0.866025403784439 / (paddle2.paddleHeight)//voir cercle trigo: 0.866025403784439
			this.dir.norm();
		}
		if (this.isCollidingLeftPaddle(paddle1))
		{
			this.dir.x = 0.5
			let diff = this.y - (paddle1.y + paddle1.paddleHeight / 2 + (Math.random() * 0.1 - 0.05))
			this.dir.y = diff * 0.866025403784439 / (paddle2.paddleHeight)
			this.dir.norm();
		}
	}

	isCollidingLeftPaddle(paddle)
	{
		return this.x - this.radius <= paddle.x && this.y >= paddle.y && this.y <= paddle.y + paddle.paddleHeight && this.dir.x < 0
	}

	isCollidingRightPaddle(paddle)
	{
		return this.x + this.radius >= paddle.x && this.y >= paddle.y && this.y <= paddle.y + paddle.paddleHeight && this.dir.x > 0
	}
}

class Vector {
    constructor(x, y){
        this.x = x
        this.y = y
    }
    norm(){
        let  mag = Math.sqrt((this.x * this.x) + (this.y * this.y))

        if (mag != 0)
        {
            this.x /= mag
            this.y /= mag
        }
    }
}

class Paddle {
    constructor(playerName, side)
    {
        this.x = 0
		this.height = 0.1
		this.paddle_margin_x = 1 / 32
		this.paddle_margin_y = 1 / 48
		this.paddle_speed = 1 / 120
		this.name = playerName
		this.paddleHeight = 1 / 8
        this.y = (1 / 2) - (this.paddleHeight / 2)
        this.top = this.y
        this.bottom = this.y - this.paddleHeight
        this.move_up = false
        this.move_down = false
        if (side == "right")
            this.x = this.paddle_margin_x
        else
            this.x = 1 - this.paddle_margin_x
    }

    move(ball_dir_y){
        if (this.y + this.paddleHeight >= 1 - this.paddle_margin_y)
            this.move_down = false
        else if (this.y <= this.paddle_margin_y)
            this.move_up = false

        if (this.move_up)
            this.y -= this.paddle_speed * Math.abs(ball_dir_y)
        else if (this.move_down)
            this.y += this.paddle_speed * Math.abs(ball_dir_y)

        this.top = this.y
        this.bottom = this.y - this.paddleHeight / 2
    }
}
