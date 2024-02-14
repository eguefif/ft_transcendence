export class localGame {
	constructor(player1, player2) {
		this.paddle1 = new LocalPaddle(player1, "right")
		this.paddle2 = new LocalPaddle(player2, "left")
		this.ball = new LocalBall()
		this.playButton = document.querySelector("#playButton")
		this.playButton.classList.remove('d-none')
		this.init_event()
		this.game_active	= false
		this.state			= "none"
		this.pointsToWin	= 1
	}

	initGame()
	{
		this.reset()
		this.game_active=true
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
		this.winnerMessage = ""
		this.player1Score = 0
		this.player2Score = 0
		this.state = "none"
		this.startTimer = 3
		this.ball.reset()
		this.countdown()
	}

	init_event()
	{

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
			})

		this.playButton.addEventListener("click", (e) => {
			if (!this.game_active)
			{
				this.initGame()
				this.playButton.classList.add('d-none')
			}
			})
	}

	update()
	{
		if (this.game_active == true)
		{
			this.result = this.move()
			if (this.result != 'none')
			{
				this.updatePoint()
				
				if (this.player1Score == this.pointsToWin)
					this.playerWonUpdate("Player 1 wins!")

				else if (this.player2Score == this.pointsToWin)
					this.playerWonUpdate("Player 2 wins!")

				else if (this.ball.in_play)// no one won yet
					setTimeout(() => {this.ball.reset(); this.ball.in_play = true}, 1000)
				
				this.ball.in_play = false
			}
		}
	}

	playerWonUpdate(message)
	{
		this.game_active = false
		this.winnerMessage = message
		this.playButton.classList.remove('d-none')
	}

	move()
	{
		this.paddle1.move()
		this.paddle2.move()
		return this.ball.move(this.paddle1, this.paddle2)
	}

	updatePoint(){
		if (!this.ball.in_play)
			return
		if (this.result == "right")
			this.player1Score++
		else
			this.player2Score++
	}
}

class LocalBall {
    constructor() {
		this.radius = 1 / 50
		this.x = 0
		this.y = 0
        this.speed = 1 / 120
		this.reset()
		this.in_play = false
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
	}

    move(paddle1, paddle2){
        this.x += this.speed * this.dir.x * this.in_play
        this.y += this.speed * this.dir.y * this.in_play
		this.checkTopWallCollision()
		this.checkPaddleCollision(paddle1, paddle2)
		return this.checkSideWallCollision()
    }

    checkSideWallCollision(){
        if (this.x >= 1 - this.radius)
			return "right"
        else if (this.x <= 0 + this.radius) //GOAL COLLISION
			return "left"
		return "none"
    }

	checkTopWallCollision()
	{
		if (this.y <= this.radius || this.y >= 1 - this.radius)
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
		return this.x - this.radius <= paddle.x && this.y >= paddle.y && this.y <= paddle.y + paddle.paddleHeight && this.dir.x < 0
	}

	isCollidingRightPaddle(paddle)
	{
		return this.x + this.radius >= paddle.x && this.y >= paddle.y && this.y <= paddle.y + paddle.paddleHeight && this.dir.x > 0
	}
}

class LocalPaddle {
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
        if (side == "right")//ASSUMING THERE ARE 2 PLAYERS
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