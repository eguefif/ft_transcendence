import { fetcher } from "./fetcher.js"
import { pongMenu } from "./pong.js"
import { closeModal } from "./modal.js";
import { createButton } from "./buttonNav.js";

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
	const profileBtn = document.querySelector("#settingButton")
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
			closeModal('connectionModal')
		  	await createButton()
			await pongMenu()
		}
		else {
			validation.innerHTML = "Something went wrong";
		}
	}
	else
	{
		document.getElementById("loginPassword").value = ""
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

export async function initAuth() {
	if (await fetcher.isAuthenticated()) {
		authLogout();
		profileInfo();
		changeProfile();
		authUpdateProfile();
	}
}
