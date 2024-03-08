import { fetcher } from "./fetcher.js"
import { clearContent, closeCovering, sendAlert } from "./utils.js"
import { updatePassAuth } from "./settings.js"

export function updateOtpToggle(data) {
	const otpToggle = document.querySelector("#otp-toggle").querySelector(".user-dependent");
	clearContent(otpToggle);
	if (data.authType == 42) {
		const text = document.createElement("span");
		otpToggle.appendChild(text);
		text.innerText = "2FA is not available (42 user)"
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
					sendAlert('success', '2FA was successfully deactivated on this account', 3000);
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
		closeCovering(otpForm);
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
			return;
		}
		const result = await fetcher.post("/api/auth/otp/activate/confirm", {'code': code});
		if (result.status >= 200 && result.status < 300) {
			const res = await fetcher.get("api/profile/userinfo/")
			if (res.status >= 200 && res.status < 300) {
				updatePassAuth(res.data);
			}
			sendAlert('success', '2FA was successfully activated on this account', 3000);
			closeCovering(otpForm);
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
			<button type="button" id="activate-otp-cancel" class="btn btn-light">Cancel</button>
		</div>`
	otpForm.querySelector("svg").setAttribute("style", "fill:currentColor");
	otpForm.querySelector("svg").querySelector("path").removeAttribute("fill");
	modal.appendChild(otpForm);
	setTimeout(() => {otpForm.classList.add("show");}, 25);
	return otpForm;
}
