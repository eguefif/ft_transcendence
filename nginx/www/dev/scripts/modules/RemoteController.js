
import { fetcher } from "../modules/fetcher.js";

export class RemoteController {
	constructor(){
		this.player1Score = 0
		this.player2Score = 0
		this.startTimer = 0
		this.winnerMessage = ""
		this.username = username
		this.paddle1 = new Paddle("player1", 1)
		this.paddle2 = new Paddle("player2", 2)
		this.ball = new Ball()
		this.address = window.location.hostname
		this.running = true
		this.msg = "none"
		this.message = ""
		this.stop = false
	}

	cleanup(){
		this.websocket.close()
	}
	update (){
		if (this.stop == true)
			this.websocket.close()
		if (this.msg.command == "data" || this.msg.command == "ending")
			return this.msg
		if (this.msg.scorePlayer1 == 3 || this.msg.scorePlayer2 == 3){
			this.running = false
			return
		}
		return {
			ball: this.ball,
			paddle1: this.paddle1,
			paddle2: this.paddle2,
			player1Score: this.player1Score,
			player2Score: this.player2Score,
			message: this.message,
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
				fetcher.sendToken(this.websocket)
			})

		this.websocket.error = (e) => {
			console.log("Error: ", e)
		}

		this.websocket.onclose = (e) => {
			this.message = "Connection lost"
			console.log("disconnection")
		}

		this.websocket.onmessage = (e) => {
			const msg = JSON.parse(e.data)
			//console.log(msg)
			switch (msg.command) {
				case "authsucess":
					console.log("authentification success")
					this.running = "authenticated"
					break
				case "serverfull":
					this.message = "Server full, retry later"
					this.state = "ending"
					break
				case "wait":
                    this.websocket.send("wait")
					this.message = "Wait for another player"
					this.state = "waiting"
					this.msg = msg
					break;
				case "getready":
					if (this.state != "running"){
						this.websocket.send("getready")
						this.state = "getready"
					}
					this.message = "Press space to space the game"
					this.msg = msg
					break;
				case "data":
					this.state = "running"
                    this.msg = msg
					break;
				case "ending":
					this.state = "ending"
					this.msg = msg
					break
			}
		}

		document.addEventListener("keydown", (e) => {
			console.log(this.state)
			if (this.state == "running") {
				console.log("sending arrow direction")
				if (e.key == 'ArrowDown')
					this.websocket.send("down")
				else if (e.key == 'ArrowUp') 
					this.websocket.send("up")
			    }
			})

		document.addEventListener("keyup", (e) => {
			if (this.state == "running") {
				console.log("sending stop")
				this.websocket.send("stop")
			}
			if (e.code == 'Space' && this.state == "getready"){
				this.websocket.send("ready")
				console.log("sending ready")
				this.state = "running"
				}
		})
    }
    isSocketConnected(){
        if (this.websocket.readyState != 3)
            return true
        return false
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
		this.x = 0
		this.y = 0
        this.speed = 1 / 120
		this.in_play = false
    }
}
