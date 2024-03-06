//import * as bootstrap from "../bootstrap/bootstrap.bundle.min.js";
import { authRegister, authLogin } from "./auth.js"
import { getSVG } from "./iconSVG.js";
import { removeModal } from "./navbar.js";

export function closeModal(modalID) {
	let modal = document.getElementById(modalID)
	const modalInstance = bootstrap.Modal.getInstance(modal);
	if (modalInstance != null) {
		modalInstance.hide()
	}
}

export function generateModalConnection() {
	removeModal()
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
	document.querySelector('.modal-body').insertAdjacentHTML("afterbegin", createFormLogin());
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
	document.querySelector('.modal-body').insertAdjacentHTML("afterbegin", createFormRegister());
	const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
	const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
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
					<div class="modal-body">
						<div class="d-flex align-items-center justify-content-center flex-gap-1">
							<hr style="width: 33%;" class="solid">
							<span>OR</span>
							<hr style="width: 33%;" class="solid">
						</div>
						<div class="d-flex align-items-center justify-content-center mt-2">
							<button type="button" id="login-42" class="btn btn-primary">Login with 42</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	`
}

function createFormLogin() {
	return `
	<div id="createFormLogin">
		<form class="needs-validation" novalidate id="loginForm" action="api/auth/token" method="POST">
			<div class="mb-3">
				<label for="loginUsername" class="form-label">Username</label>
				<input type="username" name='username' id="loginUsername" class="form-select">
			</div>
			<div class="mb-3">
				<label for="loginPassword" class="form-label">Password</label>
				<input type="password" name='password' id="loginPassword" class="form-control">
				<div class="invalid-feedback">
					Password or login invalid.
				</div>
			</div>
			<div class="container text-center">
				<button form="loginForm" type="submit" class="btn btn-primary">Submit</button>
				<div class="d-flex align-items-center justify-content-center flex-gap-1">
				<text class="text-light fs-6">Don't have an account yet ? </text><text class="fs-6" id="btnOpenRegister">Create account</text>
				</div>
			</div>
		</form>
	</div>
	`
}

function createFormRegister() {
	return  `
	<div id="createFormRegister">
		<form class="needs-validation" novalidate id="registrationForm" action="api/auth/token" method="POST">
			<div class="mb-3">
				<label for="username" class="form-label">Username</label>
				<div class="input-group mb-3">
					<input type="username" name='username' id="username" class="form-control">
					<span data-bs-toggle="tooltip" data-bs-title="Your username must have between 4-24 characters, only letters and numbers." data-bs-placement="right" class="input-group-text">${getSVG.formSVG.help}</span>
				<div  id="usernameValidation" class="invalid-feedback">
					Your username must have between 4-24 characters, only letters and numbers.
				</div>
				</div>
			</div>
			<div class="mb-3">
				<label for="email" class="form-label">Email</label>
				<input type="email" name='email' id="email" class="form-control" required pattern="^[\\w\\-\\.]+@([\\w\\-]+\\.)+[\\w\\-]{2,4}$">
				<div id="emailValidation" class="invalid-feedback">
					Your email is not a valid email ("exemple@domaine.exp").
				</div>
			</div>
			<div class="mb-3">
				<label for="password" class="form-label">Password</label>
				<div class="input-group mb-3">
					<input  type="password" name='password' id="password" class="form-control">
					<span data-bs-toggle="tooltip" data-bs-title="Your password must have between 4-24 characters, at least one uppercase, one lowercase and one number." data-bs-placement="right" class="input-group-text">${getSVG.formSVG.help}</span>
					<div id="passwordValidation" class="invalid-feedback">
						Your password must have between 4-24 characters, at least one uppercase, one lowercase and one number.
					</div>
					<div class="valid-feedback"></div>
				</div>
			</div>
			<div class="mb-3">
				<label for="password-check" class="form-label">Comfirm Password</label>
				<input type="password" name='password-check' id="password-check" class="form-control" required>
				<div class="valid-feedback"></div>
				<div id="password-checkValidation" class="invalid-feedback">
					Your password is not the same
				</div>
			</div>
			<div class="container text-center">
				<button type="submit" value="Register" class="btn btn-primary">Submit</button>
				<div class="d-flex align-items-center justify-content-center flex-gap-1">
					<text class="text-light fs-6">Already have an account ? </text><text class="fs-6" id="btnOpenLogin">login</text>
				</div>
			</div>
		</form>
	</div>
		`
}
