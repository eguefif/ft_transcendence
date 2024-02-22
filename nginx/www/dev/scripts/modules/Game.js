import { graphicEngine } from "./graphic-engine.js"
import { renderer } from "./graphic-engine.js"


export class Game {
	constructor(controller) {
		renderer.showBoard()
		renderer.hideBoard()
		this.controller = controller
		this.graphicEngine = new graphicEngine()
		this.running = true
		let menu = document.querySelector("#menubtn")
		if (menu != undefined) {
			menu.addEventListener("click", (e) => {
				// renderer.hideBoard()
				this.running = false
				this.controller.cleanup()
				this.controller.stop = true
				})
			}
		window.addEventListener("popstate", (e) => {
			this.running = false
			this.controller.cleanup()
			this.controller.stop = true
			})
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
}
