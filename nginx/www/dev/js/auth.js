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
					//const data = await res.json()
					if (res.status == 204){
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
		// showLobby()
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
		const validation = document.getElementById("loginValidation")
		if (res.status == 201)
		{
			localStorage.setItem('csrf', data.token)
			localStorage.setItem('user', JSON.stringify(data.user))
			validation.innerHTML = ""
			document.querySelector("#modalLogin").classList.remove("show")
			document.querySelector(".modal-backdrop").classList.remove("show")
			// $("#modalLogin").modal("hide")
			showLobby()

		}
		else
		{
			document.getElementById("loginPassword").value = ""
			validation.innerHTML = "Wrong credentials"
		}
	}
	catch (error) {
			console.log("Error registration: " + error)
	}
	return ;
}

async function sendRegistrationRequest(url, body, method)
{
	const bodyJSON = JSON.stringify(body);

	// TODO faire fonctions reset inputs a valid
	const form = document.getElementById("registrationForm")
	const inputs = form.querySelectorAll("input")
	inputs.forEach(input => {
		input.classList.remove("is-invalid")
		input.classList.add("is-valid")
	})

	try
	{
		const res = await fetch(url, {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: bodyJSON
		})
		const data = await res.json()
		console.log(data)
		if (res.status == 400)
		{
			for (const obj in data)
			{
				const textbox = document.getElementById(`${obj}`)
				const validation = document.getElementById(`${obj}Validation`) // depend de l'id des div validation
				textbox.classList.add("is-invalid")
				validation.classList.add("invalid-feedback")
				validation.innerHTML = data[obj]
			}
		}
		else if (res.status == 201)
		{
			localStorage.setItem('csrf', data.token)
			localStorage.setItem('user', JSON.stringify(data.user))
			// $('#modalRegistration').modal('hide')
			document.querySelector("#modalRegistration").classList.remove("show")
			document.querySelector(".modal-backdrop").classList.remove("show")
			showLobby()
			return true
		}
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
	let token = localStorage.getItem('csrf')
	return (token && (token != undefined))
}

export function initAuth() {
	if (isAuthenticated() == true)
		showLobby()
	else
		showLogin()

	authRegister();
	authLogin();
	authLogout();
}
