export function initLocalPong()
{
	const model = new Game("player1", "player2")
	const view = new graphicEngine()
	const controller = new Controller(model, view)
}

class Controller{
	constructor(model, view){
		this.model = model
		this.view = view
		this.playButton = document.querySelector("#playButton")
		this.initListener()
		this.view.display(this.model);
		this.run()
	}
	
	run()
	{
		const update = () => {
			if (!this.model.game_active)
				this.playButton.classList.remove('d-none')

			this.model.update();
			this.view.display(this.model);

			requestAnimationFrame(update);
		};
	
		update();
	}
	initListener(){
		this.playButton.addEventListener("click", (e) => {
			if (!this.model.game_active)
			{
				this.model.initGame()
				this.playButton.classList.add('d-none')
			}
		})
	}
}

class Game{
	constructor(player1, player2)
	{
		this.board = document.getElementById("board")
		this.paddle1 = new Paddle(player1, "right", board)
		this.paddle2 = new Paddle(player2, "left", board)
		this.ball = new Ball(board)
		this.init_event()
		this.game_active = false
		this.state = "none"
		this.player1Score = 0
		this.player2Score = 0
		this.pointsToWin = 1
		this.startTimer = 0
		this.winnerMessage = ""
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
		// this.playButton.classList.remove('d-none')
		this.game_active = false
		this.winnerMessage = message
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
		this.reset()
		this.in_play = false
    }

    reset() {
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
        this.x += this.speed * this.dir.x * this.in_play
        this.y += this.speed * this.dir.y * this.in_play
		this.checkTopWallCollision()
		this.checkPaddleCollision(paddle1, paddle2)
		return this.checkSideWallCollision()
    }

    checkSideWallCollision(){
        if (this.x >= this.board.width - this.radius)
			return "right"
        else if (this.x <= 0 + this.radius) //GOAL COLLISION
			return "left"
		return "none"
    }

	checkTopWallCollision()
	{
		if (this.y <= this.radius || this.y >= this.board.height - this.radius)
			this.dir.y *= -1
	}

	checkPaddleCollision(paddle1, paddle2)
	{
		if (this.isCollidingRightPaddle(paddle2))
		{
			this.dir.x = -0.5
			let diff = this.y - paddle2.y
			this.dir.y = diff * 0.866025403784439 / (paddle2.halfPaddleHeight * 2)//voir cercle trigo: 0.866025403784439
			this.dir.norm();
		}
		if (this.isCollidingLeftPaddle(paddle1))
		{
			this.dir.x = 0.5
			let diff = this.y - paddle1.y
			this.dir.y = diff * 0.866025403784439 / (paddle2.halfPaddleHeight * 2)
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
	constructor(mode="basic"){
		this.ctx =  board.getContext("2d")
	}

	display(model) {
		this.ctx.clearRect(0, 0, board.width, board.height)
		this.displayStartTimer(model.startTimer)
		this.displayBall(model.ball.x, model.ball.y, model.ball.radius)
		this.displayPaddle(model.paddle1.x, model.paddle1.top, model.paddle1.bottom)
		this.displayPaddle(model.paddle2.x, model.paddle2.top, model.paddle2.bottom)
		this.displayScore(model.player1Score, model.player2Score)
		this.displayWinner(model.winnerMessage)

		this.ctx.stroke()
	}

	displayBall(ball_x, ball_y, ball_radius){
		this.ctx.beginPath()
		this.ctx.arc(ball_x, ball_y, ball_radius, 0, 2 * Math.PI)
	}

	displayPaddle(paddle_x, paddle_top, paddle_bottom){
		this.ctx.moveTo(paddle_x, paddle_top)
		this.ctx.lineTo(paddle_x, paddle_bottom)
	}

	displayScore(player1Score, player2Score, lastScore)
	{
		const y = 50
		const mid = board.width / 2
		const dis1 = `${player1Score}`
		const dis2 = `${player2Score}`
		this.ctx.font = "30px Arial"
		this.ctx.fillText(dis1, mid - 100, y)
		this.ctx.fillText(dis2, mid + 100, y)
	}

	displayWinner(winnerMessage)
	{
		if (winnerMessage == "")
			return
		const y = 50
		const mid = board.width / 2
		this.ctx.font = "30px Arial"
		this.ctx.fillText(winnerMessage, mid -100, y + 100)
	}

	displayStartTimer(timeToWait)
	{
		if (timeToWait <= 0)
			return
		let display = `${timeToWait}`
		this.ctx.font = "80px Arial"
		this.ctx.fillText(display, board.width / 2 -25, board.height / 4)
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