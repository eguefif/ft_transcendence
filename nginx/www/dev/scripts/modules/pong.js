export function initLocalPong()
{
	// const model = new LocalGame("player1", "player2")
	const controller = new Controller()
}

class Controller{
	constructor(){
		this.view = new graphicEngine()
		// this.playButton = document.querySelector("#choose1PlayerButton")
		this.play2PlayerButton = document.querySelector("#choose2PlayerButton")
		this.playRemoteButton = document.querySelector("#chooseRemoteButton")
		this.playTournamentButton = document.querySelector("#chooseTouramentButton")
		this.initListener()
	}
	
	run()
	{
		const update = () => {
			//this.model.update();
			if (this.model.state == "running")
				this.view.display(this.model);
			requestAnimationFrame(update);
		};
		update();
	}

	initListener()
	{
		this.play2PlayerButton.addEventListener("click", (e) => {
				this.model = new LocalGame("player1", "player2")
				this.HideMenu()
				this.run()
		})

		this.playRemoteButton.addEventListener("click", (e) => {
			this.model = new remoteGame("player1", "player2")
			this.HideMenu()
			this.run()
		})

		this.playTournamentButton.addEventListener("click", (e) => {
			this.model = new remoteGame("player1", "player2")
			this.HideMenu()
			this.run()
		})
	}
	HideMenu(){
		this.playRemoteButton.classList.add('d-none')
		this.play2PlayerButton.classList.add('d-none')
		this.playTournamentButton.classList.add('d-none')
	}
	ShowMenu(){
		this.playRemoteButton.classList.remove('d-none')
		this.play2PlayerButton.classList.remove('d-none')
		this.playTournamentButton.classList.remove('d-none')
	}
}

class Game{
	constructor(){
		this.player1Score = 0
		this.player2Score = 0
		this.startTimer = 0
		this.winnerMessage = ""
		
		if (this.constructor == Game) {//abstract class
			throw new Error("Abstract classes can't be instantiated.");
		  }
	}
}

class remoteGame extends Game{
	constructor(){
		super()
		this.paddle1 = new Paddle()
		this.paddle2 = new Paddle()
		this.ball = new Ball()
		let address = window.location.hostname
		this.websocket = new WebSocket(`wss://${address}/game/`)
		this.init_event()
		this.state = "waiting"

	}

	update(msg){
		if (this.serverUpdate != null) {
			/*
			this.paddle1 = this.serverUpdate.paddle1
			this.paddle2 = this.serverUpdate.paddle2
			this.ball = this.serverUpdate.ball
			this.player1Score = this.serverUpdate.score.player1
			this.player2Score = this.serverUpdate.score.player2
			this.startTimer = this.serverUpdate.startTimer
			this.winnerMessage = this.serverUpdate.winnerMessage
			*/
			// this.game_active = false
		}
		this.paddle1 = msg.paddle1
		this.paddle2 = msg.paddle2
		this.ball = msg.ball
		this.player1Score = msg.score.player1
		this.player2Score = msg.score.player2
		this.startTimer = msg.startTimer
		this.winnerMessage = msg.winnerMessage
	}
	init_event()
	{
		this.websocket.onopen = (e) => {
				this.websocket.send("game")
		}

		this.websocket.onclose = (e) => {
			console.log(e)
			console.log("disconnection")
		}

		this.websocket.onmessage = (e) => {
			const msg = JSON.parse(e.data)
			switch (msg.command) {
				case "waiting":
					this.state = "waiting"
					break;
				case "getready":
					this.state = "getready"
					console.log("getready received")
					break;
				case "data":
					 console.log("message", msg)
					 this.update(msg)
					 //this.serverUpdate = msg
						break;
				case "ending":
						this.state == "over"
						break
			}
		}

		document.addEventListener("keydown", (e) => {
			if (this.state == "running") {
				if (e.key == 'ArrowDown')
					this.websocket.send("down")
				else if (e.key == 'ArrowUp') 
					this.websocket.send("up")
			}
			})

		document.addEventListener("keyup", (e) => {
			console.log(this.state)
			if (this.state == "running" && this.state == "running")
				this.websocket.send("stop")
			if (e.code == 'Space' && this.state == "getready"){
				this.websocket.send("ready")
				console.log("sending ready")
				this.state = "running"
				}
		})
	}	
}









