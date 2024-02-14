import * as bootstrap from "./bootstrap/bootstrap.bundle.min.js"
import { initAuth } from "./modules/auth.js"
import { initLocalPong } from "./modules/pong.js"
import { createPage } from "./modules/test.js";
import { watchProfile } from "./modules/profile.js";

(function(){
	createPage()
	watchProfile()
	initAuth()
	initLocalPong()
})();
