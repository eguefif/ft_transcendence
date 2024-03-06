import { generateModalConnection } from "./modalConnection.js";
import { createButton } from "./buttonNav.js";
import { getSVG } from "./iconSVG.js"

export async function createNavBar () {
	document.querySelector('body').insertAdjacentHTML("afterbegin", navHTML());
	await createButton();
}

function navHTML() {
	return `
	<nav class="navbar navbar-expand-sm sticky-top bg-dark">
		<div class="container-fluid">
			<a class="navbar navbar-brand" href="/" data-link>
				${getSVG.navbarSVG.logo}
			</a>
			<div id="navBarButton">
			</div>
		</div>
	</nav>
	`
}

export function removeModal() {
	const settingsModal = document.getElementById('settingsModal')
	const connectionModal = document.getElementById('connectionModal')
	if(settingsModal) {
		settingsModal.remove()
	}
	if(connectionModal) {
		connectionModal.remove()
	}
}
