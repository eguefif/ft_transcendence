function authRegister()
{
	const registrationForm = document.querySelector("#registrationForm")
	registrationForm.addEventListener("submit", function(e){
		e.preventDefault()
		const data = new FormData(e.target);
		const url = e.target.action
		const username = data.get('username')
		const email = data.get('email')
		const password = data.get('password')
		const body = {
			'username': username,
			'email': email,
			'password': password,
		}
		sendRegistrationRequest(url, body)
	})
}

async function sendRegistrationRequest(url, body)
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
		console.log(returnValue)
    })
    .catch(() => {
        throw new Error("Leaderboards fetch failed")
    })
	return;
}

authRegister();
