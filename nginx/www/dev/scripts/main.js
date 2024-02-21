import { fetcher } from "./modules/fetcher.js";
import * as bootstrap from "./bootstrap/bootstrap.bundle.min.js";
import { initAuth } from "./modules/auth.js";
import { createButton } from "./modules/buttonNav.js";
import { watchProfile } from "./modules/profile.js";
import { initRouter } from "./modules/router.js";
import { createNavBar } from "./modules/navbar.js";
import { generateModal } from "./modules/modal.js";

(async function(){
	createNavBar();
	generateModal();
	await createButton();
	initAuth();
	initRouter();
	watchProfile();
})();
