import { fetcher } from "./fetcher.js"
import { pongMenu } from "./pong.js"
import { checkFrontEnd, closeModal } from "./modal.js";
import { createButton } from "./buttonNav.js";

export async function initAuth() {
	if (await fetcher.isAuthenticated()) {
		authLogout();
		profileInfo();
		changeProfile();
		authUpdateProfile();
	}
}

export function authLogout()
{
	const logoutBtn = document.querySelector("#logoutSVG")
	logoutBtn.addEventListener("click", async function(e){
		const result = await fetcher.post("/api/auth/logout", {})
		if (result.status >= 200 && result.status < 300) {
			localStorage.removeItem("refreshExpiry")
			fetcher.reset()
			await createButton()
			await pongMenu()
		}
		else {
			console.log("Logout failed")
		}
	});
}

// function validateInput(textBox, validationBox, errorMessage) {
//     textBox.addEventListener('focusout', (event) => {
// 		event.preventDefault()
//         const value = textBox.value;
//         if ( value.length < 4) {
//             validationBox.classList.add("error");
//             validationBox.innerHTML = errorMessage;
//         }
// 		else {
// 			validationBox.classList.remove("error");
//             validationBox.innerHTML = "";
// 		}
//     });
// }

/*
function validatePassword(textBox, validationBox) {
	textBox.addEventListener('focusout', (e) => {
		e.preventDefault()
		const value = textBox.value
		if (value.length < 4) {
			validationBox.classList.add("error")
			validationBox.innerHTML = "Password is too short"
		} else {
			validationBox.classList.remove("error");
            validationBox.innerHTML = "";
		}
	})
}

function validatePasswordCheck(passTextBox, confirmTextBox, confirmValidationBox) {
	confirmTextBox.addEventListener('focusout', (e) => {
		const passValue = passTextBox.value
		const passCheckValue = confirmTextBox.value
		if (passValue != passCheckValue) {
			confirmValidationBox.classList.add("error")
			confirmValidationBox.innerHTML = "Passwords don't match"
		} else {
			confirmValidationBox.classList.remove("error")
			confirmValidationBox.innerHTML = ""
		}
	})
}
*/

// const textBoxName = document.getElementById('username');
// const textBoxEmail = document.getElementById('email');
// const textBoxPassword = document.getElementById('password');
// const textBoxPasswordCheck = document.getElementById('password-check');

// const usernameValidationBox = document.getElementById('usernameValidation');
// const emailValidationBox = document.getElementById('emailValidation');
// const passwordValidationBox = document.getElementById('passwordValidation');
// const passwordCheckValidationBox = document.getElementById('password-checkValidation');

// validateInput(textBoxName, usernameValidationBox, "This field is the wrong size.");
// validateInput(textBoxEmail, emailValidationBox, "This field is the wrong size.");
// validatePassword(textBoxPassword, passwordValidationBox);
// validatePasswordCheck(textBoxPassword, textBoxPasswordCheck, passwordCheckValidationBox);

export function authRegister()
{
	const registrationForm = document.querySelector("#registrationForm")
	if (checkFrontEnd()) {

	}
		registrationForm.addEventListener("submit", function(e){
			e.preventDefault()
			const data = new FormData(e.target);
			const url = e.target.action
			const body = {
				'formType': "register",
				'username': data.get('username'),
				'email': data.get('email'),
				'password': data.get('password'),
			}
			sendRegistrationRequest(url, body)
		})
}

export function authLogin()
{
	const registrationForm = document.querySelector("#loginForm")
	registrationForm.addEventListener("submit", function(e){
		e.preventDefault()
		const data = new FormData(e.target);
		const url = e.target.action
		const body = {
			'formType': "login",
			'username': data.get('username'),
			'password': data.get('password'),
		}
		sendLoginRequest(url, body)
	})
}

function authUpdateProfile()
{
	const modifyProfileForm = document.querySelector("#profileForm")
	modifyProfileForm.addEventListener("submit", function (e) {
		e.preventDefault()
		const data = new FormData(e.target)
		const url = e.target.action
		const body = {
			'username': data.get('username'),
			'email': data.get('email'),
		}
		sendUpdateProfileRequest(url, body)
	})
}

function profileInfo()
{
	const profileBtn = document.querySelector("#profileButton")
	profileBtn.addEventListener("click", async function (e) {
		document.querySelector("#profileUsername").disabled = true
		document.querySelector("#profileEmail").disabled = true
		document.querySelector("#profileSaveChanges").classList.add("d-none")
		document.querySelector("#profileImageContainer").classList.add("d-none")
		document.querySelector("#modifyProfile").classList.remove("d-none")
		const imgElement = document.getElementById("profilePicture")
		imgElement.src = "images/default-user-picture.png"
		const imageReply = await fetcher.get("api/userpicture/")
		if (imageReply.status == 200) {
			const imageURL = URL.createObjectURL(imageReply.data)
			imgElement.src = imageURL
			imgElement.onload = () => {
				URL.revokeObjectURL(imageReply.data)
			}
		}
		const res = await fetcher.get("api/userinfo/")
		if (res.status == 200) {

			document.querySelector("#profileUsername").value = res.data['username']
			document.querySelector("#profileEmail").value = res.data['email']
		}
	})
}

