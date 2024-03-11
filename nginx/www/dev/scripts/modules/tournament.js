import { Game } from "./Game.js"
import { renderer } from "./graphic-engine.js"
import { LocalController } from "./LocalController.js"
import { fetcher } from "./fetcher.js"
import { getUsername } from "./profile.js"

export class Tournament {
	constructor() {
	this.winner = ""
	this.displayForm()
	this.eventRemover = new AbortController();
	this.initEvent()
	this.players = []
	this.state = "lobby"
	this.game = 1
	this.runninGame = false
	}

	destructor() {
		this.eventRemover.abort()
	}

	initEvent() {
		const playerForm = document.getElementById("tournamentForm")
		if (playerForm != undefined){
			let inputs = playerForm.querySelectorAll("input")
			inputs.forEach((input) => {
				input.addEventListener("input", () => {
					input.parentElement.querySelector(".validation-field").classList.remove("invalid-feedback")
					input.parentElement.querySelector(".validation-field").innerText = ""
				})
			})
			playerForm.addEventListener("submit", (e) => {
				e.preventDefault()
				let inputs = playerForm.querySelectorAll("input")
				let valid = true
				inputs.forEach((input) => {
					if (input.value.length < 4 || input.value.length > 24) {
						input.parentElement.querySelector(".validation-field").classList.add("invalid-feedback")
						input.parentElement.querySelector(".validation-field").innerText = "Aliases should be between 4 to 24 characters"
						valid = false
					}
					if (!this.checkUnicityUsername(input, inputs)) {
						input.parentElement.querySelector(".validation-field").classList.add("invalid-feedback")
						input.parentElement.querySelector(".validation-field").innerText = "Aliases should be unique"
						valid = false
					}
				})
				this.state="run"
				if (valid) {
					this.players[1] = document.getElementById("player1Tournament").value
					this.players[2] = document.getElementById("player2Tournament").value
					this.players[3] = document.getElementById("player3Tournament").value
					this.players[4] = document.getElementById("player4Tournament").value
					this.state = "semi"
					this.displayBracket()
				}
			}, { signal: this.eventRemover.signal }
			)

		document.addEventListener("keyup", (e) => {
			if (e.code == "Space" && (this.state == "semi" || this.state == "final") && this.runninGame == false) {
				this.runGame()
				this.runninGame = true
		}
		}, { signal: this.eventRemover.signal }
		)


		document.addEventListener("endGame", (e) => {
			this.runninGame = false
			if (this.game == 2)
				this.winnerSemi1 = e.detail
			if (this.game == 3)
				this.winnerSemi2 = e.detail
			if (this.state == "end")
				this.winner = e.detail
			this.displayBracket()
		}, {signal: this.eventRemover.signal }
		)

		window.addEventListener("popstate", (e) => {
			this.eventRemover.abort()
			}, { signal: this.eventRemover.signal }
		)

		document.addEventListener("click", (e) => {
			if (e.target.matches("[data-link]")) {
				this.eventRemover.abort()
			}
			}, {signal: this.eventRemover.signal}
			)

		const logoutBtn = document.getElementById("logoutButton")
		if (logoutBtn != undefined) {
			logoutBtn.addEventListener("click", (e) => {
				this.eventRemover.abort()
			}, { signal: this.eventRemover.signal }
			)
			}
		}
	}

	checkUnicityUsername(currentInput, inputs) {
		let retval = true;
		inputs.forEach((input) => {
			if (input.id != currentInput.id && input.value == currentInput.value)
				retval = false
			})
		return retval
	}

	runGame() {
		renderer.hideBracket()
		if (this.state == "end")
			return
		if (this.game === 1) {
			let controller = new LocalController(this.players[1], this.players[2])
			controller.init()
			const game = new Game(controller, false, true)
			game.run()
			this.game = 2
			return
		}
		else if (this.game == 2) {
			let controller = new LocalController(this.players[3], this.players[4])
			const game = new Game(controller, false, true)
			controller.init()
			game.run()
			this.game = 3
			this.state = "final"
			return
		}
		else if (this.game == 3) {
			let controller = new LocalController(this.winnerSemi1, this.winnerSemi2)
			const game = new Game(controller, false, true)
			controller.init()
			game.run()
			this.game = 4
			this.state = "end"
			return
		}
	}

	displayBracket() {
		const pongTournament = document.getElementById("playerForm")
		pongTournament.innerHTML = ""

		renderer.hideBoard()
		if (this.state == "end") {
			renderer.showBracket(this.game, this.players[1], this.players[2], this.players[3], this.players[4],
			this.winnerSemi1, this.winnerSemi2, `🏆 The winner is ${this.winner} 🏆`)
			return
		}
		if (this.game == 1){
			renderer.showBracket(this.game, this.players[1], this.players[2], this.players[3], this.players[4])
		}
		if (this.game == 2) {
			renderer.showBracket(this.game, this.players[1], this.players[2], this.players[3], this.players[4],
									this.winnerSemi1)
		}
		if (this.game == 3){
			renderer.showBracket(this.game, this.players[1], this.players[2], this.players[3], this.players[4],
			this.winnerSemi1, this.winnerSemi2)
		}
	}

	async displayForm() {
		const playerForm = document.getElementById("playerForm")
		playerForm.innerHTML = tournamentForm()
		if (await fetcher.isAuthenticated()){
			const player1Input = document.getElementById("player1Tournament");
			const username = await getUsername()
			player1Input.value = username
		}
	}

}

function tournamentForm() {
	return `
	<div class="d-flex justify-content-center">
		<form id="tournamentForm" class="bg-dark m-2 p-4 border border-3 border-rounded border-primary" style="width: 400px;" novalidate>
			<h4 class="text-primary fs-3 fw-bold text-center">Enter aliases</h4>
			<div class="mb-3">
				<label for="player1Tournament" class="form-label text-secondary">Player1</label>
				<input type="text" class="form-control" id="player1Tournament"/>
				<div class="validation-field"></div>
			</div>
			<div class="mb-3">
				<label for="player2Tournament" class="form-label text-secondary">Player2</label>
				<input type="text" class="form-control" id="player2Tournament"/>
				<div class="validation-field"></div>
			</div>
			<div class="mb-3">
				<label for="player3Tournament" class="form-label text-secondary">Player3</label>
				<input type="text" class="form-control" id="player3Tournament"/>
				<div class="validation-field"></div>
			</div>
			<div class="mb-3">
				<label for="player4Tournament" class="form-label text-secondary">Player4</label>
				<input type="text" class="form-control" id="player4Tournament"/>
				<div class="validation-field"></div>
			</div>
			<div id="tournamentError"></div>
			<button type="submit" id="tournamentFormSubmit" class="btn btn-primary">Submit</button>
		</form>
	</div>

	`
}
