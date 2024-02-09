import { initAuth } from "./modules/auth.js"
import { initLocalPong } from "./modules/pong.js"
import { createPage } from "./modules/test.js";

(function(){
	initLocalPong()
	createPage()
	initAuth()
})();
