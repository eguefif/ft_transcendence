import { fetcher } from "./fetcher.js"
import { Game } from "./Game.js"
import { LocalController } from "./LocalController.js"
import { RemoteController } from "./RemoteController.js"

export function initLocalPong()
{
	const navigateTo = url => {
		history.pushState(null, null, url)
		router()
	}

	const router = async () => {
		const routes = [
			{path: "/", view: () => pongMenu()},
			{path: "/remotegame", view: () => initRemoteGame()},
			{path: "/localgame", view: () => initLocalGame()},
		]
		
		const potentialMatches = routes.map(route => {
			return {
				route: route,
				isMatch: location.pathname === route.path
			}
		})

		let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch)

		if (!match) {
			match = {
				route: routes[0],
				isMatch: true
			}
		}
		await match.route.view()
	}

	window.addEventListener("popstate", router)

	document.addEventListener("DOMContentLoaded", () => {
		//history.pushState(null, null, "/")
		document.body.addEventListener("click", e => {
			if (e.target.matches("[data-link]")) {
				e.preventDefault()
				navigateTo(e.target.href)
			}
		})
	})
	router()
}

export async function pongMenu() {
	let remoteGameBtn = document.querySelector("#remotegamebtn")
	let localGameBtn= document.querySelector("#localgamebtn")
	let previous = document.querySelector("#previousbtn")

	console.log("menu")
	previous.classList.add('d-none')
	if (await fetcher.isAuthenticated())
		remoteGameBtn.classList.remove('d-none')
	console.log(await fetcher.isAuthenticated())
	if (!await fetcher.isAuthenticated())
		remoteGameBtn.classList.add('d-none')
	localGameBtn.classList.remove('d-none')
}

async function initRemoteGame() {
	if (!await fetcher.isAuthenticated()) {
		let remoteGameBtn = document.querySelector("#remotegamebtn")
		remoteGameBtn.classList.remove('d-none')
		return
	}
	console.log("remote")	
	hideMainMenu()
	let controller = new RemoteController()
	await controller.init()
	let game = new Game(controller)
	game.run()
}

function initLocalGame() {
	console.log("local")	
	hideMainMenu()
	let controller = new LocalController()
	controller.init()
	let game = new Game(controller)
	game.run()
}

function hideMainMenu(){
	let remoteGameBtn = document.querySelector("#remotegamebtn")
	let localGameBtn= document.querySelector("#localgamebtn")
	let previous = document.querySelector("#previousbtn")

	previous.classList.add('d-none')
	remoteGameBtn.classList.add('d-none')
	localGameBtn.classList.add('d-none')
}
