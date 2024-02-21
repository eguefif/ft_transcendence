import { authLogout } from "./auth.js";
import { fetcher } from "./fetcher.js";
import { getSVG } from "./iconSVG.js";


export async function createButton () {
	const element = document.querySelector('.navbar-nav');
	if (!element) {
		document.querySelector('#navbarNavDropdown').insertAdjacentHTML("afterbegin", createUl("navbar-nav ms-auto"));
	}

	if (await fetcher.isAuthenticated()) {

		const element = document.querySelector('.navbar-nav');
		element.innerHTML = createModalBtn("nav-item btn-primary", "profile", getSVG.navbarSVG.profil);
		const firstElement = document.getElementById("profileButton")
		element.insertAdjacentHTML("beforeend", createActionBtn("nav-item btn-primary", "logout", getSVG.navbarSVG.logout, "idLogout"));
		firstElement.insertAdjacentHTML("afterend", createActionBtn("nav-item btn-primary", "seting", getSVG.navbarSVG.seting));
		authLogout()
	}
	else {
		const element = document.querySelector('.navbar-nav');
		element.innerHTML = createModalBtn("nav-item btn-primary", "connection","" , "Connexion");
	}
}

function createUl (ulClasses="") {
	return `
	<ul class="${ulClasses}">
	</ul>`
}

function createModalBtn (btnClasses="", btnName="", srcImg="", name ="") {
return `
		<li class="${btnClasses}" id="${btnName}Button"
			data-bs-toggle="modal"
			data-bs-target="#${btnName}Modal">
			${srcImg}
			<text>${name}</text>
		</li>
	`
}

function createActionBtn (btnClasses="", btnName ="", srcImg="", idLink ="", route="") {
	return `
		<li class="${btnClasses}" id="${btnName}Button">
			<a id="${idLink} href="${route}">
			${srcImg}
			</a>
		</li>
	`
}