import * as bootstrap from "./bootstrap/bootstrap.bundle.min.js";
import { initAuth } from "./modules/auth.js";
import { initLocalPong } from "./modules/pong.js";
import { createButton } from "./modules/buttonNav.js";
import { fetcher } from "./modules/fetcher.js";
import { watchProfile } from "./modules/profile.js";
import { createNavBar } from "./modules/navbar.js";

(async function(){
	createNavBar();
	await createButton();
	watchProfile()
	initAuth();
	initLocalPong();
})();
