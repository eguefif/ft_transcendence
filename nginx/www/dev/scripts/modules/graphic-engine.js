export class graphicEngine
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

		this.paddleHeigt = 1 / 8
	}

	display(model) {
		if (model == "none")
			return
		this.clearFrame()
		this.displayStartTimer(model.startTimer)
		this.displayBall(model.ball.x, model.ball.y, model.ball.radius)
		this.displayPaddle(model.paddle1.x, model.paddle1.y)
		this.displayPaddle(model.paddle2.x, model.paddle2.y)
		this.displayScore(model.player1Score, model.player2Score)
		this.displayWinner(model.message)

		this.ctx.stroke()
	}

	clearFrame(){
		this.ctx.clearRect(0, 0, board.width, board.height)
	}

	displayBall(ball_x, ball_y, ball_radius){
		this.ctx.beginPath()
		this.ctx.arc(ball_x * this.width, ball_y * this.height, ball_radius * this.height, 0, 2 * Math.PI)
	}

	displayPaddle(paddle_x, paddle_y){
		this.ctx.moveTo(paddle_x * this.width, paddle_y * this.height)
		this.ctx.lineTo(paddle_x * this.width, (paddle_y + this.paddleHeigt) * this.height)
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
