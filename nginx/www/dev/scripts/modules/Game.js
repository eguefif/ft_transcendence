import { graphicEngine } from "./graphic-engine.js"

export class Game {
	constructor(controller) {
		this.controller = controller
		this.graphicEngine = new graphicEngine
		let menu = document.querySelector("#menubtn")
		this.running = true
		menu.addEventListener("click", (e) => {
			this.running = false
			})
	}

	run() {
		const update = () => {
			if (!this.running)
				return
			let data = this.controller.update()
			this.graphicEngine.display(data)
			requestAnimationFrame(update)
		}
		update();
	}
}
