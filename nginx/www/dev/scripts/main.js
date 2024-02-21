import { fetcher } from "./modules/fetcher.js";
import * as bootstrap from "./bootstrap/bootstrap.bundle.min.js";
import { initAuth } from "./modules/auth.js";
import { createPage } from "./modules/test.js";
import { initSettings } from "./modules/settings.js";
import { initRouter } from "./modules/router.js";

(function(){
	createPage();
	initRouter();
	initSettings();
	initAuth();
})();
