export function initLocalPong()
{
	const game = new Game("player1", "player2")
	game.run()
}



class Game{
	constructor(player1, player2)
	{
		this.board = document.getElementById("board")
		this.playButton = document.querySelector("#playButton")
		this.paddle_1 = new Paddle(player1, "right", board)
		this.paddle_2 = new Paddle(player2, "left", board)
		this.ball = new Ball(board)
		this.graphicEngine = new graphicEngine()
		this.init_event()
		this.ball.init_position()
		this.game_active = false
		this.result = "none"
		this.player1Score = 0
		this.player2Score = 0
	}

	reset(){
		this.ball.init_position()
		this.ball.speed = 4
		console.log("speed", this.ball.speed)
		console.log("dir x ", this.ball.dir.x)
		console.log("dir y ", this.ball.dir.y)
		this.result = "none"
	}

	init_event()
	{
		this.playButton.addEventListener("click", (e) => {
			if (!this.game_active)
			{
				this.reset()
				this.game_active=true
				this.playButton.classList.add('d-none')
				this.run()
			}
				
		})

		document.addEventListener("keydown", (e) => {
			if (e.key == 'ArrowDown')
				this.paddle_2.move_down = true
			else if (e.key == 'ArrowUp') 
				this.paddle_2.move_up = true
			if (e.code == 'KeyS')
				this.paddle_1.move_down = true
			else if (e.code == 'KeyW') 
				this.paddle_1.move_up = true	
			})

		document.addEventListener("keyup", (e) => {
			if (e.code == 'KeyS')
				this.paddle_1.move_down = false
			else if (e.code == 'KeyW') 
				this.paddle_1.move_up = false
			if (e.key == 'ArrowDown')
				this.paddle_2.move_down = false
			else if (e.key == 'ArrowUp') 
				this.paddle_2.move_up = false
			})
		}

	run()
	{
		this.graphicEngine.display(this.ball, this.paddle_1, this.paddle_2, this.player1Score, this.player2Score)
		if (this.game_active == true)
		{
			this.result = this.move()
			if (this.result !== 'none')
			{
				this.game_active = false
				this.updatePoint()
				this.playButton.classList.remove('d-none')
			}
			requestAnimationFrame(() => {this.run()})
		}
	}

	move()
	{
		// this.paddle_1.move()
		// this.paddle_2.move()
		return this.ball.move(this.paddle_1, this.paddle_2)
	}

	updatePoint(){
		if (this.result == "right")
			this.player1Score++
		else
			this.player2Score++
	}
}

class Paddle {
    constructor(playerName, side, gameBoard)
    {
		this.board = gameBoard
		this.paddle_margin_x = 15
		this.paddle_margin_y = 10
		this.paddle_speed = 5
		this.name = playerName
        this.y = this.board.height / 2
        this.halfPaddleHeight = 30
        this.top = this.y + this.halfPaddleHeight
        this.bottom = this.y - this.halfPaddleHeight
        this.move_up = false
        this.move_down = false
        if (side == "right")//ASSUMING THERE ARE 2 PLAYERS
            this.x = this.paddle_margin_x
        else
            this.x = this.board.width - this.paddle_margin_x
    }

    move(){
        if (this.top >= this.board.height - this.paddle_margin_y)
            this.move_down = false
        else if (this.bottom <= this.paddle_margin_y)
            this.move_up = false

        if (this.move_up)
            this.y -= this.paddle_speed
        else if (this.move_down)
            this.y += this.paddle_speed
        
        this.top = this.y + this.halfPaddleHeight
        this.bottom = this.y - this.halfPaddleHeight
    }
}

class Ball {
    constructor(gameBoard) {
		this.board = gameBoard
        this.radius = 10
        this.speed = 4
		this.init_position()
    }

    init_position() {
        this.x = this.board.width / 2
        this.y = this.board.height / 2
		let dirX = Math.random() * 2 - 1
        this.dir = new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1)
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
        if (this.x >= this.board.width - this.radius)
        {
            this.speed = 0
			return "right"
        }
        else if (this.x <= 0 + this.radius) //GOAL COLLISION
        {
            this.speed = 0
			return "left"
        }
		return "none"
    }

	checkTopWallCollision()
	{
		if (this.y <= this.radius || this.y >= this.board.height - this.radius)
			this.dir.y *= -1
	}

	checkPaddleCollision(paddle_1, paddle_2)
	{
		if (this.isCollidingRightPaddle(paddle_2))
		{
			this.dir.x = -0.5
			let diff = this.y - paddle_2.y
			
			this.dir.y = diff * 0.866025403784439 / (paddle_2.halfPaddleHeight * 2)//voir cercle trigo: 0.866025403784439
			this.dir.norm();
		}
		if (this.isCollidingLeftPaddle(paddle_1))
		{
			this.dir.x = 0.5
			let diff = this.y - paddle_1.y
			this.dir.y = diff * 0.866025403784439 / (paddle_2.halfPaddleHeight * 2)
			this.dir.norm();

		}

	}

	isCollidingLeftPaddle(paddle)
	{
		return this.x - this.radius <= paddle.x && this.y <= paddle.top && this.y >= paddle.bottom && this.dir.x < 0
	}

	isCollidingRightPaddle(paddle)
	{
		return this.x + this.radius >= paddle.x && this.y <= paddle.top && this.y >= paddle.bottom && this.dir.x > 0
	}
}

class graphicEngine
{
	constructor(mode="basic")
	{
		this.ctx =  board.getContext("2d")
	}

	display(ball, paddle1, paddle2, score1=1, score2=1) {
		this.displayBall(ball)
		this.displayPaddle1(paddle1)
		this.displayPaddle2(paddle2)
		this.displayScore(score1, score2)
	}

	displayBall(ball){
		this.ctx.clearRect(0, 0, board.width, board.height)
		this.ctx.beginPath()
		this.ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI)
		this.ctx.stroke()
	}

	displayPaddle1(paddle){
		this.ctx.moveTo(paddle.x, paddle.top)
		this.ctx.lineTo(paddle.x, paddle.bottom)
		this.ctx.stroke()
	}

	displayPaddle2(paddle){
		this.ctx.moveTo(paddle.x, paddle.top)
		this.ctx.lineTo(paddle.x, paddle.bottom)
		this.ctx.stroke()
	}

	displayScore(score1, score2)
	{
		const y = 50
		const mid = board.width / 2
		const dis1 = `${score1}`
		const dis2 = `${score2}`
		this.ctx.font = "30px Arial"
		this.ctx.fillText(dis1, mid - 100, y)
		this.ctx.fillText(dis2, mid + 100, y)
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