function changeProfile()
{
	const modifyProfileBtn = document.querySelector("#modifyProfile")
	modifyProfileBtn.addEventListener("click", async function (e) {
		const profileUsername = document.querySelector("#profileUsername")
		const emailUsername = document.querySelector("#profileEmail")
		profileUsername.disabled = false
		emailUsername.disabled = false
		document.querySelector("#modifyProfile").classList.add("d-none")
		document.querySelector("#profileSaveChanges").classList.remove("d-none")
		document.querySelector("#profileImageContainer").classList.remove("d-none")
	})
}

function resetFormInput(form) {
	const inputs = form.querySelectorAll("input")
	inputs.forEach(input => {
		input.classList.remove("is-invalid")
		input.classList.add("is-valid")
	})
	// Reset validations
}

async function sendUpdateProfileRequest(url, body)
{
	const profileUsername = document.querySelector("#profileUsername")
	const profileEmail = document.querySelector("#profileEmail")
	const profileUsernameValidation = document.querySelector("#profileUsernameValidation")
	const profileEmailValidation = document.querySelector("#profileEmailValidation")

	const form = document.getElementById("profileForm")
	resetFormInput(form)

	const res = await fetcher.post(url, body)
	if (res.status == 201)
	{
		document.querySelector("#profileSaveChanges").classList.add("d-none")
		document.querySelector("#profileImageContainer").classList.add("d-none")
		document.querySelector("#modifyProfile").classList.remove("d-none")
		profileUsername.disabled = true
		profileEmail.disabled = true
		// alert test
		document.querySelector("#profileModal").insertAdjacentHTML("afterbegin", `
		<div class="alert alert-success alert-dismissible fade show" role="alert">
			<strong>Success!</strong> Your information has been saved.
			<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
		</div>
		`)
	}
	else if (res.status == 400)
	{
		const data = res.data

		if (data['username'])
		{
			profileUsername.classList.add("is-invalid")
			profileUsernameValidation.classList.add("invalid-feedback")
			profileUsernameValidation.innerHTML = data['username']
		}
		if (data['email'])
		{
			profileEmail.classList.add("is-invalid")
			profileEmailValidation.classList.add("invalid-feedback")
			profileEmailValidation.innerHTML = data['email']
		}
	}
}

async function sendLoginRequest(url, body)
{
	const refreshExpiry = Date.now() + fetcher.refreshDuration;
	const result = await fetcher.post(url, body);
	const validation = document.getElementById("loginValidation")
	if (result.status >= 200 && result.status < 300)
	{
		if (result.data.otpToken) {
			fetcher.setAccess(result.data.otpToken);
			await requireOtp();
			return;
		}
		else if (result.data.accessToken) {
			localStorage.setItem("refreshExpiry", `${refreshExpiry}`)
			fetcher.setAccess(result.data.accessToken);
		  await createButton()
		  closeModal('connectionModal')
			await pongMenu()
		}
		else {
			validation.innerHTML = "Something went wrong";
		}
	}
	else
	{
		document.getElementById("loginPassword").value = ""
		// validation.innerHTML = "Wrong credentials"
	}
	return ;
}

async function requireOtp() {
	let code;
	while (!code) {
		code = prompt("Please enter one time password");
	}
	const refreshExpiry = Date.now() + fetcher.refreshDuration;
	const result = await fetcher.post("/api/auth/otp/login", {"code": code});
	if (result.status >= 200 && result.status < 300){
		localStorage.setItem("refreshExpiry", `${refreshExpiry}`)
		fetcher.setAccess(result.data.accessToken);
		document.querySelector("#modalLogin").classList.remove("show")
		document.querySelector(".modal-backdrop").classList.remove("show")
		showLobby()
	}
	else {
		await requireOtp()
	}
}

async function sendRegistrationRequest(url, body)
{
	const form = document.getElementById("registrationForm")
	const inputs = form.querySelectorAll("input")
	inputs.forEach(input => {
		input.classList.remove("is-invalid")
		input.classList.add("is-valid")
	})
	const refreshExpiry = Date.now() + fetcher.refreshDuration;
	const result = await fetcher.post(url, body);
	if (result.status >= 400 && result.status < 500)
	{
		for (const obj in result.data)
		{
			const textbox = document.getElementById(`${obj}`)
			const validation = document.getElementById(`${obj}Validation`)
			textbox.classList.add("is-invalid")
			validation.classList.add("invalid-feedback")
			validation.innerHTML = result.data[obj]
		}
	}
	else if (result.status >= 200 && result.status < 300)
	{
		localStorage.setItem("refreshExpiry", `${refreshExpiry}`)
		fetcher.setAccess(result.data.accessToken);
		await createButton()
		closeModal('connexionModal')
		await pongMenu()
		return true
	}
}

// THIS IS A TEMPORARY SETUP TO VALIDATE BACKEND AND NEEDS TO BE IMPLEMENTED PROPERLY
function activateOtp() {
	const button = document.createElement("button");
	button.innerText = "Activate 2FA";
	document.querySelector("body").appendChild(button);
	button.addEventListener("click", async function() {
		const result = await fetcher.post("/api/auth/otp/activate");
		const qrcode = document.createElement("div")
		let qrcodeSvq = result.data.otpCode;
		qrcode.innerHTML = result.data.otpCode; 
		document.querySelector("body").appendChild(qrcode);
		setTimeout(() => {
			qrcode.remove();
		}, 5000);
	})
	const otherButton = document.createElement("button");
	otherButton.innerText = "Deactivate 2FA";
	document.querySelector("body").appendChild(otherButton);
	otherButton.addEventListener("click", async function() {
		let result = await fetcher.post("/api/auth/otp/deactivate");
	})
}
