import { authRegister, authLogin } from "./auth.js"

export function closeModal(modalID) {
	let modal = document.getElementById(modalID)
	const modalInstance = bootstrap.Modal.getInstance(modal);
	if (modalInstance != null) {
		modalInstance.hide()
	}
}

export function generateModal() {
	//document.querySelector('nav').insertAdjacentHTML("afterend", CreateModal("connection"));
	let modals = document.getElementById("modals_frame")
	modals.innerHTML = createLoginModal()
	modals.innerHTML += getProfileModal()
	displayLoginForm();
}

function getProfileModal() {
	return `
		<div class="modal fade" id="profileModal">
			<div class="modal-dialog modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h1 class="modal-title fs-5" id="profileLabel">Profile</h1>
						<div class="btn-close" data-bs-dismiss="modal"></div>
					</div>
					<div id="profilePictureContainer">
						<img id="profilePicture" class="rounded-circle border" alt="profilePicture" width="150" height="150" src="images/default-user-picture.png"/>
					</div>
					<div class="modal-body">
						<form id="profileForm" action="api/updateprofile/" method="PATCH">
							<div id="profileImageContainer" class="mb-3 d-none">
								<label for="formFile" class="form-label">Profile picture</label>
								<input class="form-control" type="file" id="profileImageField">
								<div id="pictureUploadValidation" class="error text-danger"></div>
							</div>
							<div class="mb-3">
								<label for="username" class="col-md-3 col-form-label">Username</label>
								<input type="username" name="username" id="profileUsername" class="form-control" placeholder="username" disabled>
								<div id="profileUsernameValidation"></div>
							</div>
							<div class="mb-3">
								<label for="email" class="col-md-3 col-form-label">Email</label>
								<input type="email" name="email" id="profileEmail" class="form-control" placeholder="email" disabled>
								<div id="profileEmailValidation"></div>
							</div>
							<button type="button" class="btn btn-primary" id="modifyProfile">Modify</button>
							<button type="submit" class="btn btn-primary d-none" id="profileSaveChanges">Save changes</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	
	`
}

function displayLoginForm() {
	document.querySelector("#loginModalTitle").innerText = "Login";
	document.querySelector('#loginModalBody').innerHTML = createFormLogin();
	authLogin();
	const btnSwitchRegister = document.getElementById("btnOpenRegister")
	if (btnSwitchRegister != undefined) {
		btnSwitchRegister.addEventListener('click', function(e) {
			e.preventDefault()
			displayRegistrationForm()
		});
	}
}

function displayRegistrationForm() {
	document.querySelector("#loginModalTitle").innerText = "Register";
	document.querySelector('#loginModalBody').innerHTML = createFormRegister();
	authRegister();
	const btnSwitchLogin = document.getElementById("btnOpenLogin")
	if (btnSwitchLogin != undefined) {
		btnSwitchLogin.addEventListener('click', function(e) {
			e.preventDefault()
			displayLoginForm();
		});
	}
}

function createLoginModal() {
	return `
		<div class="modal fade" id="loginModal">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<h1 class="modal-title fs-5" id="loginModalTitle"></h1>
						<div class="btn-close" data-bs-dismiss="modal"></div>
					</div>
					<div id="loginModalBody" class="modal-body">
					</div>
				</div>
			</div>
		</div>
	`
}

function createFormLogin() {
	return `
		<form class="needs-validation" novalidate id="loginForm" action="api/auth/token" method="POST">
			<div class="mb-3">
				<label for="username" class="form-label">Username</label>
				<input type="username" name='username' id="loginUsername" class="form-control" required>
				<div class="invalid-feedback">
					Your username must have between 4-24 characters, only letters and numbers.
				</div>
			</div>
			<div class="mb-3">
				<label for="password" class="form-label">Password</label>
				<input type="password" name='password' id="loginPassword" class="form-control" required>
				<div class="invalid-feedback">
					Your password must have between 4-24 characters, at least one uppercase, one lowercase and one number.
				</div>
			</div>
			<button type="submit" value="Login" class="btn btn-primary">Submit</button>
			<button id="btnOpenRegister" class="btn btn-primary">Register</button>
		</form>
	`
}

function createFormRegister() {
	return  `
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
					Your email is enter a valid email ("exemple@domaine.exp").
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
			<button id="btnOpenLogin" class="btn btn-primary">Login</button>
		</form>
		`
}




export function checkFrontEnd() {
	const forms = document.querySelectorAll('.needs-validation')
	Array.from(forms).forEach(form => {
		form.addEventListener('submit', event => {
			if (!form.checkValidity()) {
				event.preventDefault()
				event.stopPropagation()
			}
			form.classList.add('was-validated')
		}, false)
	})
}

function removeForm() {
	const loginForm = document.querySelector('#loginForm');
	const registrationForm = document.querySelector('#registrationForm');
	if (loginForm) {
		loginForm.remove();
	}
	if (registrationForm) {
		registrationForm.remove();
	}
}


function createModal(name) {
	return `
		<div class="modal fade" id="${name}Modal">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<h1 class="modal-title fs-5" id="${name}Label">${name}</h1>
						<div class="btn-close" data-bs-dismiss="modal"></div>
					</div>
					<div class="modal-body">
					</div>
				</div>
			</div>
		</div>
	`
}