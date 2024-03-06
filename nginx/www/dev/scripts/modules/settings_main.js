import { fetcher } from "./fetcher.js"
import { sendAlert, closeCovering } from "./utils.js"
import { updateUserData } from "./settings.js"

export function initProfileMain() {
	const changeImageButton = document.getElementById("profile-picture-container").querySelector("svg");
	changeImageButton.addEventListener("click", function (e) {
		initImageChangeForm();
	});
}

function initImageChangeForm() {
	createImageChangeForm();
	imageChangeFormInteractions();
}

function createImageChangeForm() {
	const modal = document.getElementById("settingsModal").querySelector(".modal-body");
	const currImage = document.getElementById("profilePicture").cloneNode(true);
	currImage.id = "image-change-form-image";
	let form = document.createElement("div");
	form.classList.add("covering");
	form.innerHTML = `
		<form id="image-change-form" action="api/profile/uploadimage/" method="POST" novalidate>
			<div class="mb-3">
				<div id="profileImageContainer" class="mb-3">
					<label for="profileImageField" class="form-label">Profile picture</label>
					<input class="form-control" type="file" id="profileImageField" accept=".png,.jpg,.jpeg,.gif">
					<div class="validation-field" id="image-change-validation"></div>
				</div>
			</div>
			<button type="submit" class="btn btn-primary" id="image-change-form-save">Save changes</button>
			<button type="button" class="btn btn-light" id="image-change-form-cancel">Cancel</button>
		</form>
	`
	modal.appendChild(form);
	setTimeout(() => {form.classList.add("show");}, 25);
	form.insertBefore(currImage, form.firstChild);
}

function imageChangeFormInteractions() {
	const imageChangeForm = document.getElementById("image-change-form");
	const btnCancel = document.getElementById("image-change-form-cancel");

	btnCancel.addEventListener("click", function () {
		closeCovering(imageChangeForm.parentElement);
	})

	const inputFields = imageChangeForm.querySelectorAll("input");
	inputFields.forEach((inputField) => {
		inputField.addEventListener("input", () => {
			inputField.classList.remove("is-invalid");
			inputField.parentElement.querySelector(".validation-field").innerText = "";
			inputField.parentElement.querySelector(".validation-field").classList.remove("invalid-feedback");
		});
	});

	const imageField = document.getElementById("profileImageField");
	imageField.addEventListener("input", () => {
		const formImage = document.getElementById("image-change-form-image");
		const file = imageField.files[0];
		if (!file) {
			resetFormImage();
			return;
		}
		const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];
		if (allowedTypes.includes(file.type)) {
			const previewURL = URL.createObjectURL(file);
			formImage.src = previewURL;
			formImage.onload = () => {
				URL.revokeObjectURL(imageField.value);
			}
		}
		else {
			resetFormImage();
		}
	});

	imageChangeForm.addEventListener("submit", async function (e) {
		e.preventDefault();
		if (imageChangeFormIsValid(imageChangeForm)) {
			const data = new FormData(e.target);
			const url = e.target.action;
			const body = {
				'password': data.get('old-password'),
				'new_password': data.get('new-password'),
			}
			await sendImageChangeRequest(url, body);
		}
	})
}

function resetFormImage() {
	const currImage = document.getElementById("profilePicture").cloneNode(true);
	currImage.id = "image-change-form-image";
	document.getElementById("image-change-form-image").remove();
	const form = document.getElementById("image-change-form");
	form.parentElement.insertBefore(currImage, form.parentElement.firstChild);
}

async function sendImageChangeRequest() {
    const imageValidation = document.getElementById("image-change-validation")
	const imageField = document.getElementById("profileImageField");
    const file = imageField.files[0]
    const formData = new FormData()

    formData.append('image', file)

    const res = await fetcher.post("api/profile/uploadimage/", formData)
    if (res.status >= 200 && res.status < 300) {
		await updateUserData();
		const form = document.getElementById("image-change-form");
		sendAlert('success', 'Your image was updated successfully', 3000);
		closeCovering(form.parentElement);
	}
    else if (res.status == 413) {
		imageField.classList.add("is-invalid");
		imageValidation.classList.add("invalid-feedback");
		imageValidation.innerText = "Image size is too large (1MB max)";
    } else if (res.status >= 400 && res.status < 500) {
		imageField.classList.add("is-invalid");
		imageValidation.classList.add("invalid-feedback");
        if (res.data['error']) {
            imageValidation.innerHTML = res.data['error']
		}
    }
}

function imageChangeFormIsValid() {
	const imageInputField = document.getElementById("profileImageField");
	const imageValidation = document.getElementById("image-change-validation");
	let toggle = true;
	const file = imageInputField.files[0];
	const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];
	if (!file || !allowedTypes.includes(file.type)) {
		imageInputField.classList.add("is-invalid");
		imageValidation.innerText = "Please provide a valid image file";
		imageValidation.classList.add("invalid-feedback");
		toggle = false;
	}
	return toggle;
}
