import { fetcher } from "./fetcher.js"
import { Game } from "./Game.js"
import { LocalController } from "./LocalController.js"
import { RemoteController } from "./RemoteController.js"
import { PassiveController } from "./PassiveController.js"
import { renderer } from "./graphic-engine.js";

export async function pongMenu() {


	let controller = new PassiveController()
	let game = new Game(controller)

	if (await fetcher.isAuthenticated())
		render_pong_menu_connected()
	if (!await fetcher.isAuthenticated())
		render_pong_menu_not_connected()
	game.run()
}


export async function initRemoteGame() {

	if (!await fetcher.isAuthenticated()) {
		return
	}
	render_pong_menu_button()
	let controller = new RemoteController()
	await controller.init()
	let game = new Game(controller)
	game.run()
}

export function initLocalGame() {
	render_pong_menu_button()

	let controller = new LocalController()
	controller.init()
	let game = new Game(controller, )
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


export function render_game_board() {
	let main_frame = document.getElementById("main_frame")
	main_frame.innerHTML = `
		<div id="pong_menu" class="row m-5">
		</div>
		<div class="row">
			<div class="col">
				<canvas id="board"></canvas>
				<canvas id="background"></canvas>
				<script type="vertex" id="vertexshader"	
					varying vec2 vUv	
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
	renderer.init()
}

function render_pong_menu_connected() {
	const row_menu = document.getElementById("pong_menu")
	row_menu.innerHTML = `
		<div class="col">
			<a id="localgamebtn" href="/localgame" class="btn btn-primary m-5" data-link>local game</a>
		</div>
		<div class="col">
			<a id="remotegamebtn" href="/remotegame" class="btn btn-primary m-5" data-link>Remote game</a>
		</div>
		`
}

function render_pong_menu_not_connected() {
	const row_menu = document.getElementById("pong_menu")
	row_menu.innerHTML = `
		<div class="col">
			<a id="localgamebtn" href="/localgame" class="btn btn-primary m-5" data-link>local game</a>
		</div>
		`
}

function render_pong_menu_button() {
	const row_menu = document.getElementById("pong_menu")
	row_menu.innerHTML = `
		<div class="col">
			<a id="menubtn" href="/" class="btn btn-primary m-5 bt-primary" data-link>Menu</a>
		</div>

		`
		
}

