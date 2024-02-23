import { fetcher } from "./modules/fetcher.js";
import * as bootstrap from "./bootstrap/bootstrap.bundle.min.js";
import { initAuth } from "./modules/auth.js";
import { initSettings } from "./modules/settings.js";
import { initRouter } from "./modules/router.js";
import { createNavBar } from "./modules/navbar.js";
import { generateModal } from "./modules/modal.js";
import { initSidebar } from "./modules/friendSidebar.js";

import { render_game_board } from "./modules/pong.js";



(async function(){
	render_game_board()
	await createNavBar();
	initSettings();
	initRouter();
	initSidebar();
})();
