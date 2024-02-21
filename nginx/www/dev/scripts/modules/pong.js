import { fetcher } from "./fetcher.js"
import { Game } from "./Game.js"
import { LocalController } from "./LocalController.js"
import { RemoteController } from "./RemoteController.js"
import { PassiveController } from "./PassiveController.js"

export async function pongMenu() {
	render_game_board()
	let remoteGameBtn = document.querySelector("#remotegamebtn")
	let localGameBtn= document.querySelector("#localgamebtn")
	let controller = new PassiveController()
	let game = new Game(controller)
	let menu = document.getElementById("menubtn")

	menu.classList.add('d-none')
	if (await fetcher.isAuthenticated())
		remoteGameBtn.classList.remove('d-none')
	if (!await fetcher.isAuthenticated())
		remoteGameBtn.classList.add('d-none')
	localGameBtn.classList.remove('d-none')
	game.run()
}

export async function initRemoteGame() {
	render_game_board()
	if (!await fetcher.isAuthenticated()) {
		let remoteGameBtn = document.querySelector("#remotegamebtn")
		remoteGameBtn.classList.remove('d-none')
		return
	}
	show_and_init_event_for_menu_button()
	hideMainMenu()
	let controller = new RemoteController()
	await controller.init()
	let game = new Game(controller)
	game.run()
}

export function initLocalGame() {
	render_game_board()
	show_and_init_event_for_menu_button()
	hideMainMenu()
	let controller = new LocalController()
	controller.init()
	let game = new Game(controller)
	game.run()
}

function hideMainMenu(){
	let remoteGameBtn = document.querySelector("#remotegamebtn")
	let localGameBtn= document.querySelector("#localgamebtn")
	let menu = document.querySelector("#menubtn")

	remoteGameBtn.classList.add('d-none')
	localGameBtn.classList.add('d-none')
}

function show_and_init_event_for_menu_button() {
	let menu = document.querySelector("#menubtn")
	menu.classList.remove("d-none")

}

function render_game_board() {
	let main_frame = document.getElementById("main_frame")
	console.log("test")
	main_frame.innerHTML = `
			<div class="row">
				<div class="col">
					<a id="localgamebtn" href="/localgame" class="btn btn-primary m-5" data-link>local game</a>
				</div>
				<div class="col">
					<a id="remotegamebtn" href="/remotegame" class="btn btn-primary d-none m-5" data-link>Remote game</a>
				</div>
			</div>
			<div class="row">
				<div class="col">
					<a id="menubtn" href="/" class="btn btn-primary d-none m-5 bt-primary">Menu</a>
				</div>
			</div>
			<div class="row">
				<div class="col">
					<canvas id="board" width="640" height="480"></canvas>
					<canvas width="640" height="480" id="background">hi</canvas>
					  <script type="vertex" id="vertexshader">
				  
						  varying vec2 vUv;
				  
						  void main() {
				  
							  vUv = uv;
				  
							  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				  
						  }
					  </script>
					  <script type="fragment" id="fragmentshader">
				  
						  uniform sampler2D baseTexture;
						  uniform sampler2D bloomTexture;
				  
						  varying vec2 vUv;
				  
						  void main() {
				  
							  gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
				  
						  }
					  </script>
				</div>
			</div>
	`
}
