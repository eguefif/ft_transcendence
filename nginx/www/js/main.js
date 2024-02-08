function authLogout()
{
	const logoutBtn = document.querySelector("#logoutButton")
	logoutBtn.addEventListener("click", async function(e){
			const body = localStorage.getItem('user')
			const csrf = localStorage.getItem('csrf')

			try {
					const res = await fetch("/api/logout/", {
						method: "DELETE",
						credentials: "same-origin",
						headers: {"Content-Type": "application/json", 'Authorization': 'Token ' + csrf},
						body: body
					})
					const data = await res.json()
					if (data.logout == true){
						localStorage.removeItem('csrf')
						showLogin()
					}
					else{
						console.log("Logout failed")
					}
			}
			catch (error) {
					console.log("Logout error: " + error)
			}
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
		sendLoginRequest(url, body)
	})
}

async function sendLoginRequest(url, body, method)
{
	const bodyJSON = JSON.stringify(body);
	try
	{
		const res = await fetch(url, {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: bodyJSON
		})
		const data = await res.json()
		localStorage.setItem('csrf', data.token)
		localStorage.setItem('user', JSON.stringify(data.user))
		$("#modalLogin").modal("hide")
		showLobby()
	}
	catch (error) {
			console.log("Error registration: " + error)
	}
	return ;
}

async function sendRegistrationRequest(url, body, method)
{
	const bodyJSON = JSON.stringify(body);
	try
	{
		const res = await fetch(url, {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: bodyJSON
		})
		const data = await res.json()
		localStorage.setItem('csrf', data.token)
		localStorage.setItem('user', JSON.stringify(data.user))
		return true
	}
	catch (error) {
			console.log("Error registration: " + error)
	}
	return ;
}

function showLobby()
{
		let loginButton = document.getElementById("loginButton")
		let logoutButton = document.getElementById("logoutButton")
		let registerButton = document.getElementById("registerButton")
		loginButton.classList.add('d-none')
		registerButton.classList.add('d-none')
		logoutButton.classList.remove('d-none')
}

function showLogin()
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
	return (token && token.length >= 1)
}

if (isAuthenticated() == true)
	showLobby()
else
	showLogin()

authRegister();
authLogin();
authLogout();
