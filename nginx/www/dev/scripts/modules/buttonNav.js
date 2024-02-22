import { authLogout } from "./auth.js";
import { fetcher } from "./fetcher.js";
import { getSVG } from "./iconSVG.js";


export async function createButton () {
	/*
	const element = document.querySelector('.navbar-nav');
	console.log(element)
	if (!element) {
		document.querySelector('#navbarNavDropdown').insertAdjacentHTML("afterbegin", createUl("navbar-nav ms-auto"));
	}
	*/

	if (await fetcher.isAuthenticated()) {

		/*
		const element = document.querySelector('.navbar-nav');
		element.innerHTML = createModalBtn("nav-item btn-primary", "profile", getSVG.navbarSVG.profil);
		const firstElement = document.getElementById("profileButton")
		element.insertAdjacentHTML("beforeend", createActionBtn("nav-item btn-primary", "logout", getSVG.navbarSVG.logout, "idLogout"));
		firstElement.insertAdjacentHTML("afterend", createActionBtn("nav-item btn-primary", "seting", getSVG.navbarSVG.seting, "settings", "/profile", "data-link"));
		*/
		createBtns()
		authLogout()
	}
	else {
		//const element = document.querySelector('.navbar-nav');
		const element = document.getElementById("navbarNavDropdown")
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
		<li class="${btnClasses}" id="${btnName}Button">
			<a id="${idLink}" href="${route}" ${dataL}>
			${srcImg}
			</a>
		</li>
	`
}

function createBtns() {
	let nav = document.getElementById("navbarNavDropdown")
	nav.innerHTML = `
		<ul class="navbar-nav ms-auto">
			<li class="nav-item btn-primary" id="setingButton">
				<a id="id" href="/profile" data-link>
				${getSVG.navbarSVG.profil}
				</a>
			</li>
			<li class="nav-item btn-primary" id="profileButton"
				data-bs-toggle="modal"
				data-bs-target="#profileModal">
				${getSVG.navbarSVG.seting}
				<text></text>
			</li>
			<li class="nav-item btn-primary" id="logoutButton">
				<a id="idLogout" href="">
				${getSVG.navbarSVG.logout}
				</a>
			</li>
	</ul>
	`
}
