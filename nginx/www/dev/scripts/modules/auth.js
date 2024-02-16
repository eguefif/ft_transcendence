import { fetcher } from "./fetcher.js"
import { pongMenu } from "./pong.js"

function authLogout()
{
	const logoutBtn = document.querySelector("#logoutButton")
	logoutBtn.addEventListener("click", async function(e){
		const result = await fetcher.post("/api/auth/logout", {})
		if (result.status >= 200 && result.status < 300) {
			localStorage.removeItem("refreshExpiry")
			fetcher.reset()

			showLogin()
			await pongMenu()
		}
		else {
			console.log("Logout failed")
		}
	});
}

function validateInput(textBox, validationBox, errorMessage) {
    textBox.addEventListener('focusout', (event) => {
		event.preventDefault()
        const value = textBox.value;
        if ( value.length < 4) {
            validationBox.classList.add("error");
            validationBox.innerHTML = errorMessage;
        }
		else {
			validationBox.classList.remove("error");
            validationBox.innerHTML = "";
		}
    });
}

const textBoxName = document.getElementById('username');
const textBoxEmail = document.getElementById('email');
const textBoxPassword = document.getElementById('password');
const textBoxPasswordCheck = document.getElementById('password-check');

const usernameValidationBox = document.getElementById('usernameValidation');
const emailValidationBox = document.getElementById('emailValidation');
const passwordValidationBox = document.getElementById('passwordValidation');
const passwordCheckValidationBox = document.getElementById('password-checkValidation');

validateInput(textBoxName, usernameValidationBox, "This field is the wrong size.");
validateInput(textBoxEmail, emailValidationBox, "This field is the wrong size.");
validateInput(textBoxPassword, passwordValidationBox, "This field is the wrong size.");
validateInput(textBoxPasswordCheck, passwordCheckValidationBox, "This field is the wrong size.");

function authRegister()
{
	const registrationForm = document.querySelector("#registrationForm")
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

function authLogin()
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

function profileInfo()
{
	const profileBtn = document.querySelector("#profileButton")
	profileBtn.addEventListener("click", async function (e) {
		const user = JSON.parse(localStorage.getItem('user'))
		const csrf = localStorage.getItem('csrf')
		console.log(user)
		try {
			const res = await fetch(`/api/userinfo/?id=${user['id']}`, {
				method: "GET",
				credentials: "same-origin",
				headers: {"Content-Type": "application/json", 'Authorization': 'Token ' + csrf}
			})
			const data = await res.json()
			console.log(data)
			if (res.status == 200)
			{

			}
			else
			{

			}
		} catch (error) {
			console.log("Profile: could not get user info")
		}
	})
}

async function sendLoginRequest(url, body, method)
{
	const refreshExpiry = Date.now() + fetcher.refreshDuration;
	const result = await fetcher.post(url, body);
	const validation = document.getElementById("loginValidation")
	if (result.status >= 200 && result.status < 300)
	{
		localStorage.setItem("refreshExpiry", `${refreshExpiry}`)
		fetcher.setAccess(result.data.accessToken);
		validation.innerHTML = ""
		document.querySelector("#modalLogin").classList.remove("show")
		document.querySelector(".modal-backdrop").classList.remove("show")
		showLobby()
		await pongMenu()
		console.log("test")
	}
	else
	{
		document.getElementById("loginPassword").value = ""
		validation.innerHTML = "Wrong credentials"
	}
	return ;
}

async function sendRegistrationRequest(url, body, method)
{

	// TODO faire fonctions reset inputs a valid
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
		document.querySelector("#modalRegistration").classList.remove("show")
		document.querySelector(".modal-backdrop").classList.remove("show")
		showLobby()
		await pongMenu()
		return true
	}
}

function showLobby()
{
		let loginButton = document.getElementById("loginButton")
		let logoutButton = document.getElementById("logoutButton")
		let registerButton = document.getElementById("registerButton")
		let profileButton = document.getElementById("profileButton")
		loginButton.classList.add('d-none')
		registerButton.classList.add('d-none')
		logoutButton.classList.remove('d-none')
		profileButton.classList.remove('d-none')
}

function showLogin()
{
		let loginButton = document.getElementById("loginButton")
		let logoutButton = document.getElementById("logoutButton")
		let registerButton = document.getElementById("registerButton")
		let profileButton = document.getElementById("profileButton")
		loginButton.classList.remove('d-none')
		registerButton.classList.remove('d-none')
		logoutButton.classList.add('d-none')
		profileButton.classList.add('d-none')
}

export async function initAuth() {
	if (await fetcher.isAuthenticated()) {
		showLobby()
	}
	else
	{
		showLogin()
	}

	authRegister();
	authLogin();
	authLogout();
	profileInfo();
}
