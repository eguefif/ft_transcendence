import { authRegister, authLogin } from "./auth.js"

export function closeModal(modalID) {
	let modal = document.getElementById(modalID)
	const modalInstance = bootstrap.Modal.getInstance(modal);
	if (modalInstance != null) {
		modalInstance.hide()
	}
}

export function generateModal() {
	document.querySelector('nav').insertAdjacentHTML("afterend", CreateModal("connection"));
	addLoginForm();
}

function removeForm() {
	const loginForm = document.getElementById('createFormLogin');
	const registrationForm = document.getElementById('createFormRegister');
	if (loginForm) {
		loginForm.remove();
	}
	if (registrationForm) {
		registrationForm.remove();
	}
}

function addLoginForm() {
	document.querySelector("#connectionLabel").innerText = "Login";
	document.querySelector('.modal-content').insertAdjacentHTML("beforeend", createFormLogin());
	authLogin();
	const btnSwitchRegister = document.getElementById("btnOpenRegister")
	btnSwitchRegister.addEventListener('click', function(e) {
		e.preventDefault()
		removeForm();
		addRegistrationForm()
	});
}

function addRegistrationForm() {
	document.querySelector("#connectionLabel").innerText = "Register";
	document.querySelector('.modal-content').insertAdjacentHTML("beforeend", createFormRegister());
	authRegister();
	const btnSwitchLogin = document.getElementById("btnOpenLogin")
	btnSwitchLogin.addEventListener('click', function(e) {
		e.preventDefault()
		removeForm();
		addLoginForm();
	});
}

function CreateModal(name) {
	return `
		<div class="modal fade" id="${name}Modal">
			<div class="modal-dialog">
				<div class="modal-content bg-dark">
					<div class="modal-header">
						<h1 class="modal-title fs-5" id="${name}Label"></h1>
						<div class="btn-close" data-bs-dismiss="modal"></div>
					</div>
				</div>
			</div>
		</div>
	`
}

function createFormLogin() {
	return `
	<div id="createFormLogin" class="modal-body">
		<form class="needs-validation" novalidate id="loginForm" action="api/auth/token" method="POST">
			<div class="mb-3">
				<label for="username" class="form-label">Username</label>
				<input type="username" name='username' id="loginUsername" class="form-control" required>
				<div class="invalid-feedback">
					Your user name is required
				</div>
			</div>
			<div class="mb-3">
				<label for="password" class="form-label">Password</label>
				<input type="password" name='password' id="loginPassword" class="form-control" required>
				<div class="invalid-feedback">
					Your password is required
				</div>
			</div>
		</form>
		<button form="loginForm" type="submit" class="btn btn-primary">Submit</button>
		<button class="btn btn-primary">Login with 42</button>
		<div class="modal-footer">
			<a id="btnOpenRegister">Register</a>
		</div>
	</div>
	`
}

function createFormRegister() {
	return  `
	<div id="createFormRegister" class="modal-body">
		<form class="needs-validation" novalidate id="registrationForm" action="api/auth/token" method="POST">
			<div class="mb-3">
				<label for="username" class="form-label">Username</label>
				<input type="username" name='username' id="username" class="form-control" required>
				<div  id="usernameValidation" class="invalid-feedback">
					Your username must have between 4-24 characters, only letters and numbers.
				</div>
			</div>
			<div class="mb-3">
				<label for="email" class="form-label">Email</label>
				<input type="email" name='email' id="email" class="form-control" required>
				<div id="emailValidation" class="invalid-feedback">
					Your email is not a valid email ("exemple@domaine.exp").
				</div>
			</div>
			<div class="mb-3">
				<label for="password" class="form-label">Password</label>
				<input type="password" name='password' id="password" class="form-control" required>
				<div id="passwordValidation" class="invalid-feedback">
					Your password must have between 4-24 characters, at least one uppercase, one lowercase and one number.
				</div>
			</div>
			<div class="mb-3">
				<label for="password-check" class="form-label">Comfirm Password</label>
				<input type="password" name='password-check' id="password-check" class="form-control" required>
				<div id="password-checkValidation" class="invalid-feedback">
					Your password is not the same
				</div>
			</div>
			<button type="submit" value="Register" class="btn btn-primary">Submit</button>
		</form>
		<div class="modal-footer">
			<a id="btnOpenLogin">Login</a>
		</div>
	</div>
		`
}
