import { fetcher } from "./fetcher.js"
import { clearContent, createAlert } from "./utils.js"
import { closeModal } from "./modalConnection.js"
import { removeModal } from "./navbar.js"

async function preview_image() {
    const validation = document.getElementById("pictureUploadValidation")

    const img = document.getElementById("profilePicture")
    const file = this.files[0]
    const formData = new FormData()

    formData.append('image', file)

    const res = await fetcher.post("api/profile/uploadimage/", formData)
    if (res.status == 201) {
        img.src = URL.createObjectURL(file)
        img.width = 150
        img.height = 150
        img.onload = () => {
            URL.revokeObjectURL(file)
        }
        validation.innerHTML = ""
    } else if (res.status == 413) {
        validation.innerHTML = "Image is too large (> 1 mb)"
    } else {
        if (res.data['error'])
            validation.innerHTML = res.data['error']
    }
}

export function initSettings() {
    const profileImageField = document.getElementById("profileImageField")

    profileImageField.addEventListener("change", preview_image);
}


async function profileInfo()
{
	const imgElement = document.getElementById("profilePicture")
	const imageReply = await fetcher.get("api/profile/userpicture/")
	if (imageReply.status >= 200 && imageReply.status < 300 && imageReply.status != 202) {
		imgElement.src = imageReply.data['image']
	}
	else {
		imgElement.src = "images/avatar.png"
	}
	const res = await fetcher.get("api/profile/userinfo/")
	if (res.status >= 200 && res.status < 300) {
		const mailProfile = document.querySelector("#profileEmail")
		if (mailProfile)
			mailProfile.value = res.data['email']
		const firstName = document.querySelector("#profileFirstName");
		if (firstName && res.data.first_name)
			firstName.value = res.data.first_name;
		const lastName = document.querySelector("#profileLastName");
		if (lastName && res.data.last_name)
			lastName.value = res.data.last_name;
	}
}

function authUpdateProfile()
{
	const modifyProfileForm = document.querySelector("#profileForm")
	const btnCancel = document.getElementById("cancelButton")

	btnCancel.addEventListener("click", function (e) {
		e.preventDefault()
		removeCardOrForm()
		addCard()
	})

	modifyProfileForm.addEventListener("submit", function (e) {
		e.preventDefault()
		const data = new FormData(e.target)
		const url = e.target.action
		const body = {
			'email': data.get('email'),
			'first_name': data.get('firstName'),
			'last_name': data.get('lastName'),
		}
		sendUpdateProfileRequest(url, body)
		removeCardOrForm()
		addCard()
	})
}

async function sendUpdateProfileRequest(url, body)
{
	const profileEmail = document.querySelector("#profileEmail")
	const profileEmailValidation = document.querySelector("#profileEmailValidation")

	const form = document.getElementById("profileForm")
	resetFormInput(form)

	const res = await fetcher.post(url, body)
	if (res.status == 201)
	{
		const settingsModal = document.querySelector("#settingsModal")
		const alert = createAlert('success', 'Your information has been saved')
		const siblingElement = settingsModal.firstChild;
		settingsModal.insertBefore(alert, siblingElement)
		setTimeout(() => {
			const bsAlert = new bootstrap.Alert(alert);
			bsAlert.close()
		}, 3000);

	}
	else if (res.status == 400)
	{
		const data = res.data

		if (data['email'])
		{
			profileEmail.classList.add("is-invalid")
			profileEmailValidation.classList.add("invalid-feedback")
			profileEmailValidation.innerHTML = data['email']
		}
	}
}

function resetFormInput(form) {
	const inputs = form.querySelectorAll("input")
	inputs.forEach(input => {
		input.classList.remove("is-invalid")
		input.classList.add("is-valid")
	})
}

