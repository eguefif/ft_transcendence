import { fetcher } from "./modules/fetcher.js";
import * as bootstrap from "./bootstrap/bootstrap.bundle.min.js";
import { tryAuthenticating } from "./modules/auth.js";
import { initSettings, profileInfo, changeProfile, authUpdateProfile } from "./modules/settings.js";
import { initRouter } from "./modules/router.js";
import { createNavBar } from "./modules/navbar.js";
import { render_game_board } from "./modules/pong.js";
import { initSidebar } from "./modules/friendSidebar.js";

(async function(){
	await tryAuthenticating();
	render_game_board()
	await createNavBar();
	authUpdateProfile();
	initSettings();
	await initSidebar()
	profileInfo();
	changeProfile();
	initRouter();
})();
