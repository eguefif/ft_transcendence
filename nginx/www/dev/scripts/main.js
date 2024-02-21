import { fetcher } from "./modules/fetcher.js";
import * as bootstrap from "./bootstrap/bootstrap.bundle.min.js";
import { tryAuthenticating, initAuth } from "./modules/auth.js";
import { createPage } from "./modules/test.js";
import { watchProfile } from "./modules/profile.js";
import { initRouter } from "./modules/router.js";

(async function(){
	await tryAuthenticating();
	createPage();
	initRouter();
	watchProfile();
	initAuth();
})();
