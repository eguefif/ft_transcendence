export class LocalController {
	constructor(player1="player1", player2="player2") {
		this.paddle1 = new Paddle(player1, "right")
		this.paddle2 = new Paddle(player2, "left")
		this.player1 = player1
		this.player2 = player2
		this.ball = new Ball()
		this.player1Score = 0
		this.player2Score = 0
		this.startTimer = ""
		this.reset()
		this.running = true
		this.stop = true
		this.ball.in_play = false
		this.restartTimestamp = 0
		this.message = "press space to start the game"
	}

	cleanup(){}

	init() {
		document.addEventListener("keydown", (e) => {
			if (e.key == 'ArrowDown')
				this.paddle2.move_down = true
			else if (e.key == 'ArrowUp') 
				this.paddle2.move_up = true
			if (e.code == 'KeyS')
				this.paddle1.move_down = true
			else if (e.code == 'KeyW') 
				this.paddle1.move_up = true	
			})

		document.addEventListener("keyup", (e) => {
			if (e.code == 'KeyS')
				this.paddle1.move_down = false
			else if (e.code == 'KeyW') 
				this.paddle1.move_up = false
			if (e.key == 'ArrowDown')
				this.paddle2.move_down = false
			else if (e.key == 'ArrowUp') 
				this.paddle2.move_up = false
			if (e.code == "Space" && this.stop == true) {

				this.stop = false;
				this.message = ""
				this.startTimer = 3
				this.countdown()
				}
			})
	}

	getWinner() {
		if (this.player1Score == 3)
			return this.paddle1.name
		else
			return this.paddle2.name
	}

	countdown()
	{
		if (this.startTimer > 0)
		{
			setTimeout(() => 
			{
				this.startTimer--
				this.countdown()
			}, 1000)
		}
		else
			this.ball.in_play = true
	}
	
	reset()
	{
		this.ball_in_play = false
		this.ball.reset()
	}


	update () {
		let retval = "none"
		if (this.ball.in_play && this.stop == false) {
			this.paddle1.move()
			this.paddle2.move()
			if (Date.now() > this.restartTimestamp && this.running)
			{
				retval = this.ball.move(this.paddle1, this.paddle2)
				if (retval != "none") 
				{
						if (retval == "right")
						this.player1Score++
					else
					this.player2Score++
					if (this.player1Score == 3) {
						this.message = "The winner is " + this.paddle1.name
						this.running = false
					}
					else if (this.player2Score == 3) {
						this.message = "The winner is " + this.paddle2.name
						this.running = false
					}
					this.ball.in_play = false
					this.restartTimestamp = Date.now() + 1000
					this.ball.reset()
				}
			}	
		}
		return {
			ball: this.ball,
			paddle1: this.paddle1,
			paddle2: this.paddle2,
			player1: this.paddle1.name,
			player2: this.paddle2.name,
			player1Score: this.player1Score,
			player2Score: this.player2Score,
			message: this.message,
			startTimer: this.startTimer
		}
	}
}

class Ball {
    constructor() {
		this.radius = 1 / 50
		this.x = 0
		this.y = 0
		this.reset()
    }

    reset() {
		this.x = 1 / 2
		this.y = 1 / 2
		let dirX = Math.random() * 2 - 1
		this.dir = new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1)
		if (this.dir.x < 0)
			this.dir.x = Math.min(-0.5)
		else 
			this.dir.x = Math.max(0.5)
		this.dir.norm()
		this.in_play = true
		this.timerBall = this.getTimeNow() + 5;
		this.speed = 1 / 120
	}

	getTimeNow() {
		const d = new Date()
		return d.getTime() / 1000;
	}

    move(paddle1, paddle2){
		const now = this.getTimeNow()
		if (now >= this.timerBall) {
			if (this.speed + 0.0005 <= this.radius - 0.002) {
				this.speed += 0.0005
				this.timerBall = this.getTimeNow() + 5;
			}
		}
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
			let diff = this.y - (paddle2.y + paddle2.paddleHeight / 2)
			this.dir.y = diff * 0.866025403784439 / (paddle2.paddleHeight)//voir cercle trigo: 0.866025403784439
			this.dir.norm();
		}
		if (this.isCollidingLeftPaddle(paddle1))
		{
			this.dir.x = 0.5
			let diff = this.y - (paddle1.y + paddle1.paddleHeight / 2)
			this.dir.y = diff * 0.866025403784439 / (paddle2.paddleHeight)
			this.dir.norm();
		}
	}

	isCollidingLeftPaddle(paddle)
	{
		return this.x - this.radius <= paddle.x && this.x - this.radius > paddle.paddle_margin_x / 2 && this.y + (this.radius / 2) >= paddle.y && this.y - (this.radius / 2) <= paddle.y + paddle.paddleHeight && this.dir.x < 0
	}

	isCollidingRightPaddle(paddle)
	{
		return this.x + this.radius >= paddle.x && this.x + this.radius < 1 - (paddle.paddle_margin_x / 2) && this.y + (this.radius / 2)  >= paddle.y && this.y - (this.radius / 2) <= paddle.y + paddle.paddleHeight && this.dir.x > 0
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
		this.paddle_speed = 1 / 96
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

    move(){
        if (this.y + this.paddleHeight >= 1 - this.paddle_margin_y)
            this.move_down = false
        else if (this.y <= this.paddle_margin_y)
            this.move_up = false

        if (this.move_up)
            this.y -= this.paddle_speed
        else if (this.move_down)
            this.y += this.paddle_speed
        
        this.top = this.y
        this.bottom = this.y - this.paddleHeight / 2
    }
}
