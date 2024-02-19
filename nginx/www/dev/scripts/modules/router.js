import { fetcher } from "./fetcher.js"
import { initRemoteGame } from "./pong.js"
import { initLocalGame } from "./pong.js"
import { pongMenu } from "./pong.js"

export function initRouter() {
	const navigateTo = url => {
		history.pushState(null, null, url)
		router()
	}

	async function router() {
		const routes = [
			{path: "/", view: () => pongMenu()},
			{path: "/remotegame", view: () => initRemoteGame()},
			{path: "/localgame", view: () => initLocalGame()},
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
