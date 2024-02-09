import { initAuth } from "./modules/auth.js"
import { initLocalPong } from "./modules/pong.js"
import * as bootstrap from "./bootstrap/bootstrap.bundle.min.js"

(function(){
	initAuth();
	initLocalPong();
})();