function createModalSettings() {
	return `
	<div class="modal fade" id="settingsModal">
		<div class="modal-dialog">
			<div class="modal-content bg-dark">
				<div class="modal-header">
					<h1 class="modal-title fs-5" id="profileLabel">Settings</h1>
					<div class="btn-close" data-bs-dismiss="modal"></div>
				</div>
				<div class="modal-body">
					<div>
						<h5>Password and authentication</h3>
						<div id="pass-change">
							<a>Change password</a>
						</div>
						<div id="auth-type" class="d-flex flex-column">
							<span class="fw-bold">Account type</span>
							<span class="user-dependent"></span>
						</div>
						<div id="otp-toggle">
							<span class="fw-bold">Two-factor authentication</span>
							<div class="user-dependent"></div>
						</div>
					</div>
				</div>
			  </div>
			</div>
		</div>
	</div>
	`
}

function createformSettings() {
	return `
	<form id="profileForm" action="api/profile/updateprofile/" method="PATCH">
		<img id="profilePicture" class="rounded-circle-border mx-auto d-block" alt="profilePicture"/>
		<div id="profileImageContainer" class="mb-3">
			<label for="profileImageField" class="form-label">Profile picture</label>
			<input class="form-control" type="file" id="profileImageField">
			<div id="pictureUploadValidation" class="error text-danger"></div>
		</div>
		<div class="mb-3">
			<label for="profileEmail" class="col-md-3 col-form-label">Email</label>
			<input type="email" name="email" id="profileEmail" class="form-control" placeholder="email">
			<div id="profileEmailValidation"></div>
		</div>
		<div class="mb-3">
			<label for="profileFirstName" class="col-md-3 col-form-label">First Name</label>
			<input type="text" name="firstName" id="profileFirstName" class="form-control" placeholder="First Name">
			<div id="profileFirstNameValidation"></div>
		</div>
		<div class="mb-3">
			<label for="profileLastName" class="col-md-3 col-form-label">Last Name</label>
			<input type="text" name="lastName" id="profileLastName" class="form-control" placeholder="Last Name">
			<div id="profileLastNameValidation"></div>
		</div>
		<button type="submit" class="btn btn-primary" id="profileSaveChanges">Save changes</button>
		<button type="button" class="btn btn-light" id="cancelButton">Cancel</button>
		<a>Change password</a>
	</form>
	`
}

function createCardSettings() {
	return `
	<div class="card bg-dark text-center">
		<img id="profilePicture" class="rounded-circle-border mx-auto d-block" alt="profilePicture"/>
		<div class="card-body d-flex flex-column align-items-center" >
			<span class="userName fs-1">Le Loup de WallStreet !</span>
			<span class="lastName fs-5">Leloup</span>
			<span class="firstName fs-5">Jean</span>
			<span class="cardEmail fs-5">pierre@gmail.com</span>
			<a id="editButton" class="btn btn-primary">edit</a>
		</div>
	</div>
	`
}

async function editProfileCard() {
	const imgElement = document.getElementById("profilePicture")
	const imageReply = await fetcher.get("api/profile/userpicture/")
	if (imageReply.status == 200) {
		imgElement.src = imageReply.data['image']
	}
	else {
		imgElement.src = "images/avatar.png"
	}
	const res = await fetcher.get("api/profile/userinfo/")
	if (res.status >= 200 && res.status < 300) {
		const usr = document.querySelector(".userName")
		if (usr && res.data.username)
			usr.innerText = res.data.username
		const mail = document.querySelector(".cardEmail")
		if(mail && res.data.email)
			mail.innerText = res.data.email
		const firstName = document.querySelector(".firstName");
		if (firstName && res.data.first_name)
			firstName.innerText = res.data.first_name;
		const lastName = document.querySelector(".lastName");
		if (lastName && res.data.last_name)
			lastName.innerText = res.data.last_name;
		updatePassAuth(res.data);
	}
}

function removeCardOrForm() {
	const cardSettings = document.querySelector('.card')
	const formSettings = document.getElementById('profileForm')
	if (cardSettings) {
		cardSettings.remove()
	}
	if(formSettings) {
		formSettings.remove()
	}
}

async function addCard () {
	const modalBody = document.querySelector('.modal-body')
	modalBody.insertAdjacentHTML("afterbegin", createCardSettings())
	const buttonEdit = document.getElementById("editButton")
	await editProfileCard()
	buttonEdit.addEventListener("click", async e  => {
		e.preventDefault()
		removeCardOrForm()
		addChangeSettings()
	});
}

