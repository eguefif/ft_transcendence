import { fetcher } from "./fetcher.js"
import { Game } from "./Game.js"
import { LocalController } from "./LocalController.js"
import { RemoteController } from "./RemoteController.js"
import { PassiveController } from "./PassiveController.js"

export async function pongMenu() {
	let remoteGameBtn = document.querySelector("#remotegamebtn")
	let localGameBtn= document.querySelector("#localgamebtn")
	let menu = document.querySelector("#menubtn")
	let controller = new PassiveController()
	let game = new Game(controller)
	menu.addEventListener("click", (e) => {
		e.preventDefault()
		history.back()
		})

	menu.classList.add('d-none')
	if (await fetcher.isAuthenticated())
		remoteGameBtn.classList.remove('d-none')
	if (!await fetcher.isAuthenticated())
		remoteGameBtn.classList.add('d-none')
	localGameBtn.classList.remove('d-none')
	game.run()
}

export async function initRemoteGame() {
	if (!await fetcher.isAuthenticated()) {
		let remoteGameBtn = document.querySelector("#remotegamebtn")
		remoteGameBtn.classList.remove('d-none')
		return
	}
	show_and_init_event_for_menu_button()
	hideMainMenu()
	let controller = new RemoteController()
	await controller.init()
	let game = new Game(controller)
	game.run()
}

export function initLocalGame() {
	show_and_init_event_for_menu_button()
	hideMainMenu()
	let controller = new LocalController()
	controller.init()
	let game = new Game(controller)
	game.run()
}

function hideMainMenu(){
	let remoteGameBtn = document.querySelector("#remotegamebtn")
	let localGameBtn= document.querySelector("#localgamebtn")
	let menu = document.querySelector("#menubtn")

	remoteGameBtn.classList.add('d-none')
	localGameBtn.classList.add('d-none')
}

function show_and_init_event_for_menu_button() {
	let menu = document.querySelector("#menubtn")
	menu.classList.remove("d-none")
}
