import { fetcher } from "./modules/fetcher.js";
import * as bootstrap from "./bootstrap/bootstrap.bundle.min.js";
import { tryAuthenticating } from "./modules/auth.js";

import { initRouter } from "./modules/router.js";
import { createNavBar } from "./modules/navbar.js";
import { render_game_board } from "./modules/pong.js";



(async function(){
	await tryAuthenticating();
	render_game_board()
	await createNavBar();
	initRouter();
})();
