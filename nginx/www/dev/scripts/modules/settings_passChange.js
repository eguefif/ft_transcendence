import * as bootstrap from "../bootstrap/bootstrap.bundle.min.js";
import { fetcher } from "./fetcher.js"
import { sendAlert, closeCovering } from "./utils.js"
import { getSVG } from "./iconSVG.js"

export function initPasswordChange() {
	if (document.getElementById("auth-type").querySelector(".user-dependent").innerText.includes("Standard")) {
		const anchor = document.createElement("a");
		anchor.innerText = "Change password";
		document.getElementById("pass-change").appendChild(anchor);
		anchor.addEventListener("click", () => {
			createPasswordChangeForm();
			passwordChangeFormInteractions();
		});
	}
}

function createPasswordChangeForm() {
	const modal = document.getElementById("settingsModal").querySelector(".modal-body");
	let form = document.createElement("div");
	form.classList.add("covering");
	form.innerHTML = `
		<form id="password-change-form" action="api/auth/password-change" method="POST" novalidate>
			<div class="form-field mb-2">
				<label for="old-password" class="form-label">Old password</label>
				<input type="password" name='old-password' id="old-password" class="form-control" required>
				<div class="validation-field" id="old-password-validation"></div>
			</div>

			<div class="form-field mb-2">
				<label for="new-password" class="form-label">New password</label>
				<div class="with-tooltip">
					<input  type="password" name='new-password' id="new-password" class="form-control" required pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d\\w\\W]{4,24}$">
					<span data-bs-toggle="tooltip" data-bs-title="Your password must have between 4-24 characters, at least one uppercase, one lowercase and one number." data-bs-placement="right" class="input-group-text">${getSVG.formSVG.help}</span>
				</div>
				<div class="validation-field" id="new-password-validation"></div>
		
			</div>
			<div class="form-field mb-2">
				<label for="confirm-password" class="form-label">Confirm new password</label>
				<input type="password" name='confirm-password' id="confirm-password" class="form-control" required>
				<div class="validation-field" id="confirm-password-validation"></div>
			</div>
			<div class="btn-container">
				<button type="submit" class="btn btn-primary" id="password-change-form-save">Save changes</button>
				<button type="button" class="btn btn-light" id="password-change-form-cancel">Cancel</button>
			</div>
		</form>
	`
	modal.appendChild(form);
	setTimeout(() => {form.classList.add("show");}, 25);
	const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
	const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
}

function passwordChangeFormInteractions() {
	const passwordChangeForm = document.getElementById("password-change-form");
	const btnCancel = document.getElementById("password-change-form-cancel");

	btnCancel.addEventListener("click", function () {
		closeCovering(passwordChangeForm.parentElement);
	})

	const inputFields = passwordChangeForm.querySelectorAll("input");
	inputFields.forEach((inputField) => {
		inputField.addEventListener("input", () => {
			inputField.classList.remove("is-invalid");
			const validationId = inputField.id + "-validation";
			document.getElementById(validationId).innerText = "";
			document.getElementById(validationId).classList.remove("invalid-feedback");
		});
	});

	passwordChangeForm.addEventListener("submit", async function (e) {
		e.preventDefault();
		if (passwordChangeFormIsValid(passwordChangeForm)) {
			const data = new FormData(e.target);
			const url = e.target.action;
			const body = {
				'password': data.get('old-password'),
				'new_password': data.get('new-password'),
			}
			await sendPasswordChangeRequest(url, body);
		}
	})
}

function passwordChangeFormIsValid(form) {
	const oldPasswordField = document.getElementById("old-password");
	const oldPasswordValidation = document.getElementById("old-password-validation");
	const newPasswordField = document.getElementById("new-password");
	const newPasswordValidation = document.getElementById("new-password-validation");
	const confirmPasswordField = document.getElementById("confirm-password");
	const confirmPasswordValidation = document.getElementById("confirm-password-validation");
	let toggle = true

	if (oldPasswordField.value.length == 0) {
		oldPasswordField.classList.add("is-invalid");
		oldPasswordValidation.classList.add("invalid-feedback");
		oldPasswordValidation.innerText = "Please provide your old password";
		toggle = false;
	}
	if (!newPasswordField.validity.valid || newPasswordField.value.length == 0) {
		newPasswordField.classList.add("is-invalid");
		newPasswordValidation.classList.add("invalid-feedback");
		newPasswordValidation.innerText = "Password does not meet requirements";
		toggle = false;
	}
	if (confirmPasswordField.value != newPasswordField.value && (newPasswordField.validity.valid && newPasswordField.value.length > 0)) {
		confirmPasswordField.classList.add("is-invalid");
		confirmPasswordValidation.classList.add("invalid-feedback");
		confirmPasswordValidation.innerText = "Passwords do not match";
		toggle = false;
	}
	return toggle;
}

async function sendPasswordChangeRequest(url, body) {
	const res = await fetcher.post(url, body)
	if (res.status >= 200 && res.status < 300)
	{
		const form = document.getElementById("password-change-form")
		const alert = sendAlert('success', 'Your password was changed successfully', 3000)
		closeCovering(form.parentElement);
	}
	else if (res.status >= 400 && res.status < 500)
	{
		const oldPasswordField = document.getElementById("old-password");
		const oldPasswordValidation = document.getElementById("old-password-validation");
		const newPasswordField = document.getElementById("new-password");
		const newPasswordValidation = document.getElementById("new-password-validation");
		if (res.status == 404) {
			oldPasswordField.classList.add("is-invalid");
			oldPasswordValidation.classList.add("invalid-feedback");
			oldPasswordValidation.innerText = res.data['old_password']
		}
		else {
			newPasswordField.classList.add("is-invalid");
			newPasswordValidation.classList.add("invalid-feedback")
			newPasswordValidation.innerText = res.data['new_password']
		}
	}
}
