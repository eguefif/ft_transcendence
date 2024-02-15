<<<<<<< HEAD
import * as bootstrap from "./bootstrap/bootstrap.bundle.min.js";
import { initAuth } from "./modules/auth.js";
import { initLocalPong } from "./modules/pong.js";
import { createPage } from "./modules/test.js";
import { fetcher } from "./modules/fetcher.js";
=======
import * as bootstrap from "./bootstrap/bootstrap.bundle.min.js"
import { initAuth } from "./modules/auth.js"
import { initLocalPong } from "./modules/pong.js"
import { createPage } from "./modules/test.js"
>>>>>>> 54a2174650c3b191cc4c037282bfe419fca9a2e6

(function(){
	createPage();
	initAuth();
	initLocalPong();
})();
