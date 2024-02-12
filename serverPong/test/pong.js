class Paddle {
    constructor(gameBoard, side)
    {
			this.board = gameBoard
		this.paddle_margin_x = 15
		this.paddle_margin_y = 10
        this.y = this.board.height / 2
        if (side == "right")
            this.x = this.paddle_margin_x
        else
            this.x = this.board.width - this.paddle_margin_x

    }
	
	update(position) {
		this.x = position.x * this.board.width
		this.y = position.y * this.board.height
	}
}

class Ball {
    constructor(gameBoard) {
		this.board = gameBoard
        this.x = this.board.width / 2
        this.y = this.board.height / 2
        this.radius = 10
    }

	update(position) {
			this.x = this.board.width * position.x
			this.y = this.board.height * position.y
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
class Game{
	constructor(player1, player2)
	{
		this.board = document.getElementById("board")
		this.paddle_1 = new Paddle(player1, "right", this.board)
		this.paddle_2 = new Paddle(player2, "left", this.board)
		this.ball = new Ball(this.board)
		this.graphicEngine = new graphicEngine()
		this.init_event()
		this.state = "waiting"
		this.player1Score = 0
		this.player2Score = 0
	}

	init_event()
	{
		websocket.onopen = (e) => {
				websocket.send("game")
		}

		websocket.onclose = (e) => {
			console.log(e)
			console.log("disconnection")
		}

		websocket.onmessage = (e) => {
			const msg = JSON.parse(e.data)
			console.log(msg)
			switch (msg.command) {
				case "waiting":
					this.state = "waiting"
					break;
				case "getready":
					this.state = "getready"
					break;
				case "data":
						this.paddle1.update(msg.paddle1)
						this.paddle2.update(msg.paddle2)
						this.ball.update(msg.ball)
						this.player1Score = msg.score.player1
						this.player2Score = msg.score.player2
						break;
				case "ending":
						this.state == "over"
						break
			}
		}

		document.addEventListener("keydown", (e) => {
			if (this.state == "running") {
				if (e.key == 'ArrowDown')
					websocket.send("down")
				else if (e.key == 'ArrowUp') 
					websocket.send("up")
			}
			if (e.key == 'space' && this.state == "getready")
				websocket.send("ready")
				this.state = "running"
			})

		document.addEventListener("keyup", (e) => {
			if (this.state == "running")
				websocket.send("stop")
			})
		}

	run()
	{
		this.graphicEngine.display(this.ball, this.paddle_1, this.paddle_2, this.player1Score, this.player2Score)
		requestAnimationFrame(() => {this.run()})
	}
}

websocket = new WebSocket("ws://localhost:10001/")
const game = new Game("player1", "player2")
game.run()
