import { remoteGame } from "./pong-remote.js"
import { localGame } from "./pong-local.js"
import { graphicEngine } from "./graphic-engine.js"

export function initLocalPong()
{
	const controller = new Controller()
}

class Controller{
	constructor(){
		this.view = new graphicEngine()
		// this.playButton = document.querySelector("#choose1PlayerButton") //AI
		this.play2PlayerButton = document.querySelector("#choose2PlayerButton")
		this.playRemoteButton = document.querySelector("#chooseRemoteButton")
		this.playTournamentButton = document.querySelector("#chooseTouramentButton")
		this.mainMenuButton = document.querySelector("#mainMenuButton")
		let token = localStorage.getItem('csrf')
		if (!(token && (token != undefined))) {
			this.HideRemoteItemsInMenu()
		}
		this.initListener()
	}
	
	run()
	{
		const update = () => {
			if (this.game_active)
			{
				this.model.update();
				this.view.display(this.model);
				requestAnimationFrame(update);
			}
		};
		update();
	}

	initListener()
	{
		this.play2PlayerButton.addEventListener("click", (e) => {
				this.model = new localGame("player1", "player2")
				this.HideMainMenu()
				this.run()
		})

		this.playRemoteButton.addEventListener("click", (e) => {
			this.model = new remoteGame()
			if (this.model == undefined)
				return undefined
			this.HideMainMenu()
			this.run()
		})

		this.playTournamentButton.addEventListener("click", (e) => {
			this.model = new remoteGame("player1", "player2")
			this.HideMainMenu()
			this.run()
		})

		this.mainMenuButton.addEventListener("click", (e) => {
			const token = localStorage.getItem("token")
			this.ShowMainMenu()
			if (!(token && (token != undefined))) {
				this.HideRemoteItemsInMenu()
			}
		})
	}
	HideMainMenu(){
		this.playRemoteButton.classList.add('d-none')
		this.play2PlayerButton.classList.add('d-none')
		this.playTournamentButton.classList.add('d-none')
		this.mainMenuButton.classList.remove('d-none')
		this.game_active = true

	}
	HideRemoteItemsInMenu(){
		this.playRemoteButton.classList.add('d-none')
		this.playTournamentButton.classList.add('d-none')
		this.mainMenuButton.classList.remove('d-none')
		this.game_active = true

	}
	ShowMainMenu(){
		this.playRemoteButton.classList.remove('d-none')
		this.play2PlayerButton.classList.remove('d-none')
		this.playTournamentButton.classList.remove('d-none')
		this.mainMenuButton.classList.add('d-none')
		if (this.model.playButton)
			this.model.playButton.classList.add('d-none')
		this.game_active = false
		this.view.clearFrame()
	}
}
