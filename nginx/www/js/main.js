import { initAuth } from "./modules/auth.js"
import { iniLocalPong } from "./modules/pong.js"

(function(){
	initAuth()
	initLocalPong()
})();
