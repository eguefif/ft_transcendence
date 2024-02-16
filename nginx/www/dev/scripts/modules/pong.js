import { fetcher } from "./fetcher.js"
import { Game } from "./Game.js"
import { LocalController } from "./LocalController.js"

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
		document.body.addEventListener("click", e => {
			if (e.target.matches("[data-link]")) {
				e.preventDefault()
				navigateTo(e.target.href)
			}
		})
	})
	router()
}

async function pongMenu() {
	let remoteGameBtn = document.querySelector("#remotegamebtn")
	let localGameBtn= document.querySelector("#localgamebtn")
	if (await fetcher.isAuthenticated() && remoteGameBtn.classList.contains('d-none'))
		remoteGameBtn.classList.remove('d-none')
	else if (!remoteGameBtn.classList.contains('d-none'))
		remoteGameBtn.classList.add('d-none')
	localGameBtn.classList.remove('d-none')
}

async function initRemoteGame() {
	console.log("remote")	
	hideMainMenu()
}

function initLocalGame() {
	console.log("local")	
	hideMainMenu()
	let controller = new LocalController()
	let game = new Game(controller)
	game.run()
}

function hideMainMenu(){
	let remoteGameBtn = document.querySelector("#remotegamebtn")
	let localGameBtn= document.querySelector("#localgamebtn")

	remoteGameBtn.classList.add('d-none')
	localGameBtn.classList.add('d-none')
}
