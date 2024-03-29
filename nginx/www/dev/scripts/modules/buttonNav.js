import { authLogout } from "./auth.js";
import { fetcher } from "./fetcher.js";
import { getSVG } from "./iconSVG.js";
import { generateSettings } from "./settings.js";
import { generateModalConnection } from "./modalConnection.js";


export async function createButton () {
	if (await fetcher.isAuthenticated()) {
		createBtns()
		authLogout()
		await generateSettings()
	}
	else {
		const element = document.getElementById("navBarButton")
		element.innerHTML = createModalBtn("nav-item btn-primary", "connection","" , "Login / Register");
		generateModalConnection();
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
			<text id="textFriendBtn"
			class="position-relative"
			data-bs-toggle="collapse"
			data-bs-target="#sidebarCollapse"
			>${getSVG.navbarSVG.friends}
			</text>
			<div id="friendBtnNavbar" class="nav-item mx-3"></div>
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
