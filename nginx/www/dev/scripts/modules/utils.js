export function createAlert(type, message) {
	let alert = document.createElement("div");
	alert.classList.add("alert", `alert-${type}`, "alert-dismissible", "fade", "show");
	alert.setAttribute("role", "alert");
	alert.innerHTML = `${message}
		  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close">
		  </button>`;
	return alert;
}

export function clearContent(node) {
	let child = node.lastElementChild;
	while (child) {
		node.removeChild(child);
		child = node.lastElementChild;
	}
}
