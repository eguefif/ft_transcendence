import { createAlert } from "./bs_utils.js"
import { fetcher } from "./fetcher.js"
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
	if (imageReply.status == 200) {
		const imageURL = URL.createObjectURL(imageReply.data)
		imgElement.src = imageURL
		imgElement.onload = () => {
			URL.revokeObjectURL(imageReply.data)
		}
	}
	else {
		imgElement.src = "images/avatar.png"
	}
	const res = await fetcher.get("api/profile/userinfo/")
	if (res.status == 200) {
		const userProfile = document.querySelector("#profileUsername")
		if(userProfile)
			userProfile.value = res.data['username']
		const mailProfile = document.querySelector("#profileEmail")
		if (mailProfile)
			mailProfile.value = res.data['email']
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
			'username': data.get('username'),
			'email': data.get('email'),
		}
		sendUpdateProfileRequest(url, body)
		removeCardOrForm()
		addCard()
	})
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

function resetFormInput(form) {
	const inputs = form.querySelectorAll("input")
	inputs.forEach(input => {
		input.classList.remove("is-invalid")
		input.classList.add("is-valid")
	})
	// Reset validations
}

function createModalSettings() {
	return `
	<div class="modal fade" id="settingsModal">
		<div class="modal-dialog">
			<div class="modal-content bg-dark">
				<div class="modal-header">
					<h1 class="modal-title fs-5" id="profileLabel">Profile</h1>
					<div class="btn-close" data-bs-dismiss="modal"></div>
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
			<label for="profileUsername" class="col-md-3 col-form-label">Username</label>
			<input type="username" name="username" id="profileUsername" class="form-control" placeholder="username" disabled>
			<div id="profileUsernameValidation"></div>
		</div>
		<div class="mb-3">
			<label for="profileEmail" class="col-md-3 col-form-label">Email</label>
			<input type="email" name="email" id="profileEmail" class="form-control" placeholder="email">
			<div id="profileEmailValidation"></div>
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
		<div class="card-body" >
			<h1 class="userName">Le Loup de WallStreet !</h1>
			<h5 class="lastName">Leloup</h5>
			<h5 class="firstName">Jean</h5>
			<h6 class="cardEmail">pierre@gmail.com</h6>
			<p class="card-text">Current world champion of Pong!</p>
			<a id="editButton" class="btn btn-primary">edit</a>
		</div>
	</div>
	`
}


async function editProfilCard() {
	const imgElement = document.getElementById("profilePicture")
	const imageReply = await fetcher.get("api/profile/userpicture/")
	if (imageReply.status == 200) {
		const imageURL = URL.createObjectURL(imageReply.data)
		imgElement.src = imageURL
		imgElement.onload = () => {
			URL.revokeObjectURL(imageReply.data)
		}
	}
	else {
		imgElement.src = "images/avatar.png"
	}
	const res = await fetcher.get("api/profile/userinfo/")
	if (res.status == 200) {
		const usr = document.querySelector(".userName")
		if (usr)
			usr.innerText = res.data['username']
		const mail = document.querySelector(".cardEmail")
		if(mail)
			mail.innerText = res.data['email']
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
	const modalBody = document.querySelector('.modal-content')
	modalBody.insertAdjacentHTML("beforeend", createCardSettings())
	const buttonEdit = document.getElementById("editButton")
	await editProfilCard()
	buttonEdit.addEventListener("click", async e  => {
		e.preventDefault()
		removeCardOrForm()
		addChangeSettings()
	});
}

function addChangeSettings () {
	const modalBody = document.querySelector('.modal-content')
	modalBody.insertAdjacentHTML("beforeend", createformSettings())
	profileInfo()
	initSettings();
	authUpdateProfile()
}

export function generateSettings() {
	removeModal()
	document.querySelector('nav').insertAdjacentHTML('afterend', createModalSettings())
	addCard()
}