import { Game } from "./Game.js"
import { renderer } from "./graphic-engine.js"

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
		const playerFormSubmit = document.getElementById("tournamentForm")
		if (playerFormSubmit != undefined){
			playerFormSubmit.addEventListener("submit", (e) => {
				e.preventDefault()
				this.players[1]= document.getElementById("player1Tournament").value
				this.players[2]= document.getElementById("player2Tournament").value
				this.players[3]= document.getElementById("player3Tournament").value
				this.players[4]= document.getElementById("player4Tournament").value
				this.state="run"
				if (this.checkFormsTournament()) {
					this.state = "semi"
					this.run()
				}
				document.getElementById("tournamentForm").classList.add("was-validated")
			})
		}

		document.addEventListener("keyup", (e) => {
			if (e.code == "Space" && (this.state == "semi" or this.state == "final"))
				this.runGame()
		}
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
			return false;
		}
		return true
	}

	rungame() {
		if (this.game == 1) {
			console.log("Game between: ", this.player[1], this.player[2])
			this.winnerSemi1 = this.player[2]
			this.game = 2
		}
		else if (this.game == 2) {
			console.log("Game between: ", this.player[3], this.player[4])
			this.winnerSemi2 = this.player[3]
			this.game = 3
		}
		else if (this.game == 2) {
			console.log("Game between: ", this.winnerSemi1, this.winnerSemi2)
			this.game = 3
		}
	}

	displayBracket() {
		console.log("run")
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
