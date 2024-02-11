const socket = new WebSocket("ws://localhost:10000")

class remoteController {
		constructor(){
			this.initEvent()
			this.state = "init"
		}

		initEvent(){
				socket.addEventListener("open", (event) => {
						socket.send("game")
				});

				socket.addEventListener("message", (e) => {
						if (e.data === "player1") {
								this.player = 1
								this.state = "wait"
						}
						if (e.data === "getready") {
								this.state = e.data
						}
						console.log("Message from server ", e.data);
						console.log("state :", this.state);
				});
		}

		run() {
				console.log("state: " + this.state)
		}
}

async function handle() {
		for (let i = 0; i < 10 ; i++) {
				controller.run()
				await sleep(1000)
				if (controller.state === "getready")
						break
		}
}

controller = new remoteController()

handle()