class LocalGame extends Game{
	constructor(player1, player2)
	{
		super()
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

class Paddle{
	constructor(){
		this.x = 0
		this.top = 0
		this.bottom = 0
		// this.height = 0.1
	}
}

class LocalPaddle extends Paddle{
    constructor(playerName, side)
    {
		super()
		this.paddle_margin_x = 1 / 32
		this.paddle_margin_y = 1 / 48
		this.paddle_speed = 1 / 96
		this.name = playerName
        this.y = 1 / 2
        this.halfPaddleHeight = 1 / 16
        this.top = this.y + this.halfPaddleHeight
        this.bottom = this.y - this.halfPaddleHeight
        this.move_up = false
        this.move_down = false
        if (side == "right")//ASSUMING THERE ARE 2 PLAYERS
            this.x = this.paddle_margin_x
        else
            this.x = 1 - this.paddle_margin_x
    }

    move(){
        if (this.top >= 1 - this.paddle_margin_y)
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


class Ball{
	constructor(){
		this.radius = 1 / 50
		this.x = 0
		this.y = 0
	}
}

class LocalBall extends Ball{
    constructor() {
		super()
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
		this.board = document.getElementById("board")

		this.width = this.board.width
		this.height = this.board.height
		this.mid = board.width / 2
		this.scoreMarginRight = this.mid + this.width / 10
		this.scoreMarginLeft = this.mid - this.width / 10
		this.scoreMarginTop = this.height / 10
		this.scoreScale = this.height / 16
		this.winnerMessageCenter = this.width / 2 - this.width / 7
		this.winnerMessageMargin = this.height / 4.8
		this.startTimerCenter = this.width / 2 - this.width / 48
		this.startTimerMargin = this.height / 4
		this.startTimerScale = this.height / 6
	}

	display(model) {
		this.ctx.clearRect(0, 0, board.width, board.height)
		this.displayStartTimer(model.startTimer)
		this.displayBall(model.ball.x, model.ball.y, model.ball.radius)
		this.displayPaddle(model.paddle1.x, model.paddle1.y, model.paddle1.height)
		this.displayPaddle(model.paddle2.x, model.paddle2.y, model.paddle2.height)
		this.displayScore(model.player1Score, model.player2Score)
		this.displayWinner(model.winnerMessage)

		this.ctx.stroke()
	}

	displayBall(ball_x, ball_y, ball_radius){
		this.ctx.beginPath()
		this.ctx.arc(ball_x * this.width, ball_y * this.height, ball_radius * this.height, 0, 2 * Math.PI)
	}

	displayPaddle(paddle_x, paddle_y, paddle_height){
		console.log("salut: ", paddle_x, " ", paddle_y)
		this.ctx.moveTo(paddle_x * this.width, paddle_y * this.height)
		this.ctx.lineTo(paddle_x * this.width, (paddle_y + paddle_height) * this.height)
	}

	displayScore(player1Score, player2Score)
	{
		const dis1 = `${player1Score}`
		const dis2 = `${player2Score}`
		this.ctx.font = "".concat(`${this.scoreScale}`, "px Arial")
		this.ctx.fillText(dis1, this.scoreMarginLeft, this.scoreMarginTop)
		this.ctx.fillText(dis2, this.scoreMarginRight, this.scoreMarginTop)
	}

	displayWinner(winnerMessage)
	{
		if (winnerMessage == "")
			return
		const y = 50
		this.ctx.font = "".concat(`${this.scoreScale}`, "px Arial")
		this.ctx.fillText(winnerMessage, this.winnerMessageCenter, this.winnerMessageMargin)
	}

	displayStartTimer(timeToWait)
	{
		if (timeToWait <= 0)
			return
		let display = `${timeToWait}`
		this.ctx.font = "".concat(`${this.startTimerScale}`, "px Arial")
		this.ctx.fillText(display, this.startTimerCenter, this.startTimerMargin)
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