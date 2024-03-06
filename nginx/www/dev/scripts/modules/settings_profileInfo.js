import { fetcher } from "./fetcher.js"
import { sendAlert, closeCovering } from "./utils.js"
import { updateUserData } from "./settings.js"

export async function initProfileInfoCard() {
	const modalBody = document.querySelector('.modal-body')
	const buttonEdit = document.getElementById("info-edit-button")
	buttonEdit.addEventListener("click", (e) => {
		initProfileInfoForm();
	});
}

function initProfileInfoForm() {
	createProfileInfoForm();
	profileInfoFormInteractions();
}

function createProfileInfoForm() {
	const modal = document.getElementById("settingsModal").querySelector(".modal-body");
	let form = document.createElement("div");
	form.classList.add("covering");
	form.innerHTML = `
		<form id="profileForm" action="api/profile/updateprofile/" method="POST" novalidate>
			<div class="mb-3">
				<label for="info-form-first-name" class="col-md-3 col-form-label">First Name</label>
				<input type="text" name="firstName" id="info-form-first-name" class="form-control" placeholder="First Name">
				<div class="validation-field" id="info-form-first-name-validation"></div>
			</div>
			<div class="mb-3">
				<label for="info-form-last-name" class="col-md-3 col-form-label">Last Name</label>
				<input type="text" name="lastName" id="info-form-last-name" class="form-control" placeholder="Last Name">
				<div class="validation-field" id="info-form-last-name-validation"></div>
			</div>
			<div class="mb-3">
				<label for="info-form-email" class="col-md-3 col-form-label">Email</label>
				<input type="email" name="email" id="info-form-email" class="form-control" placeholder="email" pattern="^[\\w\\-\\.]+@([\\w\\-]+\\.)+[\\w\\-]{2,4}$">
				<div class="validation-field" id="info-form-email-validation"></div>
			</div>
			<button type="submit" class="btn btn-primary" id="info-form-save">Save changes</button>
			<button type="button" class="btn btn-light" id="info-form-cancel">Cancel</button>
		</form>
	`
	const currFirstName = document.getElementById("info-first-name").querySelector(".user-dependent").innerText;
	const currLastName = document.getElementById("info-last-name").querySelector(".user-dependent").innerText;
	const currEmail = document.getElementById("info-email").querySelector(".user-dependent").innerText;
	modal.appendChild(form);
	setTimeout(() => {form.classList.add("show");}, 25);
	if (currFirstName) {
		document.getElementById("info-form-first-name").setAttribute('value', currFirstName);
	}
	if (currLastName) {
		document.getElementById("info-form-last-name").setAttribute('value', currLastName);
	}
	if (currEmail) {
		document.getElementById("info-form-email").setAttribute('value', currEmail);
	}
	if (document.getElementById("auth-type").querySelector(".user-dependent").innerText.includes("42")) {
		const emailField = document.getElementById("info-form-email");
		emailField.disabled = true;
		emailField.classList.add(".form-control-disabled");
	}
}

function profileInfoFormInteractions()
{
	const modifyProfileForm = document.getElementById("profileForm");
	const btnCancel = document.getElementById("info-form-cancel");

	btnCancel.addEventListener("click", function () {
		closeCovering(modifyProfileForm.parentElement);
	})

	const inputFields = modifyProfileForm.querySelectorAll("input");
	inputFields.forEach((inputField) => {
		inputField.addEventListener("input", () => {
			inputField.classList.remove("is-invalid");
			inputField.parentElement.querySelector(".validation-field").innerText = "";
			inputField.parentElement.querySelector(".validation-field").classList.remove("invalid-feedback");
		});
	});

	modifyProfileForm.addEventListener("submit", async function (e) {
		e.preventDefault();
		if (profileInfoChanged()) {
			if (profileInfoFormIsValid(modifyProfileForm)) {
				let data;
				if (document.getElementById("info-form-email").disabled) {
					document.getElementById("info-form-email").disabled = false;
					data = new FormData(e.target);
					document.getElementById("info-form-email").disabled = true;
				} else {
					data = new FormData(e.target);
				}
				const url = e.target.action;
				const body = {
					'email': data.get('email'),
					'first_name': data.get('firstName'),
					'last_name': data.get('lastName'),
				}
				await sendUpdateProfileRequest(url, body)
			}
		} else {
			closeCovering(modifyProfileForm.parentElement);
		}
	})
}

