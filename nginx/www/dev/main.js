import { initAuth } from "./js/auth.js"
import { initLocalPong } from "./js/pong.js"
import * as bootstrap from "./js/bootstrap.bundle.min.js"

(function(){
	initAuth()
	initLocalPong()
	console.log("allo");
})();
