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

