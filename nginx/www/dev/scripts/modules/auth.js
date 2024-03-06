import { fetcher } from "./fetcher.js"
import { closeModal } from "./modalConnection.js";
import { refreshContent } from "./refreshContent.js"

export function authLogout()
{
	const logoutBtn = document.querySelector("#logoutButton")
	logoutBtn.addEventListener("click", async function(e){
		e.preventDefault()
		const result = await fetcher.post("/api/auth/logout", {})
		if (result.status >= 200 && result.status < 300) {
			localStorage.removeItem("refreshExpiry")
			fetcher.reset()
			await refreshContent()
		}
		else {
			console.log("Logout failed")
		}
	});
}

function resetPasswordsFormChecks() {
	const password = document.getElementById("password")
	const password_check = document.getElementById("password-check")
	const check = document.getElementById("passwordValidation")
	const check_check = document.getElementById("password-checkValidation")
	if (password_check) {
		password_check.classList.remove("is-invalid")
		password_check.classList.add("is-valid")
	}
	if (password) {
		password.classList.remove("is-invalid")
		password.classList.add("is-valid")
	}
	if (check-check)
		check_check.innerHTML = ""
	if (check)
		check.innerHTML = ""
}

function passwordsMatch(form) {
	resetPasswordsFormChecks()
	const reg = new RegExp("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?!.* ).{4,16}$")
	if (form["password"].value === "") {
		const password = document.getElementById("password")
		const check = document.getElementById("passwordValidation")
		if (password)
			password.classList.add("is-invalid")
		if (check)
			check.innerHTML = 'Password cannot be empty'
		return false
	}
	else if (!reg.test(form["password"].value)) {
		const password = document.getElementById("password")
		const check = document.getElementById("passwordValidation")
		if (password)
			password.classList.add("is-invalid")
		if (check)
			check.innerHTML = 'Password wrong format'
		return false
	}
	else if ((form["password"].value != form["password-check"].value)) {
		const password = document.getElementById("password-check")
		const check = document.getElementById("password-checkValidation")
		if (password)
			password.classList.add("is-invalid")
		if (check)
			check.innerHTML = 'Password does not match'
		return false
	}
	return true
}

function emailValid(form) {
	const email = form.email.value
	const reg = new RegExp("^[\\w\\-\\.]+@([\\w\\-]+\\.)+[\\w\\-]{2,4}$")
	if (!reg.test(email) || email.length == 0) {
		const email = document.getElementById("email")
		const check = document.getElementById("emailValidation")
		if (email)
			email.classList.add("is-invalid")
		if (check)
			email.innerHTML = "Your email is invalid. (test@test.com)"
		return false
	}
	else {
		const email = document.getElementById("email")
		const check = document.getElementById("emailValidation")
		if (email) {
			email.classList.remove("is-invalid")
			email.classList.add("is-valid")
	}
		if (check)
			email.innerHTML = ""
	}
	return true
}

function usernameValid(form) {
	const username = form.username.value
	const reg = new RegExp("^[a-zA-Z\\d]{4,24}$")
	if (!reg.test(username) || !username.length) {
		const username = document.getElementById("username")
		const check = document.getElementById("usernameValidation")
		if (username)
			username.classList.add("is-invalid")
		if (check)
			username.innerHTML = "Your username must have between 4-24 characters, only letters and numbers."
		return false
	}
	else {
		const username = document.getElementById("username")
		const check = document.getElementById("usernameValidation")
		if (username) {
			username.classList.remove("is-invalid")
			username.classList.add("is-valid")
		}
		if (check)
			username.innerHTML = ""
	}
	return true
}

function checkRegistrationForm(form) {
	let retval = true

	if (!passwordsMatch(form))
		retval = false
	if (!usernameValid(form))
		retval = false
	if (!emailValid(form))
		retval = false
	return retval
}

export function authRegister()
{
	const form = document.getElementById('registrationForm');
	form.addEventListener('submit', e => {
		e.preventDefault();
		if (checkRegistrationForm(form)) {
			const data = new FormData(e.target);
			const url = e.target.action
			const body = {
				'formType': "register",
				'username': data.get('username'),
				'email': data.get('email'),
				'password': data.get('password'),
				}
			  sendRegistrationRequest(url, body)
			}
		}, false);
}

async function sendRegistrationRequest(url, body)
{
	const refreshExpiry = Date.now() + fetcher.refreshDuration;
	const result = await fetcher.post(url, body);
	const form = document.getElementById("registrationForm")
	const inputs = document.querySelectorAll("input")
	inputs.forEach(input => {
		input.classList.remove("is-invalid")
		input.classList.add("is-valid")
	})
	if (result.status >= 400 && result.status < 500)
	{
		for (const obj in result.data)
		{
			if (obj != undefined) {
				const textbox = document.getElementById(`${obj}`)
				const validation = document.getElementById(`${obj}Validation`)
				textbox.classList.add("is-invalid")
				validation.classList.add("invalid-feedback")
				validation.innerHTML = result.data[obj]
				form.classList.remove("was-validated")
			}
		}
	}
	else if (result.status >= 200 && result.status < 300)
	{
		localStorage.setItem("refreshExpiry", `${refreshExpiry}`)
		fetcher.setAccess(result.data.accessToken);
		closeModal('connectionModal')
		await refreshContent()
		return true
	}
}

export function authLogin()
{
	const form  = document.getElementById('loginForm');
	form.addEventListener('submit', e => {
		e.preventDefault();
		if (form.checkValidity()) {
			const data = new FormData(e.target);
			const url = e.target.action
			const body = {
				'formType': "login",
				'username': data.get('username'),
				'password': data.get('password'),
			}
		sendLoginRequest(url, body)
		}
		else {
			const loginInput = document.getElementById("loginUsername")
			if (loginInput)
				loginInput.classList.add("is-invalid")
			const password = document.getElementById("loginPassword")
			if (password)
				password.classList.add("is-invalid")
		}
  	}, false);
	const login42 = document.querySelector("#login-42");
	login42.addEventListener("click", async function() {
		let result = await fetcher.post("/api/auth/oauth/42");
		if (result.status >= 200 && result.status < 300) {
			localStorage.setItem("oauth-42", "I'm a ninja");
			window.location.href = result.data.redirect
		}
	});
}

async function sendLoginRequest(url, body)
{
	const refreshExpiry = Date.now() + fetcher.refreshDuration;
	const result = await fetcher.post(url, body);
	const validationPass = document.getElementById("loginPassword")
	const loginInput = document.getElementById("loginUsername")
	const form = document.getElementById("loginForm")
	if (loginInput){
		loginInput.classList.remove("is-invalid")
		loginInput.classList.add("is-valid")
	}
	if (form)
		form.classList.remove("was-validated")
	if (validationPass) {
		validationPass.classList.remove("is-invalid")
		validationPass.classList.add("is-valid")
	}
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
			closeModal('connectionModal')
			refreshContent()
		}
		else {
			if (validationPass) {
				validationPass.classList.add("is-invalid")
				validationPass.innerHTML = "Something went wrong";
			}
		}
	}
	else
	{
		if (validationPass)
			validationPass.classList.add("is-invalid")
		if (loginInput)
			loginInput.classList.add("is-invalid")
	}
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
		closeModal("connectionModal");
		await refreshContent()
	}
	else {
		await requireOtp()
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

export async function tryAuthenticating() {
	if (! await fetcher.isTryingOauth()) {
		await fetcher.isAuthenticated()
	}
}
