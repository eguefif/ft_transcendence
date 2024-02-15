import * as bootstrap from "./bootstrap/bootstrap.bundle.min.js";
import { fetcher } from "./modules/fetcher.js";
import { initAuth } from "./modules/auth.js";
import { initLocalPong } from "./modules/pong.js";
import { createPage } from "./modules/test.js";

(function(){
	createPage();
	initAuth();
	initLocalPong();
})();
