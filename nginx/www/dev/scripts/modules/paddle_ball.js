class Paddle{
	constructor(){
		this.x = 0
		this.height = 0.1
	}
}

class Ball{
	constructor(){
		this.radius = 1 / 50
		this.x = 0
		this.y = 0
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