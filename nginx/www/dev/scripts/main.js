import { fetcher } from "./modules/fetcher.js";
import * as bootstrap from "./bootstrap/bootstrap.bundle.min.js";
import { initAuth } from "./modules/auth.js";
import { initSettings } from "./modules/settings.js";
import { initRouter } from "./modules/router.js";
import { createNavBar } from "./modules/navbar.js";
import { generateModal } from "./modules/modal.js";

import { render_game_board } from "./modules/pong.js";

(async function(){
	render_game_board()
	await createNavBar();
	initSettings();
	initRouter();

	let ws = new WebSocket("wss://localhost/online_status/")

	ws.onopen = async function(e) {
		console.log('Connection established')
		await fetcher.sendToken(ws)
	}

	ws.onmessage = function(e) {
		console.log(e.data)
	}

	ws.onerror = function(e) {
		console.log("Error")
	}

	ws.onclose = function(e) {
		console.log("Connection closed")
	}
})();
