import { fetcher } from "./fetcher.js"
import { clearContent } from "./utils.js"

async function preview_image() {
    const profileImageContainer = document.getElementById("profileImageContainer")
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

        profileImageContainer.classList.add("d-none")
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


export function profileInfo()
{
	const settingsBtn = document.querySelector("#settingsButton")
	if (settingsBtn) {
		settingsBtn.addEventListener("click", async function (e) {
			document.querySelector("#profileUsername").disabled = true
			document.querySelector("#profileEmail").disabled = true
			document.querySelector("#profileSaveChanges").classList.add("d-none")
			document.querySelector("#profileImageContainer").classList.add("d-none")
			document.querySelector("#modifyProfile").classList.remove("d-none")
			const imgElement = document.getElementById("profilePicture")
			imgElement.src = "images/avatar.png"
			const imageReply = await fetcher.get("api/profile/userpicture/")
			if (imageReply.status == 200) {
				const imageURL = URL.createObjectURL(imageReply.data)
				imgElement.src = imageURL
				imgElement.onload = () => {
					URL.revokeObjectURL(imageReply.data)
				}
			}
			const res = await fetcher.get("api/profile/userinfo/")
			if (res.status == 200) {
				document.querySelector("#profileUsername").value = res.data['username']
				document.querySelector("#profileEmail").value = res.data['email']
				updatePassAuth(res.data);
			}
		})
	}
}

export function changeProfile()
{
	const modifySettingsBtn = document.querySelector("#modifyProfile")
	modifySettingsBtn.addEventListener("click", async function (e) {
		const profileUsername = document.querySelector("#profileUsername")
		const emailUsername = document.querySelector("#profileEmail")
		profileUsername.disabled = false
		emailUsername.disabled = false
		document.querySelector("#modifyProfile").classList.add("d-none")
		document.querySelector("#profileSaveChanges").classList.remove("d-none")
		document.querySelector("#profileImageContainer").classList.remove("d-none")
	})
}

export function authUpdateProfile()
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
		document.querySelector("#settingsModal").insertAdjacentHTML("afterbegin", `
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

function resetFormInput(form) {
	const inputs = form.querySelectorAll("input")
	inputs.forEach(input => {
		input.classList.remove("is-invalid")
		input.classList.add("is-valid")
	})
	// Reset validations
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
