import { graphicEngine } from "./graphic-engine.js"
import { renderer } from "./graphic-engine.js"


export class Game {
	constructor(controller, tournament=false) {
		this.eventRemover = new AbortController();
		renderer.showBoard
		this.controller = controller
		this.graphicEngine = new graphicEngine()
		this.running = true
		let menu = document.querySelector("#menubtn")
		this.eventRemover = new AbortController()
		this.initListeners()
		this.tournament = tournament
	}

	cleanup() {
		this.controller.cleanup()
		this.eventRemover.abort()
	}

	run() {
		const update = () => {
			if (this.controller.running == false) {
				if (this.tournament) {
					const endGameEvent = new CustomEvent("endGame", {detail: this.controller.getWinner()})
					document.dispatchEvent(endGameEvent)
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
