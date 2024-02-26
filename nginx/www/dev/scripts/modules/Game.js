import { graphicEngine } from "./graphic-engine.js"
import { renderer } from "./graphic-engine.js"


export class Game {
	constructor(controller) {
		renderer.showBoard
		this.controller = controller
		this.graphicEngine = new graphicEngine()
		this.running = true
		let menu = document.querySelector("#menubtn")
		this.initListeners()
	}

	run() {
		const update = () => {
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
			this.controller.cleanup()
			this.controller.stop = true
			})

		document.addEventListener("click", (e) => {
			if (e.target.matches("[data-link]")) {
					this.running = false
					this.controller.cleanup()
					this.graphicEngine.clearFrame()
					this.controller.stop = true
			}
			})

		const logoutBtn = document.getElementById("logoutButton")
		if (logoutBtn != undefined) {
			logoutBtn.addEventListener("click", (e) => {
				this.runnintg = false
				this.controller.cleanup()
				this.graphicEngine.clearFrame()
				this.controller.stop = true
			})
		}
	}
}
