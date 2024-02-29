import { graphicEngine } from "./graphic-engine.js"
import { renderer } from "./graphic-engine.js"


export class Game {
	constructor(controller, passive=false, tournament=false) {
		this.eventRemover = new AbortController();
		renderer.showBoard
		this.controller = controller
		this.graphicEngine = new graphicEngine()
		this.running = true
		let menu = document.querySelector("#menubtn")
		this.initListeners()
		this.tournament = tournament
		this.passive = passive
		if (!this.passive) {
			const startGameEvent = new Event("startGame")
			document.dispatchEvent(startGameEvent)
		}
	}

	cleanup() {
		this.controller.cleanup()
		this.eventRemover.abort()
		if (!this.passive) {
			const endGameEvent = new CustomEvent("endGame", {detail: this.controller.getWinner()})
			document.dispatchEvent(endGameEvent)
		}
	}

	run() {
		const update = () => {
			if (this.controller.running == false) {
				if (this.tournament) {
					this.cleanup()
					this.graphicEngine.clearFrame()
				}
				else
					renderer.hideBracket()
				this.eventRemover.abort()
				return
			}
			if (!this.running) {
				return
			}
			let data = this.controller.update()
			this.graphicEngine.display(data)
			requestAnimationFrame(update)
		}
		update();
	}

	initListeners()
	{
		window.addEventListener("popstate", (e) => {
			this.running = false
			this.controller.stop = true
			this.cleanup()
			}, { signal: this.eventRemover.signal }
		)

		document.addEventListener("click", (e) => {
			if (e.target.matches("[data-link]")) {
				this.running = false
				this.graphicEngine.clearFrame()
				this.controller.stop = true
				this.cleanup()
				this.eventRemover.abort()
			}
			}, {signal: this.eventRemover.signal}
			)

		const logoutBtn = document.getElementById("logoutButton")
		if (logoutBtn != undefined) {
			logoutBtn.addEventListener("click", (e) => {
				this.running = false
				this.graphicEngine.clearFrame()
				this.controller.stop = true
				this.cleanup()
			}, { signal: this.eventRemover.signal }
			)
		}
	}
}
