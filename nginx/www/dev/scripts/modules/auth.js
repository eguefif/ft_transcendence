import { fetcher } from "./fetcher.js"
import { pongMenu } from "./pong.js"
import { closeModal } from "./modalConnection.js";
import { createButton } from "./buttonNav.js";
import { initSidebar } from "./friendSidebar.js"

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
			console.log("Logout failed")
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
		await createButton()
		closeModal('connectionModal')
		await pongMenu()
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
