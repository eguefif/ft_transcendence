import { fetcher } from "./fetcher.js"

async function preview_image() {
    const profileImageContainer = document.getElementById("profileImageContainer")
    const validation = document.getElementById("pictureUploadValidation")

    const img = document.getElementById("profilePicture")
    const file = this.files[0]
    const formData = new FormData()

    formData.append('image', file)

    const res = await fetcher.post("api/uploadimage/", formData)
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
