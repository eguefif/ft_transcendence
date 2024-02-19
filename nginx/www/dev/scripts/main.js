import * as bootstrap from "./bootstrap/bootstrap.bundle.min.js";
import { initAuth } from "./modules/auth.js";
import { initLocalPong } from "./modules/pong.js";
import { createPage } from "./modules/buttonNav.js";
import { fetcher } from "./modules/fetcher.js";
import { watchProfile } from "./modules/profile.js";
import { createNavBar } from "./modules/navbar.js";

(function(){
	createNavBar();
	createPage();
	watchProfile()
	// initAuth();
	initLocalPong();
})();
