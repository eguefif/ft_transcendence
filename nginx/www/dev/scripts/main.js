import * as bootstrap from "./bootstrap/bootstrap.bundle.min.js"
import { initAuth } from "./modules/auth.js"
import { initLocalPong } from "./modules/pong.js"
import { createPage } from "./modules/test.js"
import { remoteGame } from "./modules/pong-remote.js"
import { localGame } from "./modules/pong-local.js"

(function(){
	createPage()
	initAuth()
	initLocalPong()
})();
