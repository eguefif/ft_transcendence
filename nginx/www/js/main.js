import { initAuth } from "./modules/auth.js"
import { initLocalPong } from "./modules/pong.js"

(function(){
	initAuth()
	initLocalPong()
})();
