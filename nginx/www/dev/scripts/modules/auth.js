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
validatePassword(textBoxPassword, passwordValidationBox);
validatePasswordCheck(textBoxPassword, textBoxPasswordCheck, passwordCheckValidationBox);

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
		const csrf = localStorage.getItem('csrf')

		imgElement.src = "images/default-user-picture.png"

		fetch("/api/userpicture/", {
			method: "GET",
			credentials: "same-origin",
			headers: {'Authorization': 'Token ' + csrf}
		})
			.then(response => {
				if (!response.ok) {
					throw new Error('No image')
				}
				return response.blob()
			})
			.then(blob => {
				console.log(blob)
				const imageURL = URL.createObjectURL(blob)
				imgElement.src = imageURL
				imgElement.onload = () => {
					URL.revokeObjectURL(blob)
				}
			})
			.catch(function (err) { console.error(err) })

		try {
			const res = await fetch("/api/userinfo/", {
				method: "GET",
				credentials: "same-origin",
				headers: {"Content-Type": "application/json", 'Authorization': 'Token ' + csrf}
			})
			const data = await res.json()
			if (res.status == 200)
			{
				document.querySelector("#profileUsername").value = data['username']
				document.querySelector("#profileEmail").value = data['email']
			}
			else if (res.status == 403) //forbidden, retour a la page de connection
			{

			}
		} catch (error) {
			console.log("Profile: could not get user info")
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
		//input.classList.add("is-valid")
	})
	// Reset validations
}

async function sendUpdateProfileRequest(url, body)
{
	const bodyJSON = JSON.stringify(body)
	const csrf = localStorage.getItem('csrf')
	const profileUsername = document.querySelector("#profileUsername")
	const profileEmail = document.querySelector("#profileEmail")
	const profileUsernameValidation = document.querySelector("#profileUsernameValidation")
	const profileEmailValidation = document.querySelector("#profileEmailValidation")

	const form = document.getElementById("profileForm")
	resetFormInput(form)

	try {
		const res = await fetch(url, {
			method: "PATCH",
			credentials: "same-origin",
			headers: {"Content-Type": "application/json", 'Authorization': 'Token ' + csrf},
			body: bodyJSON
		})
		const data = await res.json()
		if (res.status == 201)
		{
			document.querySelector("#profileSaveChanges").classList.add("d-none")
			document.querySelector("#profileImageContainer").classList.add("d-none")
			document.querySelector("#modifyProfile").classList.remove("d-none")
			profileUsername.disabled = true
			profileEmail.disabled = true
			// alert test
			document.querySelector("#modalProfile").insertAdjacentHTML("afterbegin", `
			<div class="alert alert-success alert-dismissible fade show" role="alert">
				<strong>Success!</strong> Your information has been saved.
				<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
			</div>
			`)
		}
		else if (res.status == 400)
		{
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
	} catch (error) {
		console.log(error)
	}
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

	const form = document.getElementById("registrationForm")
	resetFormInput(form)

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
	authUpdateProfile();
	profileInfo();
	changeProfile();
}
