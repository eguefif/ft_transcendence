import { fetcher } from "./fetcher.js";


export async function createButton () {
	document.querySelector('#navbarNavDropdown').insertAdjacentHTML("afterbegin", createUl("navbar-nav ms-auto"));
	const element = document.querySelector('.navbar-nav');

	if (await fetcher.isAuthenticated()) {
		element.innerHTML = createModalBtn("nav-item btn btn-primary", "profile", "navbar-brand test", "images/Person-Icon.svg");
		element.insertAdjacentHTML("beforeend", createActionBtn("nav-item btn btn-primary", "logout", "navbar-brand test", "images/logout-Icon.svg"));
	}
	else {
		element.innerHTML = createModalBtn("nav-item btn btn-primary", "login", "navbar-brand test", "images/login-Icon.svg");
		// element.insertAdjacentHTML("afterbegin", createModalBtn("nav-item btn btn-secondary", "register", "navbar-brand test", "images/Setting.svg"));
	}
}

function createUl (ulClasses="") {
	return `
	<ul class="${ulClasses}">
	</ul>`
}

function createModalBtn (btnClasses="", btnName="", aClasses="", srcImg="") {
return `
		<li class="${btnClasses}" id="${btnName}Button"
			data-bs-toggle="modal"
			data-bs-target="#${btnName}Modal">
			<img src="${srcImg}" />
		</li>
	`
}

function createActionBtn (btnClasses="", btnName ="", aClasses="", srcImg="", ref="") {
	return `
		<li class="${btnClasses}" id="${btnName}Button">
			<a class="${aClasses}" href="${ref}">
				<img src="${srcImg}" />
			</a>
			${btnName}
		</li>
	`
}