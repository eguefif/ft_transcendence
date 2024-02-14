
async function preview_image() {
    const img = document.getElementById("profilePicture")
    const file = this.files[0]
    const formData = new FormData()
    const csrf = localStorage.getItem('csrf')

    formData.append('image', file)

    const res = await fetch("api/uploadimage/", {
        method: "POST",
        credentials: "same-origin",
		headers: {'Authorization': 'Token ' + csrf},
        body: formData
    })
    const data = await res.json()
    console.log(data)

    img.src = URL.createObjectURL(file)
    img.width = 150
    img.height = 150
    img.onload = () => {
        URL.revokeObjectURL(file)
    }
}

export function watchProfile() {
    const profileImageField = document.getElementById("profileImageField")

    profileImageField.addEventListener("change", preview_image);
}