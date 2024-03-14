import * as bootstrap from "../bootstrap/bootstrap.bundle.min.js";

export function createAlert(type, message) {
	let alert = document.createElement("div");
	alert.classList.add("alert", `alert-${type}`, "alert-dismissible", "fade", "show");
	alert.setAttribute("role", "alert");
	alert.innerHTML = `${message}
		  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close">
		  </button>`;
	return alert;
}

export function sendAlert(type, message, duration=0) {
	let alert = document.createElement("div");
	alert.classList.add("alert", `alert-${type}`, "alert-dismissible", "fade", "show");
	alert.setAttribute("role", "alert");
	alert.innerHTML = `${message}
		  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close">
		  </button>`;
	document.querySelector("#alert-container").appendChild(alert);
	if (duration > 0) {
		setTimeout(() => {
			const bsAlert = new bootstrap.Alert(alert);
			bsAlert.close()
		}, duration);
	}
}

export function clearContent(node) {
	let child = node.lastElementChild;
	while (child) {
		node.removeChild(child);
		child = node.lastElementChild;
	}
}

export function closeCovering(covering) {
	covering.classList.remove("show");
	setTimeout(() => {
		covering.remove()
	}, 250);
}

export const sleep = async (delay) => new Promise((resolve) => setTimeout(resolve, delay))
