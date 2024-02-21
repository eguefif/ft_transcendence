import { fetcher } from "./fetcher.js"
import { initRemoteGame } from "./pong.js"
import { initLocalGame } from "./pong.js"
import { pongMenu } from "./pong.js"
import { profile } from "./profile.js"

export function initRouter(renderer) {
	const navigateTo = url => {
		history.pushState(null, null, url)
		router()
	}

	async function router(renderer) {
		const routes = [
			{ path: "/", view: () => pongMenu(renderer) },
			{ path: "/remotegame", view: () => initRemoteGame(renderer) },
			{ path: "/localgame", view: () => initLocalGame(renderer) },
			{ path: "/profile", view: () => profile(renderer) },
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
	router(renderer)
}