function addChangeSettings () {
	const modalBody = document.querySelector('.modal-body')
	modalBody.insertAdjacentHTML("afterbegin", createformSettings())
	profileInfo()
	initSettings();
	authUpdateProfile()
}

export function generateSettings() {
	removeModal()
	document.querySelector('nav').insertAdjacentHTML('afterend', createModalSettings())
	addCard()
}

function updatePassAuth(data) {
	updateAuthType(data);
	updateOtpToggle(data);
}

function updateAuthType(data) {
	const authTypeField = document.querySelector("#auth-type").querySelector(".user-dependent");
	authTypeField.innerText = data.authType== "42" ? "Authenticating with 42" : "Standard";
}

function updateOtpToggle(data) {
	const otpToggle = document.querySelector("#otp-toggle").querySelector(".user-dependent");
	clearContent(otpToggle);
	if (data.authType == 42) {
		const text = document.createElement("span");
		otpToggle.appendChild(text);
		text.innerText = "not available (42 user)"
	}
	else {
		const button = document.createElement("button");
		otpToggle.appendChild(button);
		button.classList.add("btn", "btn-primary");
		if (data.otp) {
			button.innerText = "Deactivate 2FA";
			button.addEventListener("click", async function() {
				let result = await fetcher.post("/api/auth/otp/deactivate");
				if (result.status >= 200 && result.status < 300) {
					const res = await fetcher.get("api/profile/userinfo/")
					if (res.status >= 200 && res.status < 300) {
						updatePassAuth(res.data);
					}
				}
			});

		} else {
			button.innerText = "Activate 2FA";
			button.addEventListener("click", async function() {
				const result = await fetcher.post("/api/auth/otp/activate");
				const qrcode = result.data.otpCode;
				activateOtp(qrcode);
			})
		}
	}
}

function activateOtp(qrcode) {
	const otpForm = createOtpForm(qrcode);
	otpForm.querySelector("#activate-otp-cancel").addEventListener("click", () => {
		closeOtpForm();
	});
	otpForm.querySelector("input").addEventListener("input", (e) => {
		e.target.classList.remove("is-invalid");
	});
	otpForm.querySelector("form").addEventListener("submit", async (e) => {
		e.preventDefault();
		const data = new FormData(e.target);
		const code = data.get('otp-code');
		if (!code || !(/^\d+$/.test(code))) {
			otpForm.querySelector("input").classList.add("is-invalid");
		}
		const result = await fetcher.post("/api/auth/otp/activate/confirm", {'code': code});
		if (result.status >= 200 && result.status < 300) {
			const res = await fetcher.get("api/profile/userinfo/")
			if (res.status >= 200 && res.status < 300) {
				updatePassAuth(res.data);
			}
			closeOtpForm();
		}
		else {
			otpForm.querySelector("input").classList.add("is-invalid");
		}
	});
}

function createOtpForm(qrcode) {
	const modal = document.querySelector("#settingsModal").querySelector(".modal-body");
	let otpForm = document.createElement("div");
	otpForm.classList.add("covering");
	otpForm.innerHTML = `
		${qrcode}
		<span>Please scan this QR code and enter your one-time password to enable 2FA</span>
		<form id="activate-otp-form" action="/api/auth/otp/activate/confirm" method="POST">
			<input class="form-control" name="otp-code" type="text"></input>
		</form>
		<div class="d-flex flex-row">
			<button type="submit" id="activate-otp-confirm" form="activate-otp-form" class="btn btn-primary">Enable</button>
			<button type="button" id="activate-otp-cancel" class="btn btn-danger">Cancel</button>
		</div>`
	otpForm.querySelector("svg").setAttribute("style", "fill:currentColor");
	otpForm.querySelector("svg").querySelector("path").removeAttribute("fill");
	modal.appendChild(otpForm);
	setTimeout(() => {otpForm.classList.add("show");}, 25);
	return otpForm;
}

async function closeOtpForm() {
	const otpForm = document.querySelector("#activate-otp-form").parentElement;
	otpForm.classList.remove("show");
	setTimeout(() => {
		otpForm.remove()
	}, 500);
}
