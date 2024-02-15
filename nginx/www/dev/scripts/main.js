import * as bootstrap from "./bootstrap/bootstrap.bundle.min.js";
import { initAuth } from "./modules/auth.js";
import { initLocalPong } from "./modules/pong.js";
import { createPage } from "./modules/test.js";
import { fetcher } from "./modules/fetcher.js";

(function(){
	createPage();
	initAuth();
	initLocalPong();
})();
