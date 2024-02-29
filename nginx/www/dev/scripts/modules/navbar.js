import { generateModalConnection } from "./modalConnection.js";
import { createButton } from "./buttonNav.js";

export async function createNavBar () {
	document.querySelector('body').insertAdjacentHTML("afterbegin", navHTML());
	generateModalConnection();
	await createButton();
}

function navHTML() {
	return `
	<nav class="navbar navbar-expand-sm sticky-top bg-dark">
		<div class="container-fluid">
			<a class="navbar navbar-brand" href="/" data-link>
				<img src="images/logo-new.png" class="nav noclick" alt="" width="150" />
			</a>
			<div id="navBarButton">
			</div>
		</div>
	</nav>
	`
}


