import { authLogout } from "./auth.js";
import { fetcher } from "./fetcher.js";
import { getSVG } from "./iconSVG.js";
import { initRouter } from "./router.js";


export async function createButton () {
	/*
	const element = document.querySelector('.navbar-nav');
	console.log(element)
	if (!element) {
		document.querySelector('#navBarButton').insertAdjacentHTML("afterbegin", createUl("navbar-nav ms-auto"));
	}
	*/

	if (await fetcher.isAuthenticated()) {

		/*
		const element = document.querySelector('.navbar-nav');
		element.innerHTML = createModalBtn("nav-item btn-primary", "profile", getSVG.navbarSVG.profil);
		const firstElement = document.getElementById("profileButton")
		element.insertAdjacentHTML("beforeend", createActionBtn("nav-item btn-primary", "logout", getSVG.navbarSVG.logout, "idLogout"));
		firstElement.insertAdjacentHTML("afterend", createActionBtn("nav-item btn-primary", "seting", getSVG.navbarSVG.seting, "seting", "/profile", "data-link"));
		*/
		createBtns()
		authLogout()
	}
	else {
		//const element = document.querySelector('.navbar-nav');
		const element = document.getElementById("navBarButton")
		element.innerHTML = createModalBtn("nav-item btn-primary", "connection","" , "Connexion");
	}
}

function createUl (ulClasses="") {
	return `
	<ul class="${ulClasses}">
	</ul>`
}

function createModalBtn(btnClasses="", btnName="", srcImg="", name ="") {
	return `
			<li class="${btnClasses}" id="${btnName}Button"
				data-bs-toggle="modal"
				data-bs-target="#${btnName}Modal">
				${srcImg}
				<text>${name}</text>
			</li>
		`
}

function createActionBtn (btnClasses="", btnName ="", srcImg="", idLink ="", route="", dataL="") {
	return `
		<li class="${btnClasses}" id="${btnName}Button" ${dataL}>
			<a id="${idLink}" href="${route}" ${dataL}>
			${srcImg}
			</a>
		</li>
	`
}

function createBtns() {
	let nav = document.getElementById("navBarButton")
	nav.innerHTML = `
		<div class="d-flex navbar-nav ms-auto">
			<a id="profileButton" class="nav-item mx-2" href="/profile" data-link>
				${getSVG.navbarSVG.profile}
			</a>
			<a class="nav-item btn-primary mx-2" id="settingsButton"
				data-bs-toggle="modal"
				data-bs-target="#settingsModal">
				${getSVG.navbarSVG.settings}
			</a>

			<a id="logoutButton" class ="nav-item btn-primary mx-2" href="">
			${getSVG.navbarSVG.logout}
			</a>
		</div>
	`
}
//