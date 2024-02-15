export class remoteGame {
	constructor(username){
		this.player1Score = 0
		this.player2Score = 0
		this.startTimer = 0
		this.winnerMessage = ""
		this.username = username
		this.paddle1 = new Paddle("player1", 1)
		this.paddle2 = new Paddle("player2", 2)
		this.ball = new Ball()
		let address = window.location.hostname
		this.websocket = new WebSocket(`wss://${address}/game/`)
		this.init_event()
		this.state = "waiting"
		this.serverUpdate = "none"
	}

	update(){
		if (this.serverUpdate == "none")
			return
		this.paddle1 = this.serverUpdate.paddle1
		this.paddle2 = this.serverUpdate.paddle2
		this.ball = this.serverUpdate.ball
		this.player1Score = this.serverUpdate.score.player1
		this.player2Score = this.serverUpdate.score.player2
		this.startTimer = this.serverUpdate.startTimer
		this.winnerMessage = this.serverUpdate.winnerMessage
	}
	init_event() {
        let mainMenuButton = document.getElementById("mainMenuButton")        
        mainMenuButton.addEventListener("click", (e) => {
            if (this.isSocketConnected()){
                this.websocket.close()
                delete this.websocket
            }
        })

		this.websocket.onopen = (e) => {
			let gameMsg = {}
			console.log(this.username)
			gameMsg["command"] = "game"
			gameMsg["username"] = this.username
			this.websocket.send(JSON.stringify(gameMsg))
		}

		this.websocket.onclose = (e) => {
			console.log(e)
			console.log("disconnection")
		}

		this.websocket.onmessage = (e) => {
			const msg = JSON.parse(e.data)
			console.log(msg)
			switch (msg.command) {
				case "wait":
					this.state = "waiting"
                    this.websocket.send("wait")
					break;
				case "getready":
					this.state = "getready"
					break;
				case "data":
					 console.log("message", msg)
                     this.serverUpdate = msg
						break;
				case "ending":
					this.state == "ending"
                    this.serverUpdate = msg
						break
			}
		}

		document.addEventListener("keydown", (e) => {
            if (!this.isSocketConnected())
                return
			if (this.state == "running") {
				if (e.key == 'ArrowDown')
					this.websocket.send("down")
				else if (e.key == 'ArrowUp') 
					this.websocket.send("up")
			    }
			})

		document.addEventListener("keyup", (e) => {
            if (!this.isSocketConnected())
                return
			console.log(this.state)
			if (this.state == "running" && this.state == "running")
				this.websocket.send("stop")
			if (e.code == 'Space' && this.state == "getready"){
				this.websocket.send("ready")
				console.log("sending ready")
				this.state = "running"
				}
		})
    }
    isSocketConnected(){
        if (this.websocket != undefined)
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