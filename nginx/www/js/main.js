function authLogout()
{
	const logoutBtn = document.querySelector("#logoutButton")
	logoutBtn.addEventListener("click", async function(e){
			const body = localStorage.getItem('user')
			const bodyJSON = JSON.stringify(body);
			await fetch("/api/logout/", {
				method: "DELETE",
				credentials: "same-origin",
				headers: {"Content-Type": "application/json"},
				body: bodyJSON
			})
			.then((response) => response.json())
			.then((result) => {
					console.log(result)
					localStorage.removeItem('csrf')
			})
			.catch(() => {
				throw new Error("Leaderboards fetch failed")
			})
			}
		)
}

function authRegister()
{
	const registrationForm = document.querySelector("#registrationForm")
	registrationForm.addEventListener("submit", function(e){
		e.preventDefault()
		const data = new FormData(e.target);
		const url = e.target.action
		const body = {
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
			'username': data.get('username'),
			'password': data.get('password'),
		}
		sendRegistrationRequest(url, body)
	})
}

async function sendRegistrationRequest(url, body, method)
{
	let returnValue
	const bodyJSON = JSON.stringify(body);
	await fetch(url, {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: bodyJSON
	})
	.then((response) => response.json())
    .then((result) => {
        returnValue = result
    })
    .then(() => {
		localStorage.setItem('csrf', returnValue.token)
		//localStrorage.setItem('user', returnValue.user)
    })
    .catch(() => {
        throw new Error("Leaderboards fetch failed")
    })
	return;
}

function turnOnLobby()
{
		let loginButton = document.getElementById("loginButton")
		let logoutButton = document.getElementById("logoutButton")
		let registerButton = document.getElementById("registerButton")
		loginButton.classList.add('d-none')
		registerButton.classList.add('d-none')
		logoutButton.classList.remove('d-none')
}

function turnOffLobby()
{
		let loginButton = document.getElementById("loginButton")
		let logoutButton = document.getElementById("logoutButton")
		let registerButton = document.getElementById("registerButton")
		loginButton.classList.remove('d-none')
		registerButton.classList.remove('d-none')
		logoutButton.classList.add('d-none')
}

function isAuthenticated()
{
	token = localStorage.getItem('csrf')
	return (typeof token != "undefine" && token.length >= 1)
}

if (isAuthenticated() == true)
	turnOnLobby()
else
	turnOffLobby()

authRegister();
authLogin();
authLogout();
