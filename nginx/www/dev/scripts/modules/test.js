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
	</ul>
	`

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
