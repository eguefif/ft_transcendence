
export function closeModal(modalID) {
	let modal = document.getElementById(modalID)
	const modalInstance = bootstrap.Modal.getInstance(modal);
	if (modalInstance != null) {
		modalInstance.hide()
	}
}


let register = "register"
let login = "login"
let logout = "logout"

const test = `
<ul class="navbar-nav ms-auto">
<li class="nav-item btn btn-secondary" id="registerButton"
data-bs-toggle="modal"
data-bs-target="#modalRegistration">
${register}
</li>
<li class="nav-item btn btn-secondary" id="loginButton"
data-bs-toggle="modal"
data-bs-target="#modalLogin">
${login}
</li>
</ul>`

const test1 = `
<li class="nav-item btn btn-secondary d-none shadow-none border-0"" id="logoutButton">
${logout}
</li>
<li class="nav-item btn btn-secondary d-none shadow-none border-0" id="profileButton"
data-bs-toggle="modal"
data-bs-target="#modalProfile">
Profile
</li>`

export function createPage () {
	document.querySelector('#navbarNavDropdown').insertAdjacentHTML("afterbegin", test);
	document.querySelector('.navbar-nav').insertAdjacentHTML("afterbegin", test1);
}

// // import { fetcher } from "./modules/fetcher.js";
// import { fetcher } from "./fetcher.js";

// async function createNavbarMenu()
// {
// 	if (!await fetcher.isAuthenticated()) {
// 		var loginButton = createNavbarModalButton("loginButton", "modalLogin", "Login")
// 		var registerButton = createNavbarModalButton("registerButton", "modalRegistration", "Register")
// 		var profileButton = createNavbarModalButton("profileButton", "modalProfile", "Profile", "d-none")
// 		var logoutButton = createNavbarButton("logoutButton", "Logout", "d-none")
// 	} else {
// 		var loginButton = createNavbarModalButton("loginButton", "modalLogin", "Login", "d-none")
// 		var registerButton = createNavbarModalButton("registerButton", "modalRegistration", "Register", "d-none")
// 		var profileButton = createNavbarModalButton("profileButton", "modalProfile", "Profile")
// 		var logoutButton = createNavbarButton("logoutButton", "Logout")
// 	}

// 	return `<ul class="navbar-nav ms-auto">
// 	${registerButton}${loginButton}${profileButton}${logoutButton}
// 	</ul>`
// }

// function createNavbarModalButton(buttonID, modalTargetID, content ="", classes="") {
// 	let btnClasses = "nav-item btn btn-secondary " + classes

// 	return `<li class="${btnClasses}" id="${buttonID}"
// 	data-bs-toggle="modal"
// 	data-bs-target="#${modalTargetID}">
// 		${content}
// 	</li>`
// }

// function createNavbarButton(buttonID, content="", classes="") {
// 	let btnClasses = "nav-item btn btn-secondary " + classes

// 	return `<li class="${btnClasses}" id="${buttonID}">
// 		${content}
// 	</li>`
// }

// export async function createPage () {
// 	document.querySelector('#navbarNavDropdown').insertAdjacentHTML("afterbegin", await createNavbarMenu());
// 	new bootstrap.Modal(document.getElementById('modalLogin'))
// 	new bootstrap.Modal(document.getElementById('modalRegistration'))
// }
