export function closeModal(modalID) {
	let modal = document.getElementById(modalID)
	const modalInstance = bootstrap.Modal.getInstance(modal);
	if (modalInstance != null) {
		modalInstance.hide()
	}
}

function CreateModal(name) {
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

function createFormLogin() {
	return `
		<form id="loginForm" action="api/auth/token" method="POST">
			<div class="mb-3">
				<label for="username" class="form-label">Username</label>
				<input type="username" name='username' id="loginUsername" class="form-control">
			</div>
			<div class="mb-3">
				<label for="password" class="form-label">Password</label>
				<input type="password" name='password' id="loginPassword" class="form-control">
				<span id="loginValidation" class="error text-danger"></span>
			</div>
			<button type="submit" value="Login" class="btn btn-primary">Submit</button>
			<button id="btnOpenRegister" class="btn btn-primary">Register</button>
		</form>
	`
}

function createFormRegister() {
	return  `
		<form id="registrationForm" action="api/auth/token" method="POST">
			<div class="mb-3">
				<label for="username" class="form-label">Username</label>
				<input type="username" name='username' id="username" class="form-control">
				<small class="form-text text-muted">
					Your username must have between 4-24 characters, only letters and numbers.
				</small>
				<div id="usernameValidation"></div>
			</div>
			<div class="mb-3">
				<label for="email" class="form-label">Email</label>
				<input type="email" name='email' id="email" class="form-control">
				<div id="emailValidation"></div>
			</div>
			<div class="mb-3">
				<label for="password" class="form-label">Password</label>
				<input type="password" name='password' id="password" class="form-control">
				<small class="form-text text-muted">
					Your password must have between 4-24 characters, at least one uppercase, one lowercase and one number.
				</small>
				<div id="passwordValidation"></div>
			</div>
			<div class="mb-3">
				<label for="password-check" class="form-label">Comfirm Password</label>
				<input type="password" name='password-check' id="password-check" class="form-control">
				<div id="password-checkValidation"></div>
			</div>
			<button type="submit" value="Register" class="btn btn-primary">Submit</button>
		</form>
		`
}

document.querySelector('body').insertAdjacentHTML("afterbegin", CreateModal("login"));
document.querySelector(".modal-body").insertAdjacentHTML("afterbegin", createFormLogin());
document.getElementById("btnOpenRegister").addEventListener('click', function(e) {
	e.preventDefault();
	document.querySelector('#loginForm').remove();
	// document.querySelector('body').insertAdjacentHTML("afterbegin", CreateModal("register"));
	document.querySelector('.modal-body').insertAdjacentHTML("afterbegin", createFormRegister());
	});

