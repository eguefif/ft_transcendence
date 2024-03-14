import { fetcher } from "./fetcher.js"
import { initRemoteGame } from "./pong.js"
import { initLocalGame } from "./pong.js"
import { pongMenu } from "./pong.js"
import { profile } from "./profile.js"
import { initTournament } from "./pong.js"

export function initRouter() {
	let lastState

	const navigateTo = url => {
		if (lastState != url) {
			history.pushState(null, null, url)
			lastState = url
		}
		router()
	}

	async function router() {
		const routes = [
			{ path: "/", view: () => pongMenu() },
			{ path: "/remotegame", view: () => initRemoteGame() },
			{ path: "/localgame", view: () => initLocalGame() },
			{ path: "/profile", view: () => profile() },
			{ path: "/tournament", view: () => initTournament() },
		]
		
		const potentialMatches = routes.map((route) => {
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

	window.addEventListener("popstate", () => {
		lastState = ""
		router()
	})

	document.addEventListener("click", e => {
		if (e.target.matches("[data-link]")) {
			e.preventDefault()
			navigateTo(e.target.href)
		}
	})
	router()
}
