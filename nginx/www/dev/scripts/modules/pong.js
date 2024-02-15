import { remoteGame } from "./pong-remote.js"
import { localGame } from "./pong-local.js"
import { graphicEngine } from "./graphic-engine.js"

import { fetcher } from "./fetcher.js"

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
		this.logoutButton = document.querySelector("#logoutButton")
		this.submitLogin = document.querySelector("#submitLogin")
		this.initListener()
		this.model = new Game()
		this.ShowMainMenu()
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
			let user = localStorage.getItem("user")
			user = JSON.parse(user)
			let username = user["username"]
			this.model = new remoteGame(username)
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

		this.logoutButton.addEventListener("click", (e) => {
			this.ShowMainMenu()
		})
	

		this.submitLogin.addEventListener("click", (e) => {
			console.log("hi")
			this.ShowMainMenu()
			if (!(token && (token != undefined))) {
				this.HideRemoteItemsInMenu()
			}
		})

		this.logoutButton.addEventListener("click", (e) => {
			this.ShowMainMenu()
		})

		this.submitLogin.addEventListener("click", (e) => {
			console.log("hi")
			this.ShowMainMenu()
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
	
	HideRemoteItemsInMenu(){
		this.playRemoteButton.classList.add('d-none')
		this.playTournamentButton.classList.add('d-none')
		this.mainMenuButton.classList.remove('d-none')
		this.game_active = true

	}
	async ShowMainMenu(){
		if (await fetcher.isAuthenticated() && this.playRemoteButton.classList.contains('d-none'))
			this.playRemoteButton.classList.remove('d-none')
		else if (!this.playRemoteButton.classList.contains('d-none'))
			this.playRemoteButton.classList.add('d-none')

		this.play2PlayerButton.classList.remove('d-none')
		this.playTournamentButton.classList.remove('d-none')
		this.mainMenuButton.classList.add('d-none')
		if (this.model.type == "local")
			this.model.playButton.classList.add('d-none')
		this.game_active = false
		this.view.clearFrame()
	}
}
