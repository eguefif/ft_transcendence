import { Game } from "./Game.js"
import { renderer } from "./graphic-engine.js"
import { LocalController } from "./LocalController.js"

export class Tournament {
	constructor() {
	this.winner = ""
	this.displayForm()
	this.initEvent()
	this.players = []
	this.state = "lobby"
	this.game = 1
	}

	initEvent() {
		const playerForm = document.getElementById("tournamentForm")
		if (playerForm != undefined){
			playerForm.addEventListener("submit", (e) => {
				e.preventDefault()
				this.players[1]= document.getElementById("player1Tournament").value
				this.players[2]= document.getElementById("player2Tournament").value
				this.players[3]= document.getElementById("player3Tournament").value
				this.players[4]= document.getElementById("player4Tournament").value
				this.state="run"
				if (this.checkFormsTournament()) {
					this.state = "semi"
					this.displayBracket()
				}
				 playerForm.classList.add("was-validated")
			})
		}

		document.addEventListener("keyup", (e) => {
			if (e.code == "Space" && (this.state == "semi" || this.state == "final"))
				this.runGame()
		})
		document.addEventListener("endGame", (e) => {
			console.log("winner is ", e.detail)
			if (this.game == 2)
				this.winnerSemi1 = e.detail
			if (this.game == 3)
				this.winnerSemi2 = e.detail
			if (this.state == "end")
				this.winner = e.detail
			this.displayBracket()
		})
	}

	checkFormsTournament() {
		if (this.players[1].length <= 4 || this.players[1].length >= 24) {
			return false;
		}
		if (this.players[2].length <= 4 || this.players[2].length >= 24) {
			document.getElementById("tournamentForm").classList.add("was-validated")
			return false;
		}
		if (this.players[3].length <= 4 || this.players[3].length >= 24) {
			document.getElementById("tournamentForm").classList.add("was-validated")
			return false;
		}
		if (this.players[4].length <= 4 || this.players[4].length >= 24) {
			document.getElementById("tournamentForm").classList.add("was-validated")
			this.state = "end"
			return false;
		}
		return true
	}

	runGame() {
		renderer.hideBracket()
		if (this.state == "end")
			return
		if (this.game === 1) {
			let controller = new LocalController(this.players[1], this.players[2])
			controller.init()
			const game = new Game(controller)
			game.run()
			this.winnerSemi1 = this.players[2]
			this.game = 2
			return
		}
		else if (this.game == 2) {
			let controller = new LocalController(this.players[3], this.players[4])
			const game = new Game(controller)
			controller.init()
			game.run()
			this.winnerSemi2 = this.players[3]
			this.game = 3
			this.state = "final"
			return
		}
		else if (this.game == 3) {
			let controller = new LocalController(this.winnerSemi1, this.winnerSemi2)
			const game = new Game(controller)
			controller.init()
			game.run()
			this.game = 4
			return
		}
	}

	displayBracket() {
		const pongTournament = document.getElementById("playerForm")
		pongTournament.innerHTML = ""

		renderer.hideBoard()
		if (this.state == "end") {
			console.log("winner is ", this.winner)
		}
		if (this.game == 1){ 
			renderer.showBracket(this.players[1], this.players[2], this.players[3], this.players[4])
			console.log("Game between: ", this.players[1], this.players[2])
		}
		if (this.game == 2) {
			renderer.showBracket(this.players[1], this.players[2], this.players[3], this.players[4],
									this.winnerSemi1)
			console.log("Game between: ", this.players[3], this.players[4])
		}
		if (this.game == 3){
			renderer.showBracket(this.players[1], this.players[2], this.players[3], this.players[4],
			this.winnerSemi1, this.winnerSemi2)
			console.log("Game between: ", this.winnerSemi1, this.winnerSemi2)
		}
	}

	formErrorTournament() {
	return `<div class="text-danger">Pseudo needs to have between 4 and 24 characters</div>`
	}

	displayForm() {
		const playerForm = document.getElementById("playerForm")
		playerForm.innerHTML = tournamentForm()
	}

}

function tournamentForm() {
	return `
	<div class="d-flex justify-content-center">
		<form id="tournamentForm" class="bg-dark m-2 p-4 border border-3 border-rounded border-primary" style="width: 400px;" novalidate>
			<h4 class="text-primary fs-3 fw-bold text-center">Enter pseudos</h4>
			<div class="mb-3">
				<label for="player1Tournament" class="form-label text-secondary">Player1</label>
				<input type="text" class="form-control" id="player1Tournament" required minlength=4 maxlength=24/>
				<div class="invalid-feedback">Names are between 4 and 24 characters</div>
				<div class="valid-feedback"></div>
			</div>
			<div class="mb-3">
				<label for="player2Tournament" class="form-label text-secondary">Player2</label>
				<input type="text" class="form-control" id="player2Tournament" required minlength=4 maxlength=24>
				<div class="valid-feedback"></div>
				<div class="invalid-feedback">Names are between 4 and 24 characters</div>
			</div>
			<div class="mb-3">
				<label for="player3Tournament" class="form-label text-secondary">Player3</label>
				<input type="text" class="form-control" id="player3Tournament" requried minlength=4 maxlength=24>
				<div class="valid-feedback"></div>
				<div class="invalid-feedback">Names are between 4 and 24 characters</div>
			</div>
			<div class="mb-3">
				<label for="player4Tournament" class="form-label text-secondary">Player4</label>
				<input type="text" class="form-control" id="player4Tournament" required minlength=4 maxlength=24>
				<div class="valid-feedback"></div>
				<div class="invalid-feedback">Names are between 4 and 24 characters</div>
			</div>
			<input type="submit" id="tournamentFormSubmit" value="submit">
		</form>
	</div>

	`
}