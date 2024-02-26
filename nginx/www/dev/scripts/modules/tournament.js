import { Game } from "./Game.js"

export class Tournament {
	constructor() {
	this.winner = ""
	}

	run() {
		this.getNames()
		while (this.winner == "")
			this.playGames()
		console.log(this.winner)
	}

	getNames() {
		console.log("get names")
		this.winner = "god"
	}
}

function tournamentForm() {
	return `

	`
}
