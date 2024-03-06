import { fetcher } from "./fetcher.js"
import { pongMenu } from "./pong.js"
import { closeModal } from "./modalConnection.js";
import { createButton } from "./buttonNav.js";
import { initSidebar } from "./friendSidebar.js";
import { closeCovering, sendAlert } from "./utils.js";

export function authLogout()
{
	const logoutBtn = document.querySelector("#logoutButton")
	logoutBtn.addEventListener("click", async function(e){
		e.preventDefault()
		const result = await fetcher.post("/api/auth/logout", {})
		if (result.status >= 200 && result.status < 300) {
			localStorage.removeItem("refreshExpiry")
			fetcher.reset()
			await createButton()
			await pongMenu()
			await initSidebar()
		}
		else {
			console.log("Logout failed");
		}
	});
}

export function authRegister()
{
	const formsRegister = document.querySelectorAll('.needs-validation');
	Array.from(formsRegister).forEach(form => {
		form.addEventListener('submit', e => {
			if (!form.checkValidity()) {
			e.preventDefault();
			e.stopPropagation();
		  }
		  else {
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
		}

		form.classList.add('was-validated');
	}, false);
});
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
		closeModal('connectionModal')
		await createButton()
		await pongMenu()
		await initSidebar()
		return true
	}
}

export function authLogin()
{
	const formsLogin = document.querySelectorAll('.needs-validation');
	Array.from(formsLogin).forEach(form => {
		form.addEventListener('submit', e => {
			if (!form.checkValidity()) {
				e.preventDefault();
				e.stopPropagation();
			}
			else {
				e.preventDefault();
			const data = new FormData(e.target);
			const url = e.target.action
			const body = {
				'formType': "login",
				'username': data.get('username'),
				'password': data.get('password'),
			}
			sendLoginRequest(url, body)
		}

		form.classList.add('was-validated');
	  }, false);
	});
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
		  	await createButton()
			await pongMenu()
			await initSidebar()
		}
		else {
			validationPass.innerHTML = "Something went wrong";
		}
	}
	else
	{
		const validation = document.querySelectorAll(".invalid-feedback")
		document.getElementById("loginUsername").value = ""
		validation[0].innerText = "Wrong credentials"
		document.getElementById("loginPassword").value = ""
		validation[1].innerText = "Wrong credentials"
	}
	return ;
}

async function requireOtp() {
	const otpField = createOtpField();
	otpField.querySelector("#otp-login-cancel").addEventListener("click", () => {
		closeCovering(otpField);
	});
	otpField.querySelector("input").addEventListener("input", (e) => {
		e.target.classList.remove("is-invalid");
	});
	otpField.querySelector("form").addEventListener("submit", async (e) => {
		e.preventDefault();
		const data = new FormData(e.target);
		const code = data.get('otp-code');
		if (!code || !(/^\d+$/.test(code))) {
			otpField.querySelector("input").classList.add("is-invalid");
			return;
		}
		const refreshExpiry = Date.now() + fetcher.refreshDuration;
		const result = await fetcher.post("/api/auth/otp/login", {'code': code});
		if (result.status >= 200 && result.status < 300) {
			closeCovering(otpField);
			localStorage.setItem("refreshExpiry", `${refreshExpiry}`)
			fetcher.setAccess(result.data.accessToken);
			closeModal("connectionModal");
			await createButton();
			await pongMenu();
			await initSidebar();
		}
		else {
			otpField.querySelector("input").classList.add("is-invalid");
		}
	});
}

function createOtpField() {
	const modal = document.querySelector("#connectionModal").querySelector(".modal-body");
	let otpField = document.createElement("div");
	otpField.classList.add("covering");
	otpField.innerHTML = `
		<span>Please enter your 2FA one-time password.</span>
		<form id="form-otp-login" action="/api/auth/otp/login" method="POST">
			<input class="form-control" name="otp-code" type="text"></input>
		</form>
		<div class="d-flex flex-row">
			<button type="submit" id="otp-login-confirm" form="form-otp-login" class="btn btn-primary">Submit</button>
			<button type="button" id="otp-login-cancel" class="btn btn-light">Cancel</button>
		</div>`
	modal.appendChild(otpField);
	setTimeout(() => {otpField.classList.add("show");}, 25);
	return otpField;
}

export async function tryAuthenticating() {
	if (! await fetcher.isTryingOauth()) {
		await fetcher.isAuthenticated()
	}
}
