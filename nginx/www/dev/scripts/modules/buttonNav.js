import { authLogout } from "./auth.js";
import { fetcher } from "./fetcher.js";
import { getSVG } from "./iconSVG.js";
import { generateModalConnection } from "./modalConnection.js";
import { initSettings, profileInfo, changeProfile, authUpdateProfile, generateModalSettings } from "./settings.js";


export async function createButton () {
	if (await fetcher.isAuthenticated()) {
		createBtns()
		authLogout()
		document.querySelector('nav').insertAdjacentHTML('afterend', generateModalSettings())
		authUpdateProfile()
		initSettings()
		profileInfo()
		changeProfile()
	}
	else {
		const element = document.getElementById("navBarButton")
		element.innerHTML = createModalBtn("nav-item btn-primary", "connection","" , "Login / Register");
	}
}

function createModalBtn(btnClasses="", btnName="", srcImg="", name ="") {
	return `
			<div class="${btnClasses} mx -3" id="${btnName}Button"
				data-bs-toggle="modal"
				data-bs-target="#${btnName}Modal">
				${srcImg}
				<text>${name}</text>
			</div>
		`
}

function createBtns() {
	let nav = document.getElementById("navBarButton")
	nav.innerHTML = `
		<div class="d-flex navbar-nav ms-auto">
			<a id="profileButton" class="nav-item mx-3" href="/profile" data-link>
				${getSVG.navbarSVG.profile}
			</a>
			<a class="nav-item btn-primary mx-3" id="settingsButton"
				data-bs-toggle="modal"
				data-bs-target="#settingsModal">
				${getSVG.navbarSVG.settings}
			</a>
			<a id="logoutButton" class ="nav-item btn-primary mx-3" href="">
				${getSVG.navbarSVG.logout}
			</a>
		</div>
	`
}
