import { fetcher } from "./fetcher.js"
import { Game } from "./Game.js"
import { LocalController } from "./LocalController.js"
import { RemoteController } from "./RemoteController.js"
import { PassiveController } from "./PassiveController.js"
import { renderer } from "./graphic-engine.js";
import { initSidebar, createSidebar } from "./friendSidebar.js";

export async function pongMenu() {
	hideProfile()
	let controller = new PassiveController()
	let game = new Game(controller)

	if (await fetcher.isAuthenticated()) {
		render_pong_menu_connected()
		initSidebar()
		}
	else 
		render_pong_menu_not_connected()
	game.run()
}

function hideProfile() {
	let profile = document.getElementById("profileDiv")
	if (profile != undefined)
		profile.innerHTML = "" 
}

export async function initRemoteGame() {
	if (!await fetcher.isAuthenticated()) {
		return
	}
	hideProfile()
	render_pong_menu_button()
	initSidebar()
	let controller = new RemoteController()
	await controller.init()
	let game = new Game(controller)
	game.run()
}

export function initLocalGame() {
	hideProfile()
	let controller = new LocalController()
	render_pong_menu_button()
	controller.init()
	let game = new Game(controller)
	game.run()
}

export function render_game_board() {
	let main_frame = document.getElementById("pongDiv")
	main_frame.innerHTML = `
		<div class="container">
			<div id="pongMenu" class="row m-5">
er
			</div>
			<div class="row">
				<div class="col">
					<canvas id="board"></canvas>
					<canvas id="background"></canvas>
				</div>
			</div>
		</div>
	`
	renderer.init()
}

function render_pong_menu_connected() {
	const row_menu = document.getElementById("pongMenu")
	row_menu.innerHTML = `
	 	<div class="col" id="addFriendList"></div>
		<div class="col">
			<a id="localgamebtn" href="/localgame" class="btn btn-primary m-5" data-link>local game</a>
		</div>
		<div class="col">
			<a id="remotegamebtn" href="/remotegame" class="btn btn-primary m-5" data-link>Remote game</a>
		</div>
		`
}

function render_pong_menu_not_connected() {
	const row_menu = document.getElementById("pongMenu")
	row_menu.innerHTML = `
		<div class="col">
			<a id="localgamebtn" href="/localgame" class="btn btn-primary m-5" data-link>local game</a>
		</div>
		`
}

function render_pong_menu_button() {
	const row_menu = document.getElementById("pongMenu")
	row_menu.innerHTML = `
	 	<div class="col" id="addFriendList"></div>
		<div class="col">
			<a id="menubtn" href="/" class="btn btn-primary m-5 bt-primary" data-link>Menu</a>
		</div>

		`

}
