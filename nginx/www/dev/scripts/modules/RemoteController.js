import { fetcher } from "../modules/fetcher.js";

export class RemoteController {
	constructor(){
		this.eventRemover = new AbortController();
		this.player1Score = 0
		this.player2Score = 0
		this.startTimer = 0
		this.winnerMessage = ""
		this.paddle1 = new Paddle("player1", "right")
		this.paddle2 = new Paddle("player2", "left")
		this.ball = new Ball()
		this.address = window.location.hostname
		this.running = true
		this.serverMsg = {}
		this.localMsg= ""
		this.stop = false
		this.timeout = false
		this.spacePressed = false
	}

	cleanup(){
		try {
			this.websocket.close()
		}
		catch (error)
		{}
		this.eventRemover.abort()
		this.stop = true
	}

	update (){
		if (this.stop)
			return
		if (this.serverMsg.command == "data" || this.serverMsg.command == "ending")
			return this.serverMsg
		if (this.serverMsg.player1Score == 3 || this.serverMsg.player2Score == 3){
			this.running = false
			return this.serverMsg
		}
		return {
			ball: this.ball,
			paddle1: this.paddle1,
			paddle2: this.paddle2,
			player1Score: this.player1Score,
			player2Score: this.player2Score,
			message: this.localMsg,
			startTimer: this.startTimer
		}
	}

	async init() {
		await this.initSocket()
		this.init_event()
	}
	async initSocket() {
		this.websocket = new WebSocket(`wss://${this.address}/game/`)
	}

	init_event() {
		if (this.websocket == undefined) {
			return
		}

		this.websocket.addEventListener("open", async (e) => {
			await fetcher.sendToken(this.websocket)
		} 
		)

		this.websocket.error = (e) => {
		}

		this.websocket.onclose = (e) => {
			if (this.timeout == false) {
				this.localMsg = "A player has left the game"
			}
			else 
				this.localMsg = "You waited too long to press space"
		}

		this.websocket.onmessage = (e) => {
			const msg = JSON.parse(e.data)
			switch (msg.command) {
				case "authsucess":
					this.running = "authenticated"
					break
				case "serverfull":
					this.localMsg = "Server full, retry later"
					this.state = "ending"
					break
				case "timeout":
					this.localMsg = "You waited too long to press space"
					this.state = "ending"
					this.timeout = true
					break
				case "timeoutOpponent":
					this.state = "ending"
					this.timeout = true
					break
				case "wait":
					try {
                    	this.websocket.send("wait")
					}
					catch {}
					this.localMsg = "Wait for another player"
					this.state = "waiting"
					this.serverMsg = msg
					break;
				case "getready":
					if (this.state != "running"){
						try {
						this.websocket.send("getready")
						}
						catch {}
						this.state = "getready"
					}
					if (!this.spacePressed) {
						this.localMsg = "Press space to start the game"
					}
					else {
						this.localMsg = "You're ready"
					}
					this.serverMsg = msg
					break;
				case "data":
					this.state = "running"
                    this.serverMsg = msg
					break;
				case "ending":
					this.state = "ending"
					this.serverMsg = msg
					break
			}
		}

		document.addEventListener("keydown", (e) => {
			if (this.websocket == undefined)
				return 
			if (this.websocket.readyState == 2 || this.websocket.readyState == 3)
				return
			if (this.state == "running") {
				if (e.key == 'ArrowDown') {
					try {
						this.websocket.send("down")
					}
					catch {}
				}
				else if (e.key == 'ArrowUp')
					try {
						this.websocket.send("up")
					}
					catch {}
			    }
			}, { signal: this.eventRemover.signal }
		)

		document.addEventListener("keyup", (e) => {
			if (this.websocket == undefined)
				return 
			if (this.websocket.readyState == 2 || this.websocket.readyState == 3)
				return
			if (this.state == "running") {
				try {
					this.websocket.send("stop")
				}
				catch {}
			}
			if (e.code == 'Space' && this.state == "getready"){
				this.spacePressed = true
				try {
					this.websocket.send("ready")
				}
				catch {}
				this.state = "running"
				}
			}, { signal: this.eventRemover.signal }
		)
    }
    isSocketConnected(){
        if (this.websocket.readyState != 3)
            return true
        return false
	}

	getWinner() {
		return ""
	}
}

class Paddle{
    constructor(playerName, side)
    {
        this.x = 0
		this.height = 0.1
		this.paddle_margin_x = 1 / 32
		this.paddle_margin_y = 1 / 48
		this.paddle_speed = 1 / 96
		this.name = playerName
		this.paddleHeight = 1 / 8
        this.y = (1 / 2) - (this.paddleHeight / 2)
        this.top = this.y
        this.bottom = this.y - this.paddleHeight
        this.move_up = false
        this.move_down = false
        if (side == "right")//ASSUMING THERE ARE 2 PLAYERS
            this.x = this.paddle_margin_x
        else
            this.x = 1 - this.paddle_margin_x
    }

    move(){
        if (this.y + this.paddleHeight >= 1 - this.paddle_margin_y)
            this.move_down = false
        else if (this.y <= this.paddle_margin_y)
            this.move_up = false

        if (this.move_up)
            this.y -= this.paddle_speed
        else if (this.move_down)
            this.y += this.paddle_speed

        this.top = this.y
        this.bottom = this.y - this.paddleHeight / 2
    }
}
class Ball {
    constructor() {
		this.radius = 1 / 50
		this.x = 0.5
		this.y = 0.5
        this.speed = 1 / 120
		this.in_play = false
    }
}