function profileInfoChanged() {
	const currFirstName = document.getElementById("info-first-name").querySelector(".user-dependent").innerText;
	const currLastName = document.getElementById("info-last-name").querySelector(".user-dependent").innerText;
	const currEmail = document.getElementById("info-email").querySelector(".user-dependent").innerText;
	const formFirstName = document.getElementById("info-form-first-name").value;
	const formLastName = document.getElementById("info-form-last-name").value;
	const formEmail = document.getElementById("info-form-email").value;
	if (currFirstName != formFirstName || currLastName != formLastName || currEmail != formEmail)
		return true;
	return false;
}

function profileInfoFormIsValid() {
	const currFirstName = document.getElementById("info-first-name").querySelector(".user-dependent").innerText;
	const currLastName = document.getElementById("info-last-name").querySelector(".user-dependent").innerText;
	const currEmail = document.getElementById("info-email").querySelector(".user-dependent").innerText;
	const firstNameField = document.getElementById("info-form-first-name");
	const firstNameValidation = document.getElementById("info-form-first-name-validation");
	const lastNameField = document.getElementById("info-form-last-name");
	const lastNameValidation = document.getElementById("info-form-last-name-validation");
	const emailField = document.getElementById("info-form-email");
	const emailValidation = document.getElementById("info-form-email-validation");
	let toggle = true;

	if (currFirstName != firstNameField.value && firstNameField.value.length > 35) {
		firstNameField.classList.add("is-invalid")
		firstNameValidation.classList.add("invalid-feedback")
		firstNameValidation.innerText = "First name is too long"
		toggle = false;
	}
	if (currLastName != lastNameField.value && lastNameField.value.length > 35) {
		lastNameField.classList.add("is-invalid")
		lastNameValidation.classList.add("invalid-feedback")
		lastNameValidation.innerText = "Last name is too long"
		toggle = false;
	}
	if (currEmail != emailField.value && (!emailField.validity.valid || emailField.value.length < 3)) {
		emailField.classList.add("is-invalid")
		emailValidation.classList.add("invalid-feedback")
		emailValidation.innerText = "Email is not valid"
		toggle = false;
	}
	return toggle;
}

async function sendUpdateProfileRequest(url, body)
{
	const res = await fetcher.post(url, body)
	if (res.status >= 200 && res.status < 300)
	{
		const form = document.getElementById("profileForm")
		const alert = sendAlert('success', 'Your information has been saved', 3000)
		await updateUserData();
		closeCovering(form.parentElement);
	}
	else if (res.status >= 400 && res.status < 500)
	{
		const firstNameField = document.getElementById("info-form-first-name");
		const firstNameValidation = document.getElementById("info-form-first-name-validation");
		const lastNameField = document.getElementById("info-form-last-name");
		const lastNameValidation = document.getElementById("info-form-last-name-validation");
		const emailField = document.getElementById("info-form-email");
		const emailValidation = document.getElementById("info-form-email-validation");
		if (res.data['first_name'])
		{
			firstNameField.classList.add("is-invalid")
			firstNameValidation.classList.add("invalid-feedback")
			firstNameValidation.innerText = res.data['first_name']
		}
		if (res.data['last_name'])
		{
			lastNameField.classList.add("is-invalid")
			lastNameValidation.classList.add("invalid-feedback")
			lastNameValidation.innerText = res.data['last_name']
		}
		if (res.data['email'])
		{
			emailField.classList.add("is-invalid")
			emailValidation.classList.add("invalid-feedback")
			emailValidation.innerText = res.data['email']
		}
	}
}
